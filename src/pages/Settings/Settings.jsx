import { useState } from 'react';
import { User, Lock, Shield, Server, Database, Globe, Save } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const user = JSON.parse(localStorage.getItem('pk_admin_user') || '{}');
  const [profileForm, setProfileForm] = useState({ full_name: user.full_name || '', phone: user.phone || '' });
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [healthData, setHealthData] = useState(null);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileForm.full_name) return toast.error('Name is required');
    setProfileLoading(true);
    try {
      await api.put('/users/me', profileForm);
      const updatedUser = { ...user, ...profileForm };
      localStorage.setItem('pk_admin_user', JSON.stringify(updatedUser));
      toast.success('Profile updated!');
    } catch(e) { toast.error('Failed to update profile'); } finally { setProfileLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passForm.current || !passForm.newPass) return toast.error('Fill all fields');
    if (passForm.newPass.length < 6) return toast.error('New password must be at least 6 characters');
    if (passForm.newPass !== passForm.confirm) return toast.error('Passwords do not match');
    setPassLoading(true);
    try {
      await api.put('/users/me/password', { current_password: passForm.current, new_password: passForm.newPass });
      toast.success('Password changed!');
      setPassForm({ current: '', newPass: '', confirm: '' });
    } catch(e) { toast.error(e.response?.data?.detail || 'Failed to change password'); } finally { setPassLoading(false); }
  };

  const checkHealth = async () => {
    try {
      const base = (import.meta.env.VITE_API_URL || '').replace('/api/v1', '');
      const res = await api.get(base + '/health');
      setHealthData(res.data);
    } catch(e) { setHealthData({ status: 'error', database: 'unknown' }); }
  };

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Manage your admin account and platform</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:900}}>
        {/* Profile */}
        <div className="card">
          <h3 style={{marginBottom:20,display:'flex',alignItems:'center',gap:8}}><User size={18} style={{color:'var(--primary)'}} /> Admin Profile</h3>
          <form onSubmit={handleProfileUpdate} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:8}}>
              <div style={{width:56,height:56,borderRadius:'50%',background:'var(--primary-gradient)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:20,boxShadow:'0 0 0 3px var(--bg-card), 0 0 0 5px rgba(37,99,235,0.3)'}}>
                {profileForm.full_name?.[0] || 'A'}
              </div>
              <div>
                <div style={{fontWeight:600,fontSize:15}}>{profileForm.full_name || 'Admin'}</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>{user.email}</div>
                <span className="badge badge-error" style={{marginTop:4}}>admin</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="input" value={profileForm.full_name} onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="+91 XXXXXXXXXX" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" value={user.email || ''} disabled style={{opacity:0.6}} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? <div className="spinner" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>

        {/* Password + System */}
        <div style={{display:'flex',flexDirection:'column',gap:24}}>
          {/* Change Password */}
          <div className="card">
            <h3 style={{marginBottom:20,display:'flex',alignItems:'center',gap:8}}><Lock size={18} style={{color:'var(--warning)'}} /> Change Password</h3>
            <form onSubmit={handlePasswordChange} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="input" type="password" value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="input" type="password" value={passForm.newPass} onChange={e => setPassForm({...passForm, newPass: e.target.value})} placeholder="Min 6 characters" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="input" type="password" value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={passLoading}>
                {passLoading ? <div className="spinner" /> : <><Shield size={16} /> Update Password</>}
              </button>
            </form>
          </div>

          {/* System Info */}
          <div className="card">
            <h3 style={{marginBottom:16,display:'flex',alignItems:'center',gap:8}}><Server size={18} style={{color:'var(--success)'}} /> System Info</h3>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                <span style={{color:'var(--text-muted)',display:'flex',alignItems:'center',gap:6}}><Globe size={14} /> API URL</span>
                <span style={{color:'var(--text-secondary)',fontSize:11}}>{import.meta.env.VITE_API_URL || 'localhost'}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                <span style={{color:'var(--text-muted)',display:'flex',alignItems:'center',gap:6}}><Database size={14} /> Database</span>
                <span className={`badge ${healthData?.database === 'connected' ? 'badge-success' : 'badge-info'}`}>
                  {healthData?.database || 'Unknown'}
                </span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
                <span style={{color:'var(--text-muted)',display:'flex',alignItems:'center',gap:6}}><Server size={14} /> Status</span>
                <span className={`badge ${healthData?.status === 'healthy' ? 'badge-success' : 'badge-info'}`}>
                  {healthData?.status || 'Unknown'}
                </span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={checkHealth} style={{marginTop:4}}>Check Health</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
