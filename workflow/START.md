# Session Start

Read this file first in every new session. Keep it short and current: when the milestone or phase
changes, update it in the same session.

## [YYYY-MM-DD] — [where the project stands, in one line]

**What this project is:** [one sentence from `PRODUCT.md`].

**Current milestone:** 0.1 — Planning and design. **Next:** 0.2 — [name], phase 1 — [name]. The
owner sets the schedule, so nothing here carries a date or a duration.

**Design:** [the chosen look and layout, and the mockup in `test_trash/mockups/` that shows it;
until the owner picks, "not chosen yet"].

## Read in this order

1. [PLANNING.md](PLANNING.md): the roadmap, its milestones and phases.
2. [TASKS.md](TASKS.md): open items, top first. Work the first open task of the current phase.
3. [PRODUCT.md](PRODUCT.md): what the project is and is not.
4. [ACCEPTANCE.md](ACCEPTANCE.md): what done means.
5. [TECH_STACK.md](TECH_STACK.md) and [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md): the tools, and
   where things go.
6. The newest records in [tasks/0.1/](tasks/0.1/).
7. [notes/README.md](notes/README.md): the knowledge base, when you need how something works.

Before you write code, also read [DATABASE.md](DATABASE.md), [ENVIRONMENT.md](ENVIRONMENT.md) and
[DEPLOYMENT.md](DEPLOYMENT.md), and [LAUNCHER.md](LAUNCHER.md) to run it. For how we got here, read
[HISTORY.md](HISTORY.md) and [CHANGELOG_AI.md](CHANGELOG_AI.md).

## The rules in short

The full rules are in `AGENTS.md`.

- These 15 files are the only authority. Notes explain; records support; proposals in
  `tasks/pending/` grant nothing.
- One phase at a time. Mark tasks done at once; add new tasks at once; leftovers first.
- Specific names only.
- One coordinator owns the ledgers and every commit; lanes edit only their packet's files.
- Stage exact paths; never `git add -A`. Delete with `trash`. Strip pictures' hidden data with
  `tools/strip-picture-hidden-data.mjs`.
- Record every session in `CHANGELOG_AI.md`, and end with the session summary.
