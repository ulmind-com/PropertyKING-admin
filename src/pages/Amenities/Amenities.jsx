import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { amenityAPI } from '../../api';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal/Modal';
import EmptyState from '../../components/EmptyState/EmptyState';

const categoryColors = { indoor: '#2563EB', outdoor: '#10B981', community: '#8B5CF6', security: '#EF4444', utilities: '#F59E0B', accessibility: '#06B6D4' };

export default function Amenities() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '✅', category: 'indoor', is_active: true, order: 0 });
  const [filterCat, setFilterCat] = useState('');
  const categories = ['indoor', 'outdoor', 'community', 'security', 'utilities', 'accessibility'];

  useEffect(() => { load(); }, [filterCat]);
  const load = async () => { try { const params = filterCat ? { category: filterCat } : {}; const res = await amenityAPI.list(params); setAmenities(res.data); } catch(e) {} finally { setLoading(false); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await amenityAPI.update(editId, form); toast.success('Updated!'); }
      else { await amenityAPI.create(form); toast.success('Created!'); }
      setShowModal(false); setEditId(null); setForm({ name: '', icon: '✅', category: 'indoor', is_active: true, order: 0 }); load();
    } catch(e) { toast.error(e.response?.data?.detail || 'Failed'); }
  };

  const handleEdit = (a) => { setForm({ name: a.name, icon: a.icon, category: a.category, is_active: a.is_active, order: a.order }); setEditId(a.id); setShowModal(true); };
  const handleDelete = async (id) => { if (!confirm('Delete this amenity?')) return; try { await amenityAPI.delete(id); toast.success('Deleted'); load(); } catch(e) { toast.error('Failed'); } };
  const openAdd = () => { setEditId(null); setForm({ name: '', icon: '✅', category: 'indoor', is_active: true, order: 0 }); setShowModal(true); };

  const toggleActive = async (a) => {
    try { await amenityAPI.update(a.id, { ...a, is_active: !a.is_active }); toast.success(a.is_active ? 'Deactivated' : 'Activated'); load(); } catch(e) { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Amenities</h1>
          <p className="page-subtitle">{amenities.length} amenities</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Amenity</button>
      </div>

      <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
        <button className={`btn btn-sm ${!filterCat ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterCat('')}>All</button>
        {categories.map(c => (
          <button key={c} className={`btn btn-sm ${filterCat === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterCat(c)} style={{textTransform:'capitalize'}}>{c}</button>
        ))}
      </div>

      {loading ? <div className="card"><div className="skeleton" style={{height:200}} /></div> : amenities.length === 0 ? (
        <div className="card"><EmptyState title="No amenities" description="Add amenities for your property listings" action={<button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={14} /> Add</button>} /></div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12}}>
          {amenities.map(a => (
            <div key={a.id} className="card glow-hover animate-in" style={{padding:16,display:'flex',alignItems:'center',justifyContent:'space-between',opacity: a.is_active ? 1 : 0.5}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:24,width:40,textAlign:'center'}}>{a.icon}</span>
                <div>
                  <span style={{fontSize:13,fontWeight:600,display:'block'}}>{a.name}</span>
                  <span style={{fontSize:11,color: categoryColors[a.category] || 'var(--text-muted)',textTransform:'capitalize',fontWeight:500}}>{a.category}</span>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div className={`toggle ${a.is_active ? 'active' : ''}`} onClick={() => toggleActive(a)} />
                <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(a)}><Edit2 size={12} /></button>
                <button className="btn btn-sm btn-ghost" style={{color:'var(--error)'}} onClick={() => handleDelete(a.id)}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Amenity' : 'Add Amenity'} size="sm"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editId ? 'Update' : 'Create'}</button>
        </>}
      >
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Swimming Pool" required />
          </div>
          <div className="form-group">
            <label className="form-label">Icon (emoji)</label>
            <input className="input" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} style={{textAlign:'center',fontSize:24}} />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {categories.map(c => <option key={c} value={c} style={{textTransform:'capitalize'}}>{c}</option>)}
            </select>
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
