import { useState } from 'react';
import { Send } from 'lucide-react';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [form, setForm] = useState({ title: '', body: '', type: 'system' });
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return toast.error('Fill all fields');
    setLoading(true);
    try {
      const res = await adminAPI.broadcast(form);
      toast.success(res.data.message);
      setForm({ title: '', body: '', type: 'system' });
    } catch(e) { toast.error('Failed'); } finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="page-title">Push Notifications</h1>
      <p className="page-subtitle">Send broadcast notifications to users</p>

      <div className="card" style={{maxWidth:600}}>
        <h3 style={{marginBottom:20}}>Send Broadcast</h3>
        <form onSubmit={handleSend} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div><label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:4}}>Title</label>
            <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Notification title" required /></div>
          <div><label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:4}}>Message</label>
            <textarea className="input" rows={4} value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Write your message..." required /></div>
          <div><label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:4}}>Type</label>
            <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="system">System</option><option value="new_listing">New Listing</option><option value="price_drop">Price Drop</option>
            </select></div>
          <button type="submit" className="btn btn-primary" disabled={loading}><Send size={16} /> {loading ? 'Sending...' : 'Send to All Users'}</button>
        </form>
      </div>
    </div>
  );
}
