# Acceptance

The definition of done. A task, phase or milestone is done only when every item that applies to it
is true, checked, and reported as it is.

## Definition of done (every task)

- [ ] The change is inside `PRODUCT.md`'s scope and uses only tools in `TECH_STACK.md`.
- [ ] The build, lint, type checks and tests that exist pass, with no new warnings. What was not
  run is said plainly.
- [ ] New behaviour has a test beside its code.
- [ ] Interface work is checked in a real browser or device at a wide and a narrow size, with
  keyboard focus, readable contrast (WCAG AA), and the empty, loading and error states the flow
  can reach.
- [ ] New names are specific (`AGENTS.md`, rule 6) and new paths are in `FOLDER_STRUCTURE.md`.
- [ ] No secret, key or password is in a tracked file.
- [ ] Pictures carry no hidden data: `node tools/strip-picture-hidden-data.mjs --check .` reports
  every picture clean.
- [ ] `TASKS.md` is up to date, the session is in `CHANGELOG_AI.md`, decisions are in
  `DECISIONS.md`, and open problems are in `BUGS.md`.

## Milestone 0.1 — Planning and design

- [ ] `workflow/` has its 15 files, the notes tiers and templates, `tasks/0.1/`, `tasks/pending/`
  and `archive/`; `test_trash/` exists with its README.
- [ ] The project's name and one-line description are filled in wherever "[project name]" stood,
  and `PROJECT` in the task IDs is the project's short name.
- [ ] The delete guard blocks `rm -rf dist` (`--check`), and each agent the team uses has the
  project's hooks approved and trusted.
- [ ] The pictures' pre-commit hook is installed, and `--check .` reports every picture clean.
- [ ] `PRODUCT.md`, the roadmap in `PLANNING.md` and the proposed stack are written, and the owner
  approved the product.
- [ ] Design options exist in `test_trash/mockups/` and were checked in a browser; the owner's pick
  is in `DECISIONS.md` with their words.
- [ ] The owner approved the stack, with versions read from the official registries on that day.
- [ ] The `LICENSE` file names the license and copyright holder the owner chose.
- [ ] `LAUNCHER.md` has a start, build, test and lint command for each operating system.
- [ ] The first commit is made on the owner's go.

## Milestone 0.2 — [name]

### Phase 1 — [name]

- [ ] [what a person can do, stated so it can be checked: "A signed-out visitor can …"]
- [ ] […]
