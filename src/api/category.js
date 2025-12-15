import client from './axios';

export const createCategory = async (name) => {
    const response = await client.post('/category', null, {
        params: { name }
    });
    return response.data;
};
