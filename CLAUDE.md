@AGENTS.md

# Claude Code

`AGENTS.md` carries the rules for every agent on this project. This file adds only what is specific
to Claude Code sessions.

## What is [project name]?

[Two or three sentences from `workflow/PRODUCT.md`: what it is, who it is for, and where it runs.]

## Session records

- Record every session once in `workflow/CHANGELOG_AI.md`, with its type: `code`, `workflow` or
  `mixed`.
- Put decisions in `workflow/DECISIONS.md`, architecture changes and their dates in
  `workflow/HISTORY.md`, unresolved blockers in `workflow/BUGS.md`, and timestamped records in the
  current milestone's folder, `workflow/tasks/<milestone>/`.
- Keep implementation plans Git-tracked in `workflow/tasks/<milestone>/` as
  `kind: planning-record`, never in a plan folder under your home directory.
- Mockups, temporary review or preview pages and other disposable output go in `test_trash/`,
  never in the project's source folders.

## Settings

- `.claude/settings.json` denies the commands the rules forbid (`rm`, `git clean`, `git add -A`,
  `git commit -a`, force pushes, `--no-verify`). Its `PreToolUse` hook runs the delete guard,
  `.agents/hooks/block-permanent-delete-commands.mjs`, before every Bash and PowerShell command
  (`AGENTS.md`, rule 12). Your own allow rules go in `.claude/settings.local.json`, which Git
  ignores; never use it to turn the guard off.
- When you run several sessions at once, one is the coordinator and the rest are lanes
  (`AGENTS.md`, rule 8).
