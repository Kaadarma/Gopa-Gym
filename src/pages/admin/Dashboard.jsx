import { Link } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { addDays, currentMembership, fmtRp, initials, statusOf, today } from '../../lib/utils';
import { IconTrend } from '../../components/icons';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MIX_COLORS = ['rgb(var(--lime))', 'rgb(var(--mix-2))', 'rgb(var(--mix-3))'];

// Jadwal contoh, sama seperti kartu "Today's classes" di figcraft.
const CLASSES = [
  { time: '06:30', name: 'Strength Foundations', coach: 'Coach Raka · Studio A', taken: 18 },
  { time: '12:00', name: 'HIIT 45', coach: 'Coach Sinta · Studio B', taken: 12 },
  { time: '18:30', name: 'Mobility & Recovery', coach: 'Coach Bayu · Studio A', taken: 9 },
];

const STATUS = {
  active: ['Active', 'bg-lime/[0.078] text-lime', 'bg-lime'],
  pending: ['Pending', 'bg-pending/[0.078] text-pending', 'bg-pending'],
  expired: ['Expired', 'bg-dim/[0.04] text-faint', 'bg-faint'],
  none: ['Expired', 'bg-dim/[0.04] text-faint', 'bg-faint'],
};

const pctChange = (now, before) => (before ? ((now - before) / before) * 100 : now ? 100 : 0);
const fmtDelta = (n) => `${n >= 0 ? '+' : ''}${(Number.isFinite(n) ? n : 0).toFixed(1)}%`;

function Panel({ className = '', children }) {
  return (
    <section className={`relative rounded-[14px] border border-hairline bg-secondary ${className}`}>{children}</section>
  );
}

function Label({ children, className = '' }) {
  return (
    <p
      className={`text-[8.5px] font-semibold uppercase leading-[10px] tracking-[1.2px] text-faint ${className}`}
    >
      {children}
    </p>
  );
}

function SampleTag() {
  return (
    <span className="absolute right-6 top-5 flex h-5 items-center rounded-full border border-line bg-panel px-3 text-[6.5px] font-semibold uppercase leading-none tracking-[1px] text-faint">
      Sample data
    </span>
  );
}

function Kpi({ label, value, valueSize = 34, delta, note }) {
  return (
    <Panel className="h-[128px]">
      <div className="px-5 pt-4">
        <Label>{label}</Label>
        <p
          className="mt-2 truncate pr-10 font-display leading-none text-text"
          style={{ fontSize: valueSize }}
        >
          {value}
        </p>
      </div>
      <IconTrend className="absolute right-3.5 top-6 text-lime" />
      {delta && (
        <div className="absolute bottom-5 left-5 flex items-center gap-5">
          <span className="flex h-5 items-center rounded-full bg-lime/[0.078] px-2 text-[8px] font-semibold leading-none text-lime">
            {delta}
          </span>
          <span className="text-[8px] leading-none text-faint">{note}</span>
        </div>
      )}
    </Panel>
  );
}

