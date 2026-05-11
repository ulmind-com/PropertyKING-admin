import { useState, useEffect } from 'react';
import { Building2, Users, Eye, Heart, MessageSquare, Star, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminAPI } from '../../api';
import './Dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);
  const loadDashboard = async () => {
    try { const res = await adminAPI.dashboard(); setData(res.data); } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

  if (loading) return <div className="dashboard"><h1 className="page-title">Dashboard</h1><div className="stats-grid">{Array(6).fill(0).map((_,i) => <div key={i} className="card stat-card" style={{height:100,opacity:0.5}} />)}</div></div>;

  const stats = [
    { label: 'Total Properties', value: data?.properties?.total || 0, icon: <Building2 size={22} />, color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
    { label: 'Active Listings', value: data?.properties?.active || 0, icon: <TrendingUp size={22} />, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Pending Review', value: data?.properties?.pending || 0, icon: <Clock size={22} />, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Total Users', value: data?.users?.total || 0, icon: <Users size={22} />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
    { label: 'Total Inquiries', value: data?.inquiries?.total || 0, icon: <MessageSquare size={22} />, color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
    { label: 'Total Favorites', value: data?.favorites || 0, icon: <Heart size={22} />, color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  ];

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Overview of your PropertyKING platform</p>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="card stat-card animate-in" style={{animationDelay: `${i*0.05}s`}}>
            <div className="stat-icon" style={{background: s.bg, color: s.color}}>{s.icon}</div>
            <div className="stat-info"><span className="stat-value">{s.value.toLocaleString()}</span><span className="stat-label">{s.label}</span></div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="card chart-card animate-in">
          <h3>Properties by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.by_type || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="type" tick={{fill:'#94A3B8',fontSize:11}} axisLine={{stroke:'rgba(255,255,255,0.06)'}} />
              <YAxis tick={{fill:'#94A3B8',fontSize:11}} axisLine={{stroke:'rgba(255,255,255,0.06)'}} />
              <Tooltip contentStyle={{background:'#1A2035',border:'1px solid #1E293B',borderRadius:8,color:'#F1F5F9',fontSize:13}} />
              <Bar dataKey="count" fill="#2563EB" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card animate-in" style={{animationDelay:'0.1s'}}>
          <h3>Listing Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data?.by_listing_type || []} cx="50%" cy="50%" outerRadius={100} innerRadius={60} dataKey="count" nameKey="type" label={({type,count}) => `${type}: ${count}`}>
                {(data?.by_listing_type || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{background:'#1A2035',border:'1px solid #1E293B',borderRadius:8,color:'#F1F5F9',fontSize:13}} />
            </PieChart>
          </ResponsiveContainer>
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
    </div>
  );
}
