import { createContext, useState, useEffect, useRef } from 'react';
import api, { setupInterceptors } from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const tokenRef = useRef(accessToken);

    tokenRef.current = accessToken;

    useEffect(() => {
        setupInterceptors(() => tokenRef.current, setAccessToken);

        // Oldal újratöltésekor megpróbáljuk frissíteni a tokent a sütiből
        const initAuth = async () => {
            try {
                const res = await api.post('/refresh-token');
                setAccessToken(res.data.accessToken);
                setUser(res.data.user);
            } catch {
                setAccessToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/login', { email, password });
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
    };

    const logout = async () => {
        await api.post('/logout');
        setAccessToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};