import { useState, useEffect } from 'react';
import { salesService } from '../../services/salesService';
import { itemsService } from '../../services/itemsService';
import { customersService } from '../../services/customersService';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import SaleForm from './SaleForm';
import { formatPrice } from '../../utils/formatters';

const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesRes, itemsRes, customersRes] = await Promise.all([
        salesService.getAll(),
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
      setError('Failed to fetch sales');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSale(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const handleDelete = async (sale) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) {
      return;
    }

    try {
      setDeletingId(sale._id);
      await salesService.delete(sale._id);
      fetchData();
    } catch (err) {
      setError('Failed to delete sale');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editingSale) {
        await salesService.update(editingSale._id, formData);
      } else {
        await salesService.create(formData);
      }
      setIsModalOpen(false);
      setEditingSale(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save sale');
      console.error(err);
    } finally {
      setSubmitting(false);
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
    let total = 0;
    if (sale.totalAmount !== undefined) {
      total = Number(sale.totalAmount);
    } else if (typeof sale.itemId === 'object' && sale.itemId !== null) {
      total = sale.itemId.price * sale.quantity;
    } else {
      const item = items.find(i => i._id === sale.itemId);
      if (item) {
        total = item.price * sale.quantity;
      }
    }
    return formatPrice(total);
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
      render: (_, row) => getTotalPrice(row)
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-200">Sales</h1>
        <Button variant="primary" onClick={handleCreate}>
          Add New Sale
        </Button>
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
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
          emptyMessage="No sales found"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSale(null);
        }}
        title={editingSale ? 'Edit Sale' : 'Add New Sale'}
      >
        <SaleForm
          sale={editingSale}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingSale(null);
          }}
          loading={submitting}
        />
      </Modal>
    </div>
  );
};

export default SalesList;

