import axios from 'axios';

// Set VITE_API_URL in gig-platform-frontend/.env to point at a different backend.
const DEFAULT_API_URL = import.meta.env.PROD
    ? 'https://gigconnect-fsd.onrender.com/api'
    : 'http://localhost:5000/api';

export const BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');

const api = axios.create({ baseURL: BASE_URL });//reusable axios object create krta hai yeh

const getStorage = () => {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage;
};

const decodeJwtPayload = (token) => {
    try {
        const base64Url = token?.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
};

const getAuthToken = () => {
    const storage = getStorage();
    const direct = storage?.getItem('token');
    const normalizedDirect = direct && direct !== 'undefined' && direct !== 'null' ? direct : null;

    let storedUser = null;
    try {
        storedUser = JSON.parse(storage?.getItem('user') || 'null');
    } catch {
        storedUser = null;
    }

    const fallback = storedUser?.token || storedUser?.accessToken;
    const normalizedFallback = fallback && fallback !== 'undefined' && fallback !== 'null' ? fallback : null;
    const token = normalizedDirect || normalizedFallback;

    if (!token) return null;
    if (!storedUser?._id) return token;

    const payload = decodeJwtPayload(token);
    if (!payload) return token;
    if (payload?.id && String(payload.id) === String(storedUser._id)) return token;

    return null;
};

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    else if (config.headers?.Authorization) delete config.headers.Authorization;
    return config;
});

// ── Auth ──
export const registerUser = (data) => api.post('/users/register', data);
export const loginUser = (data) => api.post('/users/login', data);
export const getMyProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
export const getWorkerUpdates = () => api.get('/users/worker-updates');
export const getUserById = (id) => api.get(`/users/${id}`);
export const getAllUsers = () => api.get('/users');
export const toggleStatus = (id) => api.put(`/users/${id}/toggle-status`);
export const deleteUserByAdmin = (id) => api.delete(`/users/${id}`);

// ── Gigs ──
export const getGigs = (params) => api.get('/gigs', { params });
export const getGigCategories = () => api.get('/gigs/categories');
export const getGigById = (id) => api.get(`/gigs/${id}`);
export const createGig = (data) => api.post('/gigs', data);
export const updateGig = (id, data) => api.put(`/gigs/${id}`, data);
export const deleteGig = (id) => api.delete(`/gigs/${id}`);
export const getMyGigs = () => api.get('/gigs/user/my-gigs');
export const createPaymentOrder = (gigId, data = {}) => api.post('/payments/create-order', { gigId, ...data });
export const verifyRazorpayPayment = (data) => api.post('/payments/verify', data);
export const markTestPaymentPaid = (gigId, data = {}) => api.post('/payments/test-mark-paid', { gigId, ...data });
export const getMyPayments = () => api.get('/payments/me');
export const markGigPaymentDone = (id, data = {}) => createPaymentOrder(id, data);//legacy alias for payment order creation
export const completeGig = (id) => api.put(`/gigs/${id}/complete`);
export const startGigWork = (id) => api.put(`/gigs/${id}/start`);
export const stopGigWork = (id) => api.put(`/gigs/${id}/stop`);
export const getGigInvoice = (id) => api.get(`/gigs/${id}/invoice`);

// ── Applications ──
export const applyForGig = (gigId, data) => api.post(`/applications/${gigId}`, data);
export const getGigApplications = (gigId) => api.get(`/applications/gig/${gigId}`);
export const getMyApplications = () => api.get('/applications/my-applications');
export const updateAppStatus = (id, payload) => api.put(`/applications/${id}/status`, payload);
export const getAllApplications = () => api.get('/applications');

// ── Reviews ──
export const addReview = (gigId, data) => api.post(`/reviews/${gigId}`, data);
export const getUserReviews = (userId) => api.get(`/reviews/user/${userId}`);
export const getGigReviews = (gigId) => api.get(`/reviews/gig/${gigId}`);

// Reports
export const createReport = (data) => api.post('/reports', data);

// ── Admin ──
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminGigs = () => api.get('/admin/gigs');
export const adminDeleteGig = (id) => api.delete(`/admin/gigs/${id}`);
export const getAdminReviews = () => api.get('/admin/reviews');
export const adminDeleteReview = (id) => api.delete(`/admin/reviews/${id}`);
export const getAdminReports = () => api.get('/admin/reports');
export const resolveAdminReport = (id, payload) => api.put(`/admin/reports/${id}/resolve`, payload);
export const getAdminPayments = () => api.get('/admin/payments');

// ── Notifications ──
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.put('/notifications/read-all');

// ── Chat ──
export const getGigMessages = (gigId) => api.get(`/chat/${gigId}`);
export const sendGigMessage = (gigId, data) => api.post(`/chat/${gigId}`, data);

export default api;
