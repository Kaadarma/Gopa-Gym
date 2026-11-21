import { useState } from 'react';
import { useStore } from '../../lib/store';
import { fmtRp } from '../../lib/utils';
import { Button, Card, Field, Modal, TD, TH, inputCls } from '../../components/ui';

const EMPTY = { name: '', price: '', durationDays: '' };

export default function Packages() {
  const { data, savePackage, deletePackage } = useStore();
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY);
    setErrors({});
    setModal(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: String(p.price), durationDays: String(p.durationDays) });
    setErrors({});
    setModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nama paket wajib diisi.';
    if (form.price === '') e.price = 'Harga wajib diisi.';
    else if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) e.price = 'Harga tidak boleh negatif.';
    if (form.durationDays === '') e.durationDays = 'Durasi wajib diisi.';
    else if (!Number.isInteger(Number(form.durationDays)) || Number(form.durationDays) <= 0)
      e.durationDays = 'Durasi harus bilangan bulat lebih dari 0 (hari).';
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    savePackage({
      ...(editingId ? { id: editingId } : {}),
      name: form.name.trim(),
      price: Number(form.price),
      durationDays: Number(form.durationDays),
    });
    setModal(false);
  };

  const remove = (p) => {
    if (window.confirm(`Hapus paket ${p.name}?`)) deletePackage(p.id);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>+ Paket baru</Button>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr>
              <th className={TH}>Nama paket</th>
              <th className={TH}>Harga</th>
              <th className={TH}>Durasi</th>
              <th className={TH}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.packages.length === 0 && (
              <tr>
                <td className={`${TD} text-muted`} colSpan={4}>
                  Belum ada paket.
                </td>
              </tr>
            )}
            {data.packages.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className={`${TD} font-semibold`}>{p.name}</td>
                <td className={TD}>{fmtRp(p.price)}</td>
                <td className={TD}>{p.durationDays} hari</td>
                <td className={TD}>
                  <div className="flex gap-3 text-xs font-semibold uppercase tracking-wider">
                    <button className="text-muted hover:text-lime" onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button className="text-muted hover:text-danger" onClick={() => remove(p)}>
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modal} title={editingId ? 'Edit paket' : 'Paket baru'} onClose={() => setModal(false)}>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Nama paket" error={errors.name}>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Harga (Rp)" error={errors.price}>
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </Field>
          <Field label="Durasi (hari)" error={errors.durationDays}>
            <input
              type="number"
              min="1"
              className={inputCls}
              value={form.durationDays}
              onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
