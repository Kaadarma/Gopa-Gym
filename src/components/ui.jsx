import { useEffect, useRef, useState } from 'react';

export const inputCls =
  'w-full h-11 rounded-xl bg-secondary border border-border px-4 text-sm text-text placeholder:text-muted focus:outline-none focus:border-lime';

/* Dropdown custom: options = [{ value, label }], onChange(value). Mengikuti palet tema.
   searchable: tampilkan kolom ketik di atas daftar untuk memfilter opsi. */
export function Select({ value, onChange, options, className = 'w-full', searchable = false }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);
  const selectedIdx = options.findIndex((o) => String(o.value) === String(value));
  const selected = options[selectedIdx];
  const isPlaceholder = !selected || selected.value === '';

  const q = query.trim().toLowerCase();
  const visible =
    searchable && q
      ? options.filter((o) => o.value !== '' && String(o.label).toLowerCase().includes(q))
      : options;

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    if (open && searchable) inputRef.current?.focus();
  }, [open, searchable]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const pick = (v) => {
    onChange(v);
    close();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setActive(selectedIdx >= 0 ? selectedIdx : 0);
        setOpen(true);
        return;
      }
      const d = e.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => (i + d + visible.length) % visible.length);
    }
    if ((e.key === 'Enter' || e.key === ' ') && open && !searchable) {
      e.preventDefault();
      if (visible[active]) pick(visible[active].value);
    }
  };

  const onSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!visible.length) return;
      const d = e.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => (i + d + visible.length) % visible.length);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (visible[active]) pick(visible[active].value);
    }
  };

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      // Mencegah label pembungkus (Field) meneruskan klik ke tombol dan membuka ulang dropdown.
      onClick={(e) => e.preventDefault()}
    >
      <button
        type="button"
        onClick={() => {
          if (open) return close();
          setQuery('');
          setActive(selectedIdx >= 0 ? selectedIdx : 0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-xl border bg-secondary px-4 text-left text-sm transition focus:outline-none ${
          open ? 'border-lime ring-2 ring-lime/20' : 'border-border hover:border-lime/40'
        } ${isPlaceholder ? 'text-muted' : 'text-text'}`}
      >
        <span className="truncate">{selected ? selected.label : ''}</span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`h-4 w-4 shrink-0 text-lime transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 min-w-full w-max max-w-xs rounded-xl border border-border bg-card p-1.5 shadow-2xl shadow-black/40">
          {searchable && (
            <input
              ref={inputRef}
              type="text"
              value={query}
              placeholder="Ketik nama atau kode..."
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onSearchKeyDown}
              className="mb-1.5 h-9 w-full rounded-lg border border-border bg-secondary px-3 text-sm text-text placeholder:text-muted focus:border-lime focus:outline-none"
            />
          )}
          <ul role="listbox" className="max-h-64 overflow-y-auto">
            {visible.length === 0 && <li className="px-3 py-2.5 text-sm text-muted">Tidak ada yang cocok.</li>}
            {visible.map((o, i) => {
              const isSel = String(o.value) === String(value);
              const isActive = i === active;
              return (
                <li
                  key={String(o.value)}
                  role="option"
                  aria-selected={isSel}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(o.value)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    isSel ? 'bg-lime/10 font-semibold text-lime' : isActive ? 'bg-dim/5 text-text' : 'text-text'
                  } ${o.value === '' ? 'text-muted' : ''}`}
                >
                  <span className="truncate">{o.label}</span>
                  {isSel && (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0">
                      <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export const TH = 'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-muted';
export const TD = 'px-4 py-3 text-sm text-text';

export function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full font-condensed text-[15px] font-bold uppercase tracking-[0.09em] transition disabled:opacity-40 disabled:cursor-not-allowed';
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
    expired: ['Kedaluwarsa', 'bg-dim/5 text-muted'],
    none: ['Belum ada', 'bg-dim/5 text-muted'],
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
