const API_URL = '/api';

const auth = {
    setToken: (token) => localStorage.setItem('token', token),
    getToken: () => localStorage.getItem('token'),
    removeToken: () => localStorage.removeItem('token'),

    setAdminToken: (token) => localStorage.setItem('adminToken', token),
    getAdminToken: () => localStorage.getItem('adminToken'),
    removeAdminToken: () => localStorage.removeItem('adminToken'),

    isLoggedIn: () => !!localStorage.getItem('token'),
    isAdminLoggedIn: () => !!localStorage.getItem('adminToken'),

    async fetch(url, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url, { ...options, headers });
        if (res.status === 401) {
            this.removeToken();
            window.location.href = '/login.html';
        }
        return res.json();
    },

    async fetchAdmin(url, options = {}) {
        const token = this.getAdminToken();
        const headers = {
            'Content-Type': 'application/json',
            'x-admin-username': 'rajpapa',
            'x-admin-token': token,
            ...options.headers
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url, { ...options, headers });
        return res.json();
    }
};

async function login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
        auth.setToken(data.data.token);
        window.location.href = '/dashboard.html';
    } else {
        alert(data.error);
    }
}

async function register(username, email, password, referralCode) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, referralCode })
    });
    const data = await res.json();
    if (data.success) {
        alert('Registration successful! Please login.');
        window.location.href = '/login.html';
    } else {
        alert(data.error);
    }
}

async function adminLogin(username, password) {
    const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
        auth.setAdminToken(data.data.token);
        window.location.href = '/admin/raj.html';
    } else {
        alert(data.error);
    }
}

function logout() {
    auth.removeToken();
    window.location.href = '/';
}
