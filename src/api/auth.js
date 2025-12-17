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


export const normalSignup = async (userData) => {
    const response = await client.post('/user/normal-signup', userData);
    return response.data;
};

export const updateUser = async (id, userData) => {
    const response = await client.patch(`/user/${id}`, userData);
    return response.data;
};

export const logout = async () => {
    const response = await client.post('/auth/logout');
    return response.data;
};
