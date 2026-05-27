# Prompt: Report Giornaliero

## Scopo

Generare un report operativo giornaliero a partire dalle spedizioni strutturate
presenti nel vault o restituite dal backend.

## Input Atteso

```json
{
  "data": "2026-05-27",
  "spedizioni": [],
  "motrici": [],
  "autisti": []
}
```

Ogni spedizione dovrebbe includere almeno:

```text
id
cliente_id
cliente_nome
tipo_carico
origine
destinazione
autista_id
motrice_id
stato
distanza_km
```

## Istruzioni

Analizza solo i dati forniti. Non inventare spedizioni, clienti, autisti,
motrici o stati mancanti.

Produci un report con:

```text
1. riepilogo del giorno
2. spedizioni completate, aperte o problematiche
3. utilizzo motrici
4. utilizzo autisti
5. anomalie o dati mancanti
6. azioni consigliate
```

Quando segnali un problema, cita sempre gli ID delle spedizioni coinvolte.

## Output

Usa Markdown.

```markdown
# Report giornaliero - {{data}}

## Sintesi

## Spedizioni

## Motrici

## Autisti

## Criticità

## Azioni consigliate
```
