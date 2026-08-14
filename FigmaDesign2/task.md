# Task: Integrazione Scanner Barcode

- [x] Installare pacchetto html5-qrcode o equivalente.
- [x] Implementare logica API per interrogare world.openfoodfacts.org/api/v0/product/{barcode}.json.
- [x] Creare il componente UI BarcodeScanner (modale o full-screen) per acquisire il codice.
- [x] Creare la modale BarcodeResult per mostrare l'anteprima (nome, macro) con bottone "Aggiungi".
- [x] Aggiungere logica di selezione del pasto (se lo scan avviene globalmente) tra quelli "da consumare".
- [x] UI: Inserire bottone scanner nella Home, a fianco al tasto Calendario.
- [x] UI: Inserire bottone scanner nel FabMenu (long-press +).
- [x] UI: Aggiornare le Impostazioni in ProfileScreen per permettere l'assegnazione dello Scanner come azione default del FAB.
- [x] UI: Inserire l'icona scanner all'interno della barra di ricerca alimenti (SwapAlimentoSheet, AddPastoSheet, ecc.).
- [x] Eseguire test (manuali e/o playwright se possibile) per il flow globale e contestuale.
