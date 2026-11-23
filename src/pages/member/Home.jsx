import { Link } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { currentMembership, daysBetween, downloadCsv, fmtDate, fmtRp, statusOf, today } from '../../lib/utils';
import { Avatar, Badge, Button, Card, PageHeader, TD, TH } from '../../components/ui';

export default function MemberHome() {
  const { data, session } = useStore();
  const member = data.members.find((m) => m.id === session.memberId);
  if (!member) return <p className="text-muted">Data member tidak ditemukan.</p>;

  const t = today();
  const status = statusOf(data.memberships, member.id);
  const cur = currentMembership(data.memberships, member.id);
  const pkg = cur && data.packages.find((p) => p.id === cur.packageId);
  const lastCheckin = data.attendance
    .filter((a) => a.memberId === member.id)
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))[0];
  const history = data.memberships
    .filter((m) => m.memberId === member.id)
    .sort((a, b) => b.start.localeCompare(a.start));

  const paymentOf = (h) =>
    data.transactions.find((x) => x.memberId === member.id && x.date === h.start);

  const exportHistory = () => {
    const rows = [
      ['Jenis', 'Paket', 'Mulai', 'Berakhir', 'Pembayaran'],
      ...history.map((h) => {
        const p = data.packages.find((x) => x.id === h.packageId);
        const pay = paymentOf(h);
        return [h.type, p?.name ?? '-', h.start, h.end, pay ? pay.amount : ''];
      }),
    ];
    downloadCsv(`riwayat-membership-${member.code}-${t}.csv`, rows);
  };

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Selamat datang, ${member.name}`} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <div className="flex items-center gap-5">
            <Avatar name={member.name} photo={member.photo} size="h-20 w-20" />
            <div>
              <p className="font-display text-4xl uppercase leading-none">{member.name}</p>
              <p className="mt-2 text-sm text-muted">
                Kode {member.code} · {member.phone}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="micro">Status</p>
              <div className="mt-2">
                <Badge status={status} />
              </div>
            </div>
            <div>
              <p className="micro">Paket</p>
              <p className="mt-2 text-text">{pkg ? pkg.name : '-'}</p>
            </div>
            <div>
              <p className="micro">Berlaku sampai</p>
              <p className="mt-2 text-text">{cur ? fmtDate(cur.end) : '-'}</p>
              {status === 'active' && (
                <p className="text-xs text-lime">{daysBetween(t, cur.end)} hari lagi</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <p className="micro">Check-in terakhir</p>
            <p className="mt-3 font-display text-4xl text-text">
              {lastCheckin ? fmtDate(lastCheckin.date) : '-'}
            </p>
            {lastCheckin && <p className="text-sm text-muted">Pukul {lastCheckin.time.slice(0, 5)}</p>}
          </div>
          <Link to="/member/barcode" className="mt-6">
            <Button className="w-full">Tampilkan barcode</Button>
          </Link>
        </Card>
      </div>

      <Card className="mt-4 p-0">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <p className="micro">Riwayat membership</p>
          <Button variant="secondary" className="h-9 px-4 text-xs" onClick={exportHistory}>
            Ekspor CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className={TH}>Jenis</th>
                <th className={TH}>Paket</th>
                <th className={TH}>Mulai</th>
                <th className={TH}>Berakhir</th>
                <th className={TH}>Pembayaran</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td className={`${TD} text-muted`} colSpan={5}>
                    Belum ada riwayat membership.
                  </td>
                </tr>
              )}
              {history.map((h) => {
                const p = data.packages.find((x) => x.id === h.packageId);
                const pay = data.transactions.find(
                  (x) => x.memberId === member.id && x.date === h.start,
                );
                return (
                  <tr key={h.id} className="border-t border-border">
                    <td className={TD}>{h.type}</td>
                    <td className={TD}>{p?.name ?? '-'}</td>
                    <td className={TD}>{fmtDate(h.start)}</td>
                    <td className={TD}>{fmtDate(h.end)}</td>
                    <td className={`${TD} text-muted`}>{pay ? fmtRp(pay.amount) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
