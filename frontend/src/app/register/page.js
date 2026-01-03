'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Api from '../../services/api';
import styles from './Register.module.css';
import Swal from 'sweetalert2';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await Api.request('/register', 'POST', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      if (res && res.message) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'You account has been created. Please log in.',
          confirmButtonColor: '#4f46e5'
        }).then(() => {
          router.push('/login');
        });
      } else {
        setError(res?.error || 'Registration failed');
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
          <p>Create Admin Account</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.alert}>{error}</div>}
          
          <div className={styles.group}>
            <label>Full Name</label>
            <input 
              type="text" 
              name="name"
              className={styles.input}
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className={styles.group}>
            <label>Email Address</label>
            <input 
              type="email" 
              name="email"
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className={styles.group}>
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              className={styles.input}
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className={styles.group}>
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              className={styles.input}
              value={formData.password}
              onChange={handleChange}
              required 
              minLength={6}
            />
          </div>

          <div className={styles.group}>
            <label>Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              className={styles.input}
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link href="/login" className={styles.link}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
