import { Navigate, Route, Routes } from 'react-router-dom';
import { homeFor, useStore } from './lib/store';
import { AdminLayout, MemberLayout } from './components/Layout';
import { Card } from './components/ui';
import Login from './pages/Login';
import Landing from './pages/Landing';
import AdminDashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import Packages from './pages/admin/Packages';
import Memberships from './pages/admin/Memberships';
import CheckIn from './pages/admin/CheckIn';
import Attendance from './pages/admin/Attendance';
import Transactions from './pages/admin/Transactions';
import Analytics from './pages/admin/Analytics';
import Access from './pages/admin/Access';
import MemberHome from './pages/member/Home';
import MemberBarcode from './pages/member/BarcodePage';

// Hanya peran yang diizinkan yang boleh masuk.
function Guard({ roles, children }) {
  const { session } = useStore();
  if (!session) return <Navigate to="/login" replace />;
  if (!roles.includes(session.role)) return <Navigate to={homeFor(session.role)} replace />;
  return children;
}

// Hak akses per halaman (Admin bisa diatur Owner, Owner selalu penuh).
function Gate({ page, children }) {
  const { can } = useStore();
  if (!can(page)) {
    return (
      <Card>
        <h2 className="font-display text-4xl uppercase">Akses ditolak</h2>
        <p className="mt-2 text-sm text-muted">Peran Anda tidak memiliki izin untuk halaman ini.</p>
      </Card>
    );
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <Guard roles={['admin', 'owner']}>
            <AdminLayout />
          </Guard>
        }
      >
        <Route index element={<Gate page="dashboard"><AdminDashboard /></Gate>} />
        <Route path="members" element={<Gate page="members"><Members /></Gate>} />
        <Route path="packages" element={<Gate page="packages"><Packages /></Gate>} />
        <Route path="memberships" element={<Gate page="memberships"><Memberships /></Gate>} />
        <Route path="checkin" element={<Gate page="checkin"><CheckIn /></Gate>} />
        <Route path="attendance" element={<Gate page="attendance"><Attendance /></Gate>} />
        <Route path="transactions" element={<Gate page="transactions"><Transactions /></Gate>} />
        <Route path="analytics" element={<Gate page="analytics"><Analytics /></Gate>} />
        <Route path="access" element={<Gate page="access"><Access /></Gate>} />
      </Route>

      <Route
        path="/member"
        element={
          <Guard roles={['member']}>
            <MemberLayout />
          </Guard>
        }
      >
        <Route index element={<MemberHome />} />
        <Route path="barcode" element={<MemberBarcode />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
