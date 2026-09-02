import { useEffect, useState } from 'react';
import { ExternalLink, Shield, AlertTriangle, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { getInfringements, updateInfringementStatus } from '../../api/scan';
import toast from 'react-hot-toast';

const statusConfig = {
  detected: { label: 'Detected', color: '#EF4444', bg: '#EF444420', icon: AlertTriangle },
  notified: { label: 'Notified', color: '#F59E0B', bg: '#F59E0B20', icon: Clock },
  takedown_sent: { label: 'Takedown Sent', color: '#1B9E85', bg: '#1B9E8520', icon: Shield },
  resolved: { label: 'Resolved', color: '#22C55E', bg: '#22C55E20', icon: CheckCircle },
  dismissed: { label: 'Dismissed', color: '#6B8F82', bg: '#6B8F8220', icon: XCircle },
};

export default function Infringements() {
  const [infringements, setInfringements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchInfringements();
  }, []);

  const fetchInfringements = async () => {
    try {
      const { data } = await getInfringements();
      setInfringements(data.infringements);
    } catch {
      toast.error('Failed to load infringements');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      const { data } = await updateInfringementStatus(id, status);
      setInfringements((prev) => prev.map((i) => i._id === id ? { ...i, status: data.infringement.status } : i));
      toast.success(`Marked as ${statusConfig[status].label}`);
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filtered = filter === 'all' ? infringements : infringements.filter((i) => i.status === filter);

  const counts = {
    all: infringements.length,
    detected: infringements.filter((i) => i.status === 'detected').length,
    takedown_sent: infringements.filter((i) => i.status === 'takedown_sent').length,
    resolved: infringements.filter((i) => i.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: '#1B9E85', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#F0F7F4' }}>Infringements</h2>
        <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>
          All detected piracy cases across your movies
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'detected', label: 'Active Threats' },
          { key: 'takedown_sent', label: 'Takedown Sent' },
          { key: 'resolved', label: 'Resolved' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: filter === key ? '#1B9E85' : '#111A18',
              color: filter === key ? '#fff' : '#6B8F82',
              border: `1px solid ${filter === key ? '#1B9E85' : '#2A3832'}`,
            }}>
            {label}
            <span className="px-1.5 py-0.5 rounded-full text-xs"
              style={{
                backgroundColor: filter === key ? '#ffffff30' : '#2A3832',
                color: filter === key ? '#fff' : '#6B8F82',
              }}>
              {counts[key] ?? infringements.filter((i) => i.status === key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl"
          style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
          <Shield size={48} className="mb-4" style={{ color: '#1B9E85' }} />
          <p className="font-semibold" style={{ color: '#F0F7F4' }}>No infringements found</p>
          <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>
            {filter === 'all' ? 'Upload movies and run scans to detect piracy' : `No ${filter.replace('_', ' ')} cases`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inf) => {
            const status = statusConfig[inf.status] || statusConfig.detected;
            const StatusIcon = status.icon;
            return (
              <div key={inf._id} className="flex gap-4 p-4 rounded-2xl"
                style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
                {/* Thumbnail */}
                <img src={inf.youtubeThumbnail} alt={inf.youtubeTitle}
                  className="w-32 h-20 object-cover rounded-xl shrink-0"
                  style={{ border: '1px solid #2A3832' }} />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold truncate" style={{ color: '#F0F7F4' }}>{inf.youtubeTitle}</p>
                      <p className="text-sm mt-0.5" style={{ color: '#6B8F82' }}>{inf.youtubeChannel}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shrink-0"
                      style={{ backgroundColor: status.bg, color: status.color }}>
                      <StatusIcon size={11} />
                      {status.label}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {/* Movie name */}
                    <span className="text-xs px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: '#1B9E8520', color: '#1B9E85' }}>
                      {inf.movie?.title}
                    </span>
                    {/* Confidence */}
                    <span className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: inf.matchConfidence === 'high' ? '#EF444420' : '#F59E0B20',
                        color: inf.matchConfidence === 'high' ? '#EF4444' : '#F59E0B',
                      }}>
                      {inf.matchConfidence} confidence
                    </span>
                    {/* Date */}
                    <span className="text-xs" style={{ color: '#6B8F82' }}>
                      {new Date(inf.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <a href={inf.youtubeVideoUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ backgroundColor: '#1A2622', color: '#6B8F82', border: '1px solid #2A3832' }}>
                      <ExternalLink size={12} />
                      View on YouTube
                    </a>

                    {inf.status === 'detected' && (
                      <button
                        onClick={() => handleStatusUpdate(inf._id, 'takedown_sent')}
                        disabled={updating[inf._id]}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ backgroundColor: '#EF444420', color: '#EF4444', border: '1px solid #EF444440' }}>
                        <Shield size={12} />
                        {updating[inf._id] ? 'Sending...' : 'Send Takedown'}
                      </button>
                    )}

                    {inf.status === 'takedown_sent' && (
                      <button
                        onClick={() => handleStatusUpdate(inf._id, 'resolved')}
                        disabled={updating[inf._id]}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: '#22C55E20', color: '#22C55E', border: '1px solid #22C55E40' }}>
                        <CheckCircle size={12} />
                        Mark Resolved
                      </button>
                    )}

                    {inf.status === 'detected' && (
                      <button
                        onClick={() => handleStatusUpdate(inf._id, 'dismissed')}
                        disabled={updating[inf._id]}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: '#6B8F8220', color: '#6B8F82', border: '1px solid #6B8F8240' }}>
                        <XCircle size={12} />
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