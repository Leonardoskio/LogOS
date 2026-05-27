# Prompt: Consigli Logistici

## Scopo

Produrre suggerimenti logistici a partire da spedizioni, motrici, autisti e
storico cliente. Questo prompt serve per analisi, non per creare dati ufficiali.

## Input Atteso

```json
{
  "periodo": "2026-05",
  "spedizioni": [],
  "clienti": [],
  "motrici": [],
  "autisti": []
}
```

## Istruzioni

Valuta:

```text
carichi ricorrenti
clienti con molte spedizioni
motrici sovrautilizzate o sottoutilizzate
autisti associati a troppi incarichi
tratte frequenti
spedizioni con dati incompleti
```

Non proporre decisioni operative rischiose senza indicare il dato che le
supporta. Se un consiglio dipende da dati mancanti, dichiaralo.

## Output

Usa Markdown e dividi i consigli per priorita:

```markdown
# Consigli logistici - {{periodo}}

## Priorita alta

## Priorita media

## Opportunita future

## Dati mancanti o dubbi
```

Ogni consiglio deve includere:

```text
motivo
dati osservati
impatto atteso
azione proposta
```
