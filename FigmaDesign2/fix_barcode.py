import os

file = 'src/components/BarcodeScannerSheet.tsx'

with open(file, 'rb') as f:
    content = f.read()

try:
    text = content.decode('cp1252')
except Exception as e:
    text = content.decode('utf-8', errors='replace')

with open(file, 'w', encoding='utf-8') as f:
    f.write(text)
print("Fixed BarcodeScannerSheet.tsx")
