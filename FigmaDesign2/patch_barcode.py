import os
import re

file_path = 'src/components/BarcodeScannerSheet.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the synchronous throw on stop()
old_stop_logic = '''      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
      }'''

new_stop_logic = '''      if (scannerRef.current) {
        try {
          if (scannerRef.current.getState() === 2 /* SCANNING */) {
            scannerRef.current.stop().catch(() => {}).finally(() => {
              try { scannerRef.current?.clear(); } catch(e) {}
              scannerRef.current = null;
            });
          } else {
            try { scannerRef.current.clear(); } catch(e) {}
            scannerRef.current = null;
          }
        } catch (err) {
          try { scannerRef.current?.clear(); } catch(e) {}
          scannerRef.current = null;
        }
      }'''

content = content.replace(old_stop_logic, new_stop_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("patched BarcodeScannerSheet")
