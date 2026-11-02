# test_trash

Temporary files belong here instead of the repository's root or its source folders:

- `mockups/`: design mockups, and temporary review or preview pages;
- `artifacts/`: screenshots and other captures;
- `logs/`: temporary logs, the launcher's among them;
- here at the top: one-off repros and debug files.

Rules:

- Git ignores everything here except this README and the three empty folders above.
- Move anything worth keeping into its real home (the source, or the right `workflow/notes/`
  folder) before you clean up.
- Clean up with `trash`, never a permanent delete, like everywhere else.
- Pictures here carry no hidden data either: strip them with `tools/strip-picture-hidden-data.mjs`
  the moment they land.
