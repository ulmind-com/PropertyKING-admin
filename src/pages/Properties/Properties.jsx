import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, MapPin, Calendar, User, DollarSign, Heart, MessageSquare, Trash2 } from 'lucide-react';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import Drawer from '../../components/Drawer/Drawer';
import Modal from '../../components/Modal/Modal';
import Pagination from '../../components/Pagination/Pagination';
import EmptyState from '../../components/EmptyState/EmptyState';
import { SkeletonTable } from '../../components/Skeleton/Skeleton';
import './Properties.css';

function timeAgo(date) {
  if (!date) return '—';
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 604800) return `${Math.floor(s/86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function Properties({ reviewMode }) {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(reviewMode ? 'pending' : '');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', id: null });
  const [actionReason, setActionReason] = useState('');

  useEffect(() => { load(); }, [page, statusFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      adminAPI.propertiesCount({ status: statusFilter, search }).then(countRes => {
        setTotal(countRes.data.total);
        setTotalPages(Math.ceil(countRes.data.total / 10));
      }).catch(console.error);

      const res = await adminAPI.properties(params);
      setProperties(res.data.properties);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try { await adminAPI.approveProperty(id); toast.success('Property approved!'); load(); setDrawerOpen(false); } catch(e) { toast.error('Failed to approve'); }
  };

  const handleReject = (id) => {
    setActionReason('');
    setActionModal({ isOpen: true, type: 'reject', id });
  };

  const handleDelete = (id) => {
    setActionReason('');
    setActionModal({ isOpen: true, type: 'delete', id });
  };

  const handleActionSubmit = async () => {
    if (actionReason.length < 10) return toast.error('Reason must be at least 10 characters');
    const { type, id } = actionModal;
    try {
      if (type === 'reject') {
        await adminAPI.rejectProperty(id, actionReason);
        toast.success('Property rejected');
      } else {
        await adminAPI.deleteProperty(id, actionReason);
        toast.success('Property deleted permanently');
      }
      load();
      setDrawerOpen(false);
      setActionModal({ isOpen: false, type: '', id: null });
    } catch (e) {
      toast.error(`Failed to ${type} property`);
    }
  };

  const openDrawer = (p) => { setSelected(p); setDrawerOpen(true); };

  const statusColors = { active: 'badge-success', pending: 'badge-warning', rejected: 'badge-error', sold: 'badge-info', rented: 'badge-info', expired: 'badge-error', draft: 'badge-info' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{reviewMode ? 'Review Queue' : 'Properties'}</h1>
          <p className="page-subtitle">{total} {reviewMode ? 'pending review' : 'total properties'}</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <Search size={16} />
          <input placeholder="Search by title or city..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
        </div>
        {!reviewMode && (
          <div className="toolbar-filters">
            {['', 'pending', 'active', 'rejected', 'sold'].map(s => (
              <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setStatusFilter(s); setPage(1); }}>
                {s || 'All'}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? <SkeletonTable rows={8} cols={7} /> : properties.length === 0 ? (
        <div className="card"><EmptyState title="No properties found" description={reviewMode ? 'No properties pending review' : 'Try adjusting your filters'} /></div>
      ) : (
        <div className="data-table card">
          <table>
            <thead>
              <tr><th>Property</th><th>Price</th><th>Location</th><th>Lister</th><th>Status</th><th>Stats</th><th>Added</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {properties.map(p => (
                <tr key={p.id} className="clickable-row" onClick={() => openDrawer(p)}>
                  <td>
                    <div className="prop-cell">
                      <img src={p.image || 'https://via.placeholder.com/56x40/1A2035/64748B?text=N/A'} alt="" className="prop-thumb" />
                      <div>
                        <span className="prop-title">{p.title}</span>
                        <span className="prop-type">{p.property_type || p.listing_type}</span>
                      </div>
                    </div>
                  </td>
                  <td className="price-cell">${p.price?.toLocaleString()}</td>
                  <td><span style={{fontSize:12}}>{p.city}{p.state ? `, ${p.state}` : ''}</span></td>
                  <td><span className="lister-name">{p.lister_name || '—'}</span></td>
                  <td><span className={`badge ${statusColors[p.status] || 'badge-info'}`}>{p.status}</span></td>
                  <td>
                    <div style={{display:'flex',gap:10,fontSize:11,color:'var(--text-muted)'}}>
                      <span title="Views"><Eye size={12} /> {p.views || 0}</span>
                      <span title="Favorites"><Heart size={12} /> {p.favorites || 0}</span>
                      <span title="Inquiries"><MessageSquare size={12} /> {p.inquiries || 0}</span>
                    </div>
                  </td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{timeAgo(p.created_at)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="action-btns">
                      {p.status === 'pending' ? (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => handleApprove(p.id)} title="Approve"><CheckCircle size={14} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleReject(p.id)} title="Reject"><XCircle size={14} /></button>
                        </>
                      ) : (
                        <button className="btn btn-sm btn-outline" style={{borderColor:'var(--error)',color:'var(--error)'}} onClick={() => handleDelete(p.id)} title="Delete Property">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Property Detail Drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Property Details" width={520}>
        {selected && (
          <div className="prop-detail">
            {selected.image && <img src={selected.image} alt="" className="pd-image" />}
            <h3 className="pd-title">{selected.title}</h3>
            <span className={`badge ${statusColors[selected.status]}`} style={{marginBottom:16}}>{selected.status}</span>

            <div className="pd-grid">
              <div className="pd-item"><DollarSign size={14} /><span>Price</span><strong>${selected.price?.toLocaleString()}</strong></div>
              <div className="pd-item"><MapPin size={14} /><span>Location</span><strong>{selected.city}{selected.state ? `, ${selected.state}` : ''}</strong></div>
              <div className="pd-item"><User size={14} /><span>Lister</span><strong>{selected.lister_name || '—'}</strong></div>
              <div className="pd-item"><Calendar size={14} /><span>Listed</span><strong>{timeAgo(selected.created_at)}</strong></div>
            </div>

            {selected.lister_email && (
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:8}}>Email: {selected.lister_email}</div>
            )}

            <div className="pd-stats">
              <div><Eye size={14} /><span>{selected.views || 0} views</span></div>
              <div><Heart size={14} /><span>{selected.favorites || 0} favs</span></div>
              <div><MessageSquare size={14} /><span>{selected.inquiries || 0} inquiries</span></div>
            </div>

            {selected.admin_review?.rejection_reason && (
              <div className="pd-rejection">
                <strong>Rejection Reason:</strong>
                <p>{selected.admin_review.rejection_reason}</p>
              </div>
            )}

            {selected.status === 'pending' ? (
              <div className="pd-actions">
                <button className="btn btn-success" onClick={() => handleApprove(selected.id)}><CheckCircle size={16} /> Approve</button>
                <button className="btn btn-danger" onClick={() => handleReject(selected.id)}><XCircle size={16} /> Reject</button>
              </div>
            ) : (
              <div className="pd-actions" style={{marginTop: 16}}>
                <button className="btn btn-outline" style={{borderColor:'var(--error)',color:'var(--error)',width:'100%'}} onClick={() => handleDelete(selected.id)}>
                  <Trash2 size={16} /> Permanently Delete Property
                </button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Action Reason Modal */}
      <Modal isOpen={actionModal.isOpen} onClose={() => setActionModal({ isOpen: false, type: '', id: null })} title={actionModal.type === 'reject' ? 'Reject Property' : 'Delete Property'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {actionModal.type === 'reject' 
              ? 'Please provide a reason for rejecting this property. This will be sent to the lister. (Min 10 chars)' 
              : 'Please enter a reason for permanently deleting this property. This will be emailed to the lister. (Min 10 chars)'}
          </p>
          <textarea
            className="input"
            rows={4}
            placeholder="Enter reason..."
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button className="btn btn-outline" onClick={() => setActionModal({ isOpen: false, type: '', id: null })}>Cancel</button>
            <button className="btn btn-danger" onClick={handleActionSubmit}>{actionModal.type === 'reject' ? 'Reject Property' : 'Delete Property'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
