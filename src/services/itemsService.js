import apiClient from './api';

export const itemsService = {
  getAll: async (page = 1, limit = 10, query = '') => {
    let url = `/items?page=${page}&limit=${limit}`;
    if (query && query.trim()) {
      url += `&q=${encodeURIComponent(query.trim())}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  search: async (query, page = 1, limit = 10) => {
    const response = await apiClient.get(`/items/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  },

  getList: async (query = '') => {
    let url = '/items/list';
    const trimmedQuery = query ? query.trim() : '';
    if (trimmedQuery) {
      url += `?q=${encodeURIComponent(trimmedQuery)}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/items/${id}`);
    return response.data;
  },

  create: async (itemData) => {
    const response = await apiClient.post('/items', itemData);
    return response.data;
  },

  update: async (id, itemData) => {
    const response = await apiClient.put(`/items/${id}`, itemData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/items/${id}`);
    return response.data;
  }
};

