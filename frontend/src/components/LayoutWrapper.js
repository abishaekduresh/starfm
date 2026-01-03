'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Api from '../services/api';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for mobile state
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [pathname, isMobile]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Pages that don't use the main shell
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Protected Layout Shell
  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} isMobile={isMobile} />
      
      <div className={`main-content ${isSidebarOpen && !isMobile ? 'expanded' : ''}`}>
        <Navbar toggleSidebar={toggleSidebar} title={getTitle(pathname)} />
        <main className="page-container">
            {children}
        </main>
      </div>

      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <style jsx global>{`
        .app-shell {
          display: flex;
          min-height: 100vh;
        }
        .main-content {
          flex: 1;
          margin-left: var(--sidebar-width);
          padding: 2rem;
          transition: margin-left 0.3s ease;
          width: calc(100% - var(--sidebar-width));
        }
        .page-container {
            max-width: 1400px;
            margin: 0 auto;
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            width: 100%;
            padding: 1rem;
          }
          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 40;
            backdrop-filter: blur(4px);
          }
        }
      `}</style>
    </div>
  );
}

// Helper to get title from path (simplistic)
function getTitle(path) {
  if (path.includes('dashboard')) return 'Dashboard';
  if (path.includes('channels')) return 'Channels';
  if (path.includes('ads')) return 'Ad Management';
  return 'Star FM';
}
