import Api from '../api.js';
import { ASSETS_URL } from '../config.js';
import Sidebar from '../components/Sidebar.js?v=1';
import Navbar from '../components/Navbar.js';

Api.checkAuth();

// Render Layout
document.body.insertAdjacentHTML('afterbegin', Sidebar.render('channels'));
document.querySelector('.content').insertAdjacentHTML('afterbegin', Navbar.render('Manage Channels'));
Sidebar.attachEvents();

const channelModal = new bootstrap.Modal(document.getElementById('channelModal'));
const channelForm = document.getElementById('channelForm');
let isEditing = false;

window.openModal = function() {
    isEditing = false;
    document.getElementById('modalTitle').textContent = 'Create Channel';
    channelForm.reset();
    document.getElementById('channelId').value = '';
    channelModal.show();
}

window.editChannel = (channel) => {
    isEditing = true;
    document.getElementById('modalTitle').textContent = 'Edit Channel';
    document.getElementById('channelId').value = channel.id;
    channelForm.name.value = channel.name;
    channelForm.stream_type.value = channel.stream_type || 'HLS';
    channelForm.stream_url.value = channel.stream_url;
    channelForm.status.value = channel.status;
    channelModal.show();
};

window.deleteChannel = async (id) => {
    if (confirm('Are you sure you want to delete this channel?')) {
        await Api.request(`/channels/${id}`, 'DELETE');
        loadChannels();
    }
};

async function loadChannels() {
    const res = await Api.request('/channels');
    const tbody = document.getElementById('channels-table-body');
    tbody.innerHTML = '';
    
    if (res && res.channels) {
        res.channels.forEach(ch => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    ${ch.logo_path ? `<img src="${ASSETS_URL}${ch.logo_path}" height="50">` : '-'}
                </td>
                <td>${ch.name}</td>
                <td><span class="badge bg-secondary">${ch.stream_type || 'HLS'}</span></td>
                <td><a href="${ch.stream_url}" target="_blank">Listen</a></td>
                <td><span class="badge bg-${ch.status === 'active' ? 'success' : (ch.status === 'deleted' ? 'secondary' : 'warning')}">${ch.status}</span></td>
                <td>
                    <a href="edit-channel.html?id=${ch.id}" class="btn btn-sm btn-info text-white">Edit</a>
                    <button class="btn btn-sm btn-danger" onclick="deleteChannel(${ch.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
            // tr.querySelector('.edit-btn').addEventListener('click', () => editChannel(ch)); // Removed event listener for modal
        });
    }
}

channelForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('channelId').value;
    const formData = new FormData(channelForm);
    const data = Object.fromEntries(formData.entries());
    const logoInput = document.getElementById('logoInput');

    let files = null;

    if (logoInput.files.length > 0) {
        const file = logoInput.files[0];
        if (file.size > 1024 * 1024) {
            alert('Logo size exceeds 1MB limit.');
            return;
        }
        files = { logo: file };
    }

    let url = '/channels';
    if (isEditing) {
        url = `/channels/${id}`;
    }

    const res = await Api.request(url, 'POST', data, files);
    
    if (res && !res.error) {
        channelModal.hide();
        loadChannels();
    } else {
        alert('Error saving channel: ' + (res.error || 'Unknown error'));
    }
});

loadChannels();
