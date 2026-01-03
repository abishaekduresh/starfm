'use client';
import { useEffect, useState } from 'react';
import Api from '../../services/api';
import styles from './Dashboard.module.css';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const [stats, setStats] = useState({ total_ads: '-', active_ads: '-', expired_ads: '-' });
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    // Auth Check
    if (!Api.checkAuth()) return;

    // Load Stats & Check Health
    const loadStats = async () => {
      try {
        const data = await Api.request('/dashboard');
        if (data && data.stats) {
          setStats(data.stats);
          
          // Health Check Success
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          
          Toast.fire({
            icon: 'success',
            title: 'System Online',
            text: 'Backend connection established'
          });

        } else {
            throw new Error('Invalid response structure');
        }
      } catch (err) {
        console.error('Backend Health Check Failed:', err);
        Swal.fire({
            icon: 'error',
            title: 'Connectivity Issue',
            text: 'Unable to connect to the Backend API. Please check your server.',
            confirmButtonText: 'Retry',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload();
            }
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Set API URL
    if (typeof window !== 'undefined') {
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/backend/public/api';

        // Ensure no trailing slash
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        
        if (baseUrl.endsWith('/api')) {
            setApiUrl(`${baseUrl}/streams`);
        } else {
            setApiUrl(`${baseUrl}/api/streams`);
        }
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiUrl);
    Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'API URL copied to clipboard',
        timer: 1500,
        showConfirmButton: false
    });
  };

  return (
    <>
      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.primary}`}>
          <h3>Total Ads</h3>
          <p className={styles.number}>{loading ? '...' : stats.total_ads}</p>
        </div>
        <div className={`${styles.card} ${styles.success}`}>
          <h3>Active Ads</h3>
          <p className={styles.number}>{loading ? '...' : stats.active_ads}</p>
        </div>
        <div className={`${styles.card} ${styles.danger}`}>
          <h3>Expired Ads</h3>
          <p className={styles.number}>{loading ? '...' : stats.expired_ads}</p>
        </div>
      </div>

      <div className={styles.apiSection}>
          <div className={styles.apiHeader}>Public API Documentation</div>
          <div className={styles.apiBody}>
              <p>Use the following details to integerate the content into your application:</p>
              
              <div className={styles.endpointCard}>
                  <div className={styles.method}>GET</div>
                  <div className={styles.url}>{apiUrl}</div>
                  <button onClick={copyToClipboard} className={styles.copyBtn} title="Copy URL">
                    <i className="bi bi-clipboard"></i>
                  </button>
              </div>

              <div className={styles.endpointCard}>
                  <div className={styles.method} style={{ background: '#6366f1' }}>KEY</div>
                  <div className={styles.url}>{process.env.NEXT_PUBLIC_API_KEY || 'Key Not Found'}</div>
                  <button onClick={() => {
                    navigator.clipboard.writeText(process.env.NEXT_PUBLIC_API_KEY);
                    Swal.fire({
                        icon: 'success',
                        title: 'Copied!',
                        text: 'API Key copied to clipboard',
                        timer: 1500,
                        showConfirmButton: false
                    });
                  }} className={styles.copyBtn} title="Copy API Key">
                    <i className="bi bi-clipboard"></i>
                  </button>
              </div>

              <div className={styles.docGrid}>
                <div className={styles.docBlock}>
                    <h4>Request Example (cURL)</h4>
                    <pre className={styles.codeBlock}>
{`curl -X GET '${apiUrl}' \\
  -H 'X-API-KEY: ${process.env.NEXT_PUBLIC_API_KEY || 'your_api_key'}' \\
  -H 'X-Device-Platform: android' 
  
  # Options for X-Device-Platform:
  # android | ios | web`}
                    </pre>
                </div>

                <div className={styles.docBlock}>
                    <h4>Response Structure</h4>
                    <pre className={styles.codeBlock}>
{`{
  "status": true,
  "message": "Data fetched successfully",
  "data": {
    "settings": {
      "maintenance_mode": "0",
      "app_version": "1.0.0"
    },
    "channels": [
      {
        "uuid": "...",
        "name": "Channel Name",
        "stream_url": "http://...",
        "logo_url": "http://..."
      }
    ],
    "ads": {
      "image": [ ... ],
      "banner": [ ... ],
      "video": [ ... ]
    }
  }
}`}
                    </pre>
                </div>
              </div>
          </div>
      </div>
    </>
  );
}
