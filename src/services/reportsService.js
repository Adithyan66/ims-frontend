import apiClient from './api';

export const reportsService = {
  getSalesReport: async () => {
    const response = await apiClient.get('/reports/sales');
    return response.data;
  },

  getItemsReport: async () => {
    const response = await apiClient.get('/reports/items');
    return response.data;
  },

  getCustomerLedger: async (customerId) => {
    const response = await apiClient.get(`/reports/customers/${customerId}/ledger`);
    return response.data;
  },

  sendSalesReportEmail: async () => {
    const response = await apiClient.post('/reports/sales/email');
    return response.data;
  }
};

