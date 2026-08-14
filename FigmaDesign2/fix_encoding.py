import os

files = ['src/components/BarcodeScannerSheet.tsx', 'src/components/SelectMealSheet.tsx', 'src/api.ts']

for file in files:
    try:
        with open(file, 'rb') as f:
            content = f.read()
        
        # Try to decode as utf-16 (powershell default)
        try:
            text = content.decode('utf-16')
        except:
            # Maybe already utf-8 or something else, skip
            text = content.decode('utf-8')

        with open(file, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"Fixed {file}")
    except Exception as e:
        print(f"Error on {file}: {e}")
