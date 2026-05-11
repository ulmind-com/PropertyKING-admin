import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { amenityAPI } from '../../api';
import toast from 'react-hot-toast';

export default function Amenities() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '✅', category: 'indoor', is_active: true, order: 0 });
  const [filterCat, setFilterCat] = useState('');

  useEffect(() => { load(); }, [filterCat]);
  const load = async () => { try { const params = filterCat ? { category: filterCat } : {}; const res = await amenityAPI.list(params); setAmenities(res.data); } catch(e) {} finally { setLoading(false); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await amenityAPI.update(editId, form); toast.success('Updated!'); }
      else { await amenityAPI.create(form); toast.success('Created!'); }
      setShowForm(false); setEditId(null); setForm({ name: '', icon: '✅', category: 'indoor', is_active: true, order: 0 }); load();
    } catch(e) { toast.error(e.response?.data?.detail || 'Failed'); }
  };

  const handleEdit = (a) => { setForm({ name: a.name, icon: a.icon, category: a.category, is_active: a.is_active, order: a.order }); setEditId(a.id); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await amenityAPI.delete(id); toast.success('Deleted'); load(); } catch(e) { toast.error('Failed'); } };
  const categories = ['indoor', 'outdoor', 'community', 'security', 'utilities', 'accessibility'];

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div><h1 className="page-title">Amenities</h1><p className="page-subtitle">{amenities.length} amenities</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); }}><Plus size={16} /> Add Amenity</button>
      </div>

      <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
        <button className={`btn btn-sm ${!filterCat ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterCat('')}>All</button>
        {categories.map(c => <button key={c} className={`btn btn-sm ${filterCat === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterCat(c)}>{c}</button>)}
      </div>

      {showForm && (
        <div className="card animate-in" style={{marginBottom:24}}>
          <h3 style={{marginBottom:16}}>{editId ? 'Edit' : 'Add'} Amenity</h3>
          <form onSubmit={handleSubmit} style={{display:'grid',gridTemplateColumns:'1fr 80px 1fr',gap:12,alignItems:'end'}}>
            <div><label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:4}}>Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div><label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:4}}>Icon</label><input className="input" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} style={{textAlign:'center',fontSize:20}} /></div>
            <div><label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:4}}>Category</label>
              <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div style={{gridColumn:'1/-1',display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{padding:0}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:1,background:'var(--border-light)'}}>
          {amenities.map(a => (
            <div key={a.id} style={{background:'var(--bg-card)',padding:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:20}}>{a.icon}</span>
                <div><span style={{fontSize:13,fontWeight:600,display:'block'}}>{a.name}</span><span style={{fontSize:11,color:'var(--text-muted)',textTransform:'capitalize'}}>{a.category}</span></div>
              </div>
              <div className="action-btns"><button className="btn btn-sm btn-ghost" onClick={() => handleEdit(a)}><Edit2 size={12} /></button><button className="btn btn-sm btn-ghost" style={{color:'var(--error)'}} onClick={() => handleDelete(a.id)}><Trash2 size={12} /></button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
