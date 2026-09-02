import { useEffect, useState } from 'react';
import { ExternalLink, Shield, CheckCircle, AlertTriangle, Filter } from 'lucide-react';
import { getAdminInfringements, updateAdminInfringement } from '../../api/admin';
import toast from 'react-hot-toast';

const statusConfig = {
  detected: { label: 'Detected', color: '#EF4444', bg: '#EF444420' },
  notified: { label: 'Notified', color: '#F59E0B', bg: '#F59E0B20' },
  takedown_sent: { label: 'Takedown Sent', color: '#1B9E85', bg: '#1B9E8520' },
  resolved: { label: 'Resolved', color: '#22C55E', bg: '#22C55E20' },
  dismissed: { label: 'Dismissed', color: '#6B8F82', bg: '#6B8F8220' },
};

export default function AdminInfringements() {
  const [infringements, setInfringements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState({});
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchInfringements(); }, [filter]);

  const fetchInfringements = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await getAdminInfringements(params);
      setInfringements(data.infringements);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, status) => {
    setUpdating((p) => ({ ...p, [id]: true }));
    try {
      const { data } = await updateAdminInfringement(id, { status });
      setInfringements((prev) => prev.map((i) => i._id === id ? { ...i, status: data.infringement.status } : i));
      toast.success(`Marked as ${status}`);
    } catch { toast.error('Update failed'); }
    finally { setUpdating((p) => ({ ...p, [id]: false })); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F0F7F4' }}>Infringements</h1>
          <p className="mt-1" style={{ color: '#6B8F82' }}>{total} total across all users</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'detected', 'takedown_sent', 'resolved', 'dismissed'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize"
            style={{
              backgroundColor: filter === s ? '#1B9E85' : '#111A18',
              color: filter === s ? '#fff' : '#6B8F82',
              border: `1px solid ${filter === s ? '#1B9E85' : '#2A3832'}`,
            }}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: '#1B9E85', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="space-y-3">
          {infringements.map((inf) => {
            const status = statusConfig[inf.status] || statusConfig.detected;
            return (
              <div key={inf._id} className="flex gap-4 p-4 rounded-2xl"
                style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
                <img src={inf.youtubeThumbnail} alt={inf.youtubeTitle}
                  className="w-28 h-18 object-cover rounded-xl shrink-0 h-16"
                  style={{ border: '1px solid #2A3832' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm truncate" style={{ color: '#F0F7F4' }}>
                        {inf.youtubeTitle}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B8F82' }}>{inf.youtubeChannel}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
                      style={{ backgroundColor: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#1B9E8520', color: '#1B9E85' }}>
                      {inf.movie?.title}
                    </span>
                    <span className="text-xs" style={{ color: '#6B8F82' }}>
                      Owner: {inf.owner?.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: inf.matchConfidence === 'high' ? '#EF444420' : '#F59E0B20',
                        color: inf.matchConfidence === 'high' ? '#EF4444' : '#F59E0B',
                      }}>
                      {inf.matchConfidence} confidence
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <a href={inf.youtubeVideoUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                      style={{ backgroundColor: '#1A2622', color: '#6B8F82', border: '1px solid #2A3832' }}>
                      <ExternalLink size={11} /> View
                    </a>
                    {inf.status === 'detected' && (
                      <button onClick={() => handleUpdate(inf._id, 'resolved')}
                        disabled={updating[inf._id]}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                        style={{ backgroundColor: '#22C55E20', color: '#22C55E' }}>
                        <CheckCircle size={11} /> Mark Resolved
                      </button>
                    )}
                    {inf.status === 'detected' && (
                      <button onClick={() => handleUpdate(inf._id, 'dismissed')}
                        disabled={updating[inf._id]}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                        style={{ backgroundColor: '#6B8F8220', color: '#6B8F82' }}>
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}