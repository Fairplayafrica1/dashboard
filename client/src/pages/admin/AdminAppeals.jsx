import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { getAppeals, updateAppeal } from '../../api/admin';
import toast from 'react-hot-toast';

const typeConfig = {
  fraud_flag: { label: 'Fraud Flag', color: '#EF4444' },
  suspension: { label: 'Suspension', color: '#F59E0B' },
  ban: { label: 'Ban', color: '#EF4444' },
  false_infringement: { label: 'False Infringement', color: '#6B8F82' },
};

const statusConfig = {
  pending: { label: 'Pending', color: '#F59E0B', icon: Clock },
  under_review: { label: 'Under Review', color: '#1B9E85', icon: AlertTriangle },
  approved: { label: 'Approved', color: '#22C55E', icon: CheckCircle },
  rejected: { label: 'Rejected', color: '#EF4444', icon: XCircle },
};

export default function AdminAppeals() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [notes, setNotes] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getAppeals()
      .then(({ data }) => setAppeals(data.appeals))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id, status) => {
    setUpdating((p) => ({ ...p, [id]: true }));
    try {
      const { data } = await updateAppeal(id, { status, adminNote: notes[id] || '' });
      setAppeals((prev) => prev.map((a) => a._id === id ? { ...a, ...data.appeal } : a));
      toast.success(`Appeal ${status}`);
    } catch { toast.error('Update failed'); }
    finally { setUpdating((p) => ({ ...p, [id]: false })); }
  };

  const filtered = filter === 'all' ? appeals : appeals.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#F0F7F4' }}>Appeals</h1>
        <p className="mt-1" style={{ color: '#6B8F82' }}>
          Users disputing fraud flags, suspensions, or false infringements
        </p>
      </div>

      <div className="flex items-center gap-2">
        {['all', 'pending', 'under_review', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize"
            style={{
              backgroundColor: filter === s ? '#1B9E85' : '#111A18',
              color: filter === s ? '#fff' : '#6B8F82',
              border: `1px solid ${filter === s ? '#1B9E85' : '#2A3832'}`,
            }}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: '#1B9E85', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
          style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
          <CheckCircle size={40} className="mb-3" style={{ color: '#1B9E85' }} />
          <p style={{ color: '#6B8F82' }}>No appeals found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((appeal) => {
            const type = typeConfig[appeal.type] || typeConfig.fraud_flag;
            const status = statusConfig[appeal.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <div key={appeal._id} className="p-5 rounded-2xl"
                style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                      style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
                      {appeal.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#F0F7F4' }}>{appeal.user?.name}</p>
                      <p className="text-xs" style={{ color: '#6B8F82' }}>{appeal.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${type.color}20`, color: type.color }}>
                      {type.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                      <StatusIcon size={11} />
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#1A2622' }}>
                  <p className="text-sm font-medium mb-1" style={{ color: '#F0F7F4' }}>Appeal Reason</p>
                  <p className="text-sm" style={{ color: '#6B8F82' }}>{appeal.reason}</p>
                </div>

                {appeal.movie && (
                  <p className="text-xs mt-2" style={{ color: '#6B8F82' }}>
                    Movie: {appeal.movie.title}
                  </p>
                )}

                {appeal.status === 'pending' && (
                  <div className="mt-4 space-y-3">
                    <input type="text"
                      value={notes[appeal._id] || ''}
                      onChange={(e) => setNotes((n) => ({ ...n, [appeal._id]: e.target.value }))}
                      placeholder="Admin note (optional)"
                      className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                      style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832', color: '#F0F7F4' }}
                      onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
                      onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
                    <div className="flex gap-3">
                      <button onClick={() => handleUpdate(appeal._id, 'approved')}
                        disabled={updating[appeal._id]}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                        style={{ backgroundColor: '#22C55E20', color: '#22C55E', border: '1px solid #22C55E40' }}>
                        <CheckCircle size={14} />
                        Approve & Reinstate
                      </button>
                      <button onClick={() => handleUpdate(appeal._id, 'rejected')}
                        disabled={updating[appeal._id]}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                        style={{ backgroundColor: '#EF444420', color: '#EF4444', border: '1px solid #EF444440' }}>
                        <XCircle size={14} />
                        Reject Appeal
                      </button>
                    </div>
                  </div>
                )}

                {appeal.adminNote && (
                  <div className="mt-3 p-3 rounded-xl"
                    style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: '#6B8F82' }}>Admin Note</p>
                    <p className="text-sm" style={{ color: '#F0F7F4' }}>{appeal.adminNote}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}