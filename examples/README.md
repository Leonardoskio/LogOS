# Examples

This folder contains mock JSON payloads for the MVP API.

They are not generated vault data and they are not fixtures to copy into
`vault-template/`. They are request examples used to keep frontend forms,
backend validation and documentation aligned.

Recommended manual flow:

```text
1. POST /api/clienti      using cliente-create.json
2. POST /api/autisti      using autista-create.json
3. POST /api/motrici      using motrice-create.json
4. POST /api/spedizioni   using spedizione-create.json
```

The backend is responsible for generating official IDs, timestamps, archive
paths and Markdown files.
