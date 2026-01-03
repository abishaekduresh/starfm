'use client';
import { useEffect, useState } from 'react';
import Api from '../../services/api';
import Modal from '../../components/Modal';
import Swal from 'sweetalert2';
import styles from './Channels.module.css';

export default function Channels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', stream_type: 'HLS', stream_url: '', status: 'active' });
  const [logoFile, setLogoFile] = useState(null);
  const [assetUrl, setAssetUrl] = useState('');
  
  // Filter States
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });

  useEffect(() => {
    // Auth Check
    if (!Api.checkAuth()) return;
    loadChannels();
    
    // Use API URL as base for assets
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    setAssetUrl(apiUrl); 
  }, []); // Initial Load

  // Debounce Search or Load on Filter Change
  useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
        loadChannels();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const loadChannels = async () => {
    // Build Query String
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);

    const res = await Api.request(`/channels?${params.toString()}`);
    if (res && res.channels) {
      setChannels(res.channels);
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // ... (handleOpenModal, handleDelete, etc. remain the same) ...

  const handleOpenModal = (channel = null) => {
    if (channel) {
      setIsEditing(true);
      setFormData({
        id: channel.id,
        name: channel.name,
        stream_type: channel.stream_type || 'HLS',
        stream_url: channel.stream_url,
        status: channel.status
      });
    } else {
      setIsEditing(false);
      setFormData({ id: '', name: '', stream_type: 'HLS', stream_url: '', status: 'active' });
    }
    setLogoFile(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#3b82f6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await Api.request(`/channels/${id}`, 'DELETE');
      loadChannels();
      Swal.fire('Deleted!', 'The channel has been deleted.', 'success');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let url = '/channels';
    if (isEditing) {
      url = `/channels/${formData.id}`;
    }

    const files = logoFile ? { logo: logoFile } : null;
    const dataToSend = { ...formData };
    
    const res = await Api.request(url, 'POST', dataToSend, files);
    
    if (res && !res.error) {
      setModalOpen(false);
      loadChannels();
      Swal.fire('Success', isEditing ? 'Channel updated successfully' : 'Channel created successfully', 'success');
    } else {
      Swal.fire('Error', res?.error || 'Error saving channel', 'error');
    }
  };

  return (
    <>
      <div className={styles.actionBar}>
        <div className={styles.filters}>
            <input 
                type="text" 
                placeholder="Search..." 
                className={styles.filterInput}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <select 
                className={styles.filterSelect}
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
            >
                <option value="">All Types</option>
                <option value="HLS">HLS</option>
                <option value="MP3">MP3</option>
            </select>
            <select 
                className={styles.filterSelect}
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
            >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-lg me-2"></i> Add Channel
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Logo</th>
              <th>Name</th>
              <th>Type</th>
              <th>Stream URL</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center p-4">Loading...</td></tr>
            ) : channels.map(ch => (
              <tr key={ch.id}>
                <td>
                  {ch.logo_path ? (
                    <img src={`${assetUrl}${ch.logo_path}`} alt="logo" className={styles.logo} />
                  ) : (
                    <span className={styles.noLogo}>-</span>
                  )}
                </td>
                <td>{ch.name}</td>
                <td><span className={styles.badge}>{ch.stream_type || 'HLS'}</span></td>
                <td>
                  <a href={ch.stream_url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    Listen
                  </a>
                </td>
                <td>
                  <span className={`${styles.badge} ${ch.status === 'active' ? styles.success : styles.warning}`}>
                    {ch.status}
                  </span>
                </td>
                <td>
                  <button className={`${styles.actionBtn} ${styles.edit}`} onClick={() => handleOpenModal(ch)}>Edit</button>
                  <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDelete(ch.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Channel' : 'Create Channel'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="mb-3">
            <label>Channel Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>
          <div className="mb-3">
            <label>Stream Type</label>
            <select 
              className="form-control" 
              value={formData.stream_type} 
              onChange={(e) => setFormData({...formData, stream_type: e.target.value})}
            >
              <option value="HLS">HLS</option>
              <option value="MP3">MP3</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Stream URL</label>
            <input 
              type="url" 
              className="form-control" 
              value={formData.stream_url} 
              onChange={(e) => setFormData({...formData, stream_url: e.target.value})}
              required 
            />
          </div>
          <div className="mb-3">
             <label>Status</label>
             <select 
              className="form-control" 
              value={formData.status} 
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
               <option value="active">Active</option>
               <option value="inactive">Inactive</option>
             </select>
          </div>
          <div className="mb-3">
            <label>Channel Logo</label>
            <input 
              type="file" 
              className="form-control" 
              onChange={(e) => setLogoFile(e.target.files[0])} 
              accept="image/*"
            />
            {isEditing && !logoFile && <small className="text-muted">Leave empty to keep existing logo</small>}
          </div>
          <div className="text-end">
            <button type="button" className="btn btn-secondary me-2" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEditing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <style jsx global>{`
        /* Removed .layout and .content since they are handled globally now */
        .btn-secondary { background: #9ca3af; color: white; }
        .text-end { text-align: right; }
        .me-2 { margin-right: 0.5rem; }
        .text-muted { color: #6b7280; font-size: 0.875rem; }
        .mb-3 { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; }
        .text-center { text-align: center; }
        .p-4 { padding: 1rem; }
      `}</style>
    </>
  );
}
