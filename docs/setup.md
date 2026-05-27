# Setup

This repository is currently a project skeleton. The setup below explains how
to clone it, work on the correct branch and prepare the future backend/vault
workflow.

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

At the moment backend files are mostly skeletons. Implementation should keep the
responsibilities documented in `docs/api-contract.md`.

## Obsidian Vault Template

Open this folder in Obsidian when editing the shared standard:

```text
vault-template/
```

Do not put real company shipments in `vault-template/02 Archivio`. Runtime data
belongs in generated vaults under `vaults/`.

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
