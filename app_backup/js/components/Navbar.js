export default class Navbar {
    static render(title = 'Admin Panel') {
        const user = JSON.parse(localStorage.getItem('user')) || { name: 'Admin' };
        return `
            <nav class="navbar navbar-light bg-white border-bottom mb-4 rounded">
                <div class="container-fluid">
                    <span class="navbar-brand mb-0 h1">${title}</span>
                    <span class="fw-bold">${user.name}</span>
                </div>
            </nav>
        `;
    }
}
