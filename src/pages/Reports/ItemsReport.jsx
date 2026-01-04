import { useState, useEffect } from 'react';
import { reportsService } from '../../services/reportsService';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import { exportUtils } from '../../utils/exportUtils';

const ItemsReport = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    const columns = ['Name', 'Description', 'Quantity', 'Price'];
    const rows = items.map(item => [
      item.name,
      item.description,
      item.quantity.toString(),
      `₹${Number(item.price).toFixed(2)}`
    ]);
    exportUtils.printTable('Items Report', columns, rows);
  };

  const handleExcel = () => {
    const data = items.map(item => ({
      Name: item.name,
      Description: item.description,
      Quantity: item.quantity,
      Price: `₹${Number(item.price).toFixed(2)}`
    }));
    exportUtils.exportToExcel(data, 'items-report');
  };

  const handlePDF = () => {
    const columns = ['Name', 'Description', 'Quantity', 'Price'];
    const rows = items.map(item => [
      item.name,
      item.description,
      item.quantity.toString(),
      `₹${Number(item.price).toFixed(2)}`
    ]);
    exportUtils.exportToPDF(columns, rows, 'Items Report', 'items-report');
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'quantity', label: 'Quantity' },
    { 
      key: 'price', 
      label: 'Price',
      render: (value) => `₹${Number(value).toFixed(2)}`
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Items Report</h1>
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
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
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

