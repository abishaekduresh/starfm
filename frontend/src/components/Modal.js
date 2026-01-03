'use client';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEsc);
    }
    return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="header">
          <h3>{title}</h3>
          <button onClick={onClose} className="closeBtn">&times;</button>
        </div>
        <div className="body">
          {children}
        </div>
      </div>
      <style jsx>{`
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
        }
        .modal {
          background: var(--bg-card);
          border: 1px solid var(--glass-border);
          color: var(--text-main);
          border-radius: 1rem;
          width: 90%;
          max-width: 600px; /* Slightly wider */
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);
          animation: slideIn 0.2s ease-out;
          max-height: 90vh;
          overflow-y: auto;
        }
        @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.02);
        }
        .header h3 { margin: 0; font-size: 1.25rem; font-weight: 600; }
        .closeBtn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-muted);
          transition: color 0.2s;
        }
        .closeBtn:hover { color: var(--danger); }
        .body {
          padding: 1.5rem;
        }
      `}</style>
    </div>
  );
}
