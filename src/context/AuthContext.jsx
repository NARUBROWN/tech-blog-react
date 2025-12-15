import { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, signup as signupApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Check for existing session on mount (simplified for now)
    useEffect(() => {
        // In a real app, we'd check for a token or hit a /me endpoint
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (username, password) => {
        setLoading(true);
        try {
            await loginApi(username, password);
            // Since API spec doesn't show return user data on login, we'll manually set a user object for now
            // or assume the cookie is set.
            // For Demo purposes, let's store the username.
            const userObj = { username };
            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
            return { success: true };
        } catch (error) {
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData) => {
        setLoading(true);
        try {
            await signupApi(userData);
            return { success: true };
        } catch (error) {
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
