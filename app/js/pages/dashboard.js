import Api from '../api.js';
import Sidebar from '../components/Sidebar.js?v=1';
import Navbar from '../components/Navbar.js';
import { mount, append } from '../dom.js';
import { API_BASE_URL } from '../config.js';

export async function initDashboard() {
    Api.checkAuth();

    // Render Layout
    document.body.insertAdjacentHTML('afterbegin', Sidebar.render('dashboard'));
    
    // Mount Navbar
    const contentDiv = document.querySelector('.content');
    contentDiv.insertAdjacentHTML('afterbegin', Navbar.render('Dashboard'));

    Sidebar.attachEvents();
    loadStats();

    // Set Public API URL
    const fullApiUrl = window.location.origin + API_BASE_URL + '/stream';
    const apiUrlInput = document.getElementById('apiUrl');
    if (apiUrlInput) {
        apiUrlInput.value = fullApiUrl;
        
        document.getElementById('copyApiBtn').addEventListener('click', () => {
            apiUrlInput.select();
            document.execCommand('copy');
            alert('URL copied to clipboard!');
        });
    }
}

async function loadStats() {
    const data = await Api.request('/dashboard');
    if (data && data.stats) {
        document.getElementById('total-ads').textContent = data.stats.total_ads;
        document.getElementById('active-ads').textContent = data.stats.active_ads;
        document.getElementById('expired-ads').textContent = data.stats.expired_ads;
    }
}

initDashboard();
