import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { propertyTypeAPI } from '../../api';
import toast from 'react-hot-toast';

export default function PropertyTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '🏠', description: '', is_active: true, order: 0 });

  useEffect(() => { load(); }, []);
  const load = async () => { try { const res = await propertyTypeAPI.list(); setTypes(res.data); } catch(e) {} finally { setLoading(false); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await propertyTypeAPI.update(editId, form); toast.success('Updated!'); }
      else { await propertyTypeAPI.create(form); toast.success('Created!'); }
      setShowForm(false); setEditId(null); setForm({ name: '', icon: '🏠', description: '', is_active: true, order: 0 }); load();
    } catch(e) { toast.error(e.response?.data?.detail || 'Failed'); }
  };

  const handleEdit = (t) => { setForm({ name: t.name, icon: t.icon, description: t.description || '', is_active: t.is_active, order: t.order }); setEditId(t.id); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete this type?')) return; try { await propertyTypeAPI.delete(id); toast.success('Deleted'); load(); } catch(e) { toast.error(e.response?.data?.detail || 'Failed'); } };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div><h1 className="page-title">Property Types</h1><p className="page-subtitle">Manage property categories</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', icon: '🏠', description: '', is_active: true, order: 0 }); }}><Plus size={16} /> Add Type</button>
      </div>

      {showForm && (
        <div className="card animate-in" style={{marginBottom:24}}>
          <h3 style={{marginBottom:16}}>{editId ? 'Edit' : 'Add'} Property Type</h3>
          <form onSubmit={handleSubmit} style={{display:'grid',gridTemplateColumns:'1fr 80px 2fr',gap:12,alignItems:'end'}}>
            <div><label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:4}}>Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. House" required /></div>
            <div><label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:4}}>Icon</label><input className="input" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} style={{textAlign:'center',fontSize:20}} /></div>
            <div><label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:4}}>Description</label><input className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description" /></div>
            <div style={{gridColumn:'1/-1',display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card data-table">
        <table>
          <thead><tr><th>Icon</th><th>Name</th><th>Description</th><th>Properties</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {types.map(t => (
              <tr key={t.id}>
                <td style={{fontSize:24,textAlign:'center'}}>{t.icon}</td>
                <td><strong>{t.name}</strong></td>
                <td style={{color:'var(--text-muted)',fontSize:12}}>{t.description || '—'}</td>
                <td>{t.properties_count}</td>
                <td><span className={`badge ${t.is_active ? 'badge-success' : 'badge-error'}`}>{t.is_active ? 'Active' : 'Inactive'}</span></td>
                <td><div className="action-btns">
                  <button className="btn btn-sm btn-outline" onClick={() => handleEdit(t)}><Edit2 size={13} /></button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)}><Trash2 size={13} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
