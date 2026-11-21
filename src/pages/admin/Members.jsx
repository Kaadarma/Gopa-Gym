import { useState } from 'react';
import { useStore } from '../../lib/store';
import { currentMembership, fmtDate, statusOf } from '../../lib/utils';
import { Avatar, Badge, Button, Card, Field, Modal, Notice, PageHeader, TD, TH, inputCls } from '../../components/ui';
import Barcode from '../../components/Barcode';

const EMPTY = { name: '', phone: '', email: '', photo: null };
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_BYTES = 500 * 1024;

export default function Members() {
  const { data, saveMember, deleteMember } = useStore();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [modal, setModal] = useState(null); // 'form' | 'barcode'
  const [barcodeMember, setBarcodeMember] = useState(null);

  const rows = data.members
    .map((m) => {
      const cur = currentMembership(data.memberships, m.id);
      return {
        m,
        cur,
        status: statusOf(data.memberships, m.id),
        pkg: cur && data.packages.find((p) => p.id === cur.packageId),
      };
    })
    .filter(({ m, status }) => {
      const term = q.trim().toLowerCase();
      const matchText = !term || [m.name, m.code, m.phone].some((v) => v.toLowerCase().includes(term));
      return matchText && (filter === 'all' || status === filter);
    });

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY);
    setErrors({});
    setModal('form');
  };

  const openEdit = (m) => {
    setEditingId(m.id);
    setForm({ name: m.name, phone: m.phone, email: m.email || '', photo: m.photo || null });
    setErrors({});
    setModal('form');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi.';
    if (!form.phone.trim()) e.phone = 'Nomor telepon wajib diisi.';
    else if (!/^[0-9+\-\s]{8,20}$/.test(form.phone.trim())) e.phone = 'Nomor telepon tidak valid.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Format email tidak valid.';
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    saveMember({
      ...(editingId ? { id: editingId } : {}),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      photo: form.photo,
    });
    setModal(null);
  };

  const onPhoto = (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      setErrors((x) => ({ ...x, photo: 'Format harus JPG, PNG, atau WEBP.' }));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setErrors((x) => ({ ...x, photo: 'Ukuran foto maksimal 500 KB.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, photo: reader.result }));
      setErrors((x) => ({ ...x, photo: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const remove = (m) => {
    if (window.confirm(`Hapus anggota ${m.name}? Riwayat membership dan check-in ikut terhapus.`)) {
      deleteMember(m.id);
    }
  };

  return (
    <>
      <PageHeader
        title="Members"
        subtitle="Kelola data anggota, foto profil, dan barcode identitas."
        action={<Button onClick={openNew}>+ Tambah anggota</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          className={`${inputCls} max-w-sm`}
          placeholder="Cari nama, ID, atau nomor telepon..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={`${inputCls} w-auto`} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Semua status</option>
          <option value="active">Aktif</option>
          <option value="expired">Kedaluwarsa</option>
          <option value="none">Belum ada membership</option>
        </select>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className={TH}>Anggota</th>
                <th className={TH}>ID</th>
                <th className={TH}>Telepon</th>
                <th className={TH}>Paket</th>
                <th className={TH}>Status</th>
                <th className={TH}>Berakhir</th>
                <th className={TH}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className={`${TD} text-muted`} colSpan={7}>
                    Tidak ada anggota yang cocok.
                  </td>
                </tr>
              )}
              {rows.map(({ m, cur, status, pkg }) => (
                <tr key={m.id} className="border-t border-border">
                  <td className={TD}>
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} photo={m.photo} />
                      <span>{m.name}</span>
                    </div>
                  </td>
                  <td className={`${TD} text-muted`}>{m.code}</td>
                  <td className={TD}>{m.phone}</td>
                  <td className={TD}>{pkg?.name ?? '-'}</td>
                  <td className={TD}>
                    <Badge status={status} />
                  </td>
                  <td className={`${TD} text-muted`}>{cur ? fmtDate(cur.end) : '-'}</td>
                  <td className={TD}>
                    <div className="flex gap-3 text-xs font-semibold uppercase tracking-wider">
                      <button
                        className="text-muted hover:text-lime"
                        onClick={() => {
                          setBarcodeMember(m);
                          setModal('barcode');
                        }}
                      >
                        Barcode
                      </button>
                      <button className="text-muted hover:text-lime" onClick={() => openEdit(m)}>
                        Edit
                      </button>
                      <button className="text-muted hover:text-danger" onClick={() => remove(m)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal === 'form'} title={editingId ? 'Edit anggota' : 'Anggota baru'} onClose={() => setModal(null)}>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="flex items-center gap-4">
            <Avatar name={form.name || '?'} photo={form.photo} size="h-16 w-16" />
            <Field label="Foto profil (JPG/PNG/WEBP, maks 500 KB)" error={errors.photo}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onPhoto}
                className="block text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-lime file:px-4 file:py-2 file:font-semibold file:text-ink"
              />
            </Field>
          </div>
          <Field label="Nama lengkap" error={errors.name}>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Nomor telepon" error={errors.phone}>
            <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Email (opsional)" error={errors.email}>
            <input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'barcode'} title="Barcode anggota" onClose={() => setModal(null)}>
        {barcodeMember && (
          <div className="space-y-4 text-center">
            <p className="text-text">{barcodeMember.name}</p>
            <div className="rounded-xl bg-white p-4">
              <Barcode value={barcodeMember.code} />
            </div>
            <Notice ok>Kode unik: {barcodeMember.code}</Notice>
          </div>
        )}
      </Modal>
    </>
  );
}
