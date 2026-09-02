import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Film, Upload, AlertTriangle, LogOut, Shield,Settings,MessageSquare,BarChart2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import logo from '../../assets/img/logo.webp';


const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/movies', icon: Film, label: 'My Movies' },
  { to: '/dashboard/upload', icon: Upload, label: 'Upload Movie' },
  { to: '/dashboard/infringements', icon: AlertTriangle, label: 'Infringements' },
  { to: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/dashboard/appeals', icon: MessageSquare, label: 'Appeals' },
  { to: '/dashboard/profile', icon: Settings, label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50"
      style={{ backgroundColor: '#111A18', borderRight: '1px solid #2A3832' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 p-6" style={{ borderBottom: '1px solid #2A3832' }}>
        <img src={logo} alt="FairPlay Africa" className="w-10 h-10 object-contain" />
        <div>
          <p className="font-bold text-sm" style={{ color: '#F0F7F4' }}>FairPlay</p>
          <p className="text-xs" style={{ color: '#1B9E85' }}>Africa</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={({ isActive }) => ({
              backgroundColor: isActive ? '#1A2622' : 'transparent',
              color: isActive ? '#1B9E85' : '#6B8F82',
              borderLeft: isActive ? '3px solid #1B9E85' : '3px solid transparent',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        {user?.isAdmin && (
          <NavLink
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mt-4"
            style={({ isActive }) => ({
              backgroundColor: isActive ? '#EF444420' : 'transparent',
              color: '#EF4444',
              borderLeft: isActive ? '3px solid #EF4444' : '3px solid transparent',
            })}>
            <Shield size={18} />
            Admin Panel
          </NavLink>
        )}
      </nav>


      {/* User + Logout */}
      <div className="p-4" style={{ borderTop: '1px solid #2A3832' }}>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-2"
          style={{ backgroundColor: '#1A2622' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#F0F7F4' }}>{user?.name}</p>
            <p className="text-xs truncate" style={{ color: '#6B8F82' }}>{user?.plan} plan</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm w-full transition-all"
          style={{ color: '#6B8F82' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = '#1A2622'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#6B8F82'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}