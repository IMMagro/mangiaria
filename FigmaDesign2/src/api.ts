import type { AlimentoDef } from "./data";

export async function fetchProductByBarcode(barcode: string): Promise<AlimentoDef | null> {
  try {
    const res = await fetch(https://world.openfoodfacts.org/api/v0/product/ + barcode + .json);
    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      return null;
    }

    const p = data.product;
    
    // Controlliamo che abbia i macro di base (le kcal sono essenziali)
    const kcal = p.nutriments?.['energy-kcal_100g'];
    if (typeof kcal !== 'number') {
      return null; // Prodotto senza calorie, inutilizzabile
    }

    return {
      id: off_ + p._id,
      nome: p.product_name_it || p.product_name || "Prodotto Sconosciuto",
      categoria: "extra",
      unitaMisura: "g", // Open Food Facts e sempre su 100g/100ml
      sorgente: "openfoodfacts",
      nutri: {
        kcal: kcal || 0,
        carbo: p.nutriments['carbohydrates_100g'] || 0,
        proteine: p.nutriments['proteins_100g'] || 0,
        grassi: p.nutriments['fat_100g'] || 0,
        fibra: p.nutriments['fiber_100g'] || 0,
      }
    };
  } catch (err) {
    console.error("Errore fetch barcode OFF:", err);
    return null;
  }
}
