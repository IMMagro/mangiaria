# Integrazione Scanner Barcode

Implementeremo uno scanner di codici a barre direttamente nell'app usando la fotocamera del dispositivo. 
Una volta inquadrato il codice a barre di un prodotto, l'app interrogherà le API pubbliche di Open Food Facts per recuperare tutte le informazioni nutrizionali e i macro (calorie, proteine, ecc.).

## User Review Required

> [!IMPORTANT]
> - Utilizzeremo la libreria \html5-qrcode\ o simile per l'accesso alla fotocamera. Richiederà i permessi nel browser.
> - I dati verranno estratti da Open Food Facts (gratuiti e open).

## Open Questions

- **Dove vuoi inserire il bottone per attivare la scansione?**
  1. Direttamente in home in alto (es. icona di un codice a barre)?
  2. Dentro il menu del pulsante verde + in basso (FabMenu)?
  3. All'interno della barra di ricerca degli alimenti?
- **Cosa vuoi che succeda dopo la scansione?** L'alimento deve essere aggiunto direttamente al pasto/spesa in corso, oppure vuoi una schermata di anteprima con tutti i valori nutrizionali estratti prima di confermare?

## Proposed Changes

### [Dependencies]
- [NEW] Installazione di un pacchetto per lo scan (html5-qrcode o simile).

### [Barcode Scanner Component]
- [NEW] src/components/BarcodeScanner.tsx: Componente isolato che gestisce lo stream della fotocamera, il riquadro di inquadratura e il decoding del codice. 

### [API Integration]
- [MODIFY] src/api.ts (o nuova funzione locale): Aggiunta di un metodo per interrogare l'endpoint barcode di Open Food Facts: https://world.openfoodfacts.org/api/v0/product/{barcode}.json

### [UI Integration]
- [MODIFY] Il punto di ingresso scelto per posizionare il bottone che apre la modale dello scanner.

## Verification Plan

### Manual Verification
- Cliccare il pulsante dello scanner.
- Consentire i permessi della fotocamera.
- Inquadrare un prodotto alimentare comune con codice a barre (es. un pacco di biscotti).
- Verificare che i dati vengano decodificati e l'API risponda con i dati corretti in tempo reale.
