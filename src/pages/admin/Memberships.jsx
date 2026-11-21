import { useState } from 'react';
import { useStore } from '../../lib/store';
import { fmtDate, today } from '../../lib/utils';
import { Badge, Button, Card, Field, Notice, TD, TH, inputCls } from '../../components/ui';

const METHODS = ['Tunai', 'Transfer', 'QRIS', 'Debit'];

export default function Memberships() {
  const { data, activateMembership } = useStore();
  const [form, setForm] = useState({
    memberId: '',
    packageId: '',
    start: today(),
    pay: true,
    amount: '',
    method: 'Tunai',
  });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [filterMember, setFilterMember] = useState('');

  const onPackage = (id) => {
    const pkg = data.packages.find((p) => p.id === Number(id));
    setForm((f) => ({ ...f, packageId: id, amount: pkg ? String(pkg.price) : '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.memberId) e.memberId = 'Pilih anggota.';
    if (!form.packageId) e.packageId = 'Pilih paket.';
    if (!form.start) e.start = 'Tanggal mulai wajib diisi.';
    if (form.pay && (form.amount === '' || Number(form.amount) <= 0))
      e.amount = 'Nominal pembayaran harus lebih dari 0.';
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    const res = activateMembership({
      memberId: Number(form.memberId),
      packageId: Number(form.packageId),
      start: form.start,
      payment: form.pay ? { amount: Number(form.amount), method: form.method } : null,
    });
    setResult(res.ok ? { ok: true, msg: `Membership berhasil disimpan (${res.type}).` } : { ok: false, msg: res.msg });
    if (res.ok) setForm((f) => ({ ...f, memberId: '', packageId: '', amount: '' }));
  };

  const memberName = (id) => data.members.find((m) => m.id === id)?.name ?? '-';
  const pkgName = (id) => data.packages.find((p) => p.id === id)?.name ?? '-';

  const history = data.memberships
    .filter((m) => !filterMember || m.memberId === Number(filterMember))
    .sort((a, b) => b.start.localeCompare(a.start));

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <p className="micro">Aktivasi / perpanjangan</p>
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
            <Field label="Paket" error={errors.packageId}>
              <select className={inputCls} value={form.packageId} onChange={(e) => onPackage(e.target.value)}>
                <option value="">Pilih paket</option>
                {data.packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.durationDays} hari
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tanggal mulai" error={errors.start}>
              <input type="date" className={inputCls} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
            </Field>
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" checked={form.pay} onChange={(e) => setForm({ ...form, pay: e.target.checked })} className="accent-lime" />
              Catat pembayaran sekaligus
            </label>
            {form.pay && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nominal (Rp)" error={errors.amount}>
                  <input type="number" min="0" className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </Field>
                <Field label="Metode">
                  <select className={inputCls} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    {METHODS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
            {result && <Notice ok={result.ok}>{result.msg}</Notice>}
            <Button type="submit" className="w-full">
              Simpan membership
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden p-0 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
            <p className="micro">Riwayat membership</p>
            <select className={`${inputCls} w-auto`} value={filterMember} onChange={(e) => setFilterMember(e.target.value)}>
              <option value="">Semua anggota</option>
              {data.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={TH}>Anggota</th>
                  <th className={TH}>Jenis</th>
                  <th className={TH}>Paket</th>
                  <th className={TH}>Periode</th>
                  <th className={TH}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 && (
                  <tr>
                    <td className={`${TD} text-muted`} colSpan={5}>
                      Belum ada riwayat.
                    </td>
                  </tr>
                )}
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-border">
                    <td className={TD}>{memberName(h.memberId)}</td>
                    <td className={TD}>{h.type}</td>
                    <td className={TD}>{pkgName(h.packageId)}</td>
                    <td className={`${TD} text-muted`}>
                      {fmtDate(h.start)} – {fmtDate(h.end)}
                    </td>
                    <td className={TD}>
                      <Badge status={h.end >= today() ? 'active' : 'expired'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <p className="mt-4 text-xs text-muted">
        Jika membership masih aktif, pengisian berikutnya dihitung sebagai perpanjangan dari tanggal berakhir.
      </p>
    </>
  );
}
