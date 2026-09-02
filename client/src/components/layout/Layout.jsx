import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useEffect } from 'react';
import { getMe } from '../../api/auth';
import useAuthStore from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import AccountBlocked from '../../pages/auth/AccountBlocked';
import EmailVerificationGate from '../../pages/auth/EmailVerificationGate';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/movies': 'My Movies',
  '/dashboard/upload': 'Upload Movie',
  '/dashboard/infringements': 'Infringements',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/appeals': 'Appeals',
  '/dashboard/profile': 'Profile Settings',
};

export default function Layout() {
  const location = useLocation();
  const { setUser, user } = useAuthStore();
  const title = pageTitles[location.pathname] || 'Dashboard';

  useSocket();

  useEffect(() => {
    getMe().then(({ data }) => setUser(data.user)).catch(() => {});
  }, []);

  // suspended or banned — show block screen
  if (user?.accountStatus === 'suspended') {
    return <AccountBlocked type="suspended" reason={user.suspensionReason} />;
  }
  if (user?.accountStatus === 'banned') {
    return <AccountBlocked type="banned" reason={user.suspensionReason} />;
  }

  // email not verified — show verification gate
  if (user && !user.isVerified) {
    return <EmailVerificationGate />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0F0E' }}>
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Navbar title={title} />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}