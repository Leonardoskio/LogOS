# Demo Scolastica

This document describes the shortest repeatable demo for LogOS.

The goal is not to show every future feature. The goal is to show the working
MVP flow:

```text
form frontend
  -> backend Node.js
  -> Markdown shipment notes in Obsidian vault
  -> archive and relation views
  -> mock AI daily report
```

## What The Demo Shows

The current demo can show:

```text
backend health check
shipment creation from the browser
automatic shipment IDs
automatic daily archive folders
shipment list loaded from Markdown notes
customer, driver and tractor relation lists derived from shipments
daily AI report generated from real archived shipments
report saved into the runtime vault under 03 AI
```

The current demo does not yet show:

```text
independent customer creation form
independent driver creation form
independent tractor creation form
tractor map tracking
real external AI provider
authentication
database persistence outside Markdown
```

## Reset And Seed Demo Data

From the repository root:

```bash
cd backend
npm install
npm run demo:seed
```

The seed command resets only this runtime vault:

```text
vaults/demo-company/
```

It refuses to run if `ACTIVE_VAULT_PATH` points somewhere else. This prevents
accidentally deleting a real vault.

The generated demo contains:

```text
3 shipments on 2026-05-27
1 shipment on 2026-05-28
1 AI daily report for 2026-05-27
```

Runtime vault data is ignored by Git.

## Run Backend

From `backend/`:

```bash
npm run dev
```

Expected terminal output:

```text
LogOS backend listening on http://localhost:3000
```

## Open Frontend

Open this file in the browser:

```text
frontend/index.html
```

The top-right status should become:

```text
Backend collegato
```

## Presentation Flow

Recommended order:

```text
1. Open the frontend and show that the backend is connected.
2. Show the shipment form.
3. Create one shipment.
4. Show that the archive list updates.
5. Click a customer, driver or tractor counter to filter related shipments.
6. Generate the AI daily report for 2026-05-27.
7. Open vaults/demo-company in Obsidian.
8. Show the generated archive folders under 02 Archivio.
9. Show the generated report under 03 AI/Report/Giornalieri.
```

## Files To Mention During The Demo

```text
frontend/index.html
backend/src/server.js
backend/src/routes/spedizioni.js
backend/src/routes/ai.js
backend/src/services/vaultService.js
backend/src/services/mockAiProvider.js
vault-template/
vaults/demo-company/
docs/api-contract.md
docs/data-model.md
```

## Technical Message

The important technical point is that Obsidian is not being used as a random
database dump. The backend writes structured Markdown notes with frontmatter.
The frontend never edits the vault directly. AI reads already validated
structured data and produces a secondary report.

This keeps the MVP small enough for a school project while still making the
relationships visible:

```text
shipment -> customer
shipment -> driver
shipment -> tractor
shipment -> day
shipment -> AI report source
```
