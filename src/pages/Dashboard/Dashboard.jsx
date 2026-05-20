import { useState, useEffect, useRef } from 'react';
import { Building2, Users, Heart, MessageSquare, Clock, TrendingUp, CheckCircle, Eye, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { adminAPI } from '../../api';
import { SkeletonCards } from '../../components/Skeleton/Skeleton';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function AnimatedCounter({ value, duration = 1000 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.floor(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadDashboard(); }, []);
  const loadDashboard = async () => {
    try { const res = await adminAPI.dashboard(); setData(res.data); } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
  const tooltipStyle = { background: '#1A2035', border: '1px solid #1E293B', borderRadius: 8, color: '#F1F5F9', fontSize: 13 };

  if (loading) return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Loading platform analytics...</p>
      <SkeletonCards count={6} />
    </div>
  );

  const stats = [
    { label: 'Total Properties', value: data?.properties?.total || 0, icon: <Building2 size={22} />, color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
    { label: 'Active Listings', value: data?.properties?.active || 0, icon: <TrendingUp size={22} />, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Pending Review', value: data?.properties?.pending || 0, icon: <Clock size={22} />, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', highlight: (data?.properties?.pending || 0) > 0 },
    { label: 'Total Users', value: data?.users?.total || 0, icon: <Users size={22} />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
    { label: 'Total Inquiries', value: data?.inquiries?.total || 0, icon: <MessageSquare size={22} />, color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
    { label: 'Total Favorites', value: data?.favorites || 0, icon: <Heart size={22} />, color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  ];

  const quickActions = [
    { label: 'Review Pending', desc: `${data?.properties?.pending || 0} properties waiting`, icon: <CheckCircle size={18} />, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', to: '/review-queue' },
    { label: 'Manage Users', desc: `${data?.users?.total || 0} registered`, icon: <Users size={18} />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', to: '/users' },
    { label: 'View Properties', desc: `${data?.properties?.active || 0} active`, icon: <Building2 size={18} />, color: '#2563EB', bg: 'rgba(37,99,235,0.12)', to: '/properties' },
    { label: 'View Inquiries', desc: `${data?.inquiries?.pending || 0} pending`, icon: <MessageSquare size={18} />, color: '#EC4899', bg: 'rgba(236,72,153,0.12)', to: '/inquiries' },
  ];

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Overview of your PropertyKING platform</p>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className={`card stat-card glow-hover animate-in ${s.highlight ? 'stat-highlight' : ''}`} style={{animationDelay: `${i*0.05}s`}}>
            <div className="stat-icon" style={{background: s.bg, color: s.color}}>{s.icon}</div>
            <div className="stat-info">
              <span className="stat-value"><AnimatedCounter value={s.value} /></span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-grid">
        {quickActions.map((qa, i) => (
          <button key={i} className="quick-action animate-in" style={{animationDelay: `${(i+6)*0.05}s`}} onClick={() => navigate(qa.to)}>
            <div className="qa-icon" style={{background: qa.bg, color: qa.color}}>{qa.icon}</div>
            <div style={{flex:1,textAlign:'left'}}>
              <div style={{fontWeight:600,color:'var(--text)'}}>{qa.label}</div>
              <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{qa.desc}</div>
            </div>
            <ArrowRight size={16} style={{color:'var(--text-muted)'}} />
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="card chart-card animate-in">
          <h3>Properties by Type</h3>
          {(data?.by_type?.length || 0) > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.by_type}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="type" tick={{fill:'#94A3B8',fontSize:11}} axisLine={{stroke:'rgba(255,255,255,0.06)'}} />
                <YAxis tick={{fill:'#94A3B8',fontSize:11}} axisLine={{stroke:'rgba(255,255,255,0.06)'}} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#2563EB" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No property data yet</p></div>}
        </div>

        <div className="card chart-card animate-in" style={{animationDelay:'0.1s'}}>
          <h3>Listing Types</h3>
          {(data?.by_listing_type?.length || 0) > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.by_listing_type} cx="50%" cy="50%" outerRadius={100} innerRadius={60} dataKey="count" nameKey="type" label={({type,count}) => `${type}: ${count}`}>
                  {data.by_listing_type.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No listing data yet</p></div>}
        </div>
      </div>

      {/* Top States */}
      {data?.by_state?.length > 0 && (
        <div className="card animate-in" style={{animationDelay:'0.15s'}}>
          <h3 style={{marginBottom:16}}>Top States</h3>
          <div className="state-bars">
            {data.by_state.map((s, i) => (
              <div key={i} className="state-bar-row">
                <span className="sb-label">{s.state}</span>
                <div className="sb-track"><div className="sb-fill" style={{width: `${(s.count / data.by_state[0].count) * 100}%`, background: COLORS[i % COLORS.length]}} /></div>
                <span className="sb-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Status Summary */}
      <div className="card animate-in" style={{animationDelay:'0.2s', marginTop: 16}}>
        <h3 style={{marginBottom:16}}>Property Status Summary</h3>
        <div className="status-summary-grid">
          {[
            { label: 'Active', value: data?.properties?.active || 0, color: '#10B981' },
            { label: 'Pending', value: data?.properties?.pending || 0, color: '#F59E0B' },
            { label: 'Rejected', value: data?.properties?.rejected || 0, color: '#EF4444' },
            { label: 'Sold', value: data?.properties?.sold || 0, color: '#2563EB' },
          ].map((s, i) => (
            <div key={i} className="status-summary-item">
              <div className="ss-bar" style={{background: s.color, width: `${Math.max(4, (s.value / Math.max(1, data?.properties?.total)) * 100)}%`}} />
              <div className="ss-info">
                <span className="ss-label">{s.label}</span>
                <span className="ss-value" style={{color: s.color}}>{s.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
