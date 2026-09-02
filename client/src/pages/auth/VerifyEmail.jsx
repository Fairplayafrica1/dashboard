import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import logo from '../../assets/img/logo.png';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState('verifying');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); return; }

    api.get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 3000);
      })
      .catch((err) => {
        const code = err.response?.data?.code;
        setStatus(code === 'TOKEN_EXPIRED' ? 'expired' : 'error');
      });
  }, []);

  const handleResend = async () => {
    if (!isAuthenticated) {
      toast('Please log in first to resend verification');
      navigate('/login');
      return;
    }
    setResending(true);
    try {
      await api.post('/auth/resend-verification');
      setResent(true);
      toast.success('New verification email sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: '#0A0F0E' }}>
      <div className="w-full max-w-md text-center">
        <img src={logo} alt="FairPlay Africa"
          className="w-16 h-16 object-contain mx-auto mb-8" />

        {status === 'verifying' && (
          <div className="p-8 rounded-2xl"
            style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
            <Loader size={48} className="mx-auto mb-4 animate-spin"
              style={{ color: '#1B9E85' }} />
            <h2 className="text-xl font-bold" style={{ color: '#F0F7F4' }}>
              Verifying your email...
            </h2>
          </div>
        )}

        {status === 'success' && (
          <div className="p-8 rounded-2xl"
            style={{ backgroundColor: '#111A18', border: '1px solid #22C55E40' }}>
            <CheckCircle size={56} className="mx-auto mb-4"
              style={{ color: '#22C55E' }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: '#F0F7F4' }}>
              Email Verified!
            </h2>
            <p style={{ color: '#6B8F82' }}>
              Your email has been verified. Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === 'expired' && (
          <div className="p-8 rounded-2xl"
            style={{ backgroundColor: '#111A18', border: '1px solid #F59E0B40' }}>
            <XCircle size={56} className="mx-auto mb-4"
              style={{ color: '#F59E0B' }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: '#F0F7F4' }}>
              Link Expired
            </h2>
            <p className="mb-6" style={{ color: '#6B8F82' }}>
              This verification link has expired. Request a new one below.
            </p>
            {!resent ? (
              <button onClick={handleResend} disabled={resending}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
                {resending
                  ? <><RefreshCw size={16} className="animate-spin" /> Sending...</>
                  : <><RefreshCw size={16} /> Send New Verification Email</>
                }
              </button>
            ) : (
              <div className="p-4 rounded-xl"
                style={{ backgroundColor: '#22C55E15', border: '1px solid #22C55E40' }}>
                <p style={{ color: '#22C55E' }}>
                  ✓ New verification email sent — check your inbox
                </p>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="p-8 rounded-2xl"
            style={{ backgroundColor: '#111A18', border: '1px solid #EF444440' }}>
            <XCircle size={56} className="mx-auto mb-4"
              style={{ color: '#EF4444' }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: '#F0F7F4' }}>
              Invalid Link
            </h2>
            <p className="mb-6" style={{ color: '#6B8F82' }}>
              This verification link is invalid. Log in and request a new one.
            </p>
            <button onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}