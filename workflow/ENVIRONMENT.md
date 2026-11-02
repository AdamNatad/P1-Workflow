# Environment

What a computer needs to build, run and test the project, and every setting it reads. Values of
secrets never appear here, only their names. Until the project reads any setting, the newest entry
says so ("No environment variables yet").

## [YYYY-MM-DD] — Development

| Tool | Version | Why |
| --- | --- | --- |
| Node.js | [exact] | Runs the agents' delete guard, `.agents/hooks/block-permanent-delete-commands.mjs`, and the pictures' strip tool, `tools/strip-picture-hidden-data.mjs` |
| `trash` | [exact] | Every deletion goes to the Recycle Bin or Trash (`AGENTS.md`, rule 12) |
| [runtime] | [exact] | […] |
| [package manager] | [exact] | […] |

### Settings

| Variable | Secret? | Used by | Example (never a real secret) |
| --- | --- | --- | --- |
| `<PROJECT_SETTING_NAME>` | [yes or no] | [module] | `<example>` |

- A secret is set in the environment or a secrets manager, never written in a file, a note, a log,
  a commit message or chat. Test and live values stay apart.
- `.env` files are ignored by Git. `.env.example` lists each setting's name, with no real value.

### Local ports

| Port | Serves |
| --- | --- |
| [port] | [what] |
