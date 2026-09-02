import { useEffect, useState } from 'react';
import { Users, Film, AlertTriangle, Clock, Shield } from 'lucide-react';
import { getAdminStats } from '../../api/admin';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="p-6 rounded-2xl" style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm mb-1" style={{ color: '#6B8F82' }}>{label}</p>
        <p className="text-3xl font-bold" style={{ color: '#F0F7F4' }}>{value}</p>
      </div>
      <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}18` }}>
        <Icon size={22} style={{ color }} />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: '#1B9E85', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#F0F7F4' }}>Admin Overview</h1>
        <p className="mt-1" style={{ color: '#6B8F82' }}>Platform health at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="#1B9E85" />
        <StatCard icon={Film} label="Movies Registered" value={stats?.totalMovies} color="#1B9E85" />
        <StatCard icon={AlertTriangle} label="Total Infringements" value={stats?.totalInfringements} color="#EF4444" />
        <StatCard icon={Clock} label="Pending Verifications" value={stats?.pendingVerifications} color="#F59E0B" />
        <StatCard icon={Shield} label="Suspended Accounts" value={stats?.suspendedUsers} color="#EF4444" />
      </div>
    </div>
  );
}