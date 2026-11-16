import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Prevent redirect loops if already on login/register/public auth pages
        const publicPaths = ['/login', '/register', '/forgot-password', '/pricing', '/contact'];
        const currentPath = window.location.pathname;
        const isPublicPath = publicPaths.some((path) => currentPath.startsWith(path));

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (!isPublicPath) {
          window.location.href = '/login?session_expired=true';
        }
      } else if (error.response.status === 402) {
        // Subscription is inactive or past due
        // Redirect to a billing or subscription page
        if (window.location.pathname !== '/pricing') {
          window.location.href = '/pricing?locked=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
