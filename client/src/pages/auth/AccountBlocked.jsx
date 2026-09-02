// import { Shield, AlertTriangle, LogOut, MessageSquare } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import useAuthStore from '../../store/authStore';
// import toast from 'react-hot-toast';
// import logo from '../../assets/img/logo.webp';

// export default function AccountBlocked({ type = 'suspended', reason = '' }) {
//   const { logout, user } = useAuthStore();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     toast.success('Logged out');
//     navigate('/login');
//   };

//   const isBanned = type === 'banned';

//   return (
//     <div className="min-h-screen flex items-center justify-center p-6"
//       style={{ backgroundColor: '#0A0F0E' }}>
//       <div className="w-full max-w-md">
//         {/* Logo */}
//         <div className="flex justify-center mb-8">
//           <img src={logo} alt="FairPlay Africa" className="w-16 h-16 object-contain" />
//         </div>

//         {/* Block card */}
//         <div className="rounded-2xl overflow-hidden"
//           style={{ backgroundColor: '#111A18', border: `1px solid ${isBanned ? '#EF4444' : '#F59E0B'}40` }}>

//           {/* Top banner */}
//           <div className="p-6 text-center"
//             style={{ backgroundColor: isBanned ? '#EF444415' : '#F59E0B15' }}>
//             <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
//               style={{ backgroundColor: isBanned ? '#EF444420' : '#F59E0B20' }}>
//               {isBanned
//                 ? <Shield size={32} style={{ color: '#EF4444' }} />
//                 : <AlertTriangle size={32} style={{ color: '#F59E0B' }} />}
//             </div>
//             <h2 className="text-xl font-bold mb-1"
//               style={{ color: isBanned ? '#EF4444' : '#F59E0B' }}>
//               Account {isBanned ? 'Permanently Banned' : 'Suspended'}
//             </h2>
//             <p className="text-sm" style={{ color: '#6B8F82' }}>
//               {isBanned
//                 ? 'Your account has been permanently banned from FairPlay Africa'
//                 : 'Your account has been temporarily suspended'}
//             </p>
//           </div>

//           <div className="p-6 space-y-5">
//             {/* Reason */}
//             {reason && (
//               <div className="p-4 rounded-xl"
//                 style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832' }}>
//                 <p className="text-xs font-medium mb-2" style={{ color: '#6B8F82' }}>
//                   REASON
//                 </p>
//                 <p className="text-sm" style={{ color: '#F0F7F4' }}>{reason}</p>
//               </div>
//             )}

//             {/* What this means */}
//             <div className="space-y-3">
//               <p className="text-sm font-medium" style={{ color: '#F0F7F4' }}>
//                 What this means:
//               </p>
//               {[
//                 isBanned ? 'You can no longer access your account' : 'Your account access is temporarily restricted',
//                 'Your movies are no longer being monitored',
//                 isBanned ? 'All your content has been removed from protection' : 'Scans and takedowns are paused',
//                 isBanned ? 'This decision is final unless successfully appealed' : 'You can appeal this decision below',
//               ].map((point) => (
//                 <div key={point} className="flex items-start gap-2">
//                   <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
//                     style={{ backgroundColor: isBanned ? '#EF4444' : '#F59E0B' }} />
//                   <p className="text-sm" style={{ color: '#6B8F82' }}>{point}</p>
//                 </div>
//               ))}
//             </div>

//             {/* Appeal info */}
//             <div className="p-4 rounded-xl"
//               style={{ backgroundColor: '#1B9E8510', border: '1px solid #1B9E8530' }}>
//               <p className="text-sm font-medium mb-1" style={{ color: '#1B9E85' }}>
//                 Think this is a mistake?
//               </p>
//               <p className="text-sm" style={{ color: '#6B8F82' }}>
//                 You can submit an appeal by contacting us at{' '}
//                 <a href="mailto:appeals@fairplayafrica.com"
//                   style={{ color: '#1B9E85' }}>
//                   appeals@fairplayafrica.com
//                 </a>{' '}
//                 with your account email and a detailed explanation.
//               </p>
//             </div>

