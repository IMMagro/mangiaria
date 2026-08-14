import os
import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix duplicate imports
content = re.sub(r'import BarcodeScannerSheet from "\./components/BarcodeScannerSheet";\nimport SelectMealSheet from "\./components/SelectMealSheet";\nimport BarcodeScannerSheet from "\./components/BarcodeScannerSheet";\nimport SelectMealSheet from "\./components/SelectMealSheet";', r'import BarcodeScannerSheet from "./components/BarcodeScannerSheet";\nimport SelectMealSheet from "./components/SelectMealSheet";', content)

# Fix duplicate states
content = re.sub(r'  const \[scannerSheet, setScannerSheet\] = useState\(false\);\n  const \[selectMealSheet, setSelectMealSheet\] = useState\(false\);\n  const \[scannedAlimento, setScannedAlimento\] = useState<\{ alimento: any; quantita: number \} \| null>\(null\);\n  const \[scannerSheet, setScannerSheet\] = useState\(false\);\n  const \[selectMealSheet, setSelectMealSheet\] = useState\(false\);\n  const \[scannedAlimento, setScannedAlimento\] = useState<\{ alimento: any; quantita: number \} \| null>\(null\);', r'  const [scannerSheet, setScannerSheet] = useState(false);\n  const [selectMealSheet, setSelectMealSheet] = useState(false);\n  const [scannedAlimento, setScannedAlimento] = useState<{ alimento: any; quantita: number } | null>(null);', content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("deduped")
