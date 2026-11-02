# Notes

`workflow/notes/` is the knowledge base: it explains how the project works and how to operate it.
It never creates authority. The 15 top-level files in `workflow/` are the only authority, above all
`TASKS.md`. When the owner says "notes" without another path, it means this folder.

## The four tiers of `workflow/`

| Tier | Path | Holds | Authority |
| --- | --- | --- | --- |
| Authority | `workflow/*.md` | Product, plan, tasks, acceptance, stack, environment, deployment, and the four ledgers | Yes, the only one |
| Notes | `workflow/notes/` | `docs/` (how things work), `runbooks/` (how you do an operation), `areas/` (one note per module), `overview.md`, `templates/` | No |
| Tasks | `workflow/tasks/` | The current milestone's records, and `pending/` proposals | Records support `TASKS.md`; proposals grant nothing |
| Archive | `workflow/archive/` | Finished milestones' records and retired notes | No, read-only past |

Four ledgers, one question each: [HISTORY.md](../HISTORY.md) answers how the architecture changed
and when; [DECISIONS.md](../DECISIONS.md) answers why; [CHANGELOG_AI.md](../CHANGELOG_AI.md)
answers what each session did; [BUGS.md](../BUGS.md) answers what is broken now.

## Read in this order

1. [TASKS.md](../TASKS.md): the first open task of the current phase.
2. The newest records in [tasks/0.1/](../tasks/0.1/), the current milestone's folder.
3. [overview.md](overview.md) for the product and system map, then the note in
   [areas/](areas/README.md) for the module you are touching.
4. [HISTORY.md](../HISTORY.md) when you need to know how we got here.

Proposals waiting for the owner's decision sit in [tasks/pending/](../tasks/pending/README.md). A
file there is neither approved nor discarded.

## Writing a note

- Copy a template from `templates/`:
  - `doc.md` for how something works;
  - `runbook.md` for how you do an operation;
  - `record.md` for a timestamped milestone record;
  - `decision.md` and `bug.md` for ledger entries;
  - `lane-packet.md` for a parallel session's packet.
- Name files after their subject, lowercase with dashes. Use plain backticked paths.
- Add the note to the index below, and change its "Updated" when you change it.

## Index

### Orientation

| Note | What it covers | Status | Updated |
| --- | --- | --- | --- |
| [Overview](overview.md) | The product and system map | active | [YYYY-MM-DD] |
| [Areas](areas/README.md) | One note per code module, and what each holds | active | [YYYY-MM-DD] |

### Docs: how things work

| Note | What it covers | Status | Updated |
| --- | --- | --- | --- |
| [Coding agents and the delete guard](docs/coding-agents-and-the-delete-guard.md) | Which file each agent reads the rules from, each one's hook or deny rules, how the guard decides, and its limits | active | [YYYY-MM-DD] |

### Runbooks: how you do an operation

| Note | What it covers | Status | Updated |
| --- | --- | --- | --- |
| [Session summary](runbooks/session-summary.md) | The ten-item end-of-session summary | active | [YYYY-MM-DD] |
| [Task list](runbooks/task-list.md) | The owner's progress-report format | active | [YYYY-MM-DD] |
| [Parallel lanes](runbooks/parallel-lanes.md) | Running several sessions at once: packets, lanes, the coordinator's recheck and commit | active | [YYYY-MM-DD] |