function StatusPill({ status }) {
  const [label, cls, dot] = STATUS[status] || STATUS.none;
  return (
    <span
      className={`inline-flex h-5 w-fit items-center gap-[5px] rounded-full px-[10px] text-[7.5px] font-semibold leading-none ${cls}`}
    >
      <span className={`h-[5px] w-[5px] rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export default function AdminDashboard() {
  const { data } = useStore();
  const t = today();
  const month = t.slice(0, 7);
  const prevEnd = addDays(`${month}-01`, -1);
  const prevMonth = prevEnd.slice(0, 7);

  const current = new Map(
    data.members.map((m) => [m.id, currentMembership(data.memberships, m.id)]),
  );
  const statuses = data.members.map((m) => statusOf(data.memberships, m.id));
  const count = (s) => statuses.filter((x) => x === s).length;
  const total = data.members.length;
  const active = count('active');

  const checkinsByDate = new Map();
  for (const a of data.attendance) checkinsByDate.set(a.date, (checkinsByDate.get(a.date) || 0) + 1);
  const checkinsOn = (date) => checkinsByDate.get(date) || 0;

  const revenueMonth = data.transactions
    .filter((x) => x.date.startsWith(month))
    .reduce((sum, x) => sum + x.amount, 0);
  const revenuePrev = data.transactions
    .filter((x) => x.date.startsWith(prevMonth))
    .reduce((sum, x) => sum + x.amount, 0);

  const newThis = data.members.filter((m) => m.joinDate?.startsWith(month)).length;
  const newPrev = data.members.filter((m) => m.joinDate?.startsWith(prevMonth)).length;
  const activeThen = new Set(
    data.memberships.filter((m) => m.start <= prevEnd && m.end >= prevEnd).map((m) => m.memberId),
  ).size;

  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(t, i - 6);
    return { date, label: WEEKDAYS[new Date(`${date}T00:00:00`).getDay()], count: checkinsOn(date) };
  });
  const weekTotal = week.reduce((s, d) => s + d.count, 0);
  const weekPrev = Array.from({ length: 7 }, (_, i) => checkinsOn(addDays(t, i - 13))).reduce(
    (s, n) => s + n,
    0,
  );
  const peak = Math.max(0, ...week.map((d) => d.count));
  const barHeight = (n) => (n > 0 ? Math.max(6, (n / Math.max(1, peak)) * 118) : 0);

  const mix = data.packages.slice(0, 3).map((p, i) => {
    const n = data.members.filter(
      (m) => statusOf(data.memberships, m.id) === 'active' && current.get(m.id)?.packageId === p.id,
    ).length;
    return { id: p.id, name: p.name, count: n, color: MIX_COLORS[i % MIX_COLORS.length] };
  });
  const mixPct = (n) => (active ? Math.round((n / active) * 100) : 0);

  const recent = [...data.attendance]
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 5);

  const planOf = (memberId) => {
    const pkgId = current.get(memberId)?.packageId;
    return data.packages.find((p) => p.id === pkgId)?.name ?? '—';
  };

  const spotsLeft = CLASSES.reduce((s, c) => s + (20 - c.taken), 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Total members"
          value={total.toLocaleString('en-US')}
          delta={fmtDelta(pctChange(newThis, newPrev))}
          note="vs last month"
        />
        <Kpi
          label="Active members"
          value={active.toLocaleString('en-US')}
          delta={fmtDelta(pctChange(active, activeThen))}
          note="of total"
        />
        <Kpi
          label="Check-ins today"
          value={checkinsOn(t).toLocaleString('en-US')}
          delta={fmtDelta(pctChange(checkinsOn(t), checkinsOn(addDays(t, -1))))}
          note="since 00:00"
        />
        <Kpi
          label="Monthly revenue"
          value={fmtRp(revenueMonth)}
          valueSize={30}
          delta={fmtDelta(pctChange(revenueMonth, revenuePrev))}
          note="recurring"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.926fr)_minmax(0,1fr)]">
        <Panel className="h-[300px] px-6 pt-[18px]">
          <Label>Check-ins this week</Label>
          <SampleTag />
          <div className="mt-[6px] flex items-baseline gap-[11px]">
            <p className="font-display text-[30px] leading-[30px] text-text">
              {weekTotal.toLocaleString('en-US')}
            </p>
            <p className="text-[8px] font-semibold leading-none text-lime">
              {fmtDelta(pctChange(weekTotal, weekPrev))} vs last week
            </p>
          </div>

          <div className="absolute inset-x-6 top-[110px]">
            <div className="relative h-[140px]">
              <span className="absolute inset-x-0 top-0 h-px bg-dim/[0.06]" />
              <span className="absolute inset-x-0 top-[35px] h-px bg-dim/[0.04]" />
              <span className="absolute inset-x-0 top-[70px] h-px bg-dim/[0.04]" />
              <span className="absolute inset-x-0 top-[105px] h-px bg-dim/[0.04]" />
              <span className="absolute inset-x-0 bottom-0 h-px bg-dim/[0.12]" />
              <div className="absolute inset-0 flex items-end justify-between">
                {week.map((d) => (
                  <div key={d.date} className="flex h-full w-[46px] items-end">
                    <div
                      className={`w-[46px] rounded-md ${d.count > 0 && d.count === peak ? 'bg-lime' : 'bg-bar'}`}
                      style={{ height: barHeight(d.count) }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 flex justify-between">
              {week.map((d) => (
                <p
                  key={d.date}
                  className={`w-[46px] text-center text-[7px] leading-none tracking-[0.8px] ${
                    d.count > 0 && d.count === peak ? 'text-lime' : 'text-faint'
                  }`}
                >
                  {d.label}
                </p>
              ))}
            </div>
          </div>
        </Panel>

        <Panel className="h-[300px] px-6 pt-[18px]">
          <Label>Membership mix</Label>
          <SampleTag />
          <div className="mt-2 flex items-baseline gap-[9px]">
            <p className="font-display text-[30px] leading-[30px] text-text">
              {active.toLocaleString('en-US')}
            </p>
            <p className="text-[8.5px] leading-none text-faint">active members</p>
          </div>

          <div className="mt-[30px] flex h-3 gap-[2px]">
            {mix.map((m) => (
              <span
                key={m.id}
                className="rounded-md"
                style={{ background: m.color, flexGrow: m.count, flexBasis: 0 }}
              />
            ))}
          </div>

          <div className="mt-5 space-y-[13px]">
            {mix.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: m.color }} />
                <div>
                  <p className="text-[10px] leading-[12px] text-text">{m.name}</p>
                  <p className="mt-1 text-[7.5px] leading-[9px] text-faint">{mixPct(m.count)}% of members</p>
                </div>
                <p className="ml-auto font-display text-[14px] leading-[14px] text-text">{m.count}</p>
              </div>
            ))}
          </div>

          <p className="absolute bottom-[30px] left-6 text-[8px] leading-[10px] text-faint">
            {total ? Math.round((active / total) * 100) : 0}% of members have an active plan
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.926fr)_minmax(0,1fr)]">
        <div className="overflow-x-auto">
          <Panel className="h-[300px] min-w-[676px]">
            <Label className="absolute left-6 top-[18px]">Recent check-ins</Label>
            <Link
              to="/admin/attendance"
              className="absolute right-6 top-[18px] text-[8.5px] font-semibold leading-none text-lime"
            >
              View all&nbsp;&nbsp;→
            </Link>

            <div className="absolute inset-x-6 top-[52px] grid grid-cols-[276px_170px_120px_1fr] items-center">
              {['Member', 'Plan', 'Time', 'Status'].map((h) => (
                <p key={h} className="text-[7px] font-semibold uppercase leading-none tracking-[1px] text-faint">
                  {h}
                </p>
              ))}
            </div>
            <div className="absolute inset-x-6 top-[68px] h-px bg-dim/[0.06]" />

            <div className="absolute inset-x-6 top-[79px]">
              {recent.length === 0 && (
                <p className="py-6 text-[9.5px] text-faint">No check-ins yet.</p>
              )}
              {recent.map((a) => {
                const m = data.members.find((x) => x.id === a.memberId);
                const status = m ? statusOf(data.memberships, m.id) : 'none';
                return (
                  <div
                    key={a.id}
                    className="grid h-[42px] grid-cols-[276px_170px_120px_1fr] items-center"
                  >
                    <div className="flex items-center gap-[10px] pr-4">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-chip text-[7.5px] font-semibold text-text">
                        {initials(m?.name ?? '?')}
                      </span>
                      <span className="truncate text-[9.5px] font-medium text-text">{m?.name ?? '—'}</span>
                    </div>
                    <p className="truncate pr-4 text-[9px] text-muted">{m ? planOf(m.id) : '—'}</p>
                    <p className="text-[9px] text-muted">{a.time.slice(0, 5)}</p>
                    <StatusPill status={status} />
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <Panel className="h-[300px] px-6 pt-[18px]">
          <Label>Today's classes</Label>
          <Link
            to="/admin/packages"
            className="absolute right-6 top-[18px] text-[8.5px] font-semibold leading-none text-lime"
          >
            Manage&nbsp;&nbsp;→
          </Link>

          <div className="mt-[26px] space-y-[14px]">
            {CLASSES.map((c) => (
              <div key={c.time}>
                <div className="flex items-start">
                  <p className="w-9 shrink-0 font-display text-[16px] leading-[16px] text-lime">{c.time}</p>
                  <div className="-mt-[2px] ml-[26px]">
                    <p className="text-[10px] leading-[12px] text-text">{c.name}</p>
                    <p className="mt-[6px] text-[8px] leading-[10px] text-faint">{c.coach}</p>
                  </div>
                  <p className="ml-auto text-[8px] leading-[10px] text-muted">{c.taken} / 20</p>
                </div>
                <div className="mt-[22px] h-[2px] w-full bg-dim/[0.06]">
                  <div className="h-[2px] bg-lime" style={{ width: `${(c.taken / 20) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <p className="absolute bottom-[44px] left-6 text-[8px] leading-[10px] text-faint">
            {spotsLeft} spots left across today's classes
          </p>
          <Link
            to="/admin/packages"
            className="absolute bottom-[34px] right-6 flex h-7 w-28 items-center justify-center rounded-full bg-lime font-condensed text-[11px] font-bold uppercase leading-none tracking-[1px] text-ink"
          >
            Schedule
          </Link>
        </Panel>
      </div>
    </div>
  );
}
