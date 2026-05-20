import { useState, useEffect, useRef } from 'react';
import { Search, UserCheck, UserX, Mail, Phone, Calendar, Building2, Shield } from 'lucide-react';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal/Modal';
import Pagination from '../../components/Pagination/Pagination';
import EmptyState from '../../components/EmptyState/EmptyState';
import { SkeletonTable } from '../../components/Skeleton/Skeleton';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const searchTimeout = useRef(null);

  useEffect(() => { load(); }, [page, roleFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await adminAPI.users(params);
      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch(e) {} finally { setLoading(false); }
  };

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setPage(1); load(); }, 400);
  };

  const toggleStatus = async (id) => {
    try {
      const res = await adminAPI.toggleUserStatus(id);
      toast.success(res.data.message);
      load();
      if (selected?.id === id) setSelected({ ...selected, is_active: res.data.is_active });
    } catch(e) { toast.error('Failed'); }
  };

  const makeAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to make this user an Admin?")) return;
    try {
      const res = await adminAPI.makeAdmin(id);
      toast.success(res.data.message);
      load();
      if (selected?.id === id) setSelected({ ...selected, role: res.data.role });
    } catch(e) { toast.error(e.response?.data?.detail || 'Failed'); }
  };

  return (
    <div>
      <h1 className="page-title">Users</h1>
      <p className="page-subtitle">{total} total users</p>

      <div className="toolbar">
        <div className="toolbar-search">
          <Search size={16} />
          <input placeholder="Search by name or email..." value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
        <div className="toolbar-filters">
          {['', 'user', 'admin'].map(r => (
            <button key={r} className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setRoleFilter(r); setPage(1); }}>{r || 'All'}</button>
          ))}
        </div>
      </div>

      {loading ? <SkeletonTable rows={8} cols={8} /> : users.length === 0 ? (
        <div className="card"><EmptyState title="No users found" description="Try adjusting your search or filters" /></div>
      ) : (
        <div className="card data-table">
          <table>
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Type</th><th>Listings</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="clickable-row" onClick={() => setSelected(u)}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      {u.avatar ? <img src={u.avatar} style={{width:32,height:32,borderRadius:'50%',objectFit:'cover'}} alt="" />
                        : <div style={{width:32,height:32,borderRadius:'50%',background:'var(--primary-light)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13}}>{u.full_name?.[0]}</div>}
                      <div>
                        <strong style={{fontSize:13}}>{u.full_name}</strong>
                        {u.verified && <Shield size={12} style={{color:'var(--primary)',marginLeft:4,verticalAlign:'middle'}} />}
                      </div>
                    </div>
                  </td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-error' : u.role === 'lister' ? 'badge-info' : 'badge-success'}`}>{u.role}</span></td>
                  <td style={{textTransform:'capitalize',fontSize:12}}>{u.lister_type || '—'}</td>
                  <td>{u.listings_count}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span className={`status-dot ${u.is_active ? 'online' : 'offline'}`} />
                      <span style={{fontSize:12}}>{u.is_active ? 'Active' : 'Disabled'}</span>
                    </div>
                  </td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className={`btn btn-sm ${u.is_active ? 'btn-outline' : 'btn-success'}`} onClick={() => toggleStatus(u.id)} title={u.is_active ? 'Deactivate' : 'Activate'}>
                      {u.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* User Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="User Details" size="md">
        {selected && (
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              {selected.avatar ? <img src={selected.avatar} style={{width:56,height:56,borderRadius:'50%',objectFit:'cover'}} alt="" />
                : <div style={{width:56,height:56,borderRadius:'50%',background:'var(--primary-gradient)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:20}}>{selected.full_name?.[0]}</div>}
              <div>
                <h3 style={{fontSize:18,fontWeight:700}}>{selected.full_name}</h3>
                <span className={`badge ${selected.role === 'admin' ? 'badge-error' : selected.role === 'lister' ? 'badge-info' : 'badge-success'}`} style={{marginTop:4}}>{selected.role}</span>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="pd-item"><Mail size={14} /><span>Email</span><strong style={{fontSize:12,wordBreak:'break-all'}}>{selected.email}</strong></div>
              <div className="pd-item"><Phone size={14} /><span>Phone</span><strong>{selected.phone || '—'}</strong></div>
              <div className="pd-item"><Building2 size={14} /><span>Listings</span><strong>{selected.listings_count}</strong></div>
              <div className="pd-item"><Calendar size={14} /><span>Joined</span><strong>{selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '—'}</strong></div>
            </div>

            {selected.lister_type && (
              <div style={{fontSize:13,color:'var(--text-secondary)'}}>
                <strong>Lister Type:</strong> <span style={{textTransform:'capitalize'}}>{selected.lister_type}</span>
              </div>
            )}

            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'var(--bg-elevated)',borderRadius:'var(--radius-sm)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span className={`status-dot ${selected.is_active ? 'online' : 'offline'}`} />
                <span style={{fontSize:13,fontWeight:600}}>{selected.is_active ? 'Active' : 'Disabled'}</span>
              </div>
              <div style={{display:'flex',gap:8}}>
                {selected.role !== 'admin' && (
                  <button className="btn btn-sm btn-outline" style={{borderColor:'var(--primary-light)',color:'var(--primary)'}} onClick={() => makeAdmin(selected.id)}>
                    <Shield size={13} /> Make Admin
                  </button>
                )}
                <button className={`btn btn-sm ${selected.is_active ? 'btn-outline' : 'btn-success'}`} onClick={() => toggleStatus(selected.id)}>
                  {selected.is_active ? <><UserX size={13} /> Deactivate</> : <><UserCheck size={13} /> Activate</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
