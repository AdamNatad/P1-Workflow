# Lane packet: [lane name]

<!-- The coordinator copies this to workflow/tasks/<milestone>/ as
YYYY-MM-DD-HHMMSS-packet-<lane>-<topic>.md and starts the lane with its path. A lane edits only the
files it owns here, never commits, and writes its hand-over next to this packet. How a round runs:
workflow/notes/runbooks/parallel-lanes.md. -->

## Goal

[One paragraph: what this lane builds, and why, with the task ID from `TASKS.md` and any decision
it rests on.]

## Read first

- `AGENTS.md`, `workflow/START.md`
- [the record, doc or area note this lane builds from]

## Owns

The only files this lane may create, edit or delete:

- `<path>`
- `<path>`

## Read-only

- `<path>`

## Must not touch

Files another lane or session owns right now:

- `<path>`

If the work needs a file not listed under Owns, stop and ask the coordinator.

## Checks

- [the exact commands this lane runs, and what each must show]

## Done looks like

- [a checkable result]
- The checks above pass.

## Hand back

Write `YYYY-MM-DD-HHMMSS-handoff-<lane>.md` next to this packet:

- **Files changed:** [every path, all under Owns].
- **Commands and results:** [exact command → result].
- **Not run:** [check → why].
- **Found and fixed in your own review:** [list].
- **Left for the coordinator:** [leftovers, and any decision the owner must make].

Don't stage, commit or edit the ledgers: the coordinator rechecks and records the work.
