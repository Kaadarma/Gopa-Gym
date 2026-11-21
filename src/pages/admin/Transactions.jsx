import { useState } from 'react';
import { useStore } from '../../lib/store';
import { fmtDate, fmtRp, today } from '../../lib/utils';
import { Button, Card, Field, TD, TH, inputCls } from '../../components/ui';

const METHODS = ['Tunai', 'Transfer', 'QRIS', 'Debit'];
const EMPTY = { memberId: '', amount: '', method: 'Tunai', date: today(), note: '' };

export default function Transactions() {
  const { data, addTransaction } = useStore();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.memberId) e.memberId = 'Pilih anggota.';
    if (form.amount === '') e.amount = 'Nominal wajib diisi.';
    else if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = 'Nominal harus lebih dari 0.';
    if (!form.date) e.date = 'Tanggal wajib diisi.';
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setSaved(false);
    if (Object.keys(e).length) return;
    addTransaction({
      memberId: Number(form.memberId),
      amount: Number(form.amount),
      method: form.method,
      date: form.date,
      note: form.note.trim(),
    });
    setForm(EMPTY);
    setSaved(true);
  };

  const memberName = (id) => data.members.find((m) => m.id === id)?.name ?? '-';
  const rows = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date));
  const total = rows.reduce((s, x) => s + x.amount, 0);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <p className="micro">Transaksi baru</p>
          <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
            <Field label="Anggota" error={errors.memberId}>
              <select className={inputCls} value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}>
                <option value="">Pilih anggota</option>
                {data.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nominal (Rp)" error={errors.amount}>
              <input type="number" min="0" className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Metode">
                <select className={inputCls} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  {METHODS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </Field>
              <Field label="Tanggal" error={errors.date}>
                <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
            </div>
            <Field label="Catatan (opsional)">
              <input className={inputCls} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </Field>
            {saved && <p className="text-sm text-lime">Transaksi berhasil disimpan.</p>}
            <Button type="submit" className="w-full">
              Simpan transaksi
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden p-0 lg:col-span-3">
          <div className="flex items-center justify-between px-6 pt-6">
            <p className="micro">Riwayat pembayaran</p>
            <p className="text-sm text-muted">
              Total: <span className="font-semibold text-lime">{fmtRp(total)}</span>
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={TH}>Tanggal</th>
                  <th className={TH}>Anggota</th>
                  <th className={TH}>Catatan</th>
                  <th className={TH}>Metode</th>
                  <th className={`${TH} text-right`}>Nominal</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td className={`${TD} text-muted`} colSpan={5}>
                      Belum ada transaksi.
                    </td>
                  </tr>
                )}
                {rows.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className={TD}>{fmtDate(t.date)}</td>
                    <td className={TD}>{memberName(t.memberId)}</td>
                    <td className={`${TD} text-muted`}>{t.note || '-'}</td>
                    <td className={TD}>{t.method}</td>
                    <td className={`${TD} text-right font-semibold`}>{fmtRp(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
