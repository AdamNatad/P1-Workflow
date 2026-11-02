# Agent rules

We are working on **[project name]**: [one sentence from `workflow/PRODUCT.md`]. It is built phase
by phase, with `workflow/` as the source of truth. Every coding agent on this project follows these
rules; this file says how to work with `workflow/`.

**Every agent reads this file.** Muse Code, Codex, Grok Build, Cursor, GitHub Copilot, Antigravity,
Devin, Factory Droid, Kiro, Command Code, OpenCode, Kilo Code, Cline, Amp, Jules, Zed and Junie read
it on their own. T3 Code and Paseo run those agents, so the same files apply. Claude Code reads it
through `CLAUDE.md`, Gemini CLI and Qwen Code through their settings, and Aider through
`.aider.conf.yml`. Which file each agent reads, and its delete guard:
`workflow/notes/docs/coding-agents-and-the-delete-guard.md`.

**New session:** read `workflow/START.md` first, or paste the line in `session-start-command.md`.

## 1. `workflow/` is the only authority

- Its 15 top-level files are the only files that authorize work: `START.md`, `PLANNING.md`,
  `PRODUCT.md`, `TASKS.md`, `ACCEPTANCE.md`, `TECH_STACK.md`, `FOLDER_STRUCTURE.md`, `DATABASE.md`,
  `ENVIRONMENT.md`, `DEPLOYMENT.md`, `LAUNCHER.md`, `DECISIONS.md`, `BUGS.md`, `CHANGELOG_AI.md` and
  `HISTORY.md`.
- `workflow/notes/` explains and never authorizes. `docs/` says how something works; `runbooks/`
  says how you do an operation; `areas/` has one note per code module.
- `workflow/tasks/<milestone>/` holds the current milestone's records: plans, lane packets and
  hand-overs. Records support `TASKS.md` and never replace it.
- `workflow/tasks/pending/` holds proposals the owner wants kept for review. A file there is
  neither approved nor discarded and authorizes nothing. Only the owner's decision, written into
  the workflow files, promotes it or sends it to the archive.
- `workflow/archive/` is the read-only past. A record is finished when its milestone is finished;
  it then moves there with its status: `completed`, `superseded` or `retired`. Old material always
  goes to the archive, never to a new folder.
- When the owner says "notes" without a path, it means `workflow/notes/`.
- When a change also changes a task, a decision, what done means, the environment or a release,
  update those top-level files in the same session, so they never disagree.

## 2. Four ledgers, one question each

| Ledger | Answers |
| --- | --- |
| `workflow/HISTORY.md` | How the architecture changed, and when |
| `workflow/DECISIONS.md` | Why: each product and architecture decision, with the owner's words |
| `workflow/CHANGELOG_AI.md` | What each session did. Every session adds one entry |
| `workflow/BUGS.md` | What is broken right now, and unresolved blockers |

## 3. Read before you work

- At the start of every session, read `workflow/START.md` and `workflow/PLANNING.md`, and check
  `workflow/TASKS.md` before you begin.
- Before you write code, also read `PRODUCT.md`, `TECH_STACK.md`, `FOLDER_STRUCTURE.md`,
  `DATABASE.md`, `ACCEPTANCE.md`, `ENVIRONMENT.md` and `DEPLOYMENT.md`, and the area note in
  `workflow/notes/areas/` for each module you will touch.
- For recent context, read `HISTORY.md`, `CHANGELOG_AI.md` and the newest records in
  `workflow/tasks/<milestone>/`. They are background, not authority.

## 4. Phase by phase

- Follow `TASKS.md` phase by phase, and work only within the current phase. `PRODUCT.md` sets the
  scope, `TECH_STACK.md` the tools, `FOLDER_STRUCTURE.md` where things go, `DATABASE.md` how data
  is stored, and `ACCEPTANCE.md` what done means.
- Mark a task done the moment it is done, with the check that proves it. Add a task the moment you
  find it, under the task or phase it belongs to.
- Leftovers first. A leftover's prerequisite goes first, then the current task's leftovers, then
  earlier actionable leftovers, then the next unrelated task. Required fixes, checks and reviews
  keep the parent task open: never tick a parent that still has a required leftover. Optional
  improvements go to "Later" or `workflow/tasks/pending/` and don't hold the parent open.
