import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, MapPin, Calendar, User, DollarSign, Heart, MessageSquare, Trash2, Bed, Bath, Maximize2, Building2, Car, Mail, Phone, Video, FileImage, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [imgIndex, setImgIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

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
    if (!actionReason.trim()) return toast.error('Please enter a reason');
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

  const openDrawer = (p) => { setSelected(p); setImgIndex(0); setDrawerOpen(true); };

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
                      {(p.status === 'pending' || p.status === 'rejected') && (
                        <button className="btn btn-sm btn-success" onClick={() => handleApprove(p.id)} title="Approve"><CheckCircle size={14} /></button>
                      )}
                      {p.status === 'pending' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleReject(p.id)} title="Reject"><XCircle size={14} /></button>
                      )}
                      {p.status !== 'pending' && (
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

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Property Details" width={560}>
        {selected && (
          <div className="prop-detail">
            {/* Image Gallery */}
            {selected.images && selected.images.length > 0 && (
              <div className="pd-gallery">
                <img src={selected.images[imgIndex] || selected.image} alt="" className="pd-image pd-image-clickable" onClick={() => setLightbox(true)} />
                {selected.images.length > 1 && (
                  <div className="pd-thumbs">
                    {selected.images.map((img, i) => (
                      <img key={i} src={img} alt="" className={`pd-thumb ${i === imgIndex ? 'pd-thumb-active' : ''}`} onClick={() => setImgIndex(i)} />
                    ))}
                  </div>
                )}
              </div>
            )}
            {!selected.images?.length && selected.image && <img src={selected.image} alt="" className="pd-image pd-image-clickable" onClick={() => setLightbox(true)} />}

            {/* Title & Status */}
            <h3 className="pd-title">{selected.title}</h3>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12,flexWrap:'wrap'}}>
              <span className={`badge ${statusColors[selected.status]}`}>{selected.status}</span>
              {selected.property_type && <span className="badge badge-info">{selected.property_type}</span>}
              {selected.listing_type && <span className="badge badge-info" style={{textTransform:'capitalize'}}>{selected.listing_type}</span>}
            </div>

            {/* Description */}
            {selected.description && (
              <div className="pd-section">
                <h4 className="pd-section-title">Description</h4>
                <p className="pd-desc">{selected.description}</p>
              </div>
            )}

            {/* Price & Location Grid */}
            <div className="pd-grid">
              <div className="pd-item"><DollarSign size={14} /><span>Price</span><strong>{selected.currency === 'INR' ? '₹' : '$'}{selected.price?.toLocaleString()}</strong></div>
              <div className="pd-item"><MapPin size={14} /><span>Location</span><strong>{[selected.address, selected.city, selected.state, selected.zip_code].filter(Boolean).join(', ') || '—'}</strong></div>
            </div>

            {/* Property Specs */}
            {(selected.bedrooms || selected.bathrooms || selected.area_sqft || selected.year_built) && (
              <div className="pd-section">
                <h4 className="pd-section-title">Property Details</h4>
                <div className="pd-specs">
                  {selected.bedrooms != null && <div className="pd-spec"><Bed size={16} /><span>{selected.bedrooms} Beds</span></div>}
                  {selected.bathrooms != null && <div className="pd-spec"><Bath size={16} /><span>{selected.bathrooms} Baths</span></div>}
                  {selected.area_sqft != null && <div className="pd-spec"><Maximize2 size={16} /><span>{selected.area_sqft.toLocaleString()} sqft</span></div>}
                  {selected.year_built != null && <div className="pd-spec"><Calendar size={16} /><span>Built {selected.year_built}</span></div>}
                  {selected.stories != null && <div className="pd-spec"><Building2 size={16} /><span>{selected.stories} Stories</span></div>}
                  {selected.garage_spaces != null && selected.garage_spaces > 0 && <div className="pd-spec"><Car size={16} /><span>{selected.garage_spaces} Garage</span></div>}
                </div>
                {(selected.heating || selected.cooling) && (
                  <div style={{display:'flex',gap:12,marginTop:8,fontSize:12,color:'var(--text-muted)'}}>
                    {selected.heating && <span>🔥 Heating: {selected.heating}</span>}
                    {selected.cooling && <span>❄️ Cooling: {selected.cooling}</span>}
                  </div>
                )}
              </div>
            )}

            {/* Amenities */}
            {selected.amenities && selected.amenities.length > 0 && (
              <div className="pd-section">
                <h4 className="pd-section-title">Amenities</h4>
                <div className="pd-amenities">
                  {selected.amenities.map((a, i) => {
                    const name = typeof a === 'string' ? a : (a.name || a);
                    return <span key={i} className="pd-amenity-tag">{name}</span>;
                  })}
                </div>
              </div>
            )}

            {/* Map Link */}
            {selected.latitude && selected.longitude && (
              <div className="pd-section">
                <h4 className="pd-section-title">Map Location</h4>
                <a href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`} target="_blank" rel="noopener noreferrer" className="pd-map-link">
                  <MapPin size={14} /> Open in Google Maps ↗
                </a>
              </div>
            )}

            {/* Floor Plans */}
            {(() => {
              const plans = selected.floor_plan_urls?.length ? selected.floor_plan_urls : (selected.floor_plan_url ? [selected.floor_plan_url] : []);
              return plans.length > 0 && (
                <div className="pd-section">
                  <h4 className="pd-section-title"><FileImage size={14} style={{display:'inline',marginRight:6}} />Floor Plans ({plans.length})</h4>
                  <div className="pd-floor-plans">
                    {plans.map((url, i) => (
                      <img key={i} src={url} alt={`Floor Plan ${i+1}`} className="pd-floor-plan" onClick={() => window.open(url, '_blank')} />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Video Tour */}
            {selected.video_url && (() => {
              const url = selected.video_url;
              const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
              return (
                <div className="pd-section">
                  <h4 className="pd-section-title"><Video size={14} style={{display:'inline',marginRight:6}} />Video Tour</h4>
                  {ytMatch ? (
                    <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`} className="pd-video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Property Video" />
                  ) : (
                    <video src={url} controls className="pd-video" />
                  )}
                </div>
              );
            })()}

            {/* Lister Info */}
            <div className="pd-section">
              <h4 className="pd-section-title">Lister Information</h4>
              <div className="pd-lister">
                {selected.lister_avatar ? <img src={selected.lister_avatar} alt="" className="pd-lister-avatar" /> 
                  : <div className="pd-lister-avatar-placeholder">{(selected.lister_name || '?')[0]}</div>}
                <div>
                  <strong>{selected.lister_name || '—'}</strong>
                  {selected.lister_email && <div className="pd-lister-contact"><Mail size={12} /> {selected.lister_email}</div>}
                  {selected.lister_phone && <div className="pd-lister-contact"><Phone size={12} /> {selected.lister_phone}</div>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="pd-stats">
              <div><Eye size={14} /><span>{selected.views || 0} views</span></div>
              <div><Heart size={14} /><span>{selected.favorites || 0} favs</span></div>
              <div><MessageSquare size={14} /><span>{selected.inquiries || 0} inquiries</span></div>
            </div>

            {/* Timestamps */}
            <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:12}}>
              <div>Created: {selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'}</div>
              {selected.listed_at && <div>Listed: {new Date(selected.listed_at).toLocaleString()}</div>}
            </div>

            {/* Rejection Reason */}
            {selected.admin_review?.rejection_reason && (
              <div className="pd-rejection">
                <strong>Rejection Reason:</strong>
                <p>{selected.admin_review.rejection_reason}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pd-actions">
              {(selected.status === 'pending' || selected.status === 'rejected') && (
                <button className="btn btn-success" onClick={() => handleApprove(selected.id)}><CheckCircle size={16} /> Approve</button>
              )}
              {selected.status === 'pending' && (
                <button className="btn btn-danger" onClick={() => handleReject(selected.id)}><XCircle size={16} /> Reject</button>
              )}
              {selected.status !== 'pending' && (
                <button className="btn btn-outline" style={{borderColor:'var(--error)',color:'var(--error)'}} onClick={() => handleDelete(selected.id)}>
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Action Reason Modal */}
      <Modal isOpen={actionModal.isOpen} onClose={() => setActionModal({ isOpen: false, type: '', id: null })} title={actionModal.type === 'reject' ? 'Reject Property' : 'Delete Property'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {actionModal.type === 'reject' 
              ? 'Please provide a reason for rejecting this property. This will be sent to the lister.' 
              : 'Please enter a reason for permanently deleting this property. This will be emailed to the lister.'}
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

      {/* Lightbox */}
      {lightbox && selected && (() => {
        const imgs = selected.images?.length ? selected.images : (selected.image ? [selected.image] : []);
        return (
          <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
            <button className="lightbox-close" onClick={() => setLightbox(false)}><X size={24} /></button>
            <img src={imgs[imgIndex]} alt="" className="lightbox-img" onClick={e => e.stopPropagation()} />
            {imgs.length > 1 && (
              <>
                <button className="lightbox-nav lightbox-prev" onClick={e => { e.stopPropagation(); setImgIndex((imgIndex - 1 + imgs.length) % imgs.length); }}><ChevronLeft size={32} /></button>
                <button className="lightbox-nav lightbox-next" onClick={e => { e.stopPropagation(); setImgIndex((imgIndex + 1) % imgs.length); }}><ChevronRight size={32} /></button>
              </>
            )}
            <div className="lightbox-counter">{imgIndex + 1} / {imgs.length}</div>
          </div>
        );
      })()}
    </div>
  );
}
