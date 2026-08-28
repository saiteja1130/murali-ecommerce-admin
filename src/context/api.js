import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

let activeRequests = 0;
const startLoader = () => {
  if (activeRequests === 0) window.dispatchEvent(new Event('api-load-start'));
  activeRequests++;
};
const stopLoader = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) window.dispatchEvent(new Event('api-load-end'));
};

api.interceptors.request.use(
  (config) => {
    startLoader();
    const token = localStorage.getItem('sumilux_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    stopLoader();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    stopLoader();
    return response;
  },
  (error) => {
    stopLoader();
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sumilux_admin_token');
      localStorage.removeItem('sumilux_admin_user');

      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
