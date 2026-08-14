import os
import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
imports = '''import BarcodeScannerSheet from "./components/BarcodeScannerSheet";
import SelectMealSheet from "./components/SelectMealSheet";
import StatsScreen from "./screens/StatsScreen";'''
content = content.replace('import StatsScreen from "./screens/StatsScreen";', imports)

# 2. States
states_old = '  const [pastoSheet, setPastoSheet] = useState(false);'
states_new = '''  const [pastoSheet, setPastoSheet] = useState(false);
  const [scannerSheet, setScannerSheet] = useState(false);
  const [selectMealSheet, setSelectMealSheet] = useState(false);
  const [scannedAlimento, setScannedAlimento] = useState<{ alimento: any; quantita: number } | null>(null);'''
content = content.replace(states_old, states_new)

# 3. handleFabTap
fab_old = '''  function handleFabTap() {
    if (impostazioni.fabDefault === "pasto") setPastoSheet(true);
    else setSpesaSheet(true);
  }'''
fab_new = '''  function handleFabTap() {
    if (impostazioni.fabDefault === "pasto") setPastoSheet(true);
    else if (impostazioni.fabDefault === "barcode") setScannerSheet(true);
    else setSpesaSheet(true);
  }'''
content = content.replace(fab_old, fab_new)

# 4. Header button
# Replace the whole <div className="flex items-center justify-between"> block safely.
header_regex = r'(<div className="flex items-center justify-between">.*?)(<button.*?onClick=\{\(\) => setCalendarOpen\(true\)\}.*?</button>)(.*?</div>)'
replacement = r'''\1<div className="flex items-center gap-2">
                      <button
                        onClick={() => setScannerSheet(true)}
                        className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center active:scale-95 transition-all"
                        aria-label="Scanner Barcode"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C1915" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3M8 8h1v8H8zM11 8h2v8h-2zM15 8h1v8h-1z" />
                        </svg>
                      </button>
                      \2
                    </div>\3'''

content = re.sub(header_regex, replacement, content, flags=re.DOTALL)

# 5. Bottom Sheets
sheets_old = '''      <FabMenu
        open={fabMenu}
        onClose={() => setFabMenu(false)}
        onSpesa={() => setSpesaSheet(true)}
        onPasto={() => setPastoSheet(true)}
      />
      <AddSpesaSheet open={spesaSheet} onClose={() => setSpesaSheet(false)} />
      <AddPastoSheet open={pastoSheet} onClose={() => setPastoSheet(false)} data={selectedDate} />

      <ToastHost />
    </div>'''
sheets_new = '''      <FabMenu
        open={fabMenu}
        onClose={() => setFabMenu(false)}
        onSpesa={() => setSpesaSheet(true)}
        onPasto={() => setPastoSheet(true)}
        onScanner={() => setScannerSheet(true)}
      />
      <AddSpesaSheet open={spesaSheet} onClose={() => setSpesaSheet(false)} />
      <AddPastoSheet open={pastoSheet} onClose={() => setPastoSheet(false)} data={selectedDate} />

      <BarcodeScannerSheet
        open={scannerSheet}
        onClose={() => setScannerSheet(false)}
        onResult={(alimento, quantita) => {
          setScannerSheet(false);
          setScannedAlimento({ alimento, quantita });
          setSelectMealSheet(true);
        }}
      />
      
      <SelectMealSheet
        open={selectMealSheet}
        onClose={() => setSelectMealSheet(false)}
        pasti={giorno.pasti}
        onSelect={(pastoId) => {
          if (scannedAlimento) {
            import("./store").then(({ aggiungiAlimentoAPasto }) => {
              aggiungiAlimentoAPasto(selectedDate, pastoId, {
                alimento: scannedAlimento.alimento,
                quantita: scannedAlimento.quantita,
              });
            });
          }
          setSelectMealSheet(false);
          setScannedAlimento(null);
        }}
      />

      <ToastHost />
    </div>'''
content = content.replace(sheets_old, sheets_new)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
