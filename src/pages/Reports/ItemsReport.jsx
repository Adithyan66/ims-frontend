import { useState, useEffect } from 'react';
import { reportsService } from '../../services/reportsService';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import { exportUtils } from '../../utils/exportUtils';
import { formatPrice } from '../../utils/formatters';

const ItemsReport = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState({ print: false, excel: false, pdf: false });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await reportsService.getItemsReport();
      const itemsData = response.data?.items || response.data?.data?.items || response.data || [];
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setError('');
    } catch (err) {
      setError('Failed to fetch items report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setExporting(prev => ({ ...prev, print: true }));
    try {
      const columns = ['Name', 'Description', 'Quantity', 'Price'];
      const rows = items.map(item => [
        item.name,
        item.description,
        item.quantity.toString(),
        formatPrice(item.price)
      ]);
      exportUtils.printTable('Items Report', columns, rows);
    } finally {
      setTimeout(() => setExporting(prev => ({ ...prev, print: false })), 500);
    }
  };

  const handleExcel = () => {
    setExporting(prev => ({ ...prev, excel: true }));
    try {
      const data = items.map(item => ({
        Name: item.name,
        Description: item.description,
        Quantity: item.quantity,
        Price: formatPrice(item.price)
      }));
      exportUtils.exportToExcel(data, 'items-report');
    } finally {
      setTimeout(() => setExporting(prev => ({ ...prev, excel: false })), 500);
    }
  };

  const handlePDF = () => {
    setExporting(prev => ({ ...prev, pdf: true }));
    try {
      const columns = ['Name', 'Description', 'Quantity', 'Price'];
      const rows = items.map(item => [
        item.name,
        item.description,
        item.quantity.toString(),
        formatPrice(item.price)
      ]);
      exportUtils.exportToPDF(columns, rows, 'Items Report', 'items-report');
    } finally {
      setTimeout(() => setExporting(prev => ({ ...prev, pdf: false })), 500);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'quantity', label: 'Quantity' },
    { 
      key: 'price', 
      label: 'Price',
      render: (value) => formatPrice(value)
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-200">Items Report</h1>
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
          data={items}
          emptyMessage="No items data available"
        />
      )}
    </div>
  );
};

export default ItemsReport;

