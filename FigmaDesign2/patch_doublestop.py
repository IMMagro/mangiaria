import os
import re

file_path = 'src/components/BarcodeScannerSheet.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = '''          setStatus('loading');

          // Stop scanner in background to prevent hanging the UI
          html5QrCode.stop().catch(console.error).finally(() => {
            if (scannerRef.current === html5QrCode) {
              scannerRef.current = null;
            }
          });
          
          const p = await fetchProductByBarcode(decodedText);'''

new_logic = '''          setStatus('loading');
          
          // Lo scanner verrà automaticamente stoppato e distrutto dalla cleanup function 
          // del useEffect non appena lo stato cambia in 'loading'. 
          // Non dobbiamo chiamare stop() qui altrimenti creiamo una race condition (viene chiamato due volte e blocca il thread JS).
          
          const p = await fetchProductByBarcode(decodedText);'''

content = content.replace(old_logic, new_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("patched BarcodeScannerSheet double stop bug")
