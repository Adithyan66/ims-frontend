import apiClient from './api';

export const salesService = {
  getAll: async () => {
    const response = await apiClient.get('/sales');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/sales/${id}`);
    return response.data;
  },

  create: async (saleData) => {
    const response = await apiClient.post('/sales', saleData);
    return response.data;
  },

  update: async (id, saleData) => {
    const response = await apiClient.put(`/sales/${id}`, saleData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/sales/${id}`);
    return response.data;
  }
};

