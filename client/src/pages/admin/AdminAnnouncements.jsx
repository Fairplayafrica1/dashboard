import { useEffect, useState } from 'react';
import { Plus, Trash2, Megaphone } from 'lucide-react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../../api/admin';
import toast from 'react-hot-toast';

const typeConfig = {
  info: { label: 'Info', color: '#1B9E85', bg: '#1B9E8520' },
  warning: { label: 'Warning', color: '#F59E0B', bg: '#F59E0B20' },
  success: { label: 'Success', color: '#22C55E', bg: '#22C55E20' },
  urgent: { label: 'Urgent', color: '#EF4444', bg: '#EF444420' },
};

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', message: '', type: 'info' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await getAnnouncements();
      setAnnouncements(data.announcements);
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.message) { toast.error('Title and message required'); return; }
    setSubmitting(true);
    try {
      const { data } = await createAnnouncement(form);
      setAnnouncements([data.announcement, ...announcements]);
      setForm({ title: '', message: '', type: 'info' });
      setShowForm(false);
      toast.success('Announcement sent to all users');
    } catch { toast.error('Failed to send'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter((a) => a._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const inputStyle = { backgroundColor: '#1A2622', border: '1px solid #2A3832', color: '#F0F7F4' };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F0F7F4' }}>Announcements</h1>
          <p className="mt-1" style={{ color: '#6B8F82' }}>Broadcast messages to all users</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
          <Plus size={16} />
          New Announcement
        </button>
      </div>

      {showForm && (
        <div className="p-6 rounded-2xl space-y-4"
          style={{ backgroundColor: '#111A18', border: '1px solid #1B9E85' }}>
          <h3 className="font-semibold" style={{ color: '#F0F7F4' }}>Create Announcement</h3>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#6B8F82' }}>Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement title"
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
              onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#6B8F82' }}>Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Your message to users..."
              rows={4} className="w-full px-4 py-3 rounded-xl outline-none resize-none"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
              onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#6B8F82' }}>Type</label>
            <div className="flex gap-2">
              {Object.entries(typeConfig).map(([key, config]) => (
                <button key={key} onClick={() => setForm({ ...form, type: key })}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: form.type === key ? config.bg : '#1A2622',
                    color: form.type === key ? config.color : '#6B8F82',
                    border: `1px solid ${form.type === key ? config.color : '#2A3832'}`,
                  }}>
                  {config.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
              {submitting ? 'Sending...' : 'Send to All Users'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-xl text-sm"
              style={{ backgroundColor: '#1A2622', color: '#6B8F82' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: '#1B9E85', borderTopColor: 'transparent' }} />
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
            style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
            <Megaphone size={40} className="mb-3" style={{ color: '#2A3832' }} />
            <p style={{ color: '#6B8F82' }}>No announcements yet</p>
          </div>
        ) : announcements.map((a) => {
          const config = typeConfig[a.type] || typeConfig.info;
          return (
            <div key={a._id} className="flex items-start gap-4 p-5 rounded-2xl"
              style={{ backgroundColor: '#111A18', border: `1px solid ${config.color}30` }}>
              <div className="p-2 rounded-xl shrink-0" style={{ backgroundColor: config.bg }}>
                <Megaphone size={18} style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold" style={{ color: '#F0F7F4' }}>{a.title}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: config.bg, color: config.color }}>
                    {config.label}
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#6B8F82' }}>{a.message}</p>
                <p className="text-xs mt-2" style={{ color: '#6B8F82' }}>
                  {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => handleDelete(a._id)}
                className="p-2 rounded-lg transition-all shrink-0"
                style={{ color: '#6B8F82' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = '#EF444420'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#6B8F82'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}