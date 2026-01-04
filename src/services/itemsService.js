import apiClient from './api';

export const itemsService = {
  getAll: async (query = '') => {
    const url = query ? `/items/search?q=${encodeURIComponent(query)}` : '/items';
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