- Blocked work stays visible in `TASKS.md` with what blocks it, while independent work goes on.
- Keep changes small, clean and easy to review.

## 5. The owner sets the schedule

Plans, tasks and records carry phases, scope and order only: never due dates, durations or
estimates. A ledger entry's heading carries the date it was written; that is a record of when
something happened, not a schedule.

## 6. Specific names only

Every new or renamed name (identifier, type, file, folder, command, event, field, database column,
storage key, CSS class, script) says exactly what it is, with its owning concept:
`invoiceLineTotalCents`, never `total`. Generic words (`data`, `item`, `id`, `type`, `info`,
`manager`, `main`, `version`, `entity`) never stand alone as a concept's name. Search the repository
before you introduce a name; if it already means something else, or could, choose a fuller one.
Interface text may stay short; code and stored names stay specific.

## 7. The modular approach

- Code lives in one folder per module, `src/modules/<area>/` unless `FOLDER_STRUCTURE.md` says
  otherwise, each module owning its files.
- One job per file. A file that does two things becomes two files.
- Tests sit beside the code they test.
- Shared pieces live in one shared module and are imported, never copied. When the project has one
  module for a job (notices, progress, drag and drop), use it; never add a second.
- Each module gets a note in `workflow/notes/areas/`: what it owns, its entry points, its tests.
- `FOLDER_STRUCTURE.md` places every new path before it is created.
- Never edit a generated file by hand. Change its source and generate it again.

## 8. One coordinator, parallel lanes

- One coordinator session owns the ledgers, the shared checks (build, lint, tests), every Git
  operation that changes something, and the final review.
- The coordinator writes a packet for each lane (`workflow/notes/templates/lane-packet.md`) in
  `workflow/tasks/<milestone>/`, naming every file the lane may edit.
- A lane session edits only the files its packet names. It never commits or runs any other Git
  command that changes something, never edits the ledgers, the agent files and settings, or
  generated output, and never deploys or publishes. It reviews its own work, writes its hand-over
  next to its packet, and ends.
- The coordinator rechecks every lane: a lane's report is not evidence until the coordinator has
  rerun its checks. Then it commits that lane's files alone.
- Two sessions never edit the same file at the same time.
- How a round runs: `workflow/notes/runbooks/parallel-lanes.md`.

## 9. Git

- Work on `main`. Don't create branches, worktrees or other checkouts unless the owner asks.
- Stage the exact paths you changed. Never `git add -A`, `git add .` or `git commit -a`: other
  sessions may have work in the same tree.
- Never discard, revert or overwrite another session's uncommitted work unless the owner asks. If
  the owner asks you to commit another session's work, read it and run its checks first, and split
  the commits by area.
- Never skip hooks (`--no-verify`), never force-push, never rewrite pushed history.
- A commit message says what changed, in one plain sentence.
- Commits, merges, tags, pull requests and release notes never carry an AI agent's attribution: no
  `Co-Authored-By` trailer for an agent, no "Generated with …" footer and no agent signature.
  Commits are made only as the project's human Git identity.
- Commit, push, deploy or publish only when the owner asks, and only for what they asked.

## 10. Dependencies

- Approve each dependency in `TECH_STACK.md` before you install it, with its version and license.
- Read versions from the official registry or release page on the day you check them, never from
  memory.
- Pin exact versions and update on purpose, one dependency at a time.
- Install only releases at least 7 days old, so a hijacked release has time to be caught.

## 11. Done means `ACCEPTANCE.md`

Run the build, lint, type checks and tests that exist. Report the results as they are: a failure is
reported with its output, and a step you skipped is called skipped. When the owner asks to see the
project running, start it through the launcher (`LAUNCHER.md`) so they can check it live.

## 12. Every deletion goes to the Recycle Bin or Trash

