import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import Chatbot from './Chatbot';
import { Button } from './ui';

const ADMIN_NAV = [
  ['dashboard', 'Dashboard', '/admin'],
  ['members', 'Members', '/admin/members'],
  ['packages', 'Packages', '/admin/packages'],
  ['memberships', 'Memberships', '/admin/memberships'],
  ['checkin', 'QR Check-in', '/admin/checkin'],
  ['attendance', 'Attendance', '/admin/attendance'],
  ['transactions', 'Transactions', '/admin/transactions'],
  ['analytics', 'Analytics', '/admin/analytics'],
  ['access', 'Settings', '/admin/access'],
];

const linkCls = ({ isActive }) =>
  `flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-lime/10 text-lime' : 'text-muted hover:text-text'
  }`;

export function Brand() {
  return (
    <div>
      <p className="font-display text-3xl leading-none text-text">
        GOPA<span className="text-lime">.</span>
      </p>
      <p className="micro mt-1 text-[9px]">Gym Management</p>
    </div>
  );
}

export function AdminLayout() {
  const { session, can, logout } = useStore();
  const navigate = useNavigate();
  const items = ADMIN_NAV.filter(([key]) => can(key));

  return (
    <div className="flex min-h-screen bg-base">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-secondary/40 p-5">
        <Brand />
        <nav className="mt-10 space-y-1">
          {items.map(([key, label, to]) => (
            <NavLink key={key} to={to} end={to === '/admin'} className={linkCls}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <p className="text-sm text-text">{session.name}</p>
          <p className="text-xs capitalize text-muted">{session.role}</p>
          <Button
            variant="ghost"
            className="mt-3"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </Button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export function MemberLayout() {
  const { session, logout } = useStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
        <Brand />
        <nav className="flex gap-2">
          <NavLink to="/member" end className={linkCls}>
            Dashboard
          </NavLink>
          <NavLink to="/member/barcode" className={linkCls}>
            Barcode
          </NavLink>
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted sm:block">{session.name}</span>
          <Button
            variant="secondary"
            className="h-9 px-4"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-6 md:p-10">
        <Outlet />
      </main>
      <Chatbot />
    </div>
  );
}
