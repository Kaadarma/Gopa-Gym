import { useState } from 'react';
import { useStore } from '../../lib/store';
import { fmtDate, today } from '../../lib/utils';
import { Avatar, Button, Card, Field, Notice, PageHeader, TD, TH, inputCls } from '../../components/ui';

export default function CheckIn() {
  const { data, checkIn } = useStore();
  const [code, setCode] = useState('');
  const [manualId, setManualId] = useState('');
  const [result, setResult] = useState(null);

  const run = (value) => {
    if (!value || !value.trim()) {
      setResult({ ok: false, msg: 'Masukkan kode QR/barcode anggota.' });
      return;
    }
    const res = checkIn(value);
    setResult(res);
    if (res.ok) setCode('');
  };

  const t = today();
  const todays = data.attendance
    .filter((a) => a.date === t)
    .sort((a, b) => b.time.localeCompare(a.time));
  const memberOf = (id) => data.members.find((m) => m.id === id);

  return (
    <>
      <PageHeader title="QR Check-in" subtitle="Pindai barcode anggota atau pilih manual jika barcode tidak terbaca." />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="space-y-6 lg:col-span-2">
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
              <select className={inputCls} value={manualId} onChange={(e) => setManualId(e.target.value)}>
                <option value="">Pilih anggota</option>
                {data.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
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
                </tr>
              </thead>
              <tbody>
                {todays.length === 0 && (
                  <tr>
                    <td className={`${TD} text-muted`} colSpan={3}>
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
