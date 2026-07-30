/** This boot file sets up Axios with interceptors for handling global errors
 * and adding the token to the request headers */
import { boot } from 'quasar/wrappers';

// npm package
import axios from 'axios';

// Stores
import { useAuthStore } from 'stores/auth';

// utils
import { backendApiUrl } from 'src/utils/helperFunctions';

const baseURL = backendApiUrl();

// Create a new Axios instance
const api = axios.create({
  baseURL,
  // Set the timeout to 10 seconds
  timeout: 10000,
  withCredentials: true,
  paramsSerializer: (params) => {
    const queryString = Object.entries(params)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          // Repeat key for each item in the array
          return value.map((val) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`).join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');

    return queryString;
  },
});

// Separate instance to avoid interceptor loop
const refreshApi = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });

  failedQueue = [];
};

export default boot(({ app, store, router }) => {
  // Access the auth store
  const authStore = useAuthStore(store);

  // Add request interceptor
  api.interceptors.request.use(
    (config) => {
      // Dynamically add the token from the auth store
      const { token } = authStore;

      if (process.env.DEV_MODE) {
        config.headers['ngrok-skip-browser-warning'] = true;
      }

      // const currentRoute = router.currentRoute.value;
      // const isSemiPublic = currentRoute.meta?.isSemiPublic;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor for handling global errors
  api.interceptors.response.use(
    (response) => response,

    async (error) => {
      const originalRequest = error.config;

      if (!originalRequest) {
        return Promise.reject(error.response || error);
      }

      if (!error.response) {
        return Promise.reject(error);
      }

      const { status } = error.response;

      if (status !== 401) {
        return Promise.reject(error.response || error);
      }

      const currentRoute = router.currentRoute.value;
      const isSemiPublic = currentRoute.meta?.isSemiPublic;

      if (isSemiPublic) {
        return Promise.reject(error.response || error);
      }

      if (originalRequest._retry) {
        authStore.logoutUser?.();
        return Promise.reject(error.response || error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await refreshApi.post('/users/refresh-token');

        const newAccessToken = refreshResponse?.data?.token?.access_token;

        if (!newAccessToken) {
          throw new Error('Access token missing from refresh response');
        }

        authStore.setField({
          field: 'token',
          value: newAccessToken,
        });

        processQueue(null, newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        authStore.logoutUser?.();

        return Promise.reject(refreshError.response || refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );

  // Add Axios to the app and store
  app.config.globalProperties.$api = api;
  app.config.globalProperties.$axios = axios;

  store.$axios = api;

  app.provide('$axios', axios);
  app.provide('$api', api);
});

export { api };
