const fs = require('fs');

function replaceFile(path, replacements) {
    let content = fs.readFileSync(path, 'utf8');
    for (let r of replacements) {
        content = content.replace(r.old, r.new);
    }
    fs.writeFileSync(path, content, 'utf8');
}

replaceFile('src/App.tsx', [
    {
        old: 'import ToastHost from "./components/Toast";',
        new: 'import ToastHost from "./components/Toast";\nimport BarcodeScannerSheet from "./components/BarcodeScannerSheet";\nimport SelectMealSheet from "./components/SelectMealSheet";'
    },
    {
        old: '  const [pastoSheet, setPastoSheet] = useState(false);',
        new: '  const [pastoSheet, setPastoSheet] = useState(false);\n  const [scannerSheet, setScannerSheet] = useState(false);\n  const [selectMealSheet, setSelectMealSheet] = useState(false);\n  const [scannedAlimento, setScannedAlimento] = useState<{ alimento: any; quantita: number } | null>(null);'
    },
    {
        old: '  function handleFabTap() {\n    if (impostazioni.fabDefault === "pasto") setPastoSheet(true);\n    else setSpesaSheet(true);\n  }',
        new: '  function handleFabTap() {\n    if (impostazioni.fabDefault === "pasto") setPastoSheet(true);\n    else if (impostazioni.fabDefault === "barcode") setScannerSheet(true);\n    else setSpesaSheet(true);\n  }'
    },
    {
        old: '                    <button\n                      onClick={() => setCalendarOpen(true)}\n                      className={w-11 h-11 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center active:scale-95 transition-all }\n                      aria-label="Apri calendario"\n                    >\n                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#1C1915">\n                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2z" />\n                      </svg>\n                    </button>',
        new: '                    <div className="flex items-center gap-2">\n                      <button\n                        onClick={() => setScannerSheet(true)}\n                        className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center active:scale-95 transition-all"\n                        aria-label="Scanner Barcode"\n                      >\n                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C1915" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">\n                          <path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3M8 8h1v8H8zM11 8h2v8h-2zM15 8h1v8h-1z" />\n                        </svg>\n                      </button>\n                      <button\n                        onClick={() => setCalendarOpen(true)}\n                        className={w-11 h-11 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center active:scale-95 transition-all }\n                        aria-label="Apri calendario"\n                      >\n                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1C1915">\n                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zm-8 4h2v2H7zm4 0h2v2h-2z" />\n                        </svg>\n                      </button>\n                    </div>'
    },
    {
        old: '      <FabMenu\n        open={fabMenu}\n        onClose={() => setFabMenu(false)}\n        onSpesa={() => setSpesaSheet(true)}\n        onPasto={() => setPastoSheet(true)}\n      />\n      <AddSpesaSheet open={spesaSheet} onClose={() => setSpesaSheet(false)} />\n      <AddPastoSheet open={pastoSheet} onClose={() => setPastoSheet(false)} data={selectedDate} />\n\n      <ToastHost />\n    </div>',
        new: '      <FabMenu\n        open={fabMenu}\n        onClose={() => setFabMenu(false)}\n        onSpesa={() => setSpesaSheet(true)}\n        onPasto={() => setPastoSheet(true)}\n        onScanner={() => setScannerSheet(true)}\n      />\n      <AddSpesaSheet open={spesaSheet} onClose={() => setSpesaSheet(false)} />\n      <AddPastoSheet open={pastoSheet} onClose={() => setPastoSheet(false)} data={selectedDate} />\n\n      <BarcodeScannerSheet\n        open={scannerSheet}\n        onClose={() => setScannerSheet(false)}\n        onResult={(alimento, quantita) => {\n          setScannerSheet(false);\n          setScannedAlimento({ alimento, quantita });\n          setSelectMealSheet(true);\n        }}\n      />\n      \n      <SelectMealSheet\n        open={selectMealSheet}\n        onClose={() => setSelectMealSheet(false)}\n        pasti={giorno.pasti}\n        onSelect={(pastoId) => {\n          if (scannedAlimento) {\n            import("./store").then(({ aggiungiAlimentoAPasto }) => {\n              aggiungiAlimentoAPasto(selectedDate, pastoId, {\n                alimento: scannedAlimento.alimento,\n                quantita: scannedAlimento.quantita,\n              });\n            });\n          }\n          setSelectMealSheet(false);\n          setScannedAlimento(null);\n        }}\n      />\n\n      <ToastHost />\n    </div>'
    }
]);
