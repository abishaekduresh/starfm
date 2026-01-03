'use client';
import { useEffect, useState } from 'react';
import Api from '../../services/api';
import Modal from '../../components/Modal';
import Swal from 'sweetalert2';
import styles from './Ads.module.css';

export default function Ads() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [assetUrl, setAssetUrl] = useState('');

  // Filter States
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });

  // Form State
  const initialForm = {
    id: '',
    name: '',
    type: 'image',
    resolution_select: '',
    resolution_custom: '',
    show_on: 'all',
    redirect_url: '',
    display_time: 10,
    idle_time: 0,
    expiry_time: '',
    click_tracking_enabled: false,
    status: 'active'
  };
  const [formData, setFormData] = useState(initialForm);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!Api.checkAuth()) return;
    loadAds();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/starfm.dureshtech.com/backend/public';
    setAssetUrl(apiUrl);
  }, []); // Initial load

  // Debounce Search or Load on Filter Change
  useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
        loadAds();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const loadAds = async () => {
    // Build Query String
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);

    const res = await Api.request(`/ads?${params.toString()}`);
    if (res && res.ads) {
      setAds(res.ads); // Depends on backend structure, assuming /ads returns filtered list now or we filter client side?
      // Wait, standard /ads returns all. I need to update backend AdController too?
      // The user asked to "make add filters too" and "make the /streams backend api to have mordern dynamic filter options".
      // They didn't explicitly ask to update AdController, but "add filters too" implies it should work.
      // I should update AdController.php as well.
      // For now, let's assume I will update AdController in the next step.
      // Actually, if I look at PublicController, I added filtering to /streams.
      // I should check if AdController supports filtering. If not, I'll need to update it.
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleOpenModal = (ad = null) => {
    setFile(null);
    if (ad) {
      setIsEditing(true);
      
      // Resolution Logic
      const standards = ['1920x1080', '1280x720', '1080x1920', '1080x1080', '16:9', '9:16'];
      let resSelect = '';
      let resCustom = '';
      if (ad.resolution && standards.includes(ad.resolution)) {
        resSelect = ad.resolution;
      } else if (ad.resolution) {
        resSelect = 'Custom';
        resCustom = ad.resolution;
      }

      setFormData({
        id: ad.id,
        name: ad.name,
        type: ad.type,
        resolution_select: resSelect,
        resolution_custom: resCustom,
        show_on: ad.show_on || 'all',
        redirect_url: ad.redirect_url || '',
        display_time: ad.display_time || 10,
        idle_time: ad.idle_time || 0,
        expiry_time: ad.expiry_time ? ad.expiry_time.replace(' ', 'T') : '',
        click_tracking_enabled: ad.click_tracking_enabled == 1,
        status: ad.status
      });
    } else {
      setIsEditing(false);
      // Default Expiry +30 days
      const now = new Date();
      now.setDate(now.getDate() + 30);
      const iso = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM

      setFormData({
        ...initialForm,
        expiry_time: iso
      });
    }
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
      await Api.request(`/ads/${id}`, 'DELETE');
      loadAds();
      Swal.fire('Deleted!', 'The ad has been deleted.', 'success');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare Data
    const dataToSend = { ...formData };
    
    // Resolution
    if (dataToSend.resolution_select === 'Custom') {
        dataToSend.resolution = dataToSend.resolution_custom;
    } else {
        dataToSend.resolution = dataToSend.resolution_select;
    }
    delete dataToSend.resolution_select;
    delete dataToSend.resolution_custom;

    // File Validation
    let files = null;
    if (file) {
        if (file.size > 1024 * 1024) {
            Swal.fire('Error', 'File size exceeds 1MB limit', 'error');
            return;
        }
        files = { file: file };
    }

    let url = '/ads';
    if (isEditing) {
      url = `/ads/${formData.id}`;
    }

    const res = await Api.request(url, 'POST', dataToSend, files);
    
    if (res && !res.error) {
      setModalOpen(false);
      loadAds();
      Swal.fire('Success', isEditing ? 'Ad updated successfully' : 'Ad created successfully', 'success');
    } else {
      Swal.fire('Error', res?.error || 'Error saving ad', 'error');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className={styles.actionBar}>
        <div className={styles.filters}>
            <input 
                type="text" 
                placeholder="Search ads..." 
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
                <option value="image">Image</option>
                <option value="banner">Banner</option>
                <option value="video">Video</option>
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
          <i className="bi bi-plus-lg me-2"></i> Add Ad
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Name</th>
              <th>Resolution</th>
              <th>Type</th>
              <th>Show On</th>
              <th>Status</th>
              <th>Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center p-4">Loading...</td></tr>
            ) : ads.map(ad => (
              <tr key={ad.id}>
                <td>
                  {(ad.type === 'image' || ad.type === 'banner') && ad.file_path ? (
                    <img src={`${assetUrl}${ad.file_path}`} alt="preview" className={styles.preview} />
                  ) : (
                    <span className={styles.badge}>{ad.type}</span>
                  )}
                </td>
                <td>{ad.name}</td>
                <td>{ad.resolution || '-'}</td>
                <td>{ad.type}</td>
                <td><span className={styles.badge}>{ad.show_on || 'all'}</span></td>
                <td>
                  <span className={`${styles.badge} ${ad.status === 'active' ? styles.success : ad.status === 'deleted' ? styles.secondary : styles.warning}`}>
                    {ad.status}
                  </span>
                </td>
                <td>{ad.expiry_time || 'Never'}</td>
                <td>
                  <button className={`${styles.actionBtn} ${styles.edit}`} onClick={() => handleOpenModal(ad)}>Edit</button>
                  <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDelete(ad.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Ad' : 'Create Ad'}>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className="col-span-2">
            <label>Ad Name</label>
            <input type="text" className="form-control" required 
                value={formData.name} onChange={e => handleChange('name', e.target.value)} />
          </div>

          <div>
             <label>Type</label>
             <select className="form-control" value={formData.type} onChange={e => handleChange('type', e.target.value)}>
                <option value="image">Image</option>
                <option value="banner">Banner</option>
                <option value="video">Video</option>
             </select>
          </div>

          <div>
             <label>Show On</label>
             <select className="form-control" value={formData.show_on} onChange={e => handleChange('show_on', e.target.value)}>
                <option value="all">All Channels</option>
                <option value="mobile">Mobile Only</option>
                <option value="web">Web Only</option>
             </select>
          </div>

          <div>
             <label>Resolution</label>
             <select className="form-control" value={formData.resolution_select} onChange={e => handleChange('resolution_select', e.target.value)}>
                <option value="">Select...</option>
                <option value="1920x1080">1920x1080</option>
                <option value="1280x720">1280x720</option>
                <option value="1080x1920">1080x1920</option>
                <option value="1080x1080">1080x1080</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="Custom">Custom</option>
             </select>
          </div>

          {formData.resolution_select === 'Custom' && (
             <div>
                <label>Custom Resolution</label>
                <input type="text" className="form-control" placeholder="e.g. 500x500" required 
                    value={formData.resolution_custom} onChange={e => handleChange('resolution_custom', e.target.value)} />
             </div>
          )}

          <div>
             <label>Display Time (sec)</label>
             <input type="number" className="form-control" min="1" 
                value={formData.display_time} onChange={e => handleChange('display_time', e.target.value)} />
          </div>

          <div>
             <label>Idle Time (sec)</label>
             <input type="number" className="form-control" min="0" 
                value={formData.idle_time} onChange={e => handleChange('idle_time', e.target.value)} />
          </div>

          <div className="col-span-2">
             <label>Expiry Time</label>
             <input type="datetime-local" className="form-control" 
                value={formData.expiry_time} onChange={e => handleChange('expiry_time', e.target.value)} />
          </div>

          <div className="col-span-2">
             <label>Redirect URL (Optional)</label>
             <input type="url" className="form-control" 
                value={formData.redirect_url} onChange={e => handleChange('redirect_url', e.target.value)} />
          </div>

          <div className="col-span-2">
            <label>Upload File (Max 1MB)</label>
            <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} accept="image/*,video/*" />
            {isEditing && !file && <small className="text-muted">Leave empty to keep existing file</small>}
          </div>

          <div className="col-span-2 checkbox-group">
            <input type="checkbox" id="clickTrack" 
                checked={formData.click_tracking_enabled} onChange={e => handleChange('click_tracking_enabled', e.target.checked)} />
            <label htmlFor="clickTrack">Enable Click Tracking</label>
          </div>

          <div className="col-span-2 text-end mt-4">
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
        .mt-4 { margin-top: 1rem; }
        .text-muted { color: #6b7280; font-size: 0.875rem; }
        .text-center { text-align: center; }
        .p-4 { padding: 1rem; }
        label { display: block; margin-bottom: 0.25rem; font-weight: 500; font-size: 0.875rem; }
        .checkbox-group { display: flex; align-items: center; gap: 0.5rem; }
        .checkbox-group label { margin-bottom: 0; }
        .col-span-2 { grid-column: span 2; }
      `}</style>
    </>
  );
}
