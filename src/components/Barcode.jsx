import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

// Barcode CODE128 untuk kode anggota, dibuat dengan JsBarcode.
export default function Barcode({ value, height = 90 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    JsBarcode(ref.current, value, {
      format: 'CODE128',
      lineColor: '#0A0C06',
      background: '#FFFFFF',
      width: 2,
      height,
      displayValue: true,
      fontSize: 14,
      margin: 12,
    });
  }, [value, height]);

  return <svg ref={ref} className="mx-auto max-w-full" />;
}
