import { useEffect, useState } from 'react';
import { getActivityLogs } from '../../api/admin';
import { Film, User, Shield, AlertTriangle, LogIn, Upload, Search } from 'lucide-react';

const typeConfig = {
  user_registered: { label: 'User Registered', color: '#1B9E85', icon: User },
  user_login: { label: 'Login', color: '#6B8F82', icon: LogIn },
  movie_uploaded: { label: 'Movie Uploaded', color: '#1B9E85', icon: Upload },
  movie_deleted: { label: 'Movie Deleted', color: '#EF4444', icon: Film },
  scan_completed: { label: 'Scan Completed', color: '#6B8F82', icon: Search },
  infringement_detected: { label: 'Infringement Detected', color: '#EF4444', icon: AlertTriangle },
  takedown_sent: { label: 'Takedown Sent', color: '#F59E0B', icon: Shield },
  account_suspended: { label: 'Account Suspended', color: '#F59E0B', icon: Shield },
  account_banned: { label: 'Account Banned', color: '#EF4444', icon: Shield },
  account_reinstated: { label: 'Account Reinstated', color: '#22C55E', icon: Shield },
  fraud_detected: { label: 'Fraud Detected', color: '#EF4444', icon: AlertTriangle },
  ownership_verified: { label: 'Ownership Verified', color: '#22C55E', icon: Shield },
  appeal_submitted: { label: 'Appeal Submitted', color: '#F59E0B', icon: User },
  appeal_approved: { label: 'Appeal Approved', color: '#22C55E', icon: Shield },
  appeal_rejected: { label: 'Appeal Rejected', color: '#EF4444', icon: Shield },
};

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchLogs(); }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { type: filter } : {};
      const { data } = await getActivityLogs(params);
      setLogs(data.logs);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'user_registered', label: 'Registrations' },
    { key: 'movie_uploaded', label: 'Uploads' },
    { key: 'infringement_detected', label: 'Infringements' },
    { key: 'fraud_detected', label: 'Fraud' },
    { key: 'takedown_sent', label: 'Takedowns' },
    { key: 'account_suspended', label: 'Suspensions' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#F0F7F4' }}>Activity Log</h1>
        <p className="mt-1" style={{ color: '#6B8F82' }}>Full audit trail of platform activity</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {categories.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              backgroundColor: filter === key ? '#1B9E85' : '#111A18',
              color: filter === key ? '#fff' : '#6B8F82',
              border: `1px solid ${filter === key ? '#1B9E85' : '#2A3832'}`,
            }}>
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: '#1B9E85', borderTopColor: 'transparent' }} />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#6B8F82' }}>No logs yet</div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#2A3832' }}>
            {logs.map((log) => {
              const config = typeConfig[log.type] || { label: log.type, color: '#6B8F82', icon: Shield };
              const Icon = config.icon;
              return (
                <div key={log._id} className="flex items-start gap-4 px-6 py-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${config.color}20` }}>
                    <Icon size={14} style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: '#F0F7F4' }}>{log.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {log.user && (
                        <span className="text-xs" style={{ color: '#6B8F82' }}>
                          {log.user.name} · {log.user.email}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: '#6B8F82' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full shrink-0"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}