import { useState } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwords, setPasswords] = useState({
    current: '', newPass: '', confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false, newPass: false, confirm: false,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const inputStyle = {
    backgroundColor: '#1A2622',
    border: '1px solid #2A3832',
    color: '#F0F7F4',
  };

  const handleSaveProfile = async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return; }
    setSavingProfile(true);
    try {
      const { data } = await api.patch('/auth/profile', form);
      setUser(data.user);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally { setSavingProfile(false); }
  };

  const handleSavePassword = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      toast.error('Fill in all password fields'); return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match'); return;
    }
    if (passwords.newPass.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setSavingPassword(true);
    try {
      await api.patch('/auth/password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      setPasswords({ current: '', newPass: '', confirm: '' });
      toast.success('Password updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed');
    } finally { setSavingPassword(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#F0F7F4' }}>Profile Settings</h2>
        <p className="text-sm mt-1" style={{ color: '#6B8F82' }}>
          Manage your account information
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 p-6 rounded-2xl"
        style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold" style={{ color: '#F0F7F4' }}>{user?.name}</p>
          <p className="text-sm" style={{ color: '#6B8F82' }}>{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#1B9E8520', color: '#1B9E85' }}>
              {user?.plan} plan
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: user?.verificationStatus === 'verified' ? '#22C55E20' : '#F59E0B20',
                color: user?.verificationStatus === 'verified' ? '#22C55E' : '#F59E0B',
              }}>
              {user?.verificationStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="p-6 rounded-2xl space-y-4"
        style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <h3 className="font-semibold flex items-center gap-2" style={{ color: '#F0F7F4' }}>
          <User size={16} style={{ color: '#1B9E85' }} />
          Personal Information
        </h3>
        <div>
          <label className="block text-sm mb-2" style={{ color: '#6B8F82' }}>Full Name</label>
          <input type="text" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl outline-none"
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
            onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
        </div>
        <div>
          <label className="block text-sm mb-2" style={{ color: '#6B8F82' }}>Email Address</label>
          <input type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl outline-none"
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
            onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
        </div>
        <button onClick={handleSaveProfile} disabled={savingProfile}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
          <Save size={15} />
          {savingProfile ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Password */}
      <div className="p-6 rounded-2xl space-y-4"
        style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <h3 className="font-semibold flex items-center gap-2" style={{ color: '#F0F7F4' }}>
          <Lock size={16} style={{ color: '#1B9E85' }} />
          Change Password
        </h3>
        {[
          { key: 'current', label: 'Current Password' },
          { key: 'newPass', label: 'New Password' },
          { key: 'confirm', label: 'Confirm New Password' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm mb-2" style={{ color: '#6B8F82' }}>{label}</label>
            <div className="relative">
              <input
                type={showPasswords[key] ? 'text' : 'password'}
                value={passwords[key]}
                onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl outline-none pr-12"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#1B9E85'}
                onBlur={(e) => e.target.style.borderColor = '#2A3832'} />
              <button type="button"
                onClick={() => setShowPasswords((p) => ({ ...p, [key]: !p[key] }))}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: '#6B8F82' }}>
                {showPasswords[key] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        ))}
        <button onClick={handleSavePassword} disabled={savingPassword}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: '#1B9E85', color: '#fff' }}>
          <Save size={15} />
          {savingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </div>

      {/* Account info */}
      <div className="p-6 rounded-2xl"
        style={{ backgroundColor: '#111A18', border: '1px solid #2A3832' }}>
        <h3 className="font-semibold mb-4" style={{ color: '#F0F7F4' }}>Account Details</h3>
        <div className="space-y-3">
          {[
            { label: 'Account ID', value: user?._id },
            { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString() },
            { label: 'Account Status', value: user?.accountStatus },
            { label: 'Verification', value: user?.verificationStatus },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid #2A3832' }}>
              <p className="text-sm" style={{ color: '#6B8F82' }}>{label}</p>
              <p className="text-sm font-mono" style={{ color: '#F0F7F4' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}