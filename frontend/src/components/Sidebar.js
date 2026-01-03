'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Api from '../services/api';
import styles from './Sidebar.module.css';

export default function Sidebar({ isOpen, toggle, isMobile }) {
  const pathname = usePathname();

  const handleLogout = (e) => {
    e.preventDefault();
    Api.logout();
  };

  const isActive = (path) => pathname.startsWith(path);

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.brand}>Star FM</h3>
        {isMobile && (
            <button className={styles.closeBtn} onClick={toggle}>
                <i className="bi bi-x-lg"></i>
            </button>
        )}
      </div>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={`${styles.link} ${isActive('/dashboard') ? styles.active : ''}`}>
          <i className="bi bi-speedometer2 me-2"></i> Dashboard
        </Link>
        <Link href="/channels" className={`${styles.link} ${isActive('/channels') ? styles.active : ''}`}>
          <i className="bi bi-broadcast me-2"></i> Channels
        </Link>
        <Link href="/ads" className={`${styles.link} ${isActive('/ads') ? styles.active : ''}`}>
          <i className="bi bi-megaphone me-2"></i> Ads
        </Link>
        <a href="#" onClick={handleLogout} className={styles.link}>
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </a>
      </nav>
    </div>
  );
}
