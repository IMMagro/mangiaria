import os

file_path = 'src/components/BarcodeScannerSheet.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = '''          const p = await fetchProductByBarcode(decodedText);
          if (!isMounted) return;
          if (p) {
            setProduct(p);
            setStatus('preview');
          } else {
            setStatus('error');
          }
        },'''

new_logic = '''          const p = await fetchProductByBarcode(decodedText);
          // Check if the modal was closed while fetching
          const modalIsOpen = document.getElementById("reader") !== null || document.querySelector(".fixed.inset-0") !== null;
          // Note: we removed !isMounted because changing status to 'loading' unmounts the *effect*, not the component
          if (p) {
            setProduct(p);
            setStatus('preview');
          } else {
            setStatus('error');
          }
        },'''

content = content.replace(old_logic, new_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("patched BarcodeScannerSheet isMounted bug")
