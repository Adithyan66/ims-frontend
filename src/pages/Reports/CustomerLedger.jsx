import { useState, useEffect } from 'react';
import { reportsService } from '../../services/reportsService';
import { customersService } from '../../services/customersService';
import { itemsService } from '../../services/itemsService';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import { exportUtils } from '../../utils/exportUtils';

const CustomerLedger = () => {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchLedger();
    } else {
      setLedger([]);
    }
  }, [selectedCustomerId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customersRes, itemsRes] = await Promise.all([
        customersService.getAll(),
        itemsService.getAll()
      ]);

      const customersData = customersRes.data?.customers || customersRes.data?.data?.customers || customersRes.data || [];
      const itemsData = itemsRes.data?.items || itemsRes.data?.data?.items || itemsRes.data || [];

      setCustomers(Array.isArray(customersData) ? customersData : []);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setError('');
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async () => {
    try {
      setLoadingLedger(true);
      const response = await reportsService.getCustomerLedger(selectedCustomerId);
      const ledgerData = response.data?.transactions || response.data?.data?.transactions || response.data || [];
      setLedger(Array.isArray(ledgerData) ? ledgerData : []);
      setError('');
    } catch (err) {
      setError('Failed to fetch customer ledger');
      console.error(err);
    } finally {
      setLoadingLedger(false);
    }
  };

  const getItemName = (itemId) => {
    if (typeof itemId === 'object' && itemId !== null) {
      return itemId.name || itemId._id;
    }
    const item = items.find(i => i._id === itemId);
    return item ? item.name : itemId;
  };

  const getTotalPrice = (sale) => {
    if (sale.totalAmount !== undefined) {
      return Number(sale.totalAmount);
    }
    if (typeof sale.itemId === 'object' && sale.itemId !== null) {
      return sale.itemId.price * sale.quantity;
    }
    const item = items.find(i => i._id === sale.itemId);
    if (item) {
      return item.price * sale.quantity;
    }
    return 0;
  };

  const getSelectedCustomerName = () => {
    const customer = customers.find(c => c._id === selectedCustomerId);
    return customer ? customer.name : 'Customer';
  };

  const handlePrint = () => {
    if (!selectedCustomerId || ledger.length === 0) {
      alert('Please select a customer first');
      return;
    }
    const columns = ['Date', 'Item', 'Quantity', 'Total Price'];
    const rows = ledger.map(sale => [
      new Date(sale.date).toLocaleDateString(),
      getItemName(sale.itemId),
      sale.quantity.toString(),
      `₹${getTotalPrice(sale).toFixed(2)}`
    ]);
    exportUtils.printTable(`${getSelectedCustomerName()} - Customer Ledger`, columns, rows);
  };

  const handleExcel = () => {
    if (!selectedCustomerId || ledger.length === 0) {
      alert('Please select a customer first');
      return;
    }
    const data = ledger.map(sale => ({
      Date: new Date(sale.date).toLocaleDateString(),
      Item: getItemName(sale.itemId),
      Quantity: sale.quantity,
      'Total Price': `₹${getTotalPrice(sale).toFixed(2)}`
    }));
    exportUtils.exportToExcel(data, `${getSelectedCustomerName().replace(/\s+/g, '-')}-ledger`);
  };

  const handlePDF = () => {
    if (!selectedCustomerId || ledger.length === 0) {
      alert('Please select a customer first');
      return;
    }
    const columns = ['Date', 'Item', 'Quantity', 'Total Price'];
    const rows = ledger.map(sale => [
      new Date(sale.date).toLocaleDateString(),
      getItemName(sale.itemId),
      sale.quantity.toString(),
      `₹${getTotalPrice(sale).toFixed(2)}`
    ]);
    exportUtils.exportToPDF(columns, rows, `${getSelectedCustomerName()} - Customer Ledger`, `${getSelectedCustomerName().replace(/\s+/g, '-')}-ledger`);
  };

  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'itemId', 
      label: 'Item',
      render: (value, row) => getItemName(row.itemId)
    },
    { key: 'quantity', label: 'Quantity' },
    { 
      key: 'total', 
      label: 'Total Price',
      render: (_, row) => `₹${getTotalPrice(row).toFixed(2)}`
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Customer Ledger</h1>
        {selectedCustomerId && ledger.length > 0 && (
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={handlePrint}>
              Print
            </Button>
            <Button variant="secondary" onClick={handleExcel}>
              Excel
            </Button>
            <Button variant="secondary" onClick={handlePDF}>
              PDF
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Customer
        </label>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a customer...</option>
          {customers.map(customer => (
            <option key={customer._id} value={customer._id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      {loadingLedger ? (
        <div className="text-center py-8">Loading ledger...</div>
      ) : selectedCustomerId ? (
        <Table
          columns={columns}
          data={ledger}
          emptyMessage="No transactions found for this customer"
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          Please select a customer to view their ledger
        </div>
      )}
    </div>
  );
};

export default CustomerLedger;

