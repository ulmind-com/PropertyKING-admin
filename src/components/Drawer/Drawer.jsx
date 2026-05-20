import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, children, width = 480 }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-container" style={{ width: Math.min(width, window.innerWidth - 20) }}>
        <div className="drawer-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="drawer-body">{children}</div>
      </div>
    </>
  );
}
