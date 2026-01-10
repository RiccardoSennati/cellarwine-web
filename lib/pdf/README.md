# PDF Export Documentation

## Libreria utilizzata: PDFKit

Abbiamo scelto **PDFKit** per la generazione di PDF server-side perché:

- ✅ **Leggera e veloce**: Non richiede browser headless come Puppeteer
- ✅ **Facile da usare**: API semplice e intuitiva
- ✅ **Performante**: Genera PDF direttamente senza rendering HTML
- ✅ **Print-friendly**: Ottimizzato per la stampa con sfondo bianco e testo nero
- ✅ **Supporto TypeScript**: Tipi completi disponibili

## Installazione

Le dipendenze sono già installate:
- `pdfkit` - Generazione PDF
- `@types/pdfkit` - Tipi TypeScript
- `qrcode` - Generazione QR codes
- `@types/qrcode` - Tipi TypeScript

## Utilizzo

### API Routes

1. **Export Wine PDF**: `GET /api/pdf/wine/[id]`
   - Genera PDF con tutte le informazioni del vino
   - Include QR code che punta a `/app/wine/[id]`

2. **Export Tasting PDF**: `GET /api/pdf/tasting/[id]`
   - Genera PDF con tutte le informazioni della degustazione
   - Include QR code che punta a `/app/tasting/[id]`

### Sicurezza

- ✅ **Auth guard**: Verifica autenticazione utente
- ✅ **RLS compliance**: Verifica ownership dei dati (user_id match)
- ✅ **Server-side only**: Le route API sono server-side, nessun dato esposto al client

### Caratteristiche PDF

- **Sfondo bianco**: Ottimizzato per la stampa
- **Testo nero**: Leggibilità massima
- **Accenti bordeaux**: Colore brand (#6b0f1a) per titoli e sezioni
- **QR Code**: Incluso per accesso rapido alla pagina web
- **Print-friendly**: Margini e layout ottimizzati per A4

## Esempio di utilizzo

```typescript
// Nel componente client
const handleDownload = async () => {
  const response = await fetch(`/api/pdf/wine/${wineId}`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wine.pdf";
  a.click();
};
```

## Note

- I PDF vengono generati on-demand quando richiesti
- Il QR code punta all'URL completo del sito (configura `NEXT_PUBLIC_SITE_URL` in produzione)
- I nomi file sono sanitizzati per sicurezza

