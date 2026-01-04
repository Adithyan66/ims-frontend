import { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { itemsService } from '../../services/itemsService';
import { customersService } from '../../services/customersService';
import { validators } from '../../utils/validators';

const SaleForm = ({ sale, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: '',
    customerId: '',
    isCash: false,
    date: new Date().toISOString().split('T')[0]
  });
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (sale) {
      setFormData({
        itemId: sale.itemId || '',
        quantity: sale.quantity || '',
        customerId: sale.customerId || '',
        isCash: sale.isCash || false,
        date: sale.date ? new Date(sale.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  }, [sale]);

  useEffect(() => {
    if (formData.itemId) {
      const item = items.find(i => i._id === formData.itemId);
      setSelectedItem(item);
      if (item && formData.quantity && Number(formData.quantity) > item.quantity) {
        setErrors(prev => ({ ...prev, quantity: `Quantity cannot exceed ${item.quantity}` }));
      }
    }
  }, [formData.itemId, items]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [itemsRes, customersRes] = await Promise.all([
        itemsService.getAll(),
        customersService.getAll()
      ]);
      
      const itemsData = itemsRes.data?.items || itemsRes.data?.data?.items || itemsRes.data || [];
      const customersData = customersRes.data?.customers || customersRes.data?.data?.customers || customersRes.data || [];
      
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    
    const itemError = validators.required(formData.itemId);
    if (itemError) newErrors.itemId = itemError;

    const qtyError = validators.required(formData.quantity);
    if (qtyError) {
      newErrors.quantity = qtyError;
    } else {
      const numQty = Number(formData.quantity);
      if (selectedItem && numQty > selectedItem.quantity) {
        newErrors.quantity = `Quantity cannot exceed ${selectedItem.quantity}`;
      } else if (numQty <= 0) {
        newErrors.quantity = 'Quantity must be greater than 0';
      }
    }

    if (!formData.isCash && !formData.customerId) {
      newErrors.customerId = 'Please select a customer or choose Cash sale';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        itemId: formData.itemId,
        quantity: Number(formData.quantity),
        date: formData.date,
        isCash: formData.isCash
      };
      
      if (!formData.isCash && formData.customerId) {
        submitData.customerId = formData.customerId;
      }

      onSubmit(submitData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const totalPrice = selectedItem && formData.quantity 
    ? (Number(formData.quantity) * selectedItem.price).toFixed(2) 
    : '0.00';

  return (
    <form onSubmit={handleSubmit}>
      {loadingData ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.itemId}
              onChange={(e) => handleChange('itemId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.itemId ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select an item</option>
              {items.map(item => (
                <option key={item._id} value={item._id}>
                  {item.name} (Qty: {item.quantity}, Price: ₹{item.price})
                </option>
              ))}
            </select>
            {errors.itemId && <p className="mt-1 text-sm text-red-500">{errors.itemId}</p>}
          </div>

          <Input
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            error={errors.quantity}
            required
          />

          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isCash}
                onChange={(e) => {
                  handleChange('isCash', e.target.checked);
                  if (e.target.checked) {
                    handleChange('customerId', '');
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Cash Sale</span>
            </label>
          </div>

          {!formData.isCash && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => handleChange('customerId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customerId ? 'border-red-500' : 'border-gray-300'
                }`}
                required={!formData.isCash}
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {errors.customerId && <p className="mt-1 text-sm text-red-500">{errors.customerId}</p>}
            </div>
          )}

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            required
          />

          {selectedItem && formData.quantity && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-gray-600">Total Price:</p>
              <p className="text-xl font-bold text-blue-600">₹{totalPrice}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : sale ? 'Update' : 'Create'}
            </Button>
          </div>
        </>
      )}
    </form>
  );
};

export default SaleForm;

