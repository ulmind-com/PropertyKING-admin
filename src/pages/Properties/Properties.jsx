import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import './Properties.css';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { load(); }, [page, statusFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await adminAPI.properties(params);
      setProperties(res.data.properties);
      setTotal(res.data.total);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try { await adminAPI.approveProperty(id); toast.success('Approved!'); load(); } catch(e) { toast.error('Failed'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason (min 10 chars):');
    if (!reason || reason.length < 10) return toast.error('Reason must be at least 10 characters');
    try { await adminAPI.rejectProperty(id, reason); toast.success('Rejected'); load(); } catch(e) { toast.error('Failed'); }
  };

  const statusColors = { active: 'badge-success', pending: 'badge-warning', rejected: 'badge-error', sold: 'badge-info', rented: 'badge-info', expired: 'badge-error', draft: 'badge-info' };

  return (
    <div>
      <h1 className="page-title">Properties</h1>
      <p className="page-subtitle">{total} total properties</p>

      <div className="toolbar">
        <div className="toolbar-search"><Search size={16} /><input placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} /></div>
        <div className="toolbar-filters">
          {['', 'pending', 'active', 'rejected', 'sold'].map(s => (
            <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="data-table card">
        <table>
          <thead><tr><th>Property</th><th>Price</th><th>Location</th><th>Lister</th><th>Status</th><th>Views</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{textAlign:'center',padding:40}}>Loading...</td></tr> :
              properties.length === 0 ? <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>No properties found</td></tr> :
              properties.map(p => (
                <tr key={p.id}>
                  <td><div className="prop-cell"><img src={p.image || 'https://via.placeholder.com/60x40'} alt="" className="prop-thumb" /><div><span className="prop-title">{p.title}</span><span className="prop-type">{p.property_type || p.listing_type}</span></div></div></td>
                  <td className="price-cell">${p.price?.toLocaleString()}</td>
                  <td>{p.city}, {p.state}</td>
                  <td><span className="lister-name">{p.lister_name || '—'}</span></td>
                  <td><span className={`badge ${statusColors[p.status] || 'badge-info'}`}>{p.status}</span></td>
                  <td>{p.views || 0}</td>
                  <td>
                    <div className="action-btns">
                      {p.status === 'pending' && <>
                        <button className="btn btn-sm btn-success" onClick={() => handleApprove(p.id)} title="Approve"><CheckCircle size={14} /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleReject(p.id)} title="Reject"><XCircle size={14} /></button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
