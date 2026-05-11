import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Lock, Mail } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import './Login.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { access_token, user } = res.data;
      if (user.role !== 'admin') { toast.error('Admin access only'); setLoading(false); return; }
      localStorage.setItem('pk_admin_token', access_token);
      localStorage.setItem('pk_admin_user', JSON.stringify(user));
      toast.success('Welcome, Admin!');
      navigate('/');
    } catch (e) { toast.error(e.response?.data?.detail || 'Login failed'); } finally { setLoading(false); }
  };

  return (
    <div className="admin-login">
      <div className="login-card animate-in">
        <div className="login-logo"><div className="logo-icon"><Home size={22} /></div><span>Property<b>KING</b></span></div>
        <h1>Admin Panel</h1>
        <p>Sign in to manage your platform</p>
        <form onSubmit={handleSubmit}>
          <div className="login-field"><Mail size={16} /><input type="email" className="input" placeholder="admin@propertyking.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div className="login-field"><Lock size={16} /><input type="password" className="input" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
          <button type="submit" className="btn btn-primary" style={{width:'100%',padding:'12px',marginTop:8}} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}
