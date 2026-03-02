# Koidulauliku E-laulik

Veebirakendus, mis kogub Eesti kultuuri kohta infot erinevatest veebiallikatest.

## Allikad

- **Sirp** - artiklid Eesti kultuurilehest
- **Kultuurikava** - üritused Tallinnas ja Tartus
- **Teater.ee** - tulevased teatri esietendused

## Käivitamine

Vajalik: Node.js ja pnpm.

```bash
pnpm install
pnpm dev
```

### Server

Server käivitub aadressil http://localhost:3001. Kõik andmed laetakse vahemällu ja uuendatakse iga 15 minuti tagant.

### Veebileht

Veebileht käivitub aadressil http://localhost:5173.

## Tehnoloogiad

- **Server:** Express, TypeScript, Cheerio, Axios
- **Veebileht:** React, TypeScript, Tailwind CSS, Vite
