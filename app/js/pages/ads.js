import Api from '../api.js';
import { ASSETS_URL } from '../config.js';
import Sidebar from '../components/Sidebar.js?v=1';
import Navbar from '../components/Navbar.js';

Api.checkAuth();

// Render Layout
document.body.insertAdjacentHTML('afterbegin', Sidebar.render('ads'));
document.querySelector('.content').insertAdjacentHTML('afterbegin', Navbar.render('Manage Ads'));
Sidebar.attachEvents();

const adModal = new bootstrap.Modal(document.getElementById('adModal'));
const adForm = document.getElementById('adForm');
let isEditing = false;

window.openModal = function() {
    isEditing = false;
    document.getElementById('modalTitle').textContent = 'Create Ad';
    adForm.reset();
    document.getElementById('adId').value = '';
    adModal.show();
    
    // Set default expiry to +30 days
    const now = new Date();
    now.setDate(now.getDate() + 30);
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    // We adjust for timezone offset to show local time or just use simplified ISO
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    adForm.expiry_time.value = `${year}-${month}-${day}T${hours}:${minutes}`;
}

window.editAd = (ad) => {
    isEditing = true;
    document.getElementById('modalTitle').textContent = 'Edit Ad';
    document.getElementById('adId').value = ad.id;
    adForm.name.value = ad.name;
    adForm.type.value = ad.type;
    adForm.show_on.value = ad.show_on || 'all';
    adForm.redirect_url.value = ad.redirect_url;
    adForm.display_time.value = ad.display_time;
    adForm.idle_time.value = ad.idle_time;
    adForm.expiry_time.value = ad.expiry_time ? ad.expiry_time.replace(' ', 'T') : '';
    document.getElementById('clickTracking').checked = ad.click_tracking_enabled == 1;

    // Handle Resolution Population
    const standardResolutions = ['1920x1080', '1280x720', '1080x1920', '1080x1080', '16:9', '9:16'];
    const resolutionSelect = document.getElementById('resolutionSelect');
    const resolutionCustom = document.getElementById('resolutionCustom');
    
    if (ad.resolution && standardResolutions.includes(ad.resolution)) {
        resolutionSelect.value = ad.resolution;
        resolutionCustom.classList.add('d-none');
    } else if (ad.resolution) {
        resolutionSelect.value = 'Custom';
        resolutionCustom.value = ad.resolution;
        resolutionCustom.classList.remove('d-none');
    } else {
        resolutionSelect.value = '';
        resolutionCustom.classList.add('d-none');
    }

    adModal.show();
};

window.deleteAd = async (id) => {
    if (confirm('Are you sure you want to delete this ad?')) {
        await Api.request(`/ads/${id}`, 'DELETE');
        loadAds();
    }
};

async function loadAds() {
    const res = await Api.request('/ads');
    const tbody = document.getElementById('ads-table-body');
    tbody.innerHTML = '';
    
    if (res && res.ads) {
        res.ads.forEach(ad => {
            const tr = document.createElement('tr');
            // Store ad object on the button element to avoid passing complex objects in HTML string
            tr.innerHTML = `
                <td>
                    ${(ad.type === 'image' || ad.type === 'banner') && ad.file_path ? `<img src="${ASSETS_URL}${ad.file_path}" height="50">` : ad.type}
                </td>
                <td>${ad.name}</td>
                <td>${ad.resolution || '-'}</td>
                <td>${ad.type}</td>
                <td><span class="badge bg-secondary">${ad.show_on || 'all'}</span></td>
                <td><span class="badge bg-${ad.status === 'active' ? 'success' : (ad.status === 'deleted' ? 'secondary' : 'warning')}">${ad.status}</span></td>
                <td>${ad.expiry_time || 'Never'}</td>
                <td>
                    <button class="btn btn-sm btn-info text-white edit-btn" data-id="${ad.id}">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAd(${ad.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
            
            // Attach event listener to edit button to handle object passing
            tr.querySelector('.edit-btn').addEventListener('click', () => editAd(ad));
        });
    }
}

    const resolutionSelect = document.getElementById('resolutionSelect');
    const resolutionCustom = document.getElementById('resolutionCustom');

    // Handle Resolution dropdown change
    resolutionSelect.addEventListener('change', () => {
        if (resolutionSelect.value === 'Custom') {
            resolutionCustom.classList.remove('d-none');
            resolutionCustom.required = true;
        } else {
            resolutionCustom.classList.add('d-none');
            resolutionCustom.required = false;
        }
    });

    // Handle form submit
    adForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('adId').value;
        const formData = new FormData(adForm);
        const data = Object.fromEntries(formData.entries());
        const fileInput = document.getElementById('fileInput');

        // Logic for resolution
        if (data.resolution_select === 'Custom') {
            data.resolution = data.resolution_custom;
        } else {
            data.resolution = data.resolution_select;
        }
        delete data.resolution_select;
        delete data.resolution_custom;

        let files = null;
    
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            
            // 1. Validation: Max 1MB
            if (file.size > 1024 * 1024) {
                alert('File size exceeds 1MB limit.');
                return;
            }
    
            files = { file: file };
        }
    
        if (formData.get('click_tracking_enabled')) {
             data.click_tracking_enabled = true;
        }
    
        let url = '/ads';
        if (isEditing) {
            url = `/ads/${id}`;
        }
    
        const res = await Api.request(url, 'POST', data, files);
        
        if (res && !res.error) {
            adModal.hide();
            loadAds();
        } else {
            alert('Error saving ad: ' + (res.error || 'Unknown error'));
        }
    });

loadAds();
loadAds();
