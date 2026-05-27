# Setup

This document explains how to clone LogOS, run the current MVP and work on the
correct branch.

## Requirements

Recommended local tools:

```text
Git
Node.js 20+
Obsidian
```

## Clone

```bash
git clone https://github.com/Leonardoskio/LogOS.git
cd LogOS
git checkout dev
git pull origin dev
```

## Environment

Copy `.env.example` to `.env` before running the backend once implementation
starts.

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Backend

The backend is in `backend/`.

```bash
cd backend
npm install
npm run dev
```

The backend listens on:

```text
http://localhost:3000
```

The API base URL is:

```text
http://localhost:3000/api
```

## Demo Data

To generate a repeatable local demo vault:

```bash
cd backend
npm run demo:seed
```

The command resets only:

```text
vaults/demo-company/
```

It creates example shipments and one mock AI daily report. Details are in:

```text
docs/demo.md
```

## Frontend

The frontend is static and can be opened directly in the browser:

```text
frontend/index.html
```

Run the backend before opening the frontend, otherwise the interface will show
`Backend non collegato`.

## Obsidian Vault Template

Open this folder in Obsidian when editing the shared standard:

```text
vault-template/
```

Do not put real company shipments in `vault-template/02 Archivio`. Runtime data
belongs in generated vaults under `vaults/`.

For demo or local testing, open this generated vault in Obsidian:

```text
vaults/demo-company/
```

## Git Branches

Create a branch before changing files:

```bash
git checkout -b short-description
```

Then:

```bash
git status
git add <files>
git commit -m "Clear commit message"
git push origin short-description
```

Open a pull request into `dev`.
