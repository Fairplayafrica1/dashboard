import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Film, LogOut, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import logo from '../../assets/img/logo.png';
import {
 AlertTriangle,
  ScrollText, Megaphone, Search, MessageSquare
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/movies', icon: Film, label: 'Movies' },
  { to: '/admin/infringements', icon: AlertTriangle, label: 'Infringements' },
  { to: '/admin/appeals', icon: MessageSquare, label: 'Appeals' },
  { to: '/admin/logs', icon: ScrollText, label: 'Activity Log' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/admin/scans', icon: Search, label: 'Scans & Exports' },
];



export default function AdminLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0F0E' }}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50"
        style={{ backgroundColor: '#111A18', borderRight: '1px solid #2A3832' }}>
        <div className="flex items-center gap-3 p-6" style={{ borderBottom: '1px solid #2A3832' }}>
          <img src={logo} alt="FairPlay Africa" className="w-10 h-10 object-contain" />
          <div>
            <p className="font-bold text-sm" style={{ color: '#F0F7F4' }}>Admin Panel</p>
            <p className="text-xs" style={{ color: '#EF4444' }}>FairPlay Africa</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={({ isActive }) => ({
                backgroundColor: isActive ? '#1A2622' : 'transparent',
                color: isActive ? '#1B9E85' : '#6B8F82',
                borderLeft: isActive ? '3px solid #1B9E85' : '3px solid transparent',
              })}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid #2A3832' }}>
          <NavLink to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm mb-1 transition-all"
            style={{ color: '#6B8F82' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1B9E85'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B8F82'}>
            <Shield size={18} />
            User Dashboard
          </NavLink>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm w-full transition-all"
            style={{ color: '#6B8F82' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = '#1A2622'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B8F82'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="ml-64 flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
}