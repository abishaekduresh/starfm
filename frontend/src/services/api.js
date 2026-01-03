// const API_BASE_URL = '/api'; // Hardcoded fallback for now due to env issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const X_Device_Platform=process.env.NEXT_PUBLIC_DEVICE_PLATFORM || 'web';
const X_API_KEY=process.env.NEXT_PUBLIC_API_KEY || 'starfm_secure_app_key_2026';

class Api {
    static async request(endpoint, method = 'GET', body = null, files = null) {
        let baseURL = API_BASE_URL;

        const headers = {};
        
        // Client-side access to localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        headers['X-Device-Platform'] = X_Device_Platform;
        headers['X-API-KEY'] = X_API_KEY;

        let options = {
            method: method,
            headers: headers
        };

        if (files) {
            const formData = new FormData();
            for (const key in body) {
                formData.append(key, body[key]);
            }
            for (const key in files) {
                formData.append(key, files[key]);
            }
            options.body = formData;
        } else if (body) {
            headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${baseURL}${endpoint}`, options);
            if (response.status === 401) {
                if (typeof window !== 'undefined') {
                    Api.logout();
                }
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { error: 'Network Error' };
        }
    }

    static logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }

    static checkAuth() {
        if (typeof window !== 'undefined') {
            if (!localStorage.getItem('token')) {
                window.location.href = '/login';
                return false;
            }
            return true;
        }
        return false;
    }
}

export default Api;
