import client from './axios';

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post('/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return {
        ...response.data,
        url: `${response.data.url}`
    };
};
