import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { loginUser } from '../../api/auth';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import logo from '../../assets/img/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
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
            Protect your films.<br />
            <span style={{ color: '#1B9E85' }}>Fight back against piracy.</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: '#6B8F82' }}>
            FairPlayAfrica gives African filmmakers the tools to detect, track, and take down
            pirated copies of their work on YouTube — automatically.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: 'Movies Protected', value: '2,400+' },
              { label: 'Takedowns Sent', value: '18,000+' },
              { label: 'Filmmakers', value: '340+' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl" style={{ backgroundColor: '#1A2622', border: '1px solid #2A3832' }}>
                <p className="text-2xl font-bold" style={{ color: '#1B9E85' }}>{stat.value}</p>
                <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>{stat.label}</p>
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
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#F0F7F4' }}>Welcome back</h2>
            <p style={{ color: '#6B8F82' }}>Sign in to your FairPlay Africa account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  backgroundColor: '#1A2622',
                  border: '1px solid #2A3832',
                  color: '#F0F7F4',
                }}
                onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
                onBlur={(e) => e.target.style.borderColor = '#2A3832'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#F0F7F4' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all pr-12"
                  style={{
                    backgroundColor: '#1A2622',
                    border: '1px solid #2A3832',
                    color: '#F0F7F4',
                  }}
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#6B8F82' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1B9E85' }} className="font-medium hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}