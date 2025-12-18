import { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, signup as signupApi, adminSignup as adminSignupApi, normalSignup as normalSignupApi, updateUser as updateUserApi, logout as logoutApi } from '../api/auth';

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

        console.log(user);
    }, []);

    const login = async (username, password) => {
        setLoading(true);
        try {
            const data = await loginApi(username, password);
            // Store the full user object including role which comes from the response
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData, role = 'AUTHOR') => {
        setLoading(true);
        try {
            if (role === 'ADMIN') {
                await adminSignupApi(userData);
            } else if (role === 'USER') { // Support for Normal User
                await normalSignupApi(userData);
            } else {
                await signupApi(userData);
            }
            return { success: true };
        } catch (error) {
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const updateUserInfo = async (userData) => {
        setLoading(true);
        try {
            const updatedUser = await updateUserApi(user.id, userData);
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return { success: true };
        } catch (error) {
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateUserInfo, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
