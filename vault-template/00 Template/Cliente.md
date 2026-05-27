---
type: cliente
id:
nome:
riferimento:
telefono:
email:
sede_citta:
sede_provincia:
sede_cap:
sede_via:
sede_numero_civico:
created_at:
updated_at:
---

# Cliente {{nome}}

## Riferimento

- Nome: {{riferimento}}
- Telefono: {{telefono}}
- Email: {{email}}

## Sede cliente

- Citta: {{sede_citta}}
- Provincia: {{sede_provincia}}
- CAP: {{sede_cap}}
- Via: {{sede_via}}
- Numero civico: {{sede_numero_civico}}

## Spedizioni

Le spedizioni non vengono copiate qui. La lista deve essere calcolata dal
backend o da una query usando `cliente_id: {{id}}`.
