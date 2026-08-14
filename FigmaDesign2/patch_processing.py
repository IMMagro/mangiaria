import os

file_path = 'src/components/BarcodeScannerSheet.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add isProcessing lock
old_code = '''    let isMounted = true;
    
    // Slight delay to ensure DOM element is ready for Html5Qrcode
    const timeout = setTimeout(() => {
      if (!document.getElementById("reader") || !isMounted) return;
      
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        async (decodedText) => {
          if (!isMounted) return;'''

new_code = '''    let isMounted = true;
    let isProcessing = false;
    
    // Slight delay to ensure DOM element is ready for Html5Qrcode
    const timeout = setTimeout(() => {
      if (!document.getElementById("reader") || !isMounted) return;
      
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        async (decodedText) => {
          if (!isMounted || isProcessing) return;
          isProcessing = true;'''

content = content.replace(old_code, new_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("patched BarcodeScannerSheet isProcessing")
