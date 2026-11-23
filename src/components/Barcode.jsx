import { QRCodeSVG } from 'qrcode.react';

export default function Barcode({ value, label, height = 90 }) {
  if (!value) return null;
  return (
    <div className="mx-auto flex w-fit flex-col items-center">
      <QRCodeSVG value={value} size={height * 2} level="M" fgColor="#0A0C06" bgColor="#FFFFFF" />
      {label && <p className="mt-2 font-mono text-[11px] tracking-[0.12em] text-[#0A0C06]">{label}</p>}
    </div>
  );
}
