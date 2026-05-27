# Data Model MVP

This document freezes the minimum data model used by the first working version
of LogOS. Frontend forms, backend validation, Markdown templates and AI prompts
must use these names unless this file is updated first.

## General Rules

Field names use lowercase `snake_case`.

Dates use ISO format:

```text
YYYY-MM-DD
```

Datetimes use ISO 8601 with timezone:

```text
2026-05-27T14:30:00+02:00
```

IDs are generated or normalized by the backend. Users should not type official
IDs manually in the normal workflow.

## Shipment

Type:

```text
spedizione
```

Required fields:

```text
type
id
data_operativa
cliente_id
cliente_nome
merce
tipo_carico
origine
destinazione
stato
created_at
updated_at
```

Optional fields:

```text
autista_id
motrice_id
distanza_km
note
```

`id` format:

```text
SP-YYYY-NNNNN
```

Example:

```text
SP-2026-00001
```

The progressive number is annual and scoped to the runtime company vault.

Allowed `stato` values:

```text
richiesta
programmata
in_viaggio
completata
annullata
```

Allowed `tipo_carico` values:

```text
LQ  = liquido
FR  = refrigerato/fresco
SEC = secco
ADR = merce pericolosa
GEN = generico
```

Archive path:

```text
02 Archivio/<year>/<month-name>/<day>/<id>_<cliente_id>_<tipo_carico>.md
```

Example:

```text
02 Archivio/2026/Maggio/27/SP-2026-00001_bianchi_LQ.md
```

## Customer

Type:

```text
cliente
```

Required fields:

```text
type
id
nome
created_at
updated_at
```

Optional fields:

```text
riferimento
telefono
email
sede_citta
sede_provincia
sede_cap
sede_via
sede_numero_civico
```

`id` format:

```text
lowercase slug without spaces
```

Example:

```text
bianchi
azienda-bianchi
rossi-trasporti
```

If two customers produce the same slug, the backend must add a suffix.

Customer shipment count is derived by counting shipments with the same
`cliente_id`. It is not stored as primary data.

## Driver

Type:

```text
autista
```

Required fields:

```text
type
id
nome
cognome
stato
created_at
updated_at
```

Optional fields:

```text
data_scadenza_patente
posizione
```

Allowed `stato` values:

```text
disponibile
assegnato
in_viaggio
non_disponibile
```

`id` format:

```text
nome-cognome
```

Example:

```text
mario-rossi
```

If two drivers produce the same slug, the backend must add a suffix.

## Tractor

Type:

```text
motrice
```

Required fields:

```text
type
id
targa
stato
created_at
updated_at
```

Optional fields:

```text
marca
scadenza_assicurazione
chilometri_percorsi
posizione
```

Allowed `stato` values:

```text
disponibile
assegnata
in_viaggio
manutenzione
fuori_servizio
```

`id` format:

```text
normalized plate, uppercase, without spaces
```

Example:

```text
AB123CD
```

## Operations Center

Type:

```text
centro_operativo
```

Required fields:

```text
type
id
nome
updated_at
```

Optional fields:

```text
motrici_disponibili
autisti_disponibili
sede_citta
sede_provincia
sede_cap
sede_via
sede_numero_civico
```

The operations center represents the logistics company base. Customer sede data
stays inside customer notes; there is no separate sede entity in the MVP.

## Derived Relationships

Relationships are derived from shipment metadata:

```text
cliente_id -> customer
autista_id -> driver
motrice_id -> tractor
data_operativa -> archive day
```

Do not duplicate full shipment data inside customer, driver or tractor notes.
