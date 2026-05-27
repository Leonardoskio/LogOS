# API Contract

This document describes the planned HTTP contract between the frontend and the
Node.js backend. The backend is responsible for validation, ID generation,
archive placement and writing Markdown notes into the active company vault.

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
  "distanza_km": 230
}
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

## Drivers

```text
GET /api/autisti
GET /api/autisti/:id
POST /api/autisti
```

Driver pages are stored in `01 Home/Autisti`. Real-time position should later be
served by the backend, not continuously written to Markdown.

## Tractors

```text
GET /api/motrici
GET /api/motrici/:id
POST /api/motrici
PATCH /api/motrici/:id/stato
```

Tractors have static data in the vault and operational state in the backend.
Markdown can store snapshots, but live tracking belongs outside the vault.

## AI

```text
POST /api/ai/report-giornaliero
POST /api/ai/consigli-logistici
```

AI endpoints must read structured data already created by the backend. AI should
not be the source of truth for IDs, archive paths or primary logistics records.
