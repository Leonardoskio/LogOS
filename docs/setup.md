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

## Windows Launcher

For daily local use on Windows, double-click this file:

```text
desktopdemo/windows-vs/Start-LogOS.cmd
```

It checks Node.js/npm, creates `.env` from `.env.example` if missing, starts the
backend in a `LogOS Backend` terminal, waits for:

```text
http://localhost:3000/api/health
```

and then opens:

```text
frontend/index.html
```

To create a desktop shortcut named `LogOS`, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\desktopdemo\windows-vs\install-desktop-shortcut.ps1
```

To stop LogOS, close the `LogOS Backend` terminal window.

## Linux Launcher

For daily local use on Linux, run:

```bash
bash ./desktopdemo/linux-vs/start-logos.sh
```

It checks Node.js/npm, creates `.env` from `.env.example` if missing, starts the
backend from `backend/`, waits for:

```text
http://localhost:3000/api/health
```

and then opens:

```text
frontend/index.html
```

To create a desktop shortcut named `LogOS`, run:

```bash
bash ./desktopdemo/linux-vs/install-desktop-shortcut.sh
```

To stop the backend started by the Linux launcher, run:

```bash
bash ./desktopdemo/linux-vs/stop-logos.sh
```

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
