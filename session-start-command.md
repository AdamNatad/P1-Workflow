# Session start command

Paste this line at the start of every agent session:

```text
Read AGENTS.md and workflow/START.md, then the files in the order START.md gives, and read workflow/PLANNING.md and workflow/TASKS.md before any work. Work the first open task of the current phase only. Mark it done when it is done, record the session in workflow/CHANGELOG_AI.md, and end with the session summary from AGENTS.md.
```

For a lane session, add: "You are a lane: your packet is [path]. Edit only the files it names,
don't commit, and write your hand-over next to the packet."

For the coordinator of several sessions, add: "You are the coordinator: write a packet for each
lane in workflow/tasks/[milestone]/, recheck each lane's work, and commit it by exact paths."
