import { useState } from 'react';
import { PAGE_KEYS, useStore } from '../../lib/store';
import { Button, Card, Notice, PageHeader, TD, TH } from '../../components/ui';

const LABELS = {
  dashboard: 'Dashboard',
  members: 'Members',
  packages: 'Packages',
  memberships: 'Memberships',
  checkin: 'QR Check-in',
  attendance: 'Attendance',
  transactions: 'Transactions',
  analytics: 'Analytics',
  access: 'Settings',
};

// Hanya Owner yang bisa membuka halaman ini (dijaga oleh Gate di App).
export default function Access() {
  const { data, setAdminPermissions } = useStore();
  const [pages, setPages] = useState(data.permissions.admin);
  const [saved, setSaved] = useState(false);

  const toggle = (key) => {
    setSaved(false);
    setPages((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Atur hak akses halaman untuk peran Admin. Owner selalu memiliki akses penuh."
        action={
          <Button
            onClick={() => {
              setAdminPermissions(pages);
              setSaved(true);
            }}
          >
            Simpan hak akses
          </Button>
        }
      />

      {saved && (
        <div className="mb-4">
          <Notice ok>Hak akses Admin berhasil diperbarui.</Notice>
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr>
              <th className={TH}>Halaman</th>
              <th className={TH}>Owner</th>
              <th className={TH}>Admin</th>
            </tr>
          </thead>
          <tbody>
            {PAGE_KEYS.map((key) => (
              <tr key={key} className="border-t border-border">
                <td className={TD}>{LABELS[key]}</td>
                <td className={`${TD} text-lime`}>Penuh</td>
                <td className={TD}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-lime"
                    checked={pages.includes(key)}
                    onChange={() => toggle(key)}
                    aria-label={`Akses Admin ke ${LABELS[key]}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
