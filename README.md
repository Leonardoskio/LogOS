# LogOS

LogOS is a logistics web application for managing shipments, customers, drivers
and tractors while keeping the operational archive readable in Obsidian.

The project is built around a simple rule:

```text
Backend = creates and validates structured data
Obsidian vault = readable operational archive
AI = analysis, reports and suggestions
```

The vault is not meant to be a random folder of notes. It is a standardized
Markdown archive where every generated note has a stable type, ID and metadata.

## Core Concept

The central object is the shipment.

```text
Customer 1 -> many Shipments
Driver   1 -> many Shipments
Tractor  1 -> many Shipments
Day      1 -> many Shipments
```

Each shipment is saved once in the archive:

```text
vaults/<company>/02 Archivio/<year>/<month>/<day>/
```

Customer, driver and tractor pages do not duplicate shipment data. They expose
relationships through shared IDs and future query views.

## Repository Layout

```text
backend/        Node.js backend skeleton and future API logic
frontend/       Browser interface skeleton
docs/           Project, setup, API and vault documentation
prompts/        AI prompt templates used by the backend
vault-template/ Standard Obsidian vault copied for each company
vaults/         Runtime company vaults, kept out of Git except .gitkeep
```

## Vault Strategy

`vault-template/` is the shared standard. It contains templates, home pages,
archive placeholders and AI dashboard pages.

`vaults/` is where real company vaults will be created at runtime. Those files
can contain operational data and should not be committed to the repository.

## Data Model

The MVP data model is defined in:

```text
docs/data-model.md
```

Frontend forms, backend validation, Markdown templates and AI prompts should use
those field names before introducing new ones.

Example request payloads for the MVP live in:

```text
examples/
```

## Development Flow

Use `dev` for active development. Create feature branches from `dev`, open pull
requests back into `dev`, and only promote to `main` when the project is stable.

```text
feature branch -> dev -> main
```

## Current Status

This repository is still in the architecture and skeleton phase. The important
work now is to keep the data model, vault structure and backend responsibilities
clear before implementing full behavior.
