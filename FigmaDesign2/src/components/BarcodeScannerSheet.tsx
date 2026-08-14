import React, { useEffect, useRef, useState } from 'react';
import Sheet from './Sheet';
import { fetchProductByBarcode } from '../api';
import type { AlimentoDef } from '../data';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  open: boolean;
  onClose: () => void;
  onResult: (alimento: AlimentoDef, quantita: number) => void;
}

export default function BarcodeScannerSheet({ open, onClose, onResult }: Props) {
  const [status, setStatus] = useState<'scanning' | 'loading' | 'error' | 'preview'>('scanning');
  const [product, setProduct] = useState<AlimentoDef | null>(null);
  const [quantita, setQuantita] = useState("100");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!open) {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
      }
      setStatus('scanning');
      setProduct(null);
      setQuantita("100");
      return;
    }

    if (status !== 'scanning') return;

    let isMounted = true;
    
    // Slight delay to ensure DOM element is ready for Html5Qrcode
    const timeout = setTimeout(() => {
      if (!document.getElementById("reader") || !isMounted) return;
      
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        async (decodedText) => {
          if (!isMounted) return;
          // Stop scanner
          await html5QrCode.stop().catch(console.error);
          scannerRef.current = null;
          
          setStatus('loading');
          const p = await fetchProductByBarcode(decodedText);
          if (!isMounted) return;
          if (p) {
            setProduct(p);
            setStatus('preview');
          } else {
            setStatus('error');
          }
        },
        () => {} // ignore errors during scan
      ).catch(err => {
        console.error("Camera start failed", err);
        // Might fail if no camera permissions
      });
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        });
      }
    };
  }, [open, status]);

  function handleConfirm() {
    if (product && quantita) {
      const q = parseFloat(quantita);
      if (!isNaN(q) && q > 0) {
        // Normalizza l'alimento ai grammi effettivi, poiche OFF è per 100g
        const finalAlimento = {
          ...product,
          nutri: {
            kcal: product.nutri.kcal / 100,
            carbo: product.nutri.carbo / 100,
            proteine: product.nutri.proteine / 100,
            grassi: product.nutri.grassi / 100,
            fibra: (product.nutri.fibra || 0) / 100,
          }
        };
        onResult(finalAlimento, q);
      }
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Scanner Barcode">
      <div className="px-6 pb-8 space-y-6">
        {status === 'scanning' && (
          <div className="rounded-3xl overflow-hidden bg-black/5 aspect-square relative flex items-center justify-center">
            <div id="reader" className="w-full h-full"></div>
            <p className="absolute bottom-4 text-white font-bold bg-black/50 px-4 py-2 rounded-xl text-sm">
              Inquadra il codice a barre
            </p>
          </div>
        )}

        {status === 'loading' && (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#27C882] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#9A9187] font-bold">Ricerca prodotto in corso...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-20 text-center space-y-4">
            <p className="text-[#EF4444] font-bold text-lg">Prodotto non trovato</p>
            <p className="text-[#9A9187] text-sm">Il codice a barre non è presente nel database di Open Food Facts.</p>
            <button
              onClick={() => setStatus('scanning')}
              className="mt-4 px-6 py-2 bg-[#27C882] text-white font-bold rounded-xl"
            >
              Riprova
            </button>
          </div>
        )}

        {status === 'preview' && product && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-black text-[#1C1915] mb-2">{product.nome}</h3>
              <div className="flex justify-center gap-4 text-sm text-[#9A9187] font-bold">
                <span>{product.nutri.kcal.toFixed(0)} kcal / 100g</span>
                <span>C: {product.nutri.carbo.toFixed(1)}</span>
                <span>P: {product.nutri.proteine.toFixed(1)}</span>
                <span>G: {product.nutri.grassi.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#F8F6F2] p-2 rounded-2xl">
              <input
                type="number"
                value={quantita}
                onChange={(e) => setQuantita(e.target.value)}
                className="flex-1 bg-white rounded-xl px-4 py-3 text-lg font-bold text-[#1C1915] text-center border-none focus:ring-2 focus:ring-[#27C882]/40"
              />
              <span className="w-12 text-center text-sm font-bold text-[#9A9187] uppercase">
                {product.unitaMisura}
              </span>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-4 rounded-2xl text-base font-bold text-white shadow-lg active:scale-[0.98] transition-all"
              style={{ background: "linear-gradient(135deg, #27C882 0%, #1AA86A 100%)" }}
            >
              Aggiungi Alimento
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
