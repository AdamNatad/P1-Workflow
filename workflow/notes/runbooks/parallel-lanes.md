---
kind: runbook
status: active
created: <YYYY-MM-DDTHH:MM:SS+00:00>
updated: <YYYY-MM-DDTHH:MM:SS+00:00>
milestone: "0.1"
source-of-truth: "AGENTS.md"
---

# Parallel lanes

How to run several agent sessions at once in the same checkout. The session that runs the round is
its **coordinator**; each parallel session is a **lane**. This runbook names no agent or tool, and
authorizes no work: `TASKS.md` does.

## Roles

| Role | Owns |
| --- | --- |
| Coordinator | The packets, the ledgers, generated files, the shared checks, every Git operation that changes something, and the final review |
| Lane | Only the files its packet names, its own review, and its hand-over |

A lane never commits or runs any other Git command that changes something, never edits the
ledgers, the agent files and settings (`AGENTS.md`, `CLAUDE.md`, the hooks) or generated output,
and never deploys or publishes.

## 1. Packet

- The coordinator writes one packet per lane from `../templates/lane-packet.md`, in the current
  milestone's folder, named `YYYY-MM-DD-HHMMSS-packet-<lane>-<topic>.md`.
- It names the files the lane owns, the files it may only read, and the files it must not touch
  because another lane or session owns them right now.
- Two lanes in one round never own the same file. Tests belong to the lane that owns the code they
  test.
- Before a round starts, the coordinator checks `git status` for other sessions' uncommitted work
  and keeps every lane off those files.
- The coordinator starts each lane with the packet's path as its first message (see
  `session-start-command.md`).

## 2. The lane's own review

Before it hands back, the lane:

1. reads its whole diff against the packet;
2. runs every check the packet names, and writes down each command and its result;
3. confirms with `git status --short` that every changed path is on its list;
4. fixes what it finds and runs the affected checks again;
5. writes its hand-over next to the packet, `YYYY-MM-DD-HHMMSS-handoff-<lane>.md`, and ends.

## 3. The coordinator's recheck

1. Confirm every changed path is inside the lane's list.
2. Read the full diff and the hand-over.
3. Run the shared checks no lane owns: the full build, lint, type checks and tests.
4. Accept the lane, or send a fix round to the same lane and wait again.
5. Commit the accepted lane alone, staging exact paths, never `git add -A`.
6. Record the result in `TASKS.md` and the session in `CHANGELOG_AI.md`.

A round is done only when every lane in it is accepted and the shared checks pass. A lane's report
is not evidence until the coordinator has rerun its checks.

## Keep the tree working

Lanes keep the project building after every edit: a running dev server and the other lanes' checks
load files as they are saved.
