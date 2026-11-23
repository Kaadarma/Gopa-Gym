import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useStore } from '../../lib/store';
import { fmtDate, today } from '../../lib/utils';
import { Avatar, Button, Card, Field, Notice, Select, TD, TH, inputCls } from '../../components/ui';

export default function CheckIn() {
  const { data, checkIn, deleteAttendance } = useStore();
  const [code, setCode] = useState('');
  const [manualId, setManualId] = useState('');
  const [result, setResult] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('');
  const [cameraError, setCameraError] = useState('');
  const containerRef = useRef(null);
  const scannerRef = useRef(null);
  const lastScanRef = useRef({ value: '', at: 0 });

  const run = (value) => {
    if (!value || !value.trim()) {
      setResult({ ok: false, msg: 'Masukkan kode QR/barcode anggota.' });
      return null;
    }
    const res = checkIn(value);
    setResult(res);
    if (res.ok) setCode('');
    return res;
  };

  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    if (!cameraOn) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Kamera hanya bisa dipakai di https atau localhost.');
      setCameraOn(false);
      return undefined;
    }

    let cancelled = false;
    const host = document.createElement('div');
    host.id = `qr-camera-${Date.now()}`;
    container.appendChild(host);
    const scanner = new Html5Qrcode(host.id, false);
    scannerRef.current = scanner;
    setCameraStatus('Meminta izin kamera…');

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          const now = Date.now();
          const last = lastScanRef.current;
          if (decoded === last.value && now - last.at < 3000) return;
          lastScanRef.current = { value: decoded, at: now };
          const res = runRef.current(decoded);
          if (res?.ok) setCameraOn(false);
        },
        () => {},
      )
      .then(() => {
        if (!cancelled) setCameraStatus('Kamera aktif. Arahkan ke QR anggota.');
      })
      .catch((err) => {
        if (cancelled) return;
        setCameraStatus('');
        setCameraError(`Kamera tidak bisa dibuka: ${err?.message || err}`);
        setCameraOn(false);
      });

    return () => {
      cancelled = true;
      scannerRef.current = null;
      setCameraStatus('');
      scanner
        .stop()
        .catch(() => {})
        .finally(() => {
          try {
            scanner.clear();
          } catch {
          }
          host.remove();
        });
    };
  }, [cameraOn]);

  const t = today();
  const todays = data.attendance
    .filter((a) => a.date === t)
    .sort((a, b) => b.time.localeCompare(a.time));
  const memberOf = (id) => data.members.find((m) => m.id === id);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="space-y-6 lg:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="micro">Scan kamera</p>
              <Button
                variant={cameraOn ? 'secondary' : 'primary'}
                className="h-9 px-4"
                onClick={() => {
                  setCameraError('');
                  setCameraOn((on) => !on);
                }}
              >
                {cameraOn ? 'Matikan kamera' : 'Nyalakan kamera'}
              </Button>
            </div>
            <div
              ref={containerRef}
              className={`mx-auto w-full max-w-[320px] overflow-hidden rounded-xl bg-black ${cameraOn ? '' : 'hidden'}`}
            />
            {cameraOn && cameraStatus && <p className="text-xs text-muted">{cameraStatus}</p>}
            {cameraError && <Notice ok={false}>{cameraError}</Notice>}
            <p className="text-xs text-muted">Arahkan QR code anggota ke kamera. Check-in otomatis setelah terbaca.</p>
          </div>

          <div className="border-t border-border pt-6" />

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              run(code);
            }}
          >
            <Field label="Scan barcode / kode anggota">
              <input
                autoFocus
                className={inputCls}
                placeholder="Contoh: GPA-0001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Field>
            <Button type="submit" className="w-full">
              Verifikasi &amp; check-in
            </Button>
            <p className="text-xs text-muted">
              Pemindai barcode USB bekerja sebagai keyboard: arahkan ke kolom ini lalu pindai.
            </p>
          </form>

          <div className="border-t border-border pt-6">
            <p className="micro mb-3">Pencarian manual</p>
            <div className="flex gap-2">
              <Select
                value={manualId}
                onChange={(v) => setManualId(v)}
                searchable
                options={[
                  { value: '', label: 'Pilih anggota' },
                  ...data.members.map((m) => ({ value: String(m.id), label: `${m.name} (${m.code})` })),
                ]}
              />
              <Button
                variant="secondary"
                className="px-4"
                onClick={() => {
                  const m = memberOf(Number(manualId));
                  run(m ? m.code : '');
                }}
              >
                Check-in
              </Button>
            </div>
          </div>

          {result && <Notice ok={result.ok}>{result.msg}</Notice>}
        </Card>

        <Card className="overflow-hidden p-0 lg:col-span-3">
          <div className="px-6 pt-6">
            <p className="micro">Check-in hari ini · {fmtDate(t)}</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={TH}>Anggota</th>
                  <th className={TH}>Kode</th>
                  <th className={TH}>Waktu</th>
                  <th className={TH}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {todays.length === 0 && (
                  <tr>
                    <td className={`${TD} text-muted`} colSpan={4}>
                      Belum ada check-in hari ini.
                    </td>
                  </tr>
                )}
                {todays.map((a) => {
                  const m = memberOf(a.memberId);
                  return (
                    <tr key={a.id} className="border-t border-border">
                      <td className={TD}>
                        <div className="flex items-center gap-3">
                          <Avatar name={m?.name ?? '?'} photo={m?.photo} />
                          {m?.name ?? '-'}
                        </div>
                      </td>
                      <td className={`${TD} text-muted`}>{m?.code ?? '-'}</td>
                      <td className={TD}>{a.time.slice(0, 5)}</td>
                      <td className={TD}>
                        <button
                          type="button"
                          className="text-xs font-semibold uppercase tracking-wider text-danger hover:underline"
                          onClick={() => {
                            if (window.confirm(`Hapus check-in ${m?.name ?? 'anggota'} pukul ${a.time.slice(0, 5)}?`)) {
                              deleteAttendance(a.id);
                            }
                          }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