//             {/* Account info */}
//             <div className="flex items-center gap-3 p-3 rounded-xl"
//               style={{ backgroundColor: '#1A2622' }}>
//               <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
//                 style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
//                 {user?.name?.charAt(0).toUpperCase()}
//               </div>
//               <div>
//                 <p className="text-sm font-medium" style={{ color: '#F0F7F4' }}>{user?.name}</p>
//                 <p className="text-xs" style={{ color: '#6B8F82' }}>{user?.email}</p>
//               </div>
//             </div>

//             <button onClick={handleLogout}
//               className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
//               style={{ backgroundColor: '#1A2622', color: '#6B8F82', border: '1px solid #2A3832' }}
//               onMouseEnter={(e) => { e.currentTarget.style.color = '#F0F7F4'; e.currentTarget.style.borderColor = '#6B8F82'; }}
//               onMouseLeave={(e) => { e.currentTarget.style.color = '#6B8F82'; e.currentTarget.style.borderColor = '#2A3832'; }}>
//               <LogOut size={16} />
//               Sign out
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import { Shield, AlertTriangle, LogOut, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { submitAppeal } from '../../api/scan';
import toast from 'react-hot-toast';
import logo from '../../assets/img/logo.png';

const appealTypes = [
  { value: 'suspension', label: 'Account suspension dispute' },
  { value: 'ban', label: 'Account ban dispute' },
  { value: 'fraud_flag', label: 'Wrongful fraud flag' },
  { value: 'false_infringement', label: 'False infringement claim' },
];

export default function AccountBlocked({ type = 'suspended', reason = '' }) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState('blocked'); // blocked | appeal | submitted
  const [form, setForm] = useState({ type: type === 'banned' ? 'ban' : 'suspension', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const isBanned = type === 'banned';

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const handleSubmitAppeal = async () => {
    if (!form.reason.trim() || form.reason.trim().length < 20) {
      toast.error('Please provide a detailed explanation (at least 20 characters)');
      return;
    }
    setSubmitting(true);
    try {
      await submitAppeal(form);
      setStep('submitted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed — try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: '#0A0F0E' }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="FairPlay Africa" className="w-14 h-14 object-contain" />
        </div>

        {/* STEP 1 — Block screen */}
        {step === 'blocked' && (
          <div className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: '#111A18',
              border: `1px solid ${isBanned ? '#EF444440' : '#F59E0B40'}`,
            }}>
            {/* Banner */}
            <div className="p-8 text-center"
              style={{ backgroundColor: isBanned ? '#EF444410' : '#F59E0B10' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: isBanned ? '#EF444420' : '#F59E0B20' }}>
                {isBanned
                  ? <Shield size={36} style={{ color: '#EF4444' }} />
                  : <AlertTriangle size={36} style={{ color: '#F59E0B' }} />}
              </div>
              <h2 className="text-2xl font-bold mb-2"
                style={{ color: isBanned ? '#EF4444' : '#F59E0B' }}>
                Account {isBanned ? 'Permanently Banned' : 'Suspended'}
              </h2>
              <p className="text-sm" style={{ color: '#6B8F82' }}>
                {isBanned
                  ? 'Your account has been permanently banned from FairPlay Africa due to a serious policy violation.'
                  : 'Your account has been temporarily suspended pending review.'}
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Reason */}
              {reason && (
                <div className="p-4 rounded-xl"
                  style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832' }}>
                  <p className="text-xs font-medium mb-2 uppercase tracking-wide"
                    style={{ color: '#6B8F82' }}>
                    Reason
                  </p>
                  <p className="text-sm" style={{ color: '#F0F7F4' }}>{reason}</p>
                </div>
              )}

              {/* What this means */}
              <div className="space-y-2">
                {[
                  isBanned
                    ? 'Your account and all content have been permanently removed'
                    : 'Your account access is temporarily restricted',
                  'All active movie scans and takedowns are paused',
                  isBanned
                    ? 'This action is final unless successfully appealed'
                    : 'You can submit an appeal to have this reviewed',
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: isBanned ? '#EF4444' : '#F59E0B' }} />
                    <p className="text-sm" style={{ color: '#6B8F82' }}>{point}</p>
                  </div>
                ))}
              </div>

              {/* Account info */}
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: '#1A2622' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#F0F7F4' }}>
                    {user?.name}
                  </p>
                  <p className="text-xs" style={{ color: '#6B8F82' }}>{user?.email}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button onClick={() => setStep('appeal')}
                  className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
                  <Send size={16} />
                  Submit an Appeal
                </button>
                <button onClick={handleLogout}
                  className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#6B8F82',
                    border: '1px solid #2A3832',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#F0F7F4'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6B8F82'}>
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Appeal form */}
        {step === 'appeal' && (
          <div className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#111A18', border: '1px solid #1B9E8540' }}>
            <div className="p-6" style={{ borderBottom: '1px solid #2A3832' }}>
              <button onClick={() => setStep('blocked')}
                className="text-xs mb-4 flex items-center gap-1"
                style={{ color: '#6B8F82' }}>
                ← Back
              </button>
              <h2 className="text-xl font-bold" style={{ color: '#F0F7F4' }}>
                Submit an Appeal
              </h2>
              <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>
                Explain why you believe this decision was wrong. We review all appeals within 48 hours.
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Appeal type */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>
                  Appeal Type
                </label>
                <select value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                  style={{
                    backgroundColor: '#1A2622',
                    border: '1px solid #2A3832',
                    color: '#F0F7F4',
                  }}>
                  {appealTypes.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>
                  Your Explanation
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Explain in detail why you believe this decision was incorrect. Include any relevant context, evidence, or circumstances that support your case..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none text-sm"
                  style={{
                    backgroundColor: '#1A2622',
                    border: '1px solid #2A3832',
                    color: '#F0F7F4',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
                  onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
                <p className="text-xs mt-1" style={{ color: '#6B8F82' }}>
                  {form.reason.length} characters — minimum 20 required
                </p>
              </div>

              {/* Warning */}
              <div className="p-4 rounded-xl flex items-start gap-3"
                style={{ backgroundColor: '#F59E0B10', border: '1px solid #F59E0B30' }}>
                <AlertTriangle size={16} style={{ color: '#F59E0B' }} className="shrink-0 mt-0.5" />
                <p className="text-xs" style={{ color: '#F59E0B' }}>
                  False appeals may result in permanent account termination.
                  Only submit if you genuinely believe this decision was incorrect.
                </p>
              </div>

              <div className="space-y-3">
                <button onClick={handleSubmitAppeal} disabled={submitting}
                  className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: submitting ? '#0f5c4e' : '#1B9E85',
                    color: '#fff',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}>
                  <Send size={16} />
                  {submitting ? 'Submitting...' : 'Submit Appeal'}
                </button>
                <button onClick={() => setStep('blocked')}
                  className="w-full py-3 rounded-xl text-sm font-medium"
                  style={{ color: '#6B8F82', border: '1px solid #2A3832' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Submitted confirmation */}
        {step === 'submitted' && (
          <div className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: '#111A18', border: '1px solid #22C55E40' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: '#22C55E20' }}>
              <CheckCircle size={36} style={{ color: '#22C55E' }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#F0F7F4' }}>
              Appeal Submitted
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6B8F82' }}>
              Your appeal has been received. Our team will review it within 48 hours
              and send a decision to{' '}
              <span style={{ color: '#F0F7F4' }}>{user?.email}</span>.
            </p>
            <div className="p-4 rounded-xl mb-6"
              style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832' }}>
              <p className="text-xs" style={{ color: '#6B8F82' }}>
                While your appeal is under review, your account remains{' '}
                <span style={{ color: isBanned ? '#EF4444' : '#F59E0B' }}>
                  {type}
                </span>.
                You will receive an email with our decision.
              </p>
            </div>
            <button onClick={handleLogout}
              className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: '#1A2622', color: '#6B8F82', border: '1px solid #2A3832' }}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}