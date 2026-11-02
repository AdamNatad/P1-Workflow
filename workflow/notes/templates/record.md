---
kind: <implementation-record | planning-record | decision-record | lane-packet | handoff>
status: <active | approved | blocked | pending-approval | pending-rollout | completed>
created: <YYYY-MM-DDTHH:MM:SS+00:00>
updated: <YYYY-MM-DDTHH:MM:SS+00:00>
milestone: "<0.1>"
source-of-truth: "workflow/TASKS.md"
recorded: <YYYY-MM-DDTHH:MM:SS+00:00, the same instant as the file name>
---

# [Milestone 0.1: what this record captures]

<!-- Copy to workflow/tasks/<milestone>/ and name it YYYY-MM-DD-HHMMSS-topic.md. A proposal waiting
for the owner goes in workflow/tasks/pending/ with status pending-approval. A record explains and
evidences work; authority stays in the 15 files in workflow/. Plans carry phases and scope only,
never dates or durations. -->

## Scope

[One paragraph: what this covers, and the exact paths it owns.]

## The owner's words

[Quoted, in order.]

## What changed

[Ordered, concrete changes with exact paths.]

## Verification

[Commands run and their results. Say plainly what was not run.]

## Open items

[What is left, and who it waits on. Blockers go in `BUGS.md` too, new tasks in `TASKS.md`.]

## Lifecycle

Finished when its milestone is finished. It then moves to `workflow/archive/<milestone>/` with its
status set to `completed`, `superseded` or `retired`.
