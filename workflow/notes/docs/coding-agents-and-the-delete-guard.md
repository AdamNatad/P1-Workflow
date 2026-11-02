---
kind: reference
status: active
created: <YYYY-MM-DDTHH:MM:SS+00:00>
updated: <YYYY-MM-DDTHH:MM:SS+00:00>
milestone: "0.1"
source-of-truth: "AGENTS.md"
---

# Coding agents and the delete guard

## Summary

Every coding agent reads the same rules, `AGENTS.md`, either on its own or through one small file or
setting. Before any agent runs a shell command, its hook runs one shared script,
`.agents/hooks/block-permanent-delete-commands.mjs`, which refuses a permanent delete so that every
deletion goes through `trash` (`AGENTS.md`, rule 12). Where an agent also has a deny list, it backs up
the hook.

## Which file each agent reads, and its guard

| Agent | Reads the rules from | Delete guard | Blocks by |
| --- | --- | --- | --- |
| Muse Code | `AGENTS.md` | `.muse/hooks.json` (`PreToolUse` on `shell`, `exec_command` and `bash`) | exit code 2, and a `permissionDecision: deny` answer |
| Codex | `AGENTS.md` | `.codex/hooks.json` (`PreToolUse` on Bash) and `.codex/rules/delete-with-trash.rules` | exit code 2; the rules refuse outright |
| Claude Code | `CLAUDE.md`, which imports `AGENTS.md` | `.claude/settings.json`: a `PreToolUse` hook on Bash and PowerShell, and deny rules | exit code 2 |
| Grok Build | `AGENTS.md` | `.grok/hooks/block-permanent-delete.json` (`PreToolUse` on `Bash`, which Grok maps to `run_terminal_command`). Grok also runs the Claude Code hook | `{"decision": "deny"}` and exit code 2 |
| Cursor (editor and CLI) | `AGENTS.md` | `.cursor/hooks.json` (`beforeShellExecution`), and `.cursor/cli.json` deny rules for the CLI | `{"permission": "deny"}` |
| GitHub Copilot (VS Code, CLI, coding agent) | `AGENTS.md` | `.github/hooks/block-permanent-delete.json` (`preToolUse` on bash and PowerShell) | `{"permissionDecision": "deny"}` and exit code 2 |
| Antigravity | `AGENTS.md` | `.agents/hooks.json` (`PreToolUse` on `run_command`) | `{"decision": "deny"}` |
| Gemini CLI | `AGENTS.md`, through `context.fileName` in `.gemini/settings.json` | `.gemini/settings.json` (`BeforeTool` on `run_shell_command`) | exit code 2 |
| Qwen Code | `AGENTS.md`, through `context.fileName` in `.qwen/settings.json` | `.qwen/settings.json` (`PreToolUse` on `run_shell_command`) | exit code 2 |
| Devin (formerly Windsurf) | `AGENTS.md` | `.devin/hooks.v1.json` (`PreToolUse` on `exec`), and `.devin/config.json` deny rules | exit code 2 |
| Factory Droid | `AGENTS.md` | `.factory/hooks.json` (`PreToolUse` on `Execute`) | exit code 2 |
| Kiro | `AGENTS.md` | `.kiro/hooks/block-permanent-delete.json` (`PreToolUse` on `shell`) | any exit code other than 0 |
| Command Code | `AGENTS.md` | `.commandcode/settings.json`: a `PreToolUse` hook on `shell`, and `Shell(...)` deny rules that hold in every mode | exit code 2 |
| OpenCode | `AGENTS.md` | `opencode.json` `permission.bash` deny rules (the last matching rule wins) | deny rules |
| Kilo Code | `AGENTS.md` | `.kilo/kilo.json` `permission.bash` deny rules | deny rules |
| Aider | `AGENTS.md`, through `read:` in `.aider.conf.yml` | none: Aider asks before it runs a shell command | — |
| Cline, Amp, Jules, Zed, JetBrains Junie, Continue | `AGENTS.md` | none here: no documented project hook or deny list to set | — |
| T3 Code, Paseo | through the agent they run (Codex, Claude Code, Cursor, OpenCode and others) | that agent's own hook or deny rules, above | as that agent |

## How the guard works

- Every agent that has hooks runs the guard: Muse Code, Codex, Claude Code, Grok Build, Cursor,
  Copilot, Antigravity, Gemini CLI, Qwen Code, Devin, Factory Droid, Kiro and Command Code.
- **Gemini CLI and Antigravity are both Google's, but separate products.** Antigravity replaced
  Gemini CLI for personal accounts in June 2026, while Gemini CLI still serves Code Assist and
  API-key users. Each reads its own settings, so both are here.
- Each hook passes the guard the agent's name, so the guard reads that agent's input and answers in
  that agent's format.
- It splits a command line into commands at `;`, `&&`, `||`, `|` and new lines, and looks inside
  `bash -c`, `cmd /c`, `powershell -Command`, `$( )`, `xargs`, `sudo`, `find -exec` and code run with
  `python -c` or `node -e`.
- It blocks `rm`, `rmdir`, `unlink`, `shred`, `del`, `erase`, `rd`, `Remove-Item`, `rimraf`,
  `git clean`, `git rm` (but not `git rm --cached`), `find -delete`, and .NET deletes.
- It blocks emptying the Recycle Bin or Trash, `trash` with a backslash path, and trashing a drive,
  a home folder, `.` or `*`.
- A heredoc's text going into a file is not a command, so writing about `rm` is never blocked.
- If it can't read what it was sent, it lets the command run, so a broken hook never stops work.

Test a command by hand:

```text
node .agents/hooks/block-permanent-delete-commands.mjs --check "rm -rf dist"
```

## Constraints

- **Node.js must be installed.** Every hook runs `node`. Without it, most agents report a hook error
  and run the command anyway. Kiro and Copilot refuse every shell command instead.
- **Some agents ask first.** Codex, Gemini CLI and Qwen Code load a project's hooks and rules only in
  a trusted folder. Codex also asks each person to approve a project hook once in `/hooks`, and again
  after any change to it. Cursor needs a trusted workspace, and a restart after its hooks change.
- **A hook is a guardrail, not a wall.** It reads the command line, so a delete hidden in a script
  file it runs gets through. The rule in `AGENTS.md` still applies.
- **Kiro's input isn't documented.** Its docs don't name the field that holds the command. The guard
  reads the usual `tool_input.command`; check once that Kiro is blocked.
- **Muse Code has no public hook docs.** Its hook file follows the guides of tools that hook into it,
  and they differ on how a hook denies, so the guard answers both ways. Muse Code runs project hooks
  only after you trust the folder, starts each hook with a cleared environment, and reads hooks when
  a session starts. Check once that it is blocked.
- **Some files must never be added.** Each would replace `AGENTS.md` for some agent:
  - `.rules`, `.cursorrules`, `.windsurfrules`, `.clinerules` or `.github/copilot-instructions.md`,
    which Zed reads instead of `AGENTS.md`;
  - `.junie/AGENTS.md`, which Junie reads instead of the root file;
  - `.commandcode/AGENTS.md`: Command Code reads only the first `AGENTS.md` it finds.
- **Changing the guard.** Edit only `.agents/hooks/block-permanent-delete-commands.mjs`, test it with
  `--check`, and record why in `DECISIONS.md`. Never turn a hook off to get a delete through.

## Related

- `AGENTS.md`, rule 12, and `CLAUDE.md`
- `workflow/ENVIRONMENT.md`: Node.js and `trash`
