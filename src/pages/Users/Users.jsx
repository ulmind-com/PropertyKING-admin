import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { load(); }, [page, roleFilter]);
  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await adminAPI.users(params);
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch(e) {} finally { setLoading(false); }
  };

  const toggleStatus = async (id) => {
    try { const res = await adminAPI.toggleUserStatus(id); toast.success(res.data.message); load(); } catch(e) { toast.error('Failed'); }
  };

  return (
    <div>
      <h1 className="page-title">Users</h1>
      <p className="page-subtitle">{total} total users</p>

      <div className="toolbar">
        <div className="toolbar-search"><Search size={16} /><input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} /></div>
        <div className="toolbar-filters">
          {['', 'user', 'lister'].map(r => (
            <button key={r} className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setRoleFilter(r); setPage(1); }}>{r || 'All'}</button>
          ))}
        </div>
      </div>

      <div className="card data-table">
        <table>
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Type</th><th>Listings</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{textAlign:'center',padding:40}}>Loading...</td></tr> :
              users.map(u => (
                <tr key={u.id}>
                  <td><div style={{display:'flex',alignItems:'center',gap:10}}>
                    {u.avatar ? <img src={u.avatar} style={{width:32,height:32,borderRadius:'50%',objectFit:'cover'}} /> : <div style={{width:32,height:32,borderRadius:'50%',background:'var(--primary-light)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13}}>{u.full_name?.[0]}</div>}
                    <strong style={{fontSize:13}}>{u.full_name}</strong>
                  </div></td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{u.email}</td>
                  <td><span className={`badge ${u.role === 'lister' ? 'badge-info' : 'badge-success'}`}>{u.role}</span></td>
                  <td style={{textTransform:'capitalize',fontSize:12}}>{u.lister_type || '—'}</td>
                  <td>{u.listings_count}</td>
                  <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-error'}`}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <button className={`btn btn-sm ${u.is_active ? 'btn-outline' : 'btn-success'}`} onClick={() => toggleStatus(u.id)} title={u.is_active ? 'Deactivate' : 'Activate'}>
                      {u.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                    </button>
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
