---
kind: runbook
status: active
created: <YYYY-MM-DDTHH:MM:SS+00:00>
updated: <YYYY-MM-DDTHH:MM:SS+00:00>
milestone: "0.1"
source-of-truth: "AGENTS.md"
---

# Session summary

Every session ends with this summary, in this order, after its entry is in
`workflow/CHANGELOG_AI.md`. `AGENTS.md` (rule 18) carries the same list.

1. **Session type:** `code`, `workflow` or `mixed`.
2. **Current milestone and phase,** from `TASKS.md`.
3. **What changed,** including workflow file updates.
4. **Files changed.**
5. **Commands run.**
6. **Build and test result,** as it was: say what failed, with its output, and what was skipped.
7. **Problems found,** and where each is recorded (`BUGS.md`, `TASKS.md`).
8. **Tasks completed,** by ID.
9. **New tasks discovered,** by ID.
10. **Next recommended task,** by ID, or the owner's decision it waits on.
