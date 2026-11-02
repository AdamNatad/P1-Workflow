#!/usr/bin/env node
// The delete guard every coding agent's hook runs before a shell command (AGENTS.md, rule 12).
// It blocks commands that delete permanently (rm, rmdir, unlink, del, erase, rd, Remove-Item,
// git clean, git rm, find -delete, shred, rimraf, and deleting from inline code), so deletions go
// through `trash`, which moves them to the Recycle Bin or Trash. It also blocks emptying the Trash,
// trashing a protected folder, and `trash` with a backslash path, which matches nothing.
//
//   node .agents/hooks/block-permanent-delete-commands.mjs <agent>
//
// <agent> is muse, codex, claude, grok, gemini, cursor, copilot, antigravity, devin, factory, qwen,
// kiro or commandcode, as
// each agent's hook file names it (workflow/notes/docs/coding-agents-and-the-delete-guard.md). Each
// sends the command in its own JSON on stdin and reads the answer its own way (`answerForAgent`
// below). Run it with `--check "<command>"` to test a command by hand. It needs only Node.js, and lets
// the command run if it can't read what it was sent, so a broken hook never stops an agent working.
// A heredoc's text going into a file is not a command, so writing about `rm` is never blocked.

import { readFileSync } from 'node:fs'

const permanentDeleteCommandNames = new Set([
  'rm', 'rmdir', 'unlink', 'shred', 'srm', 'wipe', 'del', 'erase', 'rd', 'remove-item', 'ri',
  'rimraf', 'del-cli', 'trash-empty', 'empty-trash', 'clear-recyclebin',
])
const trashCommandNames = new Set(['trash', 'trash-put'])
const shellCommandNames = new Set(['bash', 'sh', 'zsh', 'dash', 'ksh', 'fish', 'cmd', 'powershell', 'pwsh'])
const shellScriptFlags = new Set(['-c', '-lc', '-ic', '-cl', '-ci', '/c', '/k', '-command', '-c:', '-encodedcommand'])
const inlineCodeInterpreterNames = new Set(['python', 'python3', 'py', 'node', 'deno', 'bun', 'ruby', 'perl', 'php'])
const inlineCodeFlags = new Set(['-c', '-e', '--eval', '-p', '--print', '-r', 'eval'])
// Words that run the command after them: `sudo rm`, `xargs rm`, `npx rimraf`.
const commandPrefixNames = new Set([
  'sudo', 'doas', 'env', 'command', 'builtin', 'exec', 'nohup', 'time', 'nice', 'timeout', 'xargs',
  'stdbuf', 'npx', 'bunx', 'pnpx', 'call', 'start', '&', '.', 'then', 'do', 'else', '{', '!',
])
const permanentDeleteCodePattern =
  /\b(?:os\.(?:remove|unlink|rmdir|removedirs)|shutil\.rmtree|Deno\.remove(?:Sync)?|FileUtils\.(?:rm|rm_r|rm_rf|remove)|File\.delete|rmSync|unlinkSync|rmdirSync|rmtree)\b|\.(?:rm|unlink|rmdir)\s*\(|\bunlink\s*\(/
const powerShellDeletePattern = /\[(?:System\.)?IO\.(?:File|Directory|FileInfo|DirectoryInfo)\]::Delete\b|\)\.Delete\(|FileSystem\]::Delete(?:File|Directory)\b/i

const trashRule = 'Delete with `trash` (forward-slash paths), so it can be restored: AGENTS.md, rule 12.'

// ---------------------------------------------------------------- reading a command

// Splits a command line into simple commands at ; && || | & and new lines, outside quotes, and lifts
// out what runs inside $( ), backticks and ( ) as commands of their own.
function splitShellCommandLine(shellCommandLine) {
  const simpleCommands = []
  let currentCommand = ''
  let openQuote = null
  for (let characterIndex = 0; characterIndex < shellCommandLine.length; characterIndex += 1) {
    const character = shellCommandLine[characterIndex]
    if (openQuote !== null) {
      currentCommand += character
      if (character === openQuote) openQuote = null
      else if (character === '\\' && openQuote === '"') currentCommand += shellCommandLine[++characterIndex] ?? ''
      continue
    }
    if (character === '"' || character === "'") {
      openQuote = character
      currentCommand += character
    } else if (character === '\\') {
      currentCommand += character + (shellCommandLine[++characterIndex] ?? '')
    } else if (';|&\n\r(){}`'.includes(character)) {
      simpleCommands.push(currentCommand)
      currentCommand = ''
      if (character === '&' && /\s$|^$/.test(simpleCommands.at(-1)) && /^\s*['"]?[\w.-]/.test(shellCommandLine.slice(characterIndex + 1))) {
        // PowerShell's call operator, `& rm x`: keep it as the command's first word.
        currentCommand = '& '
      }
    } else if (character === '$' && shellCommandLine[characterIndex + 1] === '(') {
      simpleCommands.push(currentCommand)
      currentCommand = ''
      characterIndex += 1
    } else {
      currentCommand += character
    }
  }
  simpleCommands.push(currentCommand)
  return simpleCommands.map((simpleCommand) => simpleCommand.trim()).filter(Boolean)
}

// Splits one simple command into words, removing quotes.
function splitCommandWords(simpleCommand) {
  const commandWords = []
  let currentWord = ''
  let isInWord = false
  let openQuote = null
  for (let characterIndex = 0; characterIndex < simpleCommand.length; characterIndex += 1) {
    const character = simpleCommand[characterIndex]
    if (openQuote !== null) {
      if (character === openQuote) openQuote = null
      else currentWord += character
      continue
    }
    if (character === '"' || character === "'") {
      openQuote = character
      isInWord = true
    } else if (/\s/.test(character)) {
      if (isInWord) commandWords.push(currentWord)
      currentWord = ''
      isInWord = false
    } else {
      currentWord += character
      isInWord = true
    }
  }
  if (isInWord) commandWords.push(currentWord)
  return commandWords
}

// "C:\Windows\System32\cmd.exe" -> "cmd"; "Microsoft.PowerShell.Management\Remove-Item" -> "remove-item".
function readCommandName(commandWord) {
  return commandWord.split(/[\\/]/).at(-1).toLowerCase().replace(/\.(?:exe|cmd|bat|ps1|com)$/, '')
}

function isProtectedTrashTarget(trashTarget) {
  const normalizedTarget = trashTarget.replace(/\\/g, '/').replace(/\/+$/, '')
  return (
    normalizedTarget === '' ||
    ['.', '..', '~', '*', '$home', '${home}', '%userprofile%', '$env:userprofile', '$pwd', '$(pwd)'].includes(normalizedTarget.toLowerCase()) ||
    /^[a-z]:$/i.test(normalizedTarget) ||
    /^\/(?:home|users)\/[^/]+$/i.test(normalizedTarget) ||
    /^[a-z]:\/users\/[^/]+$/i.test(normalizedTarget) ||
    /^\/[a-z]?$/i.test(normalizedTarget)
  )
}

// Why one simple command deletes permanently, or null when it doesn't.
function findPermanentDeleteInSimpleCommand(simpleCommand, nestingDepth) {
  const commandWords = splitCommandWords(simpleCommand)
  // Skip variable settings, prefix words (`sudo`, `xargs`), and the prefixes' options and numbers.
  let wordIndex = 0
  let isAfterCommandPrefix = false
  while (wordIndex < commandWords.length) {
    const commandWord = commandWords[wordIndex]
    const isPrefixWord = commandPrefixNames.has(readCommandName(commandWord))
    const isPrefixOptionOrNumber = isAfterCommandPrefix && (commandWord.startsWith('-') || /^\d+[smhd]?$/.test(commandWord))
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(commandWord) || isPrefixWord || isPrefixOptionOrNumber) {
      isAfterCommandPrefix = isAfterCommandPrefix || isPrefixWord
      wordIndex += 1
      continue
    }
    break
  }
  const commandName = readCommandName(commandWords[wordIndex] ?? '')
  const commandArguments = commandWords.slice(wordIndex + 1)
  const lowerCaseArguments = commandArguments.map((commandArgument) => commandArgument.toLowerCase())

  if (permanentDeleteCommandNames.has(commandName)) {
    if (commandName === 'trash-empty' || commandName === 'empty-trash' || commandName === 'clear-recyclebin') return `\`${commandName}\` empties the Recycle Bin or Trash, which is never done`
    return `\`${commandName}\` deletes permanently`
  }
  if (trashCommandNames.has(commandName)) {
    const trashTargets = commandArguments.filter((commandArgument) => !commandArgument.startsWith('-'))
    if (lowerCaseArguments.includes('--empty') || lowerCaseArguments.includes('-e')) return '`trash` must never empty the Recycle Bin or Trash'
    const backslashTarget = trashTargets.find((trashTarget) => /\\[^\\\s]/.test(trashTarget))
    if (backslashTarget !== undefined) return `\`trash ${backslashTarget}\` uses backslashes, which match nothing; use forward slashes`
    const protectedTarget = trashTargets.find(isProtectedTrashTarget)
    if (protectedTarget !== undefined) return `\`trash ${protectedTarget}\` would trash a drive, a home folder, the project or every file here`
    return null
  }
  if (commandName === 'find') {
    if (lowerCaseArguments.includes('-delete')) return '`find -delete` deletes permanently'
    const execWordIndex = lowerCaseArguments.findIndex((commandArgument) => commandArgument === '-exec' || commandArgument === '-execdir' || commandArgument === '-ok')
    if (execWordIndex >= 0) return findPermanentDeleteInSimpleCommand(commandArguments.slice(execWordIndex + 1).join(' '), nestingDepth + 1)
    return null
  }
  if (commandName === 'git') {
    // The first word that isn't an option, skipping the values of -C, -c and the like.
    const gitOptionsWithValues = new Set(['-c', '-C', '--git-dir', '--work-tree', '--namespace', '--exec-path'])
    const gitSubcommand = lowerCaseArguments.find(
      (commandArgument, argumentIndex) => !commandArgument.startsWith('-') && !gitOptionsWithValues.has(commandArguments[argumentIndex - 1] ?? ''),
    )
    if (gitSubcommand === 'clean') return '`git clean` deletes untracked files permanently'
    if (gitSubcommand === 'rm' && !lowerCaseArguments.includes('--cached')) return '`git rm` deletes the files from disk; trash them, then stage the deletion with `git add <path>`'
    return null
  }
  if (shellCommandNames.has(commandName)) {
    const scriptFlagIndex = lowerCaseArguments.findIndex((commandArgument) => shellScriptFlags.has(commandArgument))
    if (scriptFlagIndex >= 0) {
      const shellScript = commandName === 'powershell' || commandName === 'pwsh' || commandName === 'cmd' ? commandArguments.slice(scriptFlagIndex + 1).join(' ') : commandArguments[scriptFlagIndex + 1] ?? ''
      return findPermanentDeleteInCommandLine(shellScript, nestingDepth + 1)
    }
    // PowerShell runs its first words as a command even without -Command.
    if ((commandName === 'powershell' || commandName === 'pwsh') && commandArguments.length > 0 && !commandArguments[0].startsWith('-')) {
      return findPermanentDeleteInCommandLine(commandArguments.join(' '), nestingDepth + 1)
    }
    return null
  }
  if (inlineCodeInterpreterNames.has(commandName)) {
    const codeFlagIndex = lowerCaseArguments.findIndex((commandArgument) => inlineCodeFlags.has(commandArgument))
    const inlineCode = codeFlagIndex >= 0 ? commandArguments.slice(codeFlagIndex + 1).join(' ') : ''
    if (permanentDeleteCodePattern.test(inlineCode)) return `\`${commandName}\` runs code that deletes permanently`
    return null
  }
  if (commandName === 'eval') return findPermanentDeleteInCommandLine(commandArguments.join(' '), nestingDepth + 1)
  return null
}

// Why a whole command line deletes permanently, or null when nothing in it does.
// A heredoc's body (`cat > file <<'EOF'` … `EOF`) is text going into a file, not commands, so it is
// set aside. A body fed to a shell (`bash <<EOF`) stays as commands; one fed to an interpreter
// (`python <<EOF`) is returned as code to check.
function separateHeredocBodies(shellCommandLine) {
  const keptCommandLines = []
  const inlineCodeBodies = []
  let heredocEndWord = null
  let heredocBodyKind = null
  let heredocBodyLines = []
  for (const commandLine of shellCommandLine.split('\n')) {
    if (heredocEndWord !== null) {
      if (commandLine.trim() === heredocEndWord) {
        if (heredocBodyKind === 'code') inlineCodeBodies.push(heredocBodyLines.join('\n'))
        heredocEndWord = null
        heredocBodyLines = []
      } else if (heredocBodyKind === 'commands') {
        keptCommandLines.push(commandLine)
      } else {
        heredocBodyLines.push(commandLine)
      }
      continue
    }
    keptCommandLines.push(commandLine)
    const heredocStartMatch = /<<-?\s*(['"]?)([A-Za-z_][\w-]*)\1/.exec(commandLine.replace(/<<</g, ''))
    if (heredocStartMatch === null) continue
    heredocEndWord = heredocStartMatch[2]
    const commandWordsBeforeHeredoc = splitCommandWords(commandLine.slice(0, heredocStartMatch.index)).map(readCommandName)
    if (commandWordsBeforeHeredoc.some((commandName) => shellCommandNames.has(commandName))) heredocBodyKind = 'commands'
    else if (commandWordsBeforeHeredoc.some((commandName) => inlineCodeInterpreterNames.has(commandName))) heredocBodyKind = 'code'
    else heredocBodyKind = 'text'
  }
  return { shellCommandLineWithoutText: keptCommandLines.join('\n'), inlineCodeBodies }
}

function findPermanentDeleteInCommandLine(shellCommandLine, nestingDepth = 0) {
  if (typeof shellCommandLine !== 'string' || shellCommandLine.trim() === '' || nestingDepth > 6) return null
  const { shellCommandLineWithoutText, inlineCodeBodies } = separateHeredocBodies(shellCommandLine)
  if (inlineCodeBodies.some((inlineCodeBody) => permanentDeleteCodePattern.test(inlineCodeBody))) return 'the code it runs deletes permanently'
  shellCommandLine = shellCommandLineWithoutText
  if (powerShellDeletePattern.test(shellCommandLine)) return 'it deletes permanently through .NET'
  for (const simpleCommand of splitShellCommandLine(shellCommandLine)) {
    const permanentDeleteReason = findPermanentDeleteInSimpleCommand(simpleCommand, nestingDepth)
    if (permanentDeleteReason !== null) return permanentDeleteReason
  }
  return null
}

// ---------------------------------------------------------------- talking to each agent

// The command an agent's hook was sent, from the fields each agent uses.
function readHookCommandLine(hookInput) {
  const candidateValues = [
    hookInput?.tool_input?.command,
    hookInput?.toolInput?.command,
    hookInput?.tool_input?.cmd,
    hookInput?.command,
    hookInput?.tool_info?.command_line,
    hookInput?.toolArgs?.command,
    hookInput?.toolCall?.args?.CommandLine,
    hookInput?.toolCall?.args?.command,
  ]
  if (typeof hookInput?.toolArgs === 'string') {
    try {
      candidateValues.push(JSON.parse(hookInput.toolArgs)?.command)
    } catch {
      candidateValues.push(hookInput.toolArgs)
    }
  }
  const commandValue = candidateValues.find((candidateValue) => typeof candidateValue === 'string' || Array.isArray(candidateValue))
  return Array.isArray(commandValue) ? commandValue.join(' ') : commandValue ?? null
}

// How each agent is told "no": its exit code, and what it reads on stdout and stderr.
function answerForAgent(agentName, blockedReason) {
  const blockedMessage = `Blocked: ${blockedReason}. ${trashRule}`
  switch (agentName) {
    case 'cursor':
      return { exitCode: 0, stdoutText: JSON.stringify({ permission: 'deny', user_message: blockedMessage, agent_message: blockedMessage }), stderrText: '' }
    case 'copilot':
      return { exitCode: 2, stdoutText: JSON.stringify({ permissionDecision: 'deny', permissionDecisionReason: blockedMessage }), stderrText: blockedMessage }
    case 'antigravity':
      return { exitCode: 0, stdoutText: JSON.stringify({ decision: 'deny', reason: blockedMessage }), stderrText: '' }
    case 'grok':
      return { exitCode: 2, stdoutText: JSON.stringify({ decision: 'deny', reason: blockedMessage }), stderrText: blockedMessage }
    case 'muse':
      // Guides to Muse Code differ on how a hook denies (exit code 2, or this JSON), so it gets both.
      return {
        exitCode: 2,
        stdoutText: JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: blockedMessage } }),
        stderrText: blockedMessage,
      }
    default:
      // Claude Code, Codex, Gemini CLI, Devin, Factory, Qwen, Kiro and Command Code block on exit
      // code 2 and show stderr to the agent.
      return { exitCode: 2, stdoutText: '', stderrText: blockedMessage }
  }
}

