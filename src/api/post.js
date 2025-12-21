import client from './axios';

export const createPost = async (postData, categoryId) => {
    const response = await client.post('/post', postData, {
        params: { categoryId }
    });
    return response.data;
};

export const updatePost = async (categoryId, postId, postData) => {
    const response = await client.patch('/post', postData, {
        params: { categoryId, postId }
    });
    return response.data;
};

export const getPostBySlug = async (slug, config = {}) => {
    const response = await client.get(`/post/slug/${slug}`, { ...config });
    return response.data;
};

export const getPostById = async (id, config = {}) => {
    const response = await client.get(`/post/id/${id}`, { ...config });
    return response.data;
};

export const getAllPosts = async (page = 0, size = 10, categoryName, config = {}) => {
    const params = { page, size };
    if (categoryName) {
        params.categoryName = categoryName;
    }
    const response = await client.get('/post', { params, ...config });
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

export const getPostLikes = async (postId, config = {}) => {
    const response = await client.get(`/like/${postId}`, { ...config });
    return response.data;
};

export const deletePost = async (postId) => {
    const response = await client.delete(`/post/${postId}`);
    return response.data;
};

export const increasePostViewCount = async (postId) => {
    const response = await client.post(`/post/view-count/${postId}`);
    return response.data;
};
