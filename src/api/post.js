import client from './axios';

export const createPost = async (postData, categoryId) => {
    const response = await client.post('/post', postData, {
        params: { categoryId }
    });
    return response.data;
};

export const getPostBySlug = async (slug) => {
    const response = await client.get(`/post/slug/${slug}`);
    return response.data;
};

export const getPostById = async (id) => {
    const response = await client.get(`/post/id/${id}`);
    return response.data;
};

export const getAllPosts = async (page = 0, size = 10, categoryName) => {
    const params = { page, size };
    if (categoryName) {
        params.categoryName = categoryName;
    }
    const response = await client.get('/post', { params });
    return response.data;
};

export const likePost = async (postId) => {
    const response = await client.post(`/like/${postId}`);
    return response.data;
};

export const unlikePost = async (postId) => {
    const response = await client.delete(`/like/${postId}`);
    return response.data;
};
