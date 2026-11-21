import { useStore } from '../../lib/store';
import { addDays, fmtRp, today } from '../../lib/utils';
import { Card, PageHeader, Stat } from '../../components/ui';

export default function Analytics() {
  const { data } = useStore();
  const t = today();

  // Pendapatan 6 bulan terakhir
  const base = new Date();
  base.setDate(1);
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const value = data.transactions.filter((x) => x.date.startsWith(key)).reduce((s, x) => s + x.amount, 0);
    return { key, label: d.toLocaleDateString('id-ID', { month: 'short' }), value };
  });
  const maxRevenue = Math.max(1, ...months.map((m) => m.value));

  // Check-in 7 hari terakhir
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(t, i - 6);
    const label = new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'short' });
    return { date, label, value: data.attendance.filter((a) => a.date === date).length };
  });
  const maxCheckin = Math.max(1, ...days.map((d) => d.value));

  // Status membership
  const statusCount = { active: 0, expired: 0, none: 0 };
  data.members.forEach((m) => {
    const list = data.memberships.filter((x) => x.memberId === m.id);
    if (!list.length) statusCount.none++;
    else if (list.some((x) => x.end >= t)) statusCount.active++;
    else statusCount.expired++;
  });
  const totalMembers = data.members.length || 1;

  // Paket terlaris
  const pkgSales = data.packages
    .map((p) => ({ name: p.name, count: data.memberships.filter((x) => x.packageId === p.id).length }))
    .sort((a, b) => b.count - a.count);

  // Tingkat perpanjangan: anggota yang punya >1 membership
  const withAny = data.members.filter((m) => data.memberships.some((x) => x.memberId === m.id)).length;
  const renewed = data.members.filter((m) => data.memberships.filter((x) => x.memberId === m.id).length > 1).length;
  const renewalRate = withAny ? Math.round((renewed / withAny) * 100) : 0;

  const revenueThisYear = data.transactions
    .filter((x) => x.date.startsWith(String(new Date().getFullYear())))
    .reduce((s, x) => s + x.amount, 0);

  return (
    <>
      <PageHeader title="Analytics" subtitle="Ringkasan pendapatan, keanggotaan, dan kunjungan untuk Owner." />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Pendapatan tahun ini" value={fmtRp(revenueThisYear)} />
        <Stat label="Tingkat perpanjangan" value={`${renewalRate}%`} hint={`${renewed} dari ${withAny} anggota`} />
        <Stat label="Membership aktif" value={statusCount.active} hint={`${Math.round((statusCount.active / totalMembers) * 100)}% dari anggota`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="micro">Pendapatan 6 bulan terakhir</p>
          <div className="mt-6 flex h-56 items-end gap-3">
            {months.map((m) => (
              <div key={m.key} className="flex h-full flex-1 flex-col justify-end gap-2">
                <p className="truncate text-center text-[10px] text-muted">{m.value ? fmtRp(m.value).replace('Rp ', '') : ''}</p>
                <div
                  className="rounded-t-md bg-lime/80"
                  style={{ height: `${(m.value / maxRevenue) * 100}%`, minHeight: m.value ? 4 : 0 }}
                />
                <p className="text-center text-xs text-muted">{m.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="micro">Check-in 7 hari terakhir</p>
          <div className="mt-6 flex h-56 items-end gap-3">
            {days.map((d) => (
              <div key={d.date} className="flex h-full flex-1 flex-col justify-end gap-2">
                <p className="text-center text-[11px] text-muted">{d.value}</p>
                <div
                  className={`rounded-t-md ${d.date === t ? 'bg-lime' : 'bg-white/15'}`}
                  style={{ height: `${(d.value / maxCheckin) * 100}%`, minHeight: d.value ? 4 : 0 }}
                />
                <p className="text-center text-xs text-muted">{d.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="micro">Komposisi status</p>
          <div className="mt-5 space-y-4">
            {[
              ['Aktif', statusCount.active, 'bg-lime'],
              ['Kedaluwarsa', statusCount.expired, 'bg-muted/60'],
              ['Belum ada membership', statusCount.none, 'bg-white/20'],
            ].map(([label, n, color]) => (
              <div key={label}>
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="text-muted">{n}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${(n / totalMembers) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="micro">Paket terlaris</p>
          <ul className="mt-5 divide-y divide-border">
            {pkgSales.map((p) => (
              <li key={p.name} className="flex justify-between py-3 text-sm">
                <span>{p.name}</span>
                <span className="text-lime">{p.count} transaksi</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="mt-6 text-xs text-muted">
        Prediksi pendapatan dengan Machine Learning dan data dari API Data Science belum terhubung ke halaman ini.
      </p>
    </>
  );
}
