---
kind: runbook
status: active
created: <YYYY-MM-DDTHH:MM:SS+00:00>
updated: <YYYY-MM-DDTHH:MM:SS+00:00>
milestone: "0.1"
source-of-truth: "workflow/TASKS.md"
---

# Task list

When the owner says "tasklist" (any case), or asks for progress in this format, report it this way
without asking again. A progress request doesn't stop the work under way. This note sets the
format only; `TASKS.md` owns the scope, status, owners and blockers.

## Read first

Read the current `TASKS.md`, the milestone's newest records, the Git state and the latest check
results. Never reuse an earlier percentage without checking it again.

## Layout

1. Start with **Milestone [number] · [name]: [N]% done ([done]/[total] counted items)**.
2. Then one table: **Task / leftover**, **Session**, **Verified %**, **State**, **Next step**. Each
   required leftover sits right under its parent, starting with `↳`.
3. States: ✅ done, 🔄 active, 🔍 being checked, ⏳ queued, 🟠 blocked or waiting on the owner,
   ⏸️ paused, each with its word as well.
4. The last column names the concrete next step or blocker, and who can clear it.
5. End with one sentence on what is running now and what is checked next.

## Percentages

- Verified only. A task counts as 100% when its work, checks and review have passed; otherwise 0%.
- Count required tasks and leftovers, and the milestone's `ACCEPTANCE.md` items, each once. Keep
  the total the same between reports, and say why when it changes.
- Never invent a percentage for the whole project. If it can't be backed, say **not measured**.
- No due dates or durations.

## Example

Format only; every value comes from current evidence.

| Task / leftover | Session | Verified % | State | Next step |
| --- | --- | ---: | --- | --- |
| PROJECT-WORKFLOW-SCAFFOLD | coordinator | 100% | ✅ Done | — |
| PROJECT-DESIGN-MOCKUPS | lane A | 0% | 🔄 Active | Three options in `test_trash/mockups/` |
| ↳ PROJECT-DESIGN-MOCKUPS-NARROW-CHECK | lane A | 0% | ⏳ Queued | Check each option at phone width |
| PROJECT-DESIGN-PICK | owner | 0% | 🟠 Waiting on the owner | The owner picks A, B or C |
