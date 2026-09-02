import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Movies from './pages/dashboard/Movies';
import UploadMovie from './pages/dashboard/UploadMovie';
import Infringements from './pages/dashboard/Infringements';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
// import AdminMovies from './pages/admin/AdminMovies';
import AdminInfringements from './pages/admin/AdminInfringements';
import AdminLogs from './pages/admin/AdminLogs';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAppeals from './pages/admin/AdminAppeals';
import AdminScans from './pages/admin/AdminScans';
import AdminMovies from './pages/admin/AdminMovies';
import Appeals from './pages/dashboard/Appeals';
import Profile from './pages/dashboard/Profile';
import VerifyEmail from './pages/auth/VerifyEmail';
import Analytics from './pages/dashboard/Analytics';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A2622',
            color: '#F0F7F4',
            border: '1px solid #2A3832',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="movies" element={<Movies />} />
          <Route path="upload" element={<UploadMovie />} />
          <Route path="infringements" element={<Infringements />} />
          <Route path="appeals" element={<Appeals />} />
          <Route path="profile" element={<Profile />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="infringements" element={<AdminInfringements />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="appeals" element={<AdminAppeals />} />
          <Route path="scans" element={<AdminScans />} />
        </Route>
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </BrowserRouter>
  );
}