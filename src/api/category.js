import client from './axios';

export const createCategory = async (name) => {
    const response = await client.post('/category', null, {
        params: { name }
    });
    return response.data;
};

export const getCategoryList = async () => {
    const response = await client.get('/category/list');
    return response.data;
};
