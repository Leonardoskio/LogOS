# Divisione Lavoro

This file defines ownership boundaries so work can progress without mixing
concerns.

## Vault Owner

Responsible for:

```text
vault-template/
docs/obsidian-structure.md
```

Main tasks:

```text
define note templates
keep field names consistent
avoid duplicate data
keep 02 Archivio empty in the template vault
document Obsidian conventions
```

The vault owner should not add real company data to `vault-template/`.

## Backend Owner

Responsible for:

```text
backend/
docs/api-contract.md
```

Main tasks:

```text
validate form data
generate automatic IDs
create archive folders
render Markdown templates
write notes into the active vault
serve API responses to the frontend
separate live state from archive state
```

## Frontend Owner

Responsible for:

```text
frontend/
```

Main tasks:

```text
build forms for shipments, customers, drivers and tractors
call backend APIs
show archive and customer views
show live state when backend support exists
avoid writing directly to the vault
```

## AI Owner

Responsible for:

```text
prompts/
docs/ai-plan.md
vault-template/03 AI/
```

Main tasks:

```text
define report prompts
define recommendation prompts
ensure AI reads structured data
avoid using AI as the source of truth
keep generated reports traceable to source shipments
```

## Git Workflow

Use feature branches from `dev`.

```text
dev -> feature branch -> pull request -> dev
```

Only merge `dev` into `main` when the current development state is stable.
