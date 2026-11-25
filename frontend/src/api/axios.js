import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true // Szükséges a sütik (refreshToken) küldéséhez
});

export const setupInterceptors = (getAccessToken, setAccessToken) => {
    api.interceptors.request.use(
        (config) => {
            const token = getAccessToken();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const prevRequest = error?.config;
            if (error?.response?.status === 403 && !prevRequest?._retry) {
                prevRequest._retry = true;
                try {
                    const res = await axios.post('http://localhost:5000/refresh-token', {}, { withCredentials: true });
                    const newAccessToken = res.data.accessToken;
                    setAccessToken(newAccessToken);
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return api(prevRequest);
                } catch (refreshError) {
                    setAccessToken(null);
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
};

export default api;