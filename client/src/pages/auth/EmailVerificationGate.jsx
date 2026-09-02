import { useState } from 'react';
import { Mail, RefreshCw, LogOut, CheckCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import logo from '../../assets/img/logo.webp';

export default function EmailVerificationGate() {
  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await api.post('/auth/resend-verification');
      setSent(true);
      toast.success('Verification email sent — check your inbox');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send — try again');
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      if (data.user.isVerified) {
        toast.success('Email verified — welcome!');
      } else {
        toast('Email not verified yet — check your inbox', { icon: '📧' });
      }
    } catch {
      toast.error('Failed to check — try again');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: '#0A0F0E' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="FairPlay Africa" className="w-16 h-16 object-contain" />
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#111A18', border: '1px solid #1B9E8540' }}>

          {/* Header */}
          <div className="p-8 text-center"
            style={{ backgroundColor: '#1B9E8510', borderBottom: '1px solid #2A3832' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: '#1B9E8520' }}>
              <Mail size={36} style={{ color: '#1B9E85' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#F0F7F4' }}>
              Verify Your Email
            </h2>
            <p className="text-sm" style={{ color: '#6B8F82' }}>
              We sent a verification link to
            </p>
            <p className="font-semibold mt-1" style={{ color: '#F0F7F4' }}>
              {user?.email}
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Instructions */}
            <div className="space-y-3">
              {[
                'Check your inbox for an email from FairPlay Africa',
                'Click the verification link in the email',
                'The link is valid for 72 hours',
                'Check your spam folder if you don\'t see it',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: '#1B9E8520', color: '#1B9E85' }}>
                    {i + 1}
                  </div>
                  <p className="text-sm" style={{ color: '#6B8F82' }}>{step}</p>
                </div>
              ))}
            </div>

            {/* Already verified button */}
            <button onClick={handleCheckVerification} disabled={checking}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
              {checking
                ? <><RefreshCw size={16} className="animate-spin" /> Checking...</>
                : <><CheckCircle size={16} /> I've verified my email</>
              }
            </button>

            {/* Resend button */}
            <button onClick={handleResend} disabled={sending || sent}
              className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: '#1A2622',
                color: sent ? '#22C55E' : '#6B8F82',
                border: `1px solid ${sent ? '#22C55E40' : '#2A3832'}`,
                cursor: sent ? 'default' : 'pointer',
              }}>
              {sending
                ? <><RefreshCw size={16} className="animate-spin" /> Sending...</>
                : sent
                ? <><CheckCircle size={16} /> Email sent — check your inbox</>
                : <><RefreshCw size={16} /> Resend verification email</>
              }
            </button>

            {/* Countdown if sent */}
            {sent && (
              <p className="text-xs text-center" style={{ color: '#6B8F82' }}>
                Didn't receive it? Wait a minute then try again.
                Check spam/junk folder.
              </p>
            )}

            <div style={{ borderTop: '1px solid #2A3832' }} className="pt-4">
              <button onClick={handleLogout}
                className="w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
                style={{ color: '#6B8F82' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#F0F7F4'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B8F82'}>
                <LogOut size={15} />
                Sign out and use a different account
              </button>
            </div>
          </div>
        </div>

        {/* Wrong email? */}
        <p className="text-center text-sm mt-4" style={{ color: '#6B8F82' }}>
          Wrong email address?{' '}
          <button onClick={handleLogout}
            className="hover:underline" style={{ color: '#1B9E85' }}>
            Sign out
          </button>{' '}
          and register with the correct one.
        </p>
      </div>
    </div>
  );
}