import Api from '../api.js';
import { ASSETS_URL } from '../config.js';
import Sidebar from '../components/Sidebar.js?v=1';
import Navbar from '../components/Navbar.js';

Api.checkAuth();

// Render Layout
document.body.insertAdjacentHTML('afterbegin', Sidebar.render('channels'));
document.querySelector('.content').insertAdjacentHTML('afterbegin', Navbar.render('Edit Channel'));
Sidebar.attachEvents();

const form = document.getElementById('editChannelForm');
const urlParams = new URLSearchParams(window.location.search);
const channelId = urlParams.get('id');

if (!channelId) {
    alert('No channel specified');
    window.location.href = 'channels.html';
}

async function loadChannel() {
    const res = await Api.request(`/channels/${channelId}`);
    if (res && res.id) {
        document.getElementById('channelId').value = res.id;
        document.getElementById('name').value = res.name;
        document.getElementById('stream_type').value = res.stream_type;
        document.getElementById('stream_url').value = res.stream_url;
        document.getElementById('status').value = res.status;

        if (res.logo_path) {
            document.getElementById('currentLogo').innerHTML = `
                <p class="text-muted small">Current Logo:</p>
                <img src="${ASSETS_URL}${res.logo_path}" height="60" class="rounded">
            `;
        }
    } else {
        alert('Channel not found');
        window.location.href = 'channels.html';
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
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

    const res = await Api.request(`/channels/${channelId}`, 'POST', data, files);
    
    if (res && (res.message || res.id)) {
        alert('Channel updated successfully');
        window.location.href = 'channels.html';
    } else {
        alert('Error updating channel: ' + (res.error || 'Unknown error'));
    }
});

loadChannel();
