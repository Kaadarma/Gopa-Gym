import { useStore } from '../../lib/store';
import { currentMembership, daysBetween, fmtDate, fmtRp, statusOf, today } from '../../lib/utils';
import { Avatar, Badge, Card, PageHeader, Stat, TD, TH } from '../../components/ui';

export default function AdminDashboard() {
  const { data } = useStore();
  const t = today();
  const month = t.slice(0, 7);

  const statuses = data.members.map((m) => statusOf(data.memberships, m.id));
  const count = (s) => statuses.filter((x) => x === s).length;
  const total = data.members.length;
  const checkinsToday = data.attendance.filter((a) => a.date === t).length;
  const revenue = data.transactions
    .filter((x) => x.date.startsWith(month))
    .reduce((sum, x) => sum + x.amount, 0);

  const memberOf = (id) => data.members.find((m) => m.id === id);
  const recent = [...data.attendance]
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 5);

  const expiring = data.members
    .map((m) => ({ m, cur: currentMembership(data.memberships, m.id) }))
    .filter(({ cur }) => cur && cur.end >= t && daysBetween(t, cur.end) <= 7);

  const mix = [
    ['active', 'Aktif', 'bg-lime'],
    ['expired', 'Kedaluwarsa', 'bg-muted/60'],
    ['none', 'Belum ada', 'bg-white/20'],
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Ringkasan Gopa Gym · ${fmtDate(t)}`} />

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Total anggota" value={total} hint={`${count('active')} membership aktif`} />
        <Stat
          label="Membership aktif"
          value={count('active')}
          hint={`${total ? Math.round((count('active') / total) * 100) : 0}% dari total`}
        />
        <Stat label="Check-in hari ini" value={checkinsToday} />
        <Stat label="Pendapatan bulan ini" value={fmtRp(revenue)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="micro">Komposisi membership</p>
          <div className="mt-5 space-y-4">
            {mix.map(([key, label, color]) => {
              const n = count(key);
              const pct = total ? (n / total) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm">
                    <span className="text-text">{label}</span>
                    <span className="text-muted">
                      {n} · {Math.round(pct)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-0 lg:col-span-2">
          <div className="px-6 pt-6">
            <p className="micro">Check-in terbaru</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={TH}>Anggota</th>
                  <th className={TH}>Tanggal</th>
                  <th className={TH}>Waktu</th>
                  <th className={TH}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && (
                  <tr>
                    <td className={`${TD} text-muted`} colSpan={4}>
                      Belum ada check-in.
                    </td>
                  </tr>
                )}
                {recent.map((a) => {
                  const m = memberOf(a.memberId);
                  return (
                    <tr key={a.id} className="border-t border-border">
                      <td className={TD}>
                        <div className="flex items-center gap-3">
                          <Avatar name={m?.name ?? '?'} photo={m?.photo} />
                          {m?.name ?? '-'}
                        </div>
                      </td>
                      <td className={TD}>{fmtDate(a.date)}</td>
                      <td className={TD}>{a.time.slice(0, 5)}</td>
                      <td className={TD}>
                        <Badge status={m ? statusOf(data.memberships, m.id) : 'none'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <p className="micro">Membership berakhir dalam 7 hari</p>
        {expiring.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Tidak ada membership yang akan berakhir.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {expiring.map(({ m, cur }) => (
              <li key={m.id} className="flex items-center justify-between py-3">
                <span className="text-text">{m.name}</span>
                <span className="text-sm text-pending">
                  {fmtDate(cur.end)} · {daysBetween(t, cur.end)} hari lagi
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
