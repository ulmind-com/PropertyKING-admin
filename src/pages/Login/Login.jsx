import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import './Login.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 4) e.password = 'Password too short';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { access_token, user } = res.data;
      if (user.role !== 'admin') {
        toast.error('Access denied. Admin credentials required.');
        setLoading(false);
        return;
      }
      localStorage.setItem('pk_admin_token', access_token);
      localStorage.setItem('pk_admin_user', JSON.stringify(user));
      if (remember) localStorage.setItem('pk_admin_remember', form.email);
      toast.success(`Welcome back, ${user.full_name}!`);
      navigate('/');
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0].msg : (detail || 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-bg" />
      <div className="login-card animate-in">
        <div className="login-logo">
          <div className="logo-icon"><Home size={22} /></div>
          <span>Property<b>KING</b></span>
        </div>
        <h1>Admin Panel</h1>
        <p>Sign in to manage your platform</p>
        <form onSubmit={handleSubmit}>
          <div className="login-field-group">
            <div className={`login-field ${errors.email ? 'has-error' : ''}`}>
              <Mail size={16} />
              <input
                type="email"
                className="input"
                placeholder="admin@propertyking.com"
                value={form.email}
                onChange={e => { setForm({...form, email: e.target.value}); setErrors({...errors, email: ''}); }}
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="login-field-group">
            <div className={`login-field ${errors.password ? 'has-error' : ''}`}>
              <Lock size={16} />
              <input
                type={showPass ? 'text' : 'password'}
                className="input"
                placeholder="Password"
                value={form.password}
                onChange={e => { setForm({...form, password: e.target.value}); setErrors({...errors, password: ''}); }}
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <label className="remember-check">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            <span>Remember me</span>
          </label>
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? <div className="spinner" /> : 'Sign In'}
          </button>
        </form>
        <div className="login-footer">
          <span>PropertyKING Admin v1.0</span>
        </div>
      </div>
    </div>
  );
}
