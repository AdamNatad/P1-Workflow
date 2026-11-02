# Launcher

How to start, build and test the project on each operating system, with one command each. When the
owner asks to run the project, start it through the launcher so it can be checked live.

## [YYYY-MM-DD] — Commands

| Does | Windows | macOS | Linux |
| --- | --- | --- | --- |
| Start (development) | `<command>` | `<command>` | `<command>` |
| Build | `<command>` | `<command>` | `<command>` |
| Test | `<command>` | `<command>` | `<command>` |
| Lint | `<command>` | `<command>` | `<command>` |
| Strip pictures' hidden data | `node tools/strip-picture-hidden-data.mjs <path>` | the same | the same |
| Check pictures are clean | `node tools/strip-picture-hidden-data.mjs --check .` | the same | the same |
| Install the pictures' pre-commit hook (once per clone) | `node tools/strip-picture-hidden-data.mjs --install-git-hook` | the same | the same |
| Check a command against the delete guard | `node .agents/hooks/block-permanent-delete-commands.mjs --check "<command>"` | the same | the same |

The launcher's scripts live in `<folder>`; ports are in `ENVIRONMENT.md`.

### What the launcher does

- Each operating system gets a thin script that hands off to one shared launcher, so the steps are
  written once.
- It checks the runtime and package manager versions, and installs dependencies when they are
  missing or older than the lockfile.
- It starts the project on a fixed local port and refuses to start when that port is taken.
- It writes its output to `test_trash/logs/`.
- It has `--help`, and `--dry-run`, which prints what it would do and runs nothing.
