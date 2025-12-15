import client from './axios';

export const login = async (username, password) => {
    const response = await client.post('/auth/login', { username, password });
    return response.data;
};

export const signup = async (userData) => {
    const response = await client.post('/user/author-signup', userData);
    return response.data;
};

export const adminSignup = async (userData) => {
    const response = await client.post('/user/admin-signup', userData);
    return response.data;
};
