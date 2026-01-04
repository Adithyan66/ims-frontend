import { useState, useEffect } from 'react';
import { reportsService } from '../../services/reportsService';
import { itemsService } from '../../services/itemsService';
import { customersService } from '../../services/customersService';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import { exportUtils } from '../../utils/exportUtils';
import { formatPrice } from '../../utils/formatters';

const SalesReport = () => {
  const [sales, setSales] = useState([]);
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState({ print: false, excel: false, pdf: false, email: false });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesRes, itemsRes, customersRes] = await Promise.all([
        reportsService.getSalesReport(),
        itemsService.getAll(),
        customersService.getAll()
      ]);

      const salesData = salesRes.data?.sales || salesRes.data?.data?.sales || salesRes.data || [];
      const itemsData = itemsRes.data?.items || itemsRes.data?.data?.items || itemsRes.data || [];
      const customersData = customersRes.data?.customers || customersRes.data?.data?.customers || customersRes.data || [];

      setSales(Array.isArray(salesData) ? salesData : []);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setError('');
    } catch (err) {
      setError('Failed to fetch sales report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getItemName = (itemId) => {
    if (typeof itemId === 'object' && itemId !== null) {
      return itemId.name || itemId._id;
    }
    const item = items.find(i => i._id === itemId);
    return item ? item.name : itemId;
  };

  const getCustomerName = (sale) => {
    if (sale.isCash) return 'Cash';
    if (sale.customerId) {
      if (typeof sale.customerId === 'object' && sale.customerId !== null) {
        return sale.customerId.name || sale.customerId._id;
      }
      const customer = customers.find(c => c._id === sale.customerId);
      return customer ? customer.name : sale.customerId;
    }
    return 'N/A';
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

  const getTotalPriceFormatted = (sale) => {
    return formatPrice(getTotalPrice(sale));
  };

  const handlePrint = () => {
    setExporting(prev => ({ ...prev, print: true }));
    try {
      const columns = ['Date', 'Item', 'Quantity', 'Customer/Cash', 'Total Price'];
      const rows = sales.map(sale => [
        new Date(sale.date).toLocaleDateString(),
        getItemName(sale.itemId),
        sale.quantity,
        getCustomerName(sale),
        formatPrice(getTotalPrice(sale))
      ]);
      exportUtils.printTable('Sales Report', columns, rows);
    } finally {
      setTimeout(() => setExporting(prev => ({ ...prev, print: false })), 500);
    }
  };

  const handleExcel = () => {
    setExporting(prev => ({ ...prev, excel: true }));
    try {
      const data = sales.map(sale => ({
        Date: new Date(sale.date).toLocaleDateString(),
        Item: getItemName(sale.itemId),
        Quantity: sale.quantity,
        'Customer/Cash': getCustomerName(sale),
        'Total Price': formatPrice(getTotalPrice(sale))
      }));
      exportUtils.exportToExcel(data, 'sales-report');
    } finally {
      setTimeout(() => setExporting(prev => ({ ...prev, excel: false })), 500);
    }
  };

  const handlePDF = () => {
    setExporting(prev => ({ ...prev, pdf: true }));
    try {
      const columns = ['Date', 'Item', 'Quantity', 'Customer/Cash', 'Total Price'];
      const rows = sales.map(sale => [
        new Date(sale.date).toLocaleDateString(),
        getItemName(sale.itemId),
        sale.quantity.toString(),
        getCustomerName(sale),
        formatPrice(getTotalPrice(sale))
      ]);
      exportUtils.exportToPDF(columns, rows, 'Sales Report', 'sales-report');
    } finally {
      setTimeout(() => setExporting(prev => ({ ...prev, pdf: false })), 500);
    }
  };

  const handleEmail = async () => {
    try {
      setExporting(prev => ({ ...prev, email: true }));
      await reportsService.sendSalesReportEmail();
      alert('Sales report sent to your email successfully!');
    } catch (err) {
      setError('Failed to send email');
      console.error(err);
    } finally {
      setExporting(prev => ({ ...prev, email: false }));
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
      key: 'customerId', 
      label: 'Customer/Cash',
      render: (_, row) => getCustomerName(row)
    },
    { 
      key: 'total', 
      label: 'Total Price',
      render: (_, row) => formatPrice(getTotalPrice(row))
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-200">Sales Report</h1>
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
          <Button variant="primary" onClick={handleEmail} disabled={exporting.email}>
            {exporting.email ? 'Sending...' : 'Email'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-800 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <Table
          columns={columns}
          data={sales}
          emptyMessage="No sales data available"
        />
      )}
    </div>
  );
};

export default SalesReport;

