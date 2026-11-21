import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addDays, currentMembership, nextCode, nextId, nowTime, statusOf, today } from './utils';

const DATA_KEY = 'gopa-gym-data-v1';
const SESSION_KEY = 'gopa-gym-session-v1';

export const PAGE_KEYS = [
  'dashboard',
  'members',
  'packages',
  'memberships',
  'checkin',
  'attendance',
  'transactions',
  'analytics',
  'access',
];
const ADMIN_DEFAULT = ['dashboard', 'members', 'packages', 'memberships', 'checkin', 'attendance', 'transactions'];

export const homeFor = (role) => (role === 'member' ? '/member' : '/admin');

// Data awal demo. Akun demo: admin@gopagym.id / admin123, owner@gopagym.id / owner123,
// arif@mail.com / member123 (member).
function seed() {
  const t = today();
  const packages = [
    { id: 1, name: 'Basic', price: 150000, durationDays: 30 },
    { id: 2, name: 'Standard', price: 300000, durationDays: 90 },
    { id: 3, name: 'Premium', price: 550000, durationDays: 180 },
  ];
  // [kode, nama, telepon, offset mulai (hari), id paket]
  const rows = [
    ['GPA-0001', 'Arif Rahman', '0812-1000-0001', -10, 1],
    ['GPA-0002', 'Sinta Dewi', '0812-1000-0002', -30, 2],
    ['GPA-0003', 'Bagas Wirawan', '0812-1000-0003', -100, 3],
    ['GPA-0004', 'Citra Dewi', '0812-1000-0004', -45, 1],
    ['GPA-0005', 'Dimas Saputra', '0812-1000-0005', -5, 2],
  ];
  const members = rows.map(([code, name, phone, offset], i) => ({
    id: i + 1,
    code,
    name,
    phone,
    email: '',
    photo: null,
    joinDate: addDays(t, offset),
  }));
  const memberships = rows.map(([, , , offset, pkgId], i) => {
    const pkg = packages.find((p) => p.id === pkgId);
    const start = addDays(t, offset);
    return {
      id: i + 1,
      memberId: i + 1,
      packageId: pkgId,
      start,
      end: addDays(start, pkg.durationDays),
      type: 'Aktivasi',
      createdAt: start,
    };
  });
  const transactions = rows.map(([, , , offset, pkgId], i) => {
    const pkg = packages.find((p) => p.id === pkgId);
    return {
      id: i + 1,
      memberId: i + 1,
      amount: pkg.price,
      method: 'Tunai',
      date: addDays(t, offset),
      note: `Aktivasi ${pkg.name}`,
    };
  });
  const attendance = [
    { id: 1, memberId: 1, date: addDays(t, -1), time: '08:12:00' },
    { id: 2, memberId: 2, date: addDays(t, -1), time: '07:50:00' },
    { id: 3, memberId: 5, date: addDays(t, -2), time: '18:03:00' },
  ];
  const users = [
    { email: 'admin@gopagym.id', password: 'admin123', role: 'admin', name: 'Raka Pratama' },
    { email: 'owner@gopagym.id', password: 'owner123', role: 'owner', name: 'Owner Gopa' },
    { email: 'arif@mail.com', password: 'member123', role: 'member', name: 'Arif Rahman', memberId: 1 },
  ];
  return {
    packages,
    members,
    memberships,
    transactions,
    attendance,
    users,
    permissions: { admin: ADMIN_DEFAULT },
  };
}

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => load(DATA_KEY) || seed());
  const [session, setSession] = useState(() => load(SESSION_KEY));

  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [session]);

  const api = useMemo(() => {
    const patch = (key, fn) => setData((d) => ({ ...d, [key]: fn(d[key]) }));

    return {
      data,
      session,

      login(email, password) {
        const u = data.users.find(
          (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password,
        );
        if (!u) return { ok: false, msg: 'Email atau password salah.' };
        setSession({ email: u.email, role: u.role, name: u.name, memberId: u.memberId ?? null });
        return { ok: true };
      },

      logout() {
        setSession(null);
      },

      can(page) {
        if (!session) return false;
        if (session.role === 'owner') return true;
        if (session.role === 'admin') return data.permissions.admin.includes(page);
        return false;
      },

      setAdminPermissions(pages) {
        patch('permissions', (p) => ({ ...p, admin: pages }));
      },

      saveMember(form) {
        if (form.id) {
          patch('members', (list) => list.map((m) => (m.id === form.id ? { ...m, ...form } : m)));
          return form.id;
        }
        const id = nextId(data.members);
        patch('members', (list) => [
          ...list,
          { ...form, id, code: nextCode(list), joinDate: today() },
        ]);
        return id;
      },

      deleteMember(id) {
        setData((d) => ({
          ...d,
          members: d.members.filter((m) => m.id !== id),
          memberships: d.memberships.filter((x) => x.memberId !== id),
          transactions: d.transactions.filter((x) => x.memberId !== id),
          attendance: d.attendance.filter((x) => x.memberId !== id),
          users: d.users.filter((u) => u.memberId !== id),
        }));
      },

      savePackage(form) {
        if (form.id) {
          patch('packages', (list) => list.map((p) => (p.id === form.id ? { ...p, ...form } : p)));
          return form.id;
        }
        const id = nextId(data.packages);
        patch('packages', (list) => [...list, { ...form, id: nextId(list) }]);
        return id;
      },

      deletePackage(id) {
        patch('packages', (list) => list.filter((p) => p.id !== id));
      },

      // Aktivasi baru, atau perpanjangan jika membership sebelumnya masih berlaku.
      activateMembership({ memberId, packageId, start, payment }) {
        const pkg = data.packages.find((p) => p.id === Number(packageId));
        if (!pkg) return { ok: false, msg: 'Paket tidak ditemukan.' };
        const cur = currentMembership(data.memberships, memberId);
        const isRenewal = !!cur && cur.end > start;
        const from = isRenewal ? cur.end : start;
        const type = isRenewal ? 'Perpanjangan' : 'Aktivasi';
        const id = nextId(data.memberships);
        setData((d) => ({
          ...d,
          memberships: [
            ...d.memberships,
            {
              id,
              memberId,
              packageId: pkg.id,
              start: from,
              end: addDays(from, pkg.durationDays),
              type,
              createdAt: today(),
            },
          ],
          transactions:
            payment && payment.amount > 0
              ? [
                  ...d.transactions,
                  {
                    id: nextId(d.transactions),
                    memberId,
                    amount: payment.amount,
                    method: payment.method,
                    date: start,
                    note: `${type} ${pkg.name}`,
                  },
                ]
              : d.transactions,
        }));
        return { ok: true, id, type };
      },

      addTransaction(tx) {
        patch('transactions', (list) => [...list, { ...tx, id: nextId(list) }]);
      },

      // Validasi check-in: kode dikenal, membership aktif, dan belum check-in hari ini.
      checkIn(raw) {
        const code = raw.trim().toUpperCase();
        const m = data.members.find((x) => x.code === code);
        if (!m) return { ok: false, msg: `QR Code "${code}" tidak dikenal.` };
        const st = statusOf(data.memberships, m.id);
        if (st !== 'active') {
          return {
            ok: false,
            msg: `${m.name}: membership ${st === 'none' ? 'belum tersedia' : 'sudah kedaluwarsa'}. Check-in ditolak.`,
          };
        }
        if (data.attendance.some((a) => a.memberId === m.id && a.date === today())) {
          return { ok: false, msg: `${m.name} sudah check-in hari ini.` };
        }
        patch('attendance', (list) => [
          ...list,
          { id: nextId(list), memberId: m.id, date: today(), time: nowTime() },
        ]);
        return { ok: true, msg: `Check-in ${m.name} berhasil.` };
      },
    };
  }, [data, session]);

  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);
