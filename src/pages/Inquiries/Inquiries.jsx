import { useState, useEffect } from 'react';
import { Search, MessageSquare, Building2, User, Clock, Calendar, Phone, Mail } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer/Drawer';
import Pagination from '../../components/Pagination/Pagination';
import EmptyState from '../../components/EmptyState/EmptyState';
import { SkeletonTable } from '../../components/Skeleton/Skeleton';

function timeAgo(date) {
  if (!date) return '—';
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 604800) return `${Math.floor(s/86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { load(); }, [page, statusFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      // Use admin properties endpoint to get all inquiries indirectly
      // or use the received inquiries endpoint with admin token
      const res = await api.get('/inquiries/received', { params });
      setInquiries(res.data.inquiries || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.total_pages || 0);
    } catch(e) {
      console.error(e);
      setInquiries([]);
    } finally { setLoading(false); }
  };

  const openDrawer = (inq) => { setSelected(inq); setDrawerOpen(true); };

  const statusColors = { pending: 'badge-warning', responded: 'badge-success', closed: 'badge-info' };
  const typeLabels = { general: 'General', visit: 'Site Visit', offer: 'Make Offer', info: 'Info Request' };

  return (
    <div>
      <h1 className="page-title">Inquiries</h1>
      <p className="page-subtitle">{total} total inquiries</p>

      <div className="toolbar">
        <div className="toolbar-filters">
          {['', 'pending', 'responded'].map(s => (
            <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <SkeletonTable rows={6} cols={6} /> : inquiries.length === 0 ? (
        <div className="card"><EmptyState icon={MessageSquare} title="No inquiries yet" description="Inquiries from users will appear here" /></div>
      ) : (
        <div className="card data-table">
          <table>
            <thead><tr><th>Property</th><th>From</th><th>Type</th><th>Message</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {inquiries.map(inq => (
                <tr key={inq.id} className="clickable-row" onClick={() => openDrawer(inq)}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <Building2 size={14} style={{color:'var(--primary)',flexShrink:0}} />
                      <span style={{fontSize:13,fontWeight:500,maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{inq.property_title || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      {inq.user_avatar ? <img src={inq.user_avatar} style={{width:24,height:24,borderRadius:'50%',objectFit:'cover'}} alt="" /> :
                        <div style={{width:24,height:24,borderRadius:'50%',background:'var(--primary-light)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>{inq.user_name?.[0] || '?'}</div>}
                      <span style={{fontSize:12}}>{inq.user_name || inq.user_email || '—'}</span>
                    </div>
                  </td>
                  <td><span style={{fontSize:12,textTransform:'capitalize',color:'var(--text-secondary)'}}>{typeLabels[inq.inquiry_type] || inq.inquiry_type}</span></td>
                  <td style={{fontSize:12,color:'var(--text-muted)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{inq.message}</td>
                  <td><span className={`badge ${statusColors[inq.status] || 'badge-info'}`}>{inq.status}</span></td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{timeAgo(inq.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Inquiry Detail Drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Inquiry Details" width={480}>
        {selected && (
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            {/* Property */}
            <div style={{padding:16,background:'var(--bg-elevated)',borderRadius:'var(--radius-sm)'}}>
              <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}}>Property</div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <Building2 size={18} style={{color:'var(--primary)'}} />
                <span style={{fontSize:15,fontWeight:600}}>{selected.property_title || 'Unknown Property'}</span>
              </div>
            </div>

            {/* From user */}
            <div style={{padding:16,background:'var(--bg-elevated)',borderRadius:'var(--radius-sm)'}}>
              <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.05em'}}>From</div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                {selected.user_avatar ? <img src={selected.user_avatar} style={{width:36,height:36,borderRadius:'50%',objectFit:'cover'}} alt="" /> :
                  <div style={{width:36,height:36,borderRadius:'50%',background:'var(--primary-gradient)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14}}>{selected.user_name?.[0] || '?'}</div>}
                <div>
                  <div style={{fontWeight:600,fontSize:14}}>{selected.user_name || 'Unknown User'}</div>
                  {selected.user_email && <div style={{fontSize:12,color:'var(--text-muted)'}}>{selected.user_email}</div>}
                </div>
              </div>
            </div>

            {/* Details */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="pd-item"><Clock size={14} /><span>Type</span><strong style={{textTransform:'capitalize'}}>{typeLabels[selected.inquiry_type] || selected.inquiry_type}</strong></div>
              <div className="pd-item"><Calendar size={14} /><span>Date</span><strong>{selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '—'}</strong></div>
              {selected.contact_phone && <div className="pd-item"><Phone size={14} /><span>Phone</span><strong>{selected.contact_phone}</strong></div>}
              {selected.preferred_date && <div className="pd-item"><Calendar size={14} /><span>Preferred Date</span><strong>{selected.preferred_date}</strong></div>}
            </div>

            {/* Message */}
            <div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:8,fontWeight:600}}>Message</div>
              <div style={{padding:16,background:'var(--bg-input)',borderRadius:'var(--radius-sm)',fontSize:13,lineHeight:1.6,color:'var(--text-secondary)',border:'1px solid var(--border)'}}>
                {selected.message}
              </div>
            </div>

            {/* Response */}
            {selected.response && (
              <div>
                <div style={{fontSize:12,color:'var(--success)',marginBottom:8,fontWeight:600}}>Response</div>
                <div style={{padding:16,background:'var(--success-light)',borderRadius:'var(--radius-sm)',fontSize:13,lineHeight:1.6,color:'#34D399'}}>
                  {selected.response}
                </div>
              </div>
            )}

            {/* Status */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'var(--bg-elevated)',borderRadius:'var(--radius-sm)'}}>
              <span style={{fontSize:13,color:'var(--text-secondary)'}}>Status</span>
              <span className={`badge ${statusColors[selected.status] || 'badge-info'}`}>{selected.status}</span>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
