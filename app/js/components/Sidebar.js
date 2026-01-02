import Api from '../api.js';

export default class Sidebar {
    static render(activePage) {
        return `
            <div class="sidebar">
                <h3 class="text-center py-3">Star FM</h3>
                <a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}"><i class="bi bi-speedometer2 me-2"></i> Dashboard</a>
                <a href="channels.html" class="${activePage === 'channels' ? 'active' : ''}"><i class="bi bi-broadcast me-2"></i> Manage Channels</a>
                <a href="ads.html" class="${activePage === 'ads' ? 'active' : ''}"><i class="bi bi-megaphone me-2"></i> Manage Ads</a>
                <a href="#" id="logout-btn"><i class="bi bi-box-arrow-right me-2"></i> Logout</a>
            </div>
        `;
    }

    static attachEvents() {
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            Api.logout();
        });
    }
}
