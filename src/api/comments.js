import client from './axios';

export const getComments = async (postId, page = 0, config = {}) =>
    (await client.get(`/comments/post/${postId}`, { params: { page }, ...config })).data;
export const createComment = async (postId, data) =>
    (await client.post(`/comments/post/${postId}`, data)).data;
export const updateComment = async (id, data) =>
    (await client.patch(`/comments/${id}`, data)).data;
export const deleteComment = async (id, password) =>
    (await client.delete(`/comments/${id}`, { data: { password } })).data;
