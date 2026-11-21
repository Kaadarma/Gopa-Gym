export const toISODate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const today = () => toISODate();

export const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

export const daysBetween = (from, to) =>
  Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000);

export const fmtDate = (iso) =>
  iso
    ? new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';

export const fmtRp = (n) => `Rp ${Math.round(Number(n) || 0).toLocaleString('id-ID')}`;

export const nowTime = () => new Date().toTimeString().slice(0, 8);

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export const nextId = (list) => Math.max(0, ...list.map((x) => x.id)) + 1;

export const nextCode = (members) => {
  const max = members.reduce((m, x) => Math.max(m, parseInt(x.code.replace(/\D/g, ''), 10) || 0), 0);
  return `GPA-${String(max + 1).padStart(4, '0')}`;
};

// Membership terbaru (berdasarkan tanggal berakhir) milik satu member.
export function currentMembership(memberships, memberId) {
  return (
    memberships
      .filter((m) => m.memberId === memberId)
      .sort((a, b) => b.end.localeCompare(a.end))[0] || null
  );
}

// 'active' | 'expired' | 'none'
export function statusOf(memberships, memberId) {
  const cur = currentMembership(memberships, memberId);
  if (!cur) return 'none';
  return cur.end >= today() ? 'active' : 'expired';
}
