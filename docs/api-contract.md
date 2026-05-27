# API Contract

This document describes the planned HTTP contract between the frontend and the
Node.js backend. The backend is responsible for validation, ID generation,
archive placement and writing Markdown notes into the active company vault.

The field-level source of truth is `docs/data-model.md`. If an API field and
the data model disagree, update the data model first.

Base URL during local development:

```text
http://localhost:3000/api
```

## Shipments

### Create Shipment

```text
POST /api/spedizioni
```

Creates one shipment note in the active vault archive.

Request body:

```json
{
  "data_operativa": "2026-05-27",
  "cliente_id": "bianchi",
  "cliente_nome": "Azienda Bianchi",
  "merce": "Liquido alimentare",
  "tipo_carico": "LQ",
  "origine": "Centro operativo",
  "destinazione": "Via Roma 12, Milano",
  "autista_id": "mario-rossi",
  "motrice_id": "AB123CD",
  "distanza_km": 230,
  "note": "Scarico entro le 10:00"
}
```

Required request fields:

```text
data_operativa
cliente_id
cliente_nome
merce
tipo_carico
origine
destinazione
```

Optional request fields:

```text
autista_id
motrice_id
distanza_km
note
stato
```

If `stato` is omitted, the backend should use:

```text
richiesta
```

Backend behavior:

```text
1. validate required fields
2. generate a stable shipment ID
3. ensure the customer exists or create it
4. create archive folders by data_operativa
5. render 00 Template/Spedizione.md
6. write the shipment note under 02 Archivio
```

Response:

```json
{
  "id": "SP-2026-00001",
  "file": "SP-2026-00001_bianchi_LQ.md",
  "path": "02 Archivio/2026/Maggio/27/SP-2026-00001_bianchi_LQ.md"
}
```

Minimum validation errors:

```text
400 missing_required_field
400 invalid_date
400 invalid_tipo_carico
400 invalid_stato
409 duplicate_id
500 vault_write_failed
```

### List Shipments

```text
GET /api/spedizioni
```

Optional query parameters:

```text
cliente_id
autista_id
motrice_id
data_operativa
stato
```

The backend can initially read Markdown frontmatter from `02 Archivio`. If a
relational database is added later, this endpoint should keep the same shape.

## Customers

```text
GET /api/clienti
GET /api/clienti/:id
POST /api/clienti
```

Customers represent companies and their main sede/indirizzo. Customer shipment
counts are derived from shipments, not stored as manually maintained data.

Create customer request:

```json
{
  "nome": "Azienda Bianchi",
  "riferimento": "Luca Bianchi",
  "telefono": "+39 000 000000",
  "email": "logistica@bianchi.example",
  "sede_citta": "Milano",
  "sede_provincia": "MI",
  "sede_cap": "20100",
  "sede_via": "Via Roma",
  "sede_numero_civico": "12"
}
```

The backend generates or normalizes `id`.

## Drivers

```text
GET /api/autisti
GET /api/autisti/:id
POST /api/autisti
```

Driver pages are stored in `01 Home/Autisti`. Real-time position should later be
served by the backend, not continuously written to Markdown.

Create driver request:

```json
{
  "nome": "Mario",
  "cognome": "Rossi",
  "data_scadenza_patente": "2027-06-30",
  "stato": "disponibile"
}
```

## Tractors

```text
GET /api/motrici
GET /api/motrici/:id
POST /api/motrici
PATCH /api/motrici/:id/stato
```

Tractors have static data in the vault and operational state in the backend.
Markdown can store snapshots, but live tracking belongs outside the vault.

Create tractor request:

```json
{
  "targa": "AB123CD",
  "marca": "Iveco",
  "stato": "disponibile",
  "scadenza_assicurazione": "2027-01-31",
  "chilometri_percorsi": 120000
}
```

## AI

```text
POST /api/ai/report-giornaliero
POST /api/ai/consigli-logistici
```

AI endpoints must read structured data already created by the backend. AI should
not be the source of truth for IDs, archive paths or primary logistics records.
