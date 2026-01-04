import apiClient from './api';

export const customersService = {
  getAll: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`/customers?page=${page}&limit=${limit}`);
    return response.data;
  },

  search: async (query, page = 1, limit = 10) => {
    const response = await apiClient.get(`/customers/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  },

  getList: async (query = '') => {
    let url = '/customers/list';
    const trimmedQuery = query ? query.trim() : '';
    if (trimmedQuery) {
      url += `?q=${encodeURIComponent(trimmedQuery)}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  create: async (customerData) => {
    const response = await apiClient.post('/customers', customerData);
    return response.data;
  },

  update: async (id, customerData) => {
    const response = await apiClient.put(`/customers/${id}`, customerData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  }
};

