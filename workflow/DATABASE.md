# Database

Every place the project stores data: what it holds, its keys, and how it changes. Until the project
stores anything, the newest entry says so ("No database yet").

## [YYYY-MM-DD] — [store name]

| Table or store | Holds | Key |
| --- | --- | --- |
| [name] | [what one row is] | [key] |

Rules:

- Every change to a schema goes with a migration. Never wipe people's data on an upgrade.
- Indexes and caches can be rebuilt from the source of truth; say which one is the source.
- Names follow the specific-names rule.
- A proposed store is marked "(proposed)" until the phase that builds it lands.
