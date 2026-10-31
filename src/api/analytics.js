import client from './axios';
export const getInterestCount = async () => (await client.get('/analytics/interest')).data;
export const getAnalytics = async (days, config = {}) => (await client.get('/admin/analytics', { params: { days }, ...config })).data;
export const getAnalyticsEvents = async (days, page, type, config = {}) => (await client.get('/admin/analytics/events', { params: { days, page, type }, ...config })).data;
