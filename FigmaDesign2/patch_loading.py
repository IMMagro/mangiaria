import os
import re

file_path = 'src/components/BarcodeScannerSheet.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = '''        async (decodedText) => {
          if (!isMounted || isProcessing) return;
          isProcessing = true;
          // Stop scanner
          await html5QrCode.stop().catch(console.error);
          scannerRef.current = null;
          
          setStatus('loading');
          const p = await fetchProductByBarcode(decodedText);'''

new_logic = '''        async (decodedText) => {
          if (!isMounted || isProcessing) return;
          isProcessing = true;
          
          setStatus('loading');

          // Stop scanner in background to prevent hanging the UI
          html5QrCode.stop().catch(console.error).finally(() => {
            if (scannerRef.current === html5QrCode) {
              scannerRef.current = null;
            }
          });
          
          const p = await fetchProductByBarcode(decodedText);'''

content = content.replace(old_logic, new_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("patched BarcodeScannerSheet loading hang")
