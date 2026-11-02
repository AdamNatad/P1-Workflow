# Folder Structure

Where everything goes. A new path is added here before it is created.

## [YYYY-MM-DD] — Current layout

```text
<project>/
├─ AGENTS.md              the rules every agent follows
├─ CLAUDE.md              Claude Code's additions (imports AGENTS.md)
├─ README.md              the public README
├─ LICENSE                the license and its copyright holder
├─ session-start-command.md   the line to paste at the start of a session
├─ .gitignore, .gitattributes  what Git ignores, and line endings per file type
├─ .agents/hooks/block-permanent-delete-commands.mjs   the delete guard every agent's hook runs
├─ .agents/hooks.json     Antigravity's hook
├─ .muse/hooks.json       Muse Code's hook
├─ .codex/                Codex's hook (hooks.json) and rules (rules/)
├─ .claude/settings.json  Claude Code's hook and deny rules
├─ .grok/hooks/           Grok Build's hook
├─ .cursor/               Cursor's hook (hooks.json) and CLI deny rules (cli.json)
├─ .github/hooks/         GitHub Copilot's hook
├─ .gemini/, .qwen/       Gemini CLI's and Qwen Code's settings: read AGENTS.md, and the hook
├─ .devin/, .factory/, .kiro/hooks/   Devin's, Factory Droid's and Kiro's hooks
├─ .commandcode/settings.json   Command Code's hook and deny rules
├─ opencode.json, .kilo/  OpenCode's and Kilo Code's deny rules
├─ .aider.conf.yml        loads AGENTS.md into Aider
├─ src/
│  └─ modules/<area>/     one folder per module; tests beside their code
├─ tools/strip-picture-hidden-data.mjs   strips C2PA, EXIF and other hidden data from pictures
├─ test_trash/            disposable scratch: one-off repros and debug files
│  ├─ mockups/            mockups, and temporary review or preview pages
│  ├─ artifacts/          screenshots and other captures
│  └─ logs/               temporary logs
└─ workflow/
   ├─ 15 authority files  START, PLANNING, PRODUCT, TASKS, ACCEPTANCE, TECH_STACK,
   │                      FOLDER_STRUCTURE, DATABASE, ENVIRONMENT, DEPLOYMENT, LAUNCHER,
   │                      DECISIONS, BUGS, CHANGELOG_AI, HISTORY
   ├─ notes/              knowledge base: README, overview, areas/, docs/, runbooks/, templates/
   ├─ tasks/              <milestone>/ records, pending/ proposals
   └─ archive/            the read-only past
```

## Rules

- **One folder per module** under `src/modules/<area>/`, named for what it owns.
- **One job per file.** Shared code lives in one shared module and is imported, never copied.
- **Tests sit beside their module** (`<name>.test.<ext>`).
- **Disposable output goes in `test_trash/`,** never the root or a source folder. That includes
  every temporary review or preview page.
- **Do not create a second workflow** anywhere else, and no second notes folder.

## Planned (created when its phase starts)

```text
<paths a later phase adds>
```
