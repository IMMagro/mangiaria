import os

file_path = 'src/api.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = '''export async function fetchProductByBarcode(barcode: string): Promise<AlimentoDef | null> {
  try {
    const res = await fetch("https://world.openfoodfacts.org/api/v0/product/" + barcode + ".json");'''

new_logic = '''export async function fetchProductByBarcode(barcode: string): Promise<AlimentoDef | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch("https://world.openfoodfacts.org/api/v0/product/" + barcode + ".json", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);'''

content = content.replace(old_logic, new_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("patched api.ts timeout")
