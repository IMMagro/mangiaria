# Piano: App Diario Alimentare (da Flutter → React)

## Context
L'utente ha un'app Flutter (Mangiaria) per gestire il piano alimentare giornaliero. Vuole ricrearla come web app React nel progetto Figma Make esistente (Vite + Tailwind CSS v4).

## Cosa costruire

Fedele riproduzione della HomeScreen Flutter con le seguenti funzionalità:
- Lista pasti del giorno (card per ogni pasto)
- Ogni card mostra: nome pasto, chip stato (cliccabile, cicla tra i 4 stati), scelte alimentari con dropdown per selezionare alternative
- I dati mock replicano esattamente il pranzo del lunedì con carboidrati/proteine/verdure/grassi

## File da creare / modificare

### `src/types.ts` (nuovo)
Tipi TypeScript equivalenti ai model Dart:
- `CategoriaAlimento`, `UnitaMisura`, `TipoPasto`, `StatoPasto` (enums/union types)
- `Alimento`, `Porzione`, `SceltaVoce`, `DiarioPasto`, `DiarioGiorno` (interfaces)
- `SceltaVoce` e `DiarioPasto` hanno campi mutabili (stato, porzioneSelezionata) → usare stato React, non oggetti immutabili

### `src/mockData.ts` (nuovo)
Replica esatta dei dati mock Dart:
- 7 alimenti (riso, couscous, pasta integrale, pollo, tacchino, verdure, olio EVO)
- pranzoLunedi con 4 SceltaVoce (carboidrati/proteine/verdure/grassi)
- mockGiornoLunedi con data = oggi

### `src/App.tsx` (sostituire il placeholder)
Componente principale che renderizza la HomeScreen. Gestisce lo stato dell'intera giornata con `useState` (array di pasti con stato e selezioni correnti).

### `src/components/PastoCard.tsx` (nuovo)
Card per un singolo pasto:
- Header: nome pasto in maiuscolo + StatoChip
- Lista SceltaVoce con dropdown (`<select>` nativo stilizzato con Tailwind)
- Props: `pasto`, `onStatoChange`, `onPorzioneChange`

### `src/components/StatoChip.tsx` (nuovo)
Chip cliccabile che cicla tra i 4 stati con colori:
- `daConsumare` → blu
- `completato` → verde  
- `pastoLibero` → arancione
- `saltato` → rosso

## Approccio stilistico
- Background grigio chiaro (`bg-gray-100`)
- Card bianche con shadow leggera e border-radius `rounded-xl`
- AppBar bianca con titolo "Oggi - Diario Alimentare"
- Dropdown con bordo grigio e icona ↔
- Font sistema (no Google Fonts necessario per questa prima versione)

## Gestione stato
Lo stato dei pasti vive in `App.tsx` come array di oggetti pasto con `stato` e `scelteEffettuate` (dove ogni scelta ha `porzioneSelezionataId`). I componenti figlio ricevono callback per modificarlo.

## Verifica
- Dev server già in esecuzione su `$PORT` — hot reload automatico
- Verificare visivamente: card pasto appare, dropdown funziona, chip cicla i 4 stati al click
