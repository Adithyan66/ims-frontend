import { useState, useEffect } from 'react';
import { reportsService } from '../../services/reportsService';
import { customersService } from '../../services/customersService';
import { itemsService } from '../../services/itemsService';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import { exportUtils } from '../../utils/exportUtils';
import { formatPrice } from '../../utils/formatters';

const CustomerLedger = () => {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState({ print: false, excel: false, pdf: false });

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
      // Response structure from API: { status: "success", data: [...], message: "..." }
      // reportsService returns response.data, so response = { status: "success", data: [...], message: "..." }
      const ledgerData = response.data || [];
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
    setExporting(prev => ({ ...prev, print: true }));
    try {
      const columns = ['Date', 'Item', 'Quantity', 'Total Price'];
      const rows = ledger.map(sale => [
        new Date(sale.date).toLocaleDateString(),
        getItemName(sale.itemId),
        sale.quantity.toString(),
        formatPrice(getTotalPrice(sale))
      ]);
      exportUtils.printTable(`${getSelectedCustomerName()} - Customer Ledger`, columns, rows);
    } finally {
      setTimeout(() => setExporting(prev => ({ ...prev, print: false })), 500);
    }
  };

  const handleExcel = () => {
    if (!selectedCustomerId || ledger.length === 0) {
      alert('Please select a customer first');
      return;
    }
    setExporting(prev => ({ ...prev, excel: true }));
    try {
      const data = ledger.map(sale => ({
        Date: new Date(sale.date).toLocaleDateString(),
        Item: getItemName(sale.itemId),
        Quantity: sale.quantity,
        'Total Price': formatPrice(getTotalPrice(sale))
      }));
      exportUtils.exportToExcel(data, `${getSelectedCustomerName().replace(/\s+/g, '-')}-ledger`);
    } finally {
      setTimeout(() => setExporting(prev => ({ ...prev, excel: false })), 500);
    }
  };

  const handlePDF = () => {
    if (!selectedCustomerId || ledger.length === 0) {
      alert('Please select a customer first');
      return;
    }
    setExporting(prev => ({ ...prev, pdf: true }));
    try {
      const columns = ['Date', 'Item', 'Quantity', 'Total Price'];
      const rows = ledger.map(sale => [
        new Date(sale.date).toLocaleDateString(),
        getItemName(sale.itemId),
        sale.quantity.toString(),
        formatPrice(getTotalPrice(sale))
      ]);
      exportUtils.exportToPDF(columns, rows, `${getSelectedCustomerName()} - Customer Ledger`, `${getSelectedCustomerName().replace(/\s+/g, '-')}-ledger`);
    } finally {
      setTimeout(() => setExporting(prev => ({ ...prev, pdf: false })), 500);
    }
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
      render: (_, row) => formatPrice(getTotalPrice(row))
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-200">Customer Ledger</h1>
        {selectedCustomerId && ledger.length > 0 && (
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={handlePrint} disabled={exporting.print}>
              {exporting.print ? 'Printing...' : 'Print'}
            </Button>
            <Button variant="secondary" onClick={handleExcel} disabled={exporting.excel}>
              {exporting.excel ? 'Exporting...' : 'Excel'}
            </Button>
            <Button variant="secondary" onClick={handlePDF} disabled={exporting.pdf}>
              {exporting.pdf ? 'Generating...' : 'PDF'}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-800 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Customer
        </label>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 bg-gray-800 text-gray-200 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="text-center py-8 text-gray-400">
          Please select a customer to view their ledger
        </div>
      )}
    </div>
  );
};

export default CustomerLedger;

