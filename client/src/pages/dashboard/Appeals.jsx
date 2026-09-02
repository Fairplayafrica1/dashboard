import { useEffect, useState } from 'react';
import { MessageSquare, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { getMyAppeals, submitAppeal } from '../../api/scan';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'Pending', color: '#F59E0B', icon: Clock },
  under_review: { label: 'Under Review', color: '#1B9E85', icon: Clock },
  approved: { label: 'Approved', color: '#22C55E', icon: CheckCircle },
  rejected: { label: 'Rejected', color: '#EF4444', icon: XCircle },
};

const appealTypes = [
  { value: 'fraud_flag', label: 'Wrongful fraud flag' },
  { value: 'suspension', label: 'Account suspension' },
  { value: 'ban', label: 'Account ban' },
  { value: 'false_infringement', label: 'False infringement claim' },
];

export default function Appeals() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'fraud_flag', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAppeals(); }, []);

  const fetchAppeals = async () => {
    try {
      const { data } = await getMyAppeals();
      setAppeals(data.appeals);
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.reason.trim()) { toast.error('Please explain your appeal'); return; }
    setSubmitting(true);
    try {
      const { data } = await submitAppeal(form);
      setAppeals([data.appeal, ...appeals]);
      setForm({ type: 'fraud_flag', reason: '' });
      setShowForm(false);
      toast.success('Appeal submitted — we will review within 48 hours');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#F0F7F4' }}>Appeals</h2>
          <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>
            Dispute a fraud flag, suspension, or false infringement
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
          <Plus size={16} />
          Submit Appeal
        </button>
      </div>

      {showForm && (
        <div className="p-6 rounded-2xl space-y-4"
          style={{ backgroundColor: '#111A18', border: '1px solid #1B9E85' }}>
          <h3 className="font-semibold" style={{ color: '#F0F7F4' }}>New Appeal</h3>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#6B8F82' }}>Appeal Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832', color: '#F0F7F4' }}>
              {appealTypes.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: '#6B8F82' }}>
              Explain your appeal
            </label>
            <textarea value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Provide as much detail as possible about why this decision should be reversed..."
              rows={5} className="w-full px-4 py-3 rounded-xl outline-none resize-none text-sm"
              style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832', color: '#F0F7F4' }}
              onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
              onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
              {submitting ? 'Submitting...' : 'Submit Appeal'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-xl text-sm"
              style={{ backgroundColor: '#1A2622', color: '#6B8F82' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: '#1B9E85', borderTopColor: 'transparent' }} />
        </div>
      ) : appeals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
          <MessageSquare size={40} className="mb-4" style={{ color: '#2A3832' }} />
          <p className="font-medium" style={{ color: '#F0F7F4' }}>No appeals submitted</p>
          <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>
            If you believe a decision was wrong, submit an appeal above
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appeals.map((appeal) => {
            const status = statusConfig[appeal.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const type = appealTypes.find((t) => t.value === appeal.type);
            return (
              <div key={appeal._id} className="p-5 rounded-2xl"
                style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold" style={{ color: '#F0F7F4' }}>
                      {type?.label || appeal.type}
                    </p>
                    {appeal.movie && (
                      <p className="text-xs mt-0.5" style={{ color: '#6B8F82' }}>
                        Movie: {appeal.movie.title}
                      </p>
                    )}
                  </div>
                  <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full shrink-0"
                    style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                    <StatusIcon size={11} />
                    {status.label}
                  </span>
                </div>

                <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: '#1A2622' }}>
                  <p className="text-sm" style={{ color: '#6B8F82' }}>{appeal.reason}</p>
                </div>

                {appeal.adminNote && (
                  <div className="mt-3 p-3 rounded-xl"
                    style={{ backgroundColor: '#1B9E8515', border: '1px solid #1B9E8530' }}>
                    <p className="text-xs font-medium mb-1" style={{ color: '#1B9E85' }}>
                      Admin Response
                    </p>
                    <p className="text-sm" style={{ color: '#F0F7F4' }}>{appeal.adminNote}</p>
                  </div>
                )}

                <p className="text-xs mt-3" style={{ color: '#6B8F82' }}>
                  Submitted {new Date(appeal.createdAt).toLocaleDateString()}
                  {appeal.reviewedAt && ` · Reviewed ${new Date(appeal.reviewedAt).toLocaleDateString()}`}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}