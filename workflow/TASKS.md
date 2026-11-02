# Tasks

Open work, top first, grouped by milestone and phase. Work only within the current phase. The owner
sets the schedule: tasks carry scope and order, never dates or durations.

- Mark a task `[x]` the moment it is done, with a one-line note of what was done and the check that
  proves it.
- Add a task the moment you find it, under the phase it belongs to. A required leftover sits
  indented under its parent, and the parent stays open until every required leftover is done.
- A blocked task stays here with what blocks it.
- **[Owner]** means only the owner can close it: a decision, an approval, an account or a payment.
  Everything else is an agent task.
- Task IDs are specific names in capitals that start with the project's short name:
  `PROJECT-WHAT-IT-IS`, with `PROJECT` replaced (`SHOP-CART-CHECKOUT`).

## Milestone 0.1 — Planning and design (current)

- [ ] **PROJECT-WORKFLOW-SCAFFOLD:** these files at the repository's root, with the project's name
  and one-line description filled in (`AGENTS.md`, `CLAUDE.md`, `workflow/START.md`), `PROJECT` in
  these task IDs replaced, and `git init` on `main`. Check the delete guard with
  `node .agents/hooks/block-permanent-delete-commands.mjs --check "rm -rf dist"` (it must say
  blocked), approve the project's hooks in each agent the team uses, and install the pictures'
  pre-commit hook with `node tools/strip-picture-hidden-data.mjs --install-git-hook`. Done when: no
  "[project name]" is left, the guard blocks, and the pre-commit hook is installed.
- [ ] **PROJECT-INITIAL-PLAN:** `PRODUCT.md`, the roadmap in `PLANNING.md`, a proposed stack in
  `TECH_STACK.md`, and a planning record in `tasks/0.1/` that lists every open decision.
- [ ] **[Owner] PROJECT-PRODUCT-APPROVAL:** the owner approves `PRODUCT.md`, with their words in
  `DECISIONS.md`.
- [ ] **PROJECT-DESIGN-MOCKUPS:** two or three design options side by side in
  `test_trash/mockups/`, checked in a browser.
- [ ] **[Owner] PROJECT-DESIGN-PICK:** the owner picks the look and layout; the pick and their words
  go in `DECISIONS.md`, and `START.md` names the chosen mockup.
- [ ] **[Owner] PROJECT-TECH-STACK-APPROVAL:** the owner approves the stack, with versions read from
  the official registries on that day and the release-age rule.
- [ ] **[Owner] PROJECT-LICENSE-CHOICE:** the owner picks the license and its copyright holder, and
  the `LICENSE` file says it.
- [ ] **[Owner] PROJECT-REPOSITORY:** where the repository lives, and whether it is public.
- [ ] **PROJECT-LAUNCHER:** one start, build, test and lint command for each operating system,
  written in `LAUNCHER.md`.
- [ ] **PROJECT-FIRST-COMMIT:** the first commit, staged by exact paths, on the owner's go.

## Milestone 0.2 — [name]

### Phase 1 — [name]

- [ ] **PROJECT-[TASK-NAME]:** [what, in one line]. Done when: [the `ACCEPTANCE.md` item].
  - [ ] **PROJECT-[LEFTOVER-NAME]:** [a required leftover of the task above].
- [ ] **[Owner] PROJECT-[DECISION-NAME]:** [the decision only the owner can make].

### Phase 2 — [name]

- [ ] **PROJECT-[TASK-NAME]:** […].

## Later (not scheduled)

- [ ] **PROJECT-[TASK-NAME]:** [work that needs the owner's go before it joins a milestone].