Delete every file and folder with a `trash` command (for example
[trash-cli](https://github.com/sindresorhus/trash-cli)) that moves it to the Recycle Bin or Trash,
so it can be restored. This covers everything an agent deletes: project files, `test_trash/`, build
output, and scratch files outside the repository, even one you made a minute ago.

- Never delete any other way: no `rm` (with or without `-r` or `-f`), `rmdir`, `unlink`, `del`,
  `erase`, `rd` or `Remove-Item`, and no deleting from code you write or run (`fs.rm`, `os.remove`,
  `shutil.rmtree` and the like). A build tool replacing its own output folder is not an agent
  deletion.
- Pass forward-slash paths (`trash 'C:/projects/example/test_trash/old-run'`): many `trash`
  commands read their arguments as patterns, and a backslash path matches nothing yet still
  succeeds. Confirm the path is gone afterwards.
- Never delete a drive root, a home folder, the repository root or a folder that holds the current
  directory, and never empty the Recycle Bin or Trash.
- If `trash` is missing or fails, stop: keep the file and report it. Never work around a delete
  guard.
- Every agent's hook runs `.agents/hooks/block-permanent-delete-commands.mjs` before a shell command,
  and refuses a permanent delete. When it blocks you, use `trash`. Never turn a hook or deny rule off,
  or edit one to let a delete through.

## 13. Pictures carry no hidden data

Every picture (PNG, JPEG, WebP, SVG) is stored without hidden data: no C2PA content credentials,
EXIF, XMP, IPTC, text chunks, comments or editor data, `test_trash/` included. Generated pictures
arrive with C2PA, so strip a picture the moment it lands, before you use or commit it, and keep no
unstripped copy.

- Strip: `node tools/strip-picture-hidden-data.mjs <file or folder>`.
- Check: `node tools/strip-picture-hidden-data.mjs --check .` must report every picture clean.
- The Git pre-commit hook strips every staged picture on each commit. Install it once per clone with
  `node tools/strip-picture-hidden-data.mjs --install-git-hook`, and never bypass it.

## 14. Disposable output goes in `test_trash/`

Mockups, temporary review or preview pages, logs, screenshots, debug files and one-off repros go in
`test_trash/`, never in the project's source folders or the root: mockups and review pages in
`test_trash/mockups/`, screenshots and captures in `test_trash/artifacts/`, logs in
`test_trash/logs/`. Git ignores everything there but its README and those empty folders. Move
anything worth keeping to its real home before you clean up.

## 15. Design

- Show two or three options side by side and let the owner pick. Record the pick in
  `DECISIONS.md` with the owner's own words.
- Make the smallest change that matches the request. If a redesign is rejected, revert it rather
  than iterate on it.
- Confirm the exact visual target before you change it, and don't grow a small request into a
  rewrite.
- Nothing generic-looking: no decorative gradients, placeholder numbers or invented data.
  Hierarchy comes from spacing, type and contrast first.

## 16. The project's files describe the project only

The project's files, commit messages included, describe the project and nothing outside it. Docs
state what was decided and why, plainly, not a story of the options you weighed.

## 17. No secrets in files

Keys, tokens and passwords live in environment variables or a secrets manager, never in a file Git
tracks, a note, a log, a commit message or chat. `ENVIRONMENT.md` names each variable without its
value. `.env` files stay ignored; `.env.example` lists names only.

## 18. Session records and the end-of-session summary

- Record every session once in `workflow/CHANGELOG_AI.md`, with its type (`code`, `workflow` or
  `mixed`), before the session ends or its context is cleared.
- Decisions go in `DECISIONS.md`, architecture changes and their dates in `HISTORY.md`, unresolved
  bugs and blockers in `BUGS.md`, and timestamped plans and hand-overs in
  `workflow/tasks/<milestone>/`.
- Keep implementation plans Git-tracked in `workflow/tasks/<milestone>/` as
  `kind: planning-record`, never only in your agent's own plan folder or under your home folder.
- End every session with this summary
  (`workflow/notes/runbooks/session-summary.md` says what each item holds):
  1. Session type (`code`, `workflow` or `mixed`)
  2. Current milestone and phase (from `TASKS.md`)
  3. What changed (include workflow file updates)
  4. Files changed
  5. Commands run
  6. Build and test result
  7. Problems found
  8. Tasks completed
  9. New tasks discovered
  10. Next recommended task
- When the owner says "tasklist", report progress in the format in
  `workflow/notes/runbooks/task-list.md`.

## 19. Learned owner preferences

Add what you learn about how the owner likes to work, one line each with their words where you
have them, so every agent follows it.

- (none yet)
