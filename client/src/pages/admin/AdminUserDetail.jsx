import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, XCircle, Brain, Film } from 'lucide-react';
import { getAdminUser, verifyUser, updateUserStatus, aiReviewUser } from '../../api/admin';
import toast from 'react-hot-toast';

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [aiReview, setAiReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => { fetchUser(); }, [id]);

  const fetchUser = async () => {
    try {
      const { data } = await getAdminUser(id);
      setData(data);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (action) => {
    try {
      await verifyUser(id, { action, note });
      toast.success(`User ${action}d`);
      fetchUser();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleStatus = async (status) => {
    try {
      await updateUserStatus(id, { status, reason: note });
      toast.success(`Account ${status}`);
      fetchUser();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleAiReview = async () => {
    setAiLoading(true);
    try {
      const { data } = await aiReviewUser(id);
      setAiReview(data);
    } catch {
      toast.error('AI review failed');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: '#1B9E85', borderTopColor: 'transparent' }} />
    </div>
  );

  const { user, movies, infringementCount } = data;

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => navigate('/admin/users')}
        className="flex items-center gap-2 text-sm transition-all"
        style={{ color: '#6B8F82' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#F0F7F4'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#6B8F82'}>
        <ArrowLeft size={16} />
        Back to users
      </button>

      {/* User header */}
      <div className="flex items-start justify-between p-6 rounded-2xl"
        style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
            style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#F0F7F4' }}>{user.name}</h2>
            <p style={{ color: '#6B8F82' }}>{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: user.accountStatus === 'active' ? '#22C55E20' : '#EF444420',
                  color: user.accountStatus === 'active' ? '#22C55E' : '#EF4444',
                }}>
                {user.accountStatus}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: user.verificationStatus === 'verified' ? '#1B9E8520' : '#F59E0B20',
                  color: user.verificationStatus === 'verified' ? '#1B9E85' : '#F59E0B',
                }}>
                {user.verificationStatus}
              </span>
              {user.fraudFlags > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: '#EF444420', color: '#EF4444' }}>
                  <AlertTriangle size={10} />
                  {user.fraudFlags} fraud flag{user.fraudFlags > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm" style={{ color: '#6B8F82' }}>Joined</p>
          <p className="font-medium" style={{ color: '#F0F7F4' }}>
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Movies', value: movies.length, icon: Film },
          { label: 'Infringements', value: infringementCount, icon: AlertTriangle },
          { label: 'Fraud Flags', value: user.fraudFlags, icon: Shield },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-4 rounded-xl text-center"
            style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
            <p className="text-2xl font-bold" style={{ color: '#F0F7F4' }}>{value}</p>
            <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Movies list */}
      {movies.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
          <div className="p-4" style={{ borderBottom: '1px solid #2A3832' }}>
            <h3 className="font-semibold" style={{ color: '#F0F7F4' }}>Registered Movies</h3>
          </div>
          <div className="divide-y" style={{ borderColor: '#2A3832' }}>
            {movies.map((movie) => (
              <div key={movie._id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#F0F7F4' }}>{movie.title}</p>
                  <p className="text-xs" style={{ color: '#6B8F82' }}>
                    Owner code: {movie.ownerCode || 'Not watermarked'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: movie.legalDeclaration?.agreed ? '#22C55E20' : '#EF444420',
                      color: movie.legalDeclaration?.agreed ? '#22C55E' : '#EF4444',
                    }}>
                    {movie.legalDeclaration?.agreed ? 'Declared' : 'No declaration'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: movie.watermarkStatus === 'ready' ? '#1B9E8520' : '#6B8F8220',
                      color: movie.watermarkStatus === 'ready' ? '#1B9E85' : '#6B8F82',
                    }}>
                    {movie.watermarkStatus === 'ready' ? 'Watermarked' : 'No watermark'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ownership evidence */}
      {movies.some((m) => m.ownershipEvidence?.fileUrl) && (
        <div className="p-5 rounded-2xl" style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
          <h3 className="font-semibold mb-3" style={{ color: '#F0F7F4' }}>Ownership Evidence</h3>
          {movies.filter((m) => m.ownershipEvidence?.fileUrl).map((movie) => (
            <div key={movie._id} className="flex items-center justify-between py-2">
              <p className="text-sm" style={{ color: '#6B8F82' }}>{movie.title}</p>
              <a href={movie.ownershipEvidence.fileUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: '#1B9E8520', color: '#1B9E85' }}>
                View Evidence
              </a>
            </div>
          ))}
        </div>
      )}

      {/* AI Review */}
      <div className="p-5 rounded-2xl" style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain size={18} style={{ color: '#1B9E85' }} />
            <h3 className="font-semibold" style={{ color: '#F0F7F4' }}>AI Ownership Analysis</h3>
          </div>
          <button onClick={handleAiReview} disabled={aiLoading}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ backgroundColor: '#1B9E8520', color: '#1B9E85' }}>
            {aiLoading ? 'Analysing...' : 'Run AI Review'}
          </button>
        </div>

        {aiReview && (
          <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2A3832" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    stroke={aiReview.score >= 70 ? '#22C55E' : aiReview.score >= 40 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="3"
                    strokeDasharray={`${aiReview.score} 100`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold" style={{ color: '#F0F7F4' }}>{aiReview.score}</span>
                </div>
              </div>
              <div>
                <p className="font-semibold" style={{
                  color: aiReview.recommendation === 'approve' ? '#22C55E'
                    : aiReview.recommendation === 'manual_review' ? '#F59E0B' : '#EF4444'
                }}>
                  {aiReview.recommendation === 'approve' ? '✓ Recommend Approve'
                    : aiReview.recommendation === 'manual_review' ? '⚠ Manual Review Needed'
                    : '✗ Recommend Reject'}
                </p>
                <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>{aiReview.summary}</p>
              </div>
            </div>

            {/* Signals */}
            <div className="space-y-2">
              {aiReview.signals.map((s) => (
                <div key={s.signal} className="flex items-center justify-between py-2 px-3 rounded-lg"
                  style={{ backgroundColor: '#1A2622' }}>
                  <div className="flex items-center gap-2">
                    {s.status === 'pass' ? <CheckCircle size={14} style={{ color: '#22C55E' }} />
                      : s.status === 'fail' ? <XCircle size={14} style={{ color: '#EF4444' }} />
                      : <AlertTriangle size={14} style={{ color: '#F59E0B' }} />}
                    <span className="text-sm" style={{ color: '#F0F7F4' }}>{s.signal}</span>
                  </div>
                  <span className="text-xs font-mono" style={{
                    color: s.weight.startsWith('+') ? '#22C55E' : s.weight.startsWith('-') ? '#EF4444' : '#6B8F82'
                  }}>{s.weight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin Actions */}
      <div className="p-5 rounded-2xl" style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <h3 className="font-semibold mb-4" style={{ color: '#F0F7F4' }}>Admin Actions</h3>
        <div className="mb-4">
          <label className="block text-sm mb-2" style={{ color: '#6B8F82' }}>Note (optional)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note for the user..."
            className="w-full px-4 py-3 rounded-xl outline-none"
            style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832', color: '#F0F7F4' }}
            onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
            onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {user.verificationStatus === 'pending' && (<>
            <button onClick={() => handleVerify('approve')}
              className="py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: '#22C55E20', color: '#22C55E', border: '1px solid #22C55E40' }}>
              <CheckCircle size={15} /> Approve Ownership
            </button>
            <button onClick={() => handleVerify('reject')}
              className="py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: '#EF444420', color: '#EF4444', border: '1px solid #EF444440' }}>
              <XCircle size={15} /> Reject Ownership
            </button>
          </>)}

          {user.accountStatus === 'active' && (
            <button onClick={() => handleStatus('suspended')}
              className="py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: '#F59E0B20', color: '#F59E0B', border: '1px solid #F59E0B40' }}>
              <Shield size={15} /> Suspend Account
            </button>
          )}

          {user.accountStatus === 'suspended' && (
            <button onClick={() => handleStatus('active')}
              className="py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: '#22C55E20', color: '#22C55E', border: '1px solid #22C55E40' }}>
              <CheckCircle size={15} /> Reinstate Account
            </button>
          )}

          {user.accountStatus !== 'banned' && (
            <button onClick={() => handleStatus('banned')}
              className="py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: '#EF444420', color: '#EF4444', border: '1px solid #EF444440' }}>
              <XCircle size={15} /> Ban Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}