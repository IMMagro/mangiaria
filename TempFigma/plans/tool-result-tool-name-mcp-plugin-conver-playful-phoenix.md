# Piano: Espansione Onboarding con dati dietologo + acqua

## Context
Gemini ha suggerito 3 macro-step per il questionario. Dopo scrematura:

**Si implementa:**
- Acqua giornaliera (acquaMax) → stepper semplice
- Dati dietologo: nome, telefono, email, prossima visita → step dedicato

**Si scarta per onboarding (già coperto altrove):**
- Struttura pasti giornata → fissa (colazione/spuntino/pranzo/merenda/cena)
- Alimenti per ogni giorno → è il PianoEditor, troppo complesso per onboarding
- Tempistiche pasti e giorni liberi → complessità non giustificata

## Modifiche da fare

### 1. `src/types.ts` — estendere `Dietologo`
Aggiungere `telefono?: string` e `email?: string` al tipo `Dietologo`.

### 2. `src/components/Onboarding.tsx` — 2 nuovi step
Aggiungere dopo "obiettivo" (step 7):

**Step 8 — Acqua 💧**
- Titolo: "Quanta acqua bevi al giorno?"
- Stepper +/- identico agli altri step numerici (min 1, max 15, unit "bicchieri")
- Salva in `setImpostazioni({ acquaMax: n })`

**Step 9 — Dietologo 👨‍⚕️**
- Titolo: "Hai un nutrizionista?"
- Campi: nome (testo), telefono (tel input), email (email input), prossima visita (date input)
- Tutti opzionali — step saltabile
- Salva in `setDietologo({ nome, telefono, email, prossimaVisita })`

In `STEPS` array: aggiungere `"acqua"` e `"dietologo"` dopo `"obiettivo"`.
In `handleComplete`: chiamare `setImpostazioni({ acquaMax })` e `setDietologo(...)` prima di `setImpostazioni({ onboardingCompleto: true })`.

### 3. Alla fine dell'onboarding — schermata di completamento
Aggiungere menzione del piano pasti: "Personalizza il tuo piano dalla schermata Spesa → Piano".

## File modificati
- `src/types.ts` — aggiungi `telefono?` e `email?` a `Dietologo`
- `src/components/Onboarding.tsx` — 2 nuovi step + salvataggio dati aggiuntivi

## Verifica
- Completare onboarding → profilo + dietologo + acqua salvati correttamente nel store
- Il tasto "Salta" sul step dietologo non salva nulla (fields empty → no-op)
- Riaprire app → onboarding non compare (flag impostato)
