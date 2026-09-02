import { useState, useEffect } from 'react';
import { Search, Play, Users, Film } from 'lucide-react';
import { triggerScanAll, triggerScanUser, getAdminUsers, exportUsers, exportInfringements } from '../../api/admin';
import toast from 'react-hot-toast';

export default function AdminScans() {
  const [users, setUsers] = useState([]);
  const [scanning, setScanning] = useState({});
  const [scanningAll, setScanningAll] = useState(false);

  useEffect(() => {
    getAdminUsers({}).then(({ data }) => setUsers(data.users));
  }, []);

  const handleScanAll = async () => {
    setScanningAll(true);
    try {
      await triggerScanAll();
      toast.success('Full platform scan started — running in background');
    } catch { toast.error('Scan failed'); }
    finally { setScanningAll(false); }
  };

  const handleScanUser = async (userId, name) => {
    setScanning((p) => ({ ...p, [userId]: true }));
    try {
      const { data } = await triggerScanUser(userId);
      toast.success(`${data.message} for ${name}`);
    } catch { toast.error('Scan failed'); }
    finally { setScanning((p) => ({ ...p, [userId]: false })); }
  };

  const handleExport = async (type) => {
    try {
      const { data } = type === 'users' ? await exportUsers() : await exportInfringements();
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `fairplayafrica_${type}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success(`${type} exported`);
    } catch { toast.error('Export failed'); }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#F0F7F4' }}>Scan Management & Exports</h1>
        <p className="mt-1" style={{ color: '#6B8F82' }}>
          Manually trigger scans and export platform data
        </p>
      </div>

      {/* Global scan */}
      <div className="p-6 rounded-2xl" style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#1B9E8520' }}>
              <Search size={20} style={{ color: '#1B9E85' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#F0F7F4' }}>Full Platform Scan</p>
              <p className="text-sm" style={{ color: '#6B8F82' }}>
                Scan all registered movies across all users
              </p>
            </div>
          </div>
          <button onClick={handleScanAll} disabled={scanningAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: scanningAll ? '#0f5c4e' : '#1B9E85',
              color: '#fff',
              cursor: scanningAll ? 'not-allowed' : 'pointer',
            }}>
            <Play size={16} />
            {scanningAll ? 'Starting...' : 'Scan All Movies'}
          </button>
        </div>
      </div>

      {/* Per-user scan */}
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <div className="flex items-center gap-3 p-5" style={{ borderBottom: '1px solid #2A3832' }}>
          <Users size={18} style={{ color: '#1B9E85' }} />
          <h3 className="font-semibold" style={{ color: '#F0F7F4' }}>Scan by User</h3>
        </div>
        <div className="divide-y" style={{ borderColor: '#2A3832' }}>
          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#F0F7F4' }}>{user.name}</p>
                  <p className="text-xs" style={{ color: '#6B8F82' }}>{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleScanUser(user._id, user.name)}
                disabled={scanning[user._id]}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: '#1B9E8520',
                  color: scanning[user._id] ? '#6B8F82' : '#1B9E85',
                }}>
                <Search size={12} />
                {scanning[user._id] ? 'Scanning...' : 'Scan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Exports */}
      <div className="p-6 rounded-2xl" style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <h3 className="font-semibold mb-4" style={{ color: '#F0F7F4' }}>Export Data</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { type: 'users', label: 'Export Users', desc: 'All user accounts as CSV' },
            { type: 'infringements', label: 'Export Infringements', desc: 'All detected piracy as CSV' },
          ].map(({ type, label, desc }) => (
            <button key={type} onClick={() => handleExport(type)}
              className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
              style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1B9E85'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2A3832'}>
              <Film size={18} style={{ color: '#1B9E85' }} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium" style={{ color: '#F0F7F4' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#6B8F82' }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}