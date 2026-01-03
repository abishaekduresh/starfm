'use client';
import { useEffect, useState } from 'react';

export default function Navbar({ title, toggleSidebar }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  return (
    <div className="navbar">
        <div className="start">
            <button className="menu-btn" onClick={toggleSidebar}>
                <i className="bi bi-list"></i>
            </button>
            <h2 className="title">{title}</h2>
        </div>
        <div className="profile">
            {user ? (
                <span>Welcome, <strong>{user.name || 'Admin'}</strong></span>
            ) : (
                <span>Loading...</span>
            )}
        </div>
        <style jsx>{`
            .navbar {
                height: 70px;
                background: var(--bg-card);
                backdrop-filter: blur(12px);
                border-bottom: 1px solid var(--glass-border);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 2rem;
                margin-bottom: 2rem;
                border-radius: 1rem;
                color: var(--text-main);
            }
            .start { display: flex; align-items: center; gap: 1rem; }
            .title {
                font-size: 1.5rem;
                font-weight: 600;
                margin: 0;
            }
            .menu-btn {
                background: none;
                border: none;
                color: var(--text-main);
                font-size: 1.5rem;
                cursor: pointer;
                display: none;
            }
            .profile {
                font-size: 0.9rem;
                color: var(--text-muted);
            }
            
            @media (max-width: 768px) {
                .menu-btn { display: block; }
                .navbar { padding: 0 1rem; }
            }
        `}</style>
    </div>
  );
}
