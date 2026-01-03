import { API_BASE_URL } from './config.js';

class Api {
    static async request(endpoint, method = 'GET', body = null, files = null) {
        
        // Failsafe: Ensure API URL is absolute and correct
        let baseURL = API_BASE_URL;
        if (!baseURL || !baseURL.startsWith('http')) {
            console.warn('API_BASE_URL is relative/improper:', baseURL);
            // Force Production URL if config is broken
            baseURL = 'https://starfm.dureshtech.com/backend/public/api'; 
        }

        console.log('Final API_BASE_URL:', baseURL); 
        const token = localStorage.getItem('token');
        const headers = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Identify as Web Client for Ad Filtering
        headers['X-Device-Platform'] = 'web';
        // Required API Key
        headers['X-API-KEY'] = 'starfm_secure_app_key_2026';

        let options = {
            method: method,
            headers: headers
        };

        if (files) {
            const formData = new FormData();
            for (const key in body) {
                formData.append(key, body[key]);
            }
            // files is expected to be an object { fieldName: FileObject }
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
                // Unauthorized
                Api.logout();
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { error: 'Network Error' };
        }
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    static checkAuth() {
        if (!localStorage.getItem('token')) {
            window.location.href = 'login.html';
        }
    }
}

export default Api;
