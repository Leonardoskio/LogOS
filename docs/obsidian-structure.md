# Obsidian Structure

The Obsidian vault is the readable operational archive for LogOS. It is not a
free-form note space: each note type has a stable schema and relationships are
expressed through IDs.

## Template Vault

```text
vault-template/
├── 00 Template/
├── 01 Home/
├── 02 Archivio/
└── 03 AI/
```

`vault-template/` is copied when a new company vault is created. It contains no
real shipments. The real generated vaults live under `vaults/`.

## Runtime Vault

Example runtime structure:

```text
vaults/demo-company/
├── 00 Template/
├── 01 Home/
│   ├── Centro_operativo.md
│   ├── Autisti/
│   ├── Clienti/
│   └── Motrici/
├── 02 Archivio/
│   └── 2026/
│       └── Maggio/
│           └── 27/
│               └── SP-2026-00001_bianchi_LQ.md
└── 03 AI/
```

## Entity Model

The system intentionally has few entities:

```text
cliente
autista
motrice
spedizione
centro_operativo
```

The shipment is the central fact. Customers, drivers and tractors are connected
to shipments through IDs such as `cliente_id`, `autista_id` and `motrice_id`.

## Archive Rule

Shipments are stored only in the archive:

```text
02 Archivio/<year>/<month>/<day>/<shipment-file>.md
```

The folder path is based on `data_operativa`, not `created_at`.

Example:

```text
02 Archivio/2026/Maggio/27/SP-2026-00001_bianchi_LQ.md
```

## ID and Filename Rule

The stable ID should not contain mutable business details.

```text
SP-2026-00001
```

The filename can include readable hints:

```text
SP-2026-00001_bianchi_LQ.md
```

Where:

```text
SP-2026-00001 = stable shipment ID
bianchi       = customer slug for readability
LQ            = cargo type code
```

## Derived Data

Do not manually store values that can be derived from shipments, such as:

```text
number of shipments per customer
number of trips per tractor
driver shipment history
```

Those views should be produced by the backend or by Obsidian query tools.

## Live Data

Live tractor tracking, current GPS position and frequent status changes should
not be written to Markdown on every update. The vault is for stable history and
snapshots. Real-time state belongs in backend memory or a future database.
