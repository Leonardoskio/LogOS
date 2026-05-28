# LogOS Desktop Demo

Questa cartella contiene solo launcher locali per avviare la demo LogOS.
Backend, frontend, vault e API restano nella struttura principale del progetto.

## Windows

Usa:

```text
windows-vs/Start-LogOS.cmd
```

Per creare o aggiornare il collegamento Desktop:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\desktopdemo\windows-vs\install-desktop-shortcut.ps1
```

## Linux

Usa:

```bash
bash ./desktopdemo/linux-vs/start-logos.sh
```

Per creare o aggiornare il collegamento Desktop:

```bash
bash ./desktopdemo/linux-vs/install-desktop-shortcut.sh
```

Per fermare il backend avviato dal launcher Linux:

```bash
bash ./desktopdemo/linux-vs/stop-logos.sh
```
