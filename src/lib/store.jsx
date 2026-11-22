import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addDays, currentMembership, nextCode, nextId, nowTime, statusOf, today } from './utils';
import { demoAccounts } from './config';

const DATA_KEY = 'gopa-gym-frontend:data-v2';
const SESSION_KEY = 'gopa-gym-frontend:session-v2';

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

// Token QR sekali pakai: berganti setiap check-in berhasil.
export const newQrToken = () =>
  Array.from({ length: 8 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');

// Isi QR anggota: "KODE|TOKEN". Kode saja tetap bisa dipakai untuk input manual.
export const qrValueOf = (m) => (m?.qrToken ? `${m.code}|${m.qrToken}` : m?.code ?? '');

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
    qrToken: newQrToken(),
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
  const users = demoAccounts.map(({ email, password, role, name, memberId }) => ({
    email,
    password,
    role,
    name,
    memberId,
  }));
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
  // Akun owner sudah dihapus: buang juga dari data tersimpan dan sesi lama.
  const [data, setData] = useState(() => {
    const d = load(DATA_KEY) || seed();
    return {
      ...d,
      users: d.users.filter((u) => u.role !== 'owner'),
      members: d.members.map((m) => (m.qrToken ? m : { ...m, qrToken: newQrToken() })),
    };
  });
  const [session, setSession] = useState(() => {
    const s = load(SESSION_KEY);
    return s?.role === 'owner' ? null : s;
  });

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

      // Simpan anggota dan akun login-nya sekaligus. Email anggota adalah username login.
      // form.password: wajib untuk anggota baru; saat edit, kosong berarti tidak diubah.
      saveMember(form) {
        const { password, ...member } = form;
        const email = (member.email || '').trim().toLowerCase();
        const takenBy = data.users.find((u) => u.email.toLowerCase() === email && u.memberId !== member.id);
        if (email && takenBy) return { ok: false, msg: 'Email ini sudah dipakai akun lain.' };
        if (!member.id && !password) return { ok: false, msg: 'Password akun member wajib diisi.' };

        const existingUser = member.id ? data.users.find((u) => u.memberId === member.id) : null;
        const id = member.id || nextId(data.members);

        setData((d) => {
          const members = member.id
            ? d.members.map((m) => (m.id === member.id ? { ...m, ...member } : m))
            : [
                ...d.members,
                { ...member, id, code: nextCode(d.members), joinDate: today(), qrToken: newQrToken() },
              ];

          let users = d.users;
          if (existingUser) {
            users = users.map((u) =>
              u.memberId === id
                ? {
                    ...u,
                    email: email || u.email,
                    name: member.name,
                    ...(password ? { password } : {}),
                  }
                : u,
            );
          } else if (email && password) {
            users = [...users, { email, password, role: 'member', name: member.name, memberId: id }];
          }
          return { ...d, members, users };
        });
        return { ok: true, id };
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

      deleteAttendance(id) {
        patch('attendance', (list) => list.filter((a) => a.id !== id));
      },

      // Validasi check-in: kode dikenal, membership aktif, dan belum check-in hari ini.
      checkIn(raw) {
        const [code, token] = raw.trim().toUpperCase().split('|');
        const m = data.members.find((x) => x.code === code);
        if (!m) return { ok: false, msg: `QR Code "${code}" tidak dikenal.` };
        // QR yang berisi token harus cocok dengan token terbaru anggota (QR lama tidak berlaku).
        if (token !== undefined && token !== m.qrToken) {
          return { ok: false, msg: `QR ${m.name} sudah tidak berlaku. Minta anggota menampilkan QR terbaru.` };
        }
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
        // Check-in berhasil: catat kehadiran dan ganti token QR anggota.
        setData((d) => ({
          ...d,
          attendance: [
            ...d.attendance,
            { id: nextId(d.attendance), memberId: m.id, date: today(), time: nowTime() },
          ],
          members: d.members.map((x) => (x.id === m.id ? { ...x, qrToken: newQrToken() } : x)),
        }));
        return { ok: true, msg: `Check-in ${m.name} berhasil. QR anggota sudah diganti.` };
      },
    };
  }, [data, session]);

  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);
