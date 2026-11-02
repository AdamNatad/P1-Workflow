# Tech Stack

The approved tools, libraries and services. Nothing is installed until it is listed here with the
owner's approval.

## [YYYY-MM-DD] — Approved stack

The owner approved this on [YYYY-MM-DD]: "[quote]". Versions were read from the official registries
and release pages on that day, never from memory.

| Concern | Choice | Version | License | Notes |
| --- | --- | --- | --- | --- |
| Runtime | […] | [exact] | […] | |
| Package manager | […] | [exact] | […] | Pinned in the project's manifest |
| Language | […] | [exact] | […] | |
| Framework | […] | [exact] | […] | |
| Tests | […] | [exact] | […] | |
| Lint | […] | [exact] | […] | |
| Hosting | […] | — | — | `DEPLOYMENT.md` |

## Release-age rule

Install only releases at least 7 days old, and pin exact versions. A freshly published bad or
hijacked release then cannot slip in. Update on purpose, one dependency at a time, and set the
package manager's own minimum release age where it has one.

## Not chosen

- [a tool you considered, and the one-line reason it isn't used]
