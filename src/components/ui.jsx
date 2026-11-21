export const inputCls =
  'w-full h-11 rounded-xl bg-secondary border border-border px-4 text-sm text-text placeholder:text-muted focus:outline-none focus:border-lime';

export const TH = 'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted';
export const TD = 'px-4 py-3 text-sm text-text';

export function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full text-sm font-semibold uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-lime text-ink hover:bg-limeBright',
    secondary: 'bg-secondary text-text border border-border hover:border-lime/40',
    danger: 'bg-danger text-text hover:brightness-110',
    ghost: 'text-muted hover:text-lime px-0 h-auto',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Card({ className = '', children }) {
  return <div className={`rounded-2xl bg-card border border-border p-6 ${className}`}>{children}</div>;
}

export function Field({ label, error, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="micro block">{label}</span>
      {children}
      {error && <span className="block text-xs text-danger">{error}</span>}
    </label>
  );
}

export function Badge({ status }) {
  const map = {
    active: ['Aktif', 'bg-lime/10 text-lime'],
    expired: ['Kedaluwarsa', 'bg-white/5 text-muted'],
    none: ['Belum ada', 'bg-white/5 text-muted'],
    pending: ['Pending', 'bg-pending/10 text-pending'],
  };
  const [label, cls] = map[status] || map.none;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-5xl uppercase leading-none text-text">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint }) {
  return (
    <Card>
      <p className="micro">{label}</p>
      <p className="mt-3 break-words font-display text-4xl leading-none text-text">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

export function Avatar({ name, photo, size = 'h-9 w-9' }) {
  if (photo) return <img src={photo} alt={name} className={`${size} rounded-full object-cover`} />;
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <span className={`${size} inline-flex shrink-0 items-center justify-center rounded-full bg-lime text-xs font-bold text-ink`}>
      {initials}
    </span>
  );
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-3xl uppercase text-text">{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none text-muted hover:text-lime" aria-label="Tutup">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Notice({ ok, children }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${
        ok ? 'border-lime/40 bg-lime/10 text-lime' : 'border-danger/40 bg-danger/10 text-danger'
      }`}
    >
      {children}
    </div>
  );
}
