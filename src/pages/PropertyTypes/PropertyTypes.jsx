import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { propertyTypeAPI } from '../../api';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal/Modal';
import EmptyState from '../../components/EmptyState/EmptyState';

export default function PropertyTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '🏠', description: '', is_active: true, order: 0 });

  useEffect(() => { load(); }, []);
  const load = async () => { try { const res = await propertyTypeAPI.list(); setTypes(res.data); } catch(e) {} finally { setLoading(false); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await propertyTypeAPI.update(editId, form); toast.success('Updated!'); }
      else { await propertyTypeAPI.create(form); toast.success('Created!'); }
      setShowModal(false); setEditId(null); setForm({ name: '', icon: '🏠', description: '', is_active: true, order: 0 }); load();
    } catch(e) { toast.error(e.response?.data?.detail || 'Failed'); }
  };

  const handleEdit = (t) => { setForm({ name: t.name, icon: t.icon, description: t.description || '', is_active: t.is_active, order: t.order }); setEditId(t.id); setShowModal(true); };
  const handleDelete = async (id) => { if (!confirm('Delete this property type?')) return; try { await propertyTypeAPI.delete(id); toast.success('Deleted'); load(); } catch(e) { toast.error(e.response?.data?.detail || 'Failed'); } };
  const openAdd = () => { setEditId(null); setForm({ name: '', icon: '🏠', description: '', is_active: true, order: 0 }); setShowModal(true); };

  const toggleActive = async (t) => {
    try {
      await propertyTypeAPI.update(t.id, { ...t, is_active: !t.is_active });
      toast.success(t.is_active ? 'Deactivated' : 'Activated');
      load();
    } catch(e) { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Property Types</h1>
          <p className="page-subtitle">Manage property categories</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Type</button>
      </div>

      {loading ? <div className="card"><div className="skeleton" style={{height:200}} /></div> : types.length === 0 ? (
        <div className="card"><EmptyState title="No property types" description="Add your first property type to get started" action={<button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={14} /> Add Type</button>} /></div>
      ) : (
        <div className="card data-table">
          <table>
            <thead><tr><th>Icon</th><th>Name</th><th>Description</th><th>Properties</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {types.map(t => (
                <tr key={t.id}>
                  <td style={{fontSize:24,textAlign:'center'}}>{t.icon}</td>
                  <td><strong>{t.name}</strong></td>
                  <td style={{color:'var(--text-muted)',fontSize:12,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.description || '—'}</td>
                  <td>{t.properties_count}</td>
                  <td>
                    <div className={`toggle ${t.is_active ? 'active' : ''}`} onClick={() => toggleActive(t)} title={t.is_active ? 'Click to deactivate' : 'Click to activate'} />
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm btn-outline" onClick={() => handleEdit(t)}><Edit2 size={13} /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Property Type' : 'Add Property Type'} size="sm"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editId ? 'Update' : 'Create'}</button>
        </>}
      >
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. House" required />
          </div>
          <div className="form-group">
            <label className="form-label">Icon (emoji)</label>
            <input className="input" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} style={{textAlign:'center',fontSize:24}} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description" />
          </div>
          <div className="form-group">
            <label className="form-label">Display Order</label>
            <input className="input" type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value) || 0})} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
