# LogOS Vault Template

This folder is the standard Obsidian vault copied for each company using LogOS.
It contains the structure and templates, not real operational data.

## Sections

```text
00 Template = note models used by backend and Obsidian
01 Home     = main navigation and company entities
02 Archivio = generated shipment archive, empty in the template
03 AI       = AI dashboards, reports and analysis outputs
```

## Main Rule

The shipment is created once in `02 Archivio`. Customers, drivers and tractors
reference shipments through metadata fields such as:

```text
cliente_id
autista_id
motrice_id
```

Do not duplicate full shipment content inside customer, driver or tractor notes.

## Runtime Data

`02 Archivio` must stay empty in this template. During application use, the
backend creates folders like:

```text
02 Archivio/2026/Maggio/27/
```

and writes shipment notes inside them.

## Editing This Template

When changing field names, update:

```text
00 Template/*.md
docs/obsidian-structure.md
backend services that read/write those fields
```

Field names should stay lowercase `snake_case` to keep backend parsing simple.
