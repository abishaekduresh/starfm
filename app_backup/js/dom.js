export function mount(containerId, html) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = html;
}

export function append(containerId, html) {
    const el = document.getElementById(containerId);
    if (el) el.insertAdjacentHTML('beforeend', html);
}
