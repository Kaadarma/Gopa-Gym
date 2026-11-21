import { useState } from 'react';
import { useStore } from '../../lib/store';
import { fmtDate } from '../../lib/utils';
import { Avatar, Card, TD, TH, inputCls } from '../../components/ui';

export default function Attendance() {
  const { data } = useStore();
  const [date, setDate] = useState('');
  const [memberId, setMemberId] = useState('');

  const rows = data.attendance
    .filter((a) => (!date || a.date === date) && (!memberId || a.memberId === Number(memberId)))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const memberOf = (id) => data.members.find((m) => m.id === id);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3">
        <input type="date" className={`${inputCls} w-auto`} value={date} onChange={(e) => setDate(e.target.value)} />
        <select className={`${inputCls} w-auto`} value={memberId} onChange={(e) => setMemberId(e.target.value)}>
          <option value="">Semua anggota</option>
          {data.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        {(date || memberId) && (
          <button
            className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-lime"
            onClick={() => {
              setDate('');
              setMemberId('');
            }}
          >
            Reset filter
          </button>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className={TH}>Tanggal</th>
                <th className={TH}>Waktu</th>
                <th className={TH}>Anggota</th>
                <th className={TH}>Kode</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className={`${TD} text-muted`} colSpan={4}>
                    Tidak ada data kehadiran.
                  </td>
                </tr>
              )}
              {rows.map((a) => {
                const m = memberOf(a.memberId);
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className={TD}>{fmtDate(a.date)}</td>
                    <td className={TD}>{a.time.slice(0, 5)}</td>
                    <td className={TD}>
                      <div className="flex items-center gap-3">
                        <Avatar name={m?.name ?? '?'} photo={m?.photo} />
                        {m?.name ?? '-'}
                      </div>
                    </td>
                    <td className={`${TD} text-muted`}>{m?.code ?? '-'}</td>
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
