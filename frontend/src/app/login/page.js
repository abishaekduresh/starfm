'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Api from '../../services/api';
import styles from './Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await Api.request('/login', 'POST', { email, password });
      
      if (res && res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        router.push('/dashboard');
      } else {
        setError(res?.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Star FM</h1>
          <p>Admin Access Panel</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.alert}>{error}</div>}
          
          <div className={styles.group}>
            <label>Email Address</label>
            <input 
              type="email" 
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className={styles.group}>
            <label>Password</label>
            <input 
              type="password" 
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.footer}>
          Don't have an account? <Link href="/register" className={styles.link}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
