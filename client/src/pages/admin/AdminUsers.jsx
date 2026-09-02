import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { getAdminUsers } from '../../api/admin';

const statusConfig = {
  active: { label: 'Active', color: '#22C55E', bg: '#22C55E20' },
  suspended: { label: 'Suspended', color: '#F59E0B', bg: '#F59E0B20' },
  banned: { label: 'Banned', color: '#EF4444', bg: '#EF444420' },
  pending_verification: { label: 'Pending', color: '#6B8F82', bg: '#6B8F8220' },
};

const verificationConfig = {
  unverified: { label: 'Unverified', color: '#6B8F82', icon: XCircle },
  pending: { label: 'Pending Review', color: '#F59E0B', icon: Clock },
  verified: { label: 'Verified', color: '#22C55E', icon: CheckCircle },
  rejected: { label: 'Rejected', color: '#EF4444', icon: XCircle },
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'pending') params.verification = 'pending';
      if (filter === 'suspended') params.status = 'suspended';
      if (filter === 'banned') params.status = 'banned';
      const { data } = await getAdminUsers(params);
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#F0F7F4' }}>Users</h1>
        <p className="mt-1" style={{ color: '#6B8F82' }}>Manage accounts and verifications</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { key: 'all', label: 'All Users' },
          { key: 'pending', label: 'Pending Review' },
          { key: 'suspended', label: 'Suspended' },
          { key: 'banned', label: 'Banned' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: filter === key ? '#1B9E85' : '#111A18',
              color: filter === key ? '#fff' : '#6B8F82',
              border: `1px solid ${filter === key ? '#1B9E85' : '#2A3832'}`,
            }}>
            {label}
          </button>
        ))}

        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B8F82' }} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-xl text-sm outline-none"
            style={{ backgroundColor: '#111A18', border: '1px solid #2A3832', color: '#F0F7F4', width: '200px' }}
          />
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <div className="grid grid-cols-5 px-6 py-3 text-xs font-medium uppercase"
          style={{ color: '#6B8F82', borderBottom: '1px solid #2A3832', backgroundColor: '#1A2622' }}>
          <span className="col-span-2">User</span>
          <span>Account</span>
          <span>Verification</span>
          <span>Fraud Flags</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: '#1B9E85', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#6B8F82' }}>No users found</div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2A3832' }}>
            {filtered.map((user) => {
              const status = statusConfig[user.accountStatus] || statusConfig.active;
              const verification = verificationConfig[user.verificationStatus] || verificationConfig.unverified;
              const VerIcon = verification.icon;
              return (
                <div key={user._id}
                  onClick={() => navigate(`/admin/users/${user._id}`)}
                  className="grid grid-cols-5 px-6 py-4 cursor-pointer transition-all items-center"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1A2622'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: '#F0F7F4' }}>{user.name}</p>
                      <p className="text-xs truncate" style={{ color: '#6B8F82' }}>{user.email}</p>
                    </div>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <VerIcon size={13} style={{ color: verification.color }} />
                    <span className="text-xs" style={{ color: verification.color }}>{verification.label}</span>
                  </div>
                  <div>
                    {user.fraudFlags > 0 ? (
                      <span className="flex items-center gap-1 text-xs" style={{ color: '#EF4444' }}>
                        <AlertTriangle size={13} />
                        {user.fraudFlags} flag{user.fraudFlags > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: '#6B8F82' }}>Clean</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}