function runHook() {
  const commandLineArguments = process.argv.slice(2)
  if (commandLineArguments[0] === '--check') {
    const checkedCommandLine = commandLineArguments.slice(1).join(' ')
    const blockedReason = findPermanentDeleteInCommandLine(checkedCommandLine)
    console.log(blockedReason === null ? `allowed: ${checkedCommandLine}` : `blocked: ${checkedCommandLine}\n  ${blockedReason}`)
    process.exit(blockedReason === null ? 0 : 2)
  }
  const agentName = (commandLineArguments[0] ?? 'claude').toLowerCase()
  let hookInput
  try {
    hookInput = JSON.parse(readFileSync(0, 'utf8') || '{}')
  } catch {
    process.exit(0)
  }
  const blockedReason = findPermanentDeleteInCommandLine(readHookCommandLine(hookInput))
  if (blockedReason === null) {
    if (agentName === 'cursor') process.stdout.write(JSON.stringify({ permission: 'allow' }))
    process.exit(0)
  }
  const agentAnswer = answerForAgent(agentName, blockedReason)
  if (agentAnswer.stdoutText) process.stdout.write(agentAnswer.stdoutText)
  if (agentAnswer.stderrText) process.stderr.write(agentAnswer.stderrText)
  process.exit(agentAnswer.exitCode)
}

runHook()
