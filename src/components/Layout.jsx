import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import Chatbot from './Chatbot';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui';
import {
  IconAnalytics,
  IconAttendance,
  IconBell,
  IconDashboard,
  IconLogout,
  IconMembers,
  IconMemberships,
  IconPackages,
  IconQr,
  IconSearch,
  IconSettings,
  IconTransactions,
} from './icons';

const ADMIN_NAV = [
  { key: 'dashboard', label: 'Dashboard', to: '/admin', icon: IconDashboard, section: 'Overview' },
  { key: 'members', label: 'Members', to: '/admin/members', icon: IconMembers, count: true },
  { key: 'memberships', label: 'Memberships', to: '/admin/memberships', icon: IconMemberships },
  { key: 'packages', label: 'Packages', to: '/admin/packages', icon: IconPackages },
  { key: 'checkin', label: 'QR Check-in', to: '/admin/checkin', icon: IconQr, section: 'Operations', live: true },
  { key: 'attendance', label: 'Attendance', to: '/admin/attendance', icon: IconAttendance },
  { key: 'transactions', label: 'Transactions', to: '/admin/transactions', icon: IconTransactions },
  { key: 'analytics', label: 'Analytics', to: '/admin/analytics', icon: IconAnalytics, section: 'Insights' },
  { key: 'access', label: 'Settings', to: '/admin/access', icon: IconSettings },
];

const ADMIN_TITLES = {
  '/admin': 'Dashboard',
  '/admin/members': 'Members',
  '/admin/memberships': 'Memberships',
  '/admin/packages': 'Packages',
  '/admin/checkin': 'QR Check-in',
  '/admin/attendance': 'Attendance',
  '/admin/transactions': 'Transactions',
  '/admin/analytics': 'Analytics',
  '/admin/access': 'Settings',
};

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

function useClockLine() {
  const [line, setLine] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const day = now.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      setLine(`${day}  ·  ${time} WIB`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return line;
}

function Initials({ name = '', className = '' }) {
  const letters = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-chip font-semibold text-text ${className}`}
    >
      {letters}
    </span>
  );
}

function SidebarLink({ item, count }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/admin'}
      className={({ isActive }) =>
        `relative flex h-10 items-center gap-[11px] rounded-lg pl-[13px] pr-3 text-[11.5px] font-medium transition ${
          isActive ? 'bg-lime/[0.078] text-lime' : 'text-muted hover:text-text'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 bg-lime" />}
          <Icon className={isActive ? 'text-lime' : 'text-muted'} />
          <span className="truncate">{item.label}</span>
          {item.count && <span className="ml-auto text-[8px] font-medium text-faint">{count}</span>}
          {item.live && (
            <span className="ml-auto text-[7px] font-semibold uppercase tracking-[1px] text-lime">Live</span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function AdminLayout() {
  const { data, session, can, logout } = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const clock = useClockLine();

  const items = ADMIN_NAV.filter((item) => can(item.key));
  const groups = [];
  for (const item of items) {
    if (item.section || groups.length === 0) {
      groups.push({ name: item.section || 'Overview', items: [] });
    }
    groups[groups.length - 1].items.push(item);
  }

  const title = ADMIN_TITLES[pathname];
  const memberCount = data.members.length.toLocaleString('en-US');
  const roleLabel = session.role === 'owner' ? 'Owner' : 'Administrator';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen bg-base">
      <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-hairline bg-panel">
        <div className="px-6 pt-6">
          <div className="relative inline-block">
            <span className="block font-display text-[24px] leading-[24px] tracking-[0.5px] text-text">GOPA</span>
            <span className="absolute left-[70px] top-[2px] h-1.5 w-1.5 bg-lime" />
          </div>
          <p className="mt-2 text-[7px] font-semibold uppercase leading-none tracking-[1.6px] text-faint">
            Gym Management
          </p>
        </div>

        <nav className="mt-[42px] flex-1 overflow-y-auto px-4">
          {groups.map((group, index) => (
            <div key={group.name} className={index === 0 ? '' : 'mt-4'}>
              <p className="px-2 text-[8px] font-semibold uppercase leading-none tracking-[1.4px] text-faint">
                {group.name}
              </p>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => (
                  <SidebarLink key={item.key} item={item} count={memberCount} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 pb-6">
          <div className="h-px w-full bg-hairline" />
          <div className="mt-[22px] flex items-center gap-3 px-1">
            <Initials name={session.name} className="h-8 w-8 text-[11px]" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium leading-[13px] text-text">{session.name}</p>
              <p className="mt-[3px] truncate text-[8.5px] leading-[10px] text-faint">{roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              aria-label="Logout"
              title="Logout"
              className="ml-auto text-faint transition hover:text-text"
            >
              <IconLogout />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center gap-4 border-b border-hairline px-4 sm:px-8">
          <div className="min-w-0">
            <h1 className="truncate font-condensed text-[24px] font-bold leading-[29px] text-text">{title}</h1>
            <p className="text-[9.5px] leading-[11px] text-faint">{clock}</p>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate('/admin/members');
              }}
              className="hidden h-[34px] w-[220px] items-center gap-2 rounded-full border border-line bg-secondary pl-[15px] lg:flex"
            >
              <IconSearch className="text-faint" />
              <input
                className="h-full w-full bg-transparent pr-3 text-[9px] text-text placeholder:text-faint focus:outline-none"
                placeholder="Search members, transactions…"
                aria-label="Search"
              />
            </form>
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-secondary text-muted transition hover:text-text"
            >
              <IconBell />
            </button>
            <ThemeToggle className="!h-9 !w-9 !border-line" />
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="User menu"
                aria-expanded={menuOpen}
                className="block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-lime"
              >
                <Initials name={session.name} className="h-8 w-8 text-[10px]" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-lime ring-2 ring-base" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-[44px] z-50 w-[224px] rounded-xl border border-line bg-secondary p-3 shadow-xl shadow-black/40">
                  <div className="flex items-center gap-3">
                    <Initials name={session.name} className="h-9 w-9 text-[11px]" />
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-medium leading-[14px] text-text">{session.name}</p>
                      <p className="mt-[2px] truncate text-[9px] leading-[11px] text-faint">{roleLabel}</p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-hairline pt-3">
                    <p className="truncate text-[9px] leading-[11px] text-faint">{session.email}</p>
                    <p className="mt-1 text-[9px] leading-[11px] text-faint">
                      Role: <span className="text-muted">{roleLabel}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="mt-3 flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-[10px] font-medium text-text transition hover:border-lime/40 hover:text-lime"
                  >
                    <IconLogout />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
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
          <ThemeToggle />
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
