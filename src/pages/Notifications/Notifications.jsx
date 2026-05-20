import { useState } from 'react';
import { Send, Bell, Smartphone, CheckCircle, Sparkles } from 'lucide-react';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [form, setForm] = useState({ title: '', body: '', type: 'system' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return toast.error('Fill all fields');
    setLoading(true);
    try {
      const res = await adminAPI.broadcast(form);
      toast.success(res.data.message);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setForm({ title: '', body: '', type: 'system' });
    } catch(e) { toast.error('Failed to send'); } finally { setLoading(false); }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt) return toast.error('Enter a topic for the AI');
    setAiLoading(true);
    try {
      const res = await adminAPI.generateAI({ prompt: aiPrompt, tone: 'professional', type: form.type });
      setForm(prev => ({ ...prev, title: res.data.title, body: res.data.body }));
      toast.success('AI Generated successfully!');
      setShowAiInput(false);
      setAiPrompt('');
    } catch (e) {
      toast.error('AI Generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Push Notifications</h1>
      <p className="page-subtitle">Send broadcast notifications to all users</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:900}}>
        {/* Send Form */}
        <div className="card">
          <div style={{marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <h3 style={{display:'flex',alignItems:'center',gap:8,margin:0}}><Bell size={18} style={{color:'var(--primary)'}} /> Compose Broadcast</h3>
            <button className="btn btn-sm btn-outline" onClick={() => setShowAiInput(!showAiInput)} style={{color:'var(--primary)',borderColor:'var(--primary-light)'}}>
              <Sparkles size={14} /> AI Assist
            </button>
          </div>

          {showAiInput && (
            <div style={{marginBottom:20,padding:16,background:'rgba(37,99,235,0.05)',borderRadius:'var(--radius-sm)',border:'1px dashed var(--primary-light)'}}>
              <div style={{fontSize:12,fontWeight:600,color:'var(--primary)',marginBottom:8}}>Generate with AI</div>
              <div style={{display:'flex',gap:8}}>
                <input className="input" style={{flex:1}} placeholder="e.g. 50% discount on summer houses" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerateAI()} />
                <button className="btn btn-primary" onClick={handleGenerateAI} disabled={aiLoading}>
                  {aiLoading ? <div className="spinner" style={{width:14,height:14}} /> : 'Generate'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Notification title" required maxLength={100} />
              <span style={{fontSize:11,color:'var(--text-muted)',textAlign:'right'}}>{form.title.length}/100</span>
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="input" rows={4} value={form.body} onChange={e => setForm({...form, body: e.target.value})} placeholder="Write your message..." required maxLength={500} />
              <span style={{fontSize:11,color:'var(--text-muted)',textAlign:'right'}}>{form.body.length}/500</span>
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="system">System Announcement</option>
                <option value="new_listing">New Listing Alert</option>
                <option value="price_drop">Price Drop</option>
                <option value="promotion">Promotion</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{padding:'12px'}}>
              {loading ? <div className="spinner" /> : sent ? <><CheckCircle size={16} /> Sent!</> : <><Send size={16} /> Send to All Users</>}
            </button>
          </form>
        </div>

        {/* Preview */}
        <div>
          <div className="card" style={{marginBottom:16}}>
            <h3 style={{marginBottom:16,display:'flex',alignItems:'center',gap:8}}><Smartphone size={18} style={{color:'var(--primary)'}} /> Preview</h3>
            <div style={{background:'var(--bg-elevated)',borderRadius:'var(--radius-sm)',padding:16,border:'1px solid var(--border)'}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                <div style={{width:36,height:36,borderRadius:8,background:'var(--primary-gradient)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Bell size={16} color="white" />
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:600}}>PropertyKING</span>
                    <span style={{fontSize:10,color:'var(--text-muted)'}}>now</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{form.title || 'Notification Title'}</div>
                  <div style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.4}}>{form.body || 'Your message will appear here...'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{fontSize:12,color:'var(--text-muted)'}}>
            <h4 style={{marginBottom:8,color:'var(--text-secondary)'}}>ℹ️ Info</h4>
            <ul style={{paddingLeft:16,display:'flex',flexDirection:'column',gap:6}}>
              <li>Broadcasts are sent to all users with push notifications enabled</li>
              <li>Users receive notifications on their mobile devices via FCM</li>
              <li>Notifications are also saved in the in-app notification center</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
