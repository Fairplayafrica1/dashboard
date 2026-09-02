import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../../api/auth';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import logo from '../../assets/img/logo.png';

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      setAuth(data.user, data.token);
      toast.success(`Welcome to FairPlay Africa, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0F0E' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ backgroundColor: '#111A18' }}>
        <img src={logo} alt="FairPlay Africa" className="w-16 h-16 object-contain" />
        <div>
          <h1 className="text-4xl font-bold mb-6" style={{ color: '#F0F7F4' }}>
            Your content.<br />
            <span style={{ color: '#1B9E85' }}>Your rights. Protected.</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: '#6B8F82' }}>
            Join hundreds of African filmmakers using FairPlayAfrica to automatically
            detect and remove pirated copies of their work from YouTube.
          </p>
          <div className="mt-12 space-y-4">
            {[
              'Upload your movie once — we scan YouTube automatically',
              'Get instant alerts when piracy is detected',
              'Send DMCA takedowns with one click',
              'Track every infringement from your dashboard',
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                  style={{ backgroundColor: '#1B9E85' }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p style={{ color: '#6B8F82' }}>{feature}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm" style={{ color: '#6B8F82' }}>© 2026 FairPlay Africa. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <img src={logo} alt="FairPlay Africa" className="w-16 h-16 object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#F0F7F4' }}>Create your account</h2>
            <p style={{ color: '#6B8F82' }}>Start protecting your films today — it's free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>Full name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Warris Ibrahim"
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832', color: '#F0F7F4' }}
                onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
                onBlur={(e) => e.target.style.borderColor = '#2A3832'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832', color: '#F0F7F4' }}
                onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
                onBlur={(e) => e.target.style.borderColor = '#2A3832'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all pr-12"
                  style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832', color: '#F0F7F4' }}
                  onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
                  onBlur={(e) => e.target.style.borderColor = '#2A3832'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#6B8F82' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all mt-2"
              style={{
                backgroundColor: loading ? '#0f5c4e' : '#1B9E85',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#6B8F82' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1B9E85' }} className="font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}