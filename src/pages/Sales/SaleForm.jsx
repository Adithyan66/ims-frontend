import { useState, useEffect, useRef } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import { itemsService } from '../../services/itemsService';
import { customersService } from '../../services/customersService';
import { validators } from '../../utils/validators';
import { formatPrice, formatNumber } from '../../utils/formatters';

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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [itemsSearchQuery, setItemsSearchQuery] = useState('');
  const [customersSearchQuery, setCustomersSearchQuery] = useState('');
  const [isItemsDropdownOpen, setIsItemsDropdownOpen] = useState(false);
  const [isCustomersDropdownOpen, setIsCustomersDropdownOpen] = useState(false);
  const itemsDropdownRef = useRef(null);
  const customersDropdownRef = useRef(null);
  const itemsSearchInputRef = useRef(null);
  const customersSearchInputRef = useRef(null);

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);
        const [itemsRes, customersRes] = await Promise.all([
          itemsService.getList(''),
          customersService.getList('')
        ]);
        
        const itemsData = itemsRes.data || [];
        const customersData = customersRes.data || [];
        
        setItems(Array.isArray(itemsData) ? itemsData : []);
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Search items with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchItems = async () => {
        try {
          const query = itemsSearchQuery.trim();
          const response = await itemsService.getList(query);
          const itemsData = response.data || [];
          setItems(Array.isArray(itemsData) ? itemsData : []);
        } catch (err) {
          console.error('Error fetching items:', err);
        }
      };
      fetchItems();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [itemsSearchQuery]);

  // Search customers with debounce
  useEffect(() => {
    if (formData.isCash) return; // Don't fetch customers if cash sale
    
    const timeoutId = setTimeout(() => {
      const fetchCustomers = async () => {
        try {
          const query = customersSearchQuery.trim();
          const response = await customersService.getList(query);
          const customersData = response.data || [];
          setCustomers(Array.isArray(customersData) ? customersData : []);
        } catch (err) {
          console.error('Error fetching customers:', err);
        }
      };
      fetchCustomers();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [customersSearchQuery, formData.isCash]);

  // Open dropdown when items are loaded and there are results (only when searching)
  useEffect(() => {
    if (itemsSearchQuery.trim() && items.length > 0) {
      setIsItemsDropdownOpen(true);
    } else if (items.length === 0 && itemsSearchQuery.trim()) {
      setIsItemsDropdownOpen(true); // Show "No items found" message
    }
  }, [items, itemsSearchQuery]);

  // Open dropdown when customers are loaded and there are results (only when searching)
  useEffect(() => {
    if (formData.isCash) return;
    
    if (customersSearchQuery.trim() && customers.length > 0) {
      setIsCustomersDropdownOpen(true);
    } else if (customers.length === 0 && customersSearchQuery.trim()) {
      setIsCustomersDropdownOpen(true); // Show "No customers found" message
    }
  }, [customers, customersSearchQuery, formData.isCash]);

  // Handle sale prop for editing
  useEffect(() => {
    if (sale) {
      const itemIdValue = typeof sale.itemId === 'object' ? sale.itemId._id : sale.itemId;
      const customerIdValue = typeof sale.customerId === 'object' ? sale.customerId._id : sale.customerId;
      
      setFormData({
        itemId: itemIdValue || '',
        quantity: sale.quantity || '',
        customerId: customerIdValue || '',
        isCash: sale.isCash || false,
        date: sale.date ? new Date(sale.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  }, [sale]);

  // Update selectedItem when itemId or items change
  useEffect(() => {
    if (formData.itemId && items.length > 0) {
      const item = items.find(i => i._id === formData.itemId);
      if (item) {
        setSelectedItem(item);
        if (formData.quantity && Number(formData.quantity) > item.quantity) {
          setErrors(prev => ({ ...prev, quantity: `Quantity cannot exceed ${item.quantity}` }));
        }
      } else {
        setSelectedItem(null);
      }
    } else if (!formData.itemId) {
      setSelectedItem(null);
    }
  }, [formData.itemId, items]);

  // Update selectedCustomer when customerId or customers change
  useEffect(() => {
    if (formData.customerId && customers.length > 0) {
      const customer = customers.find(c => c._id === formData.customerId);
      if (customer) {
        setSelectedCustomer(customer);
      } else {
        setSelectedCustomer(null);
      }
    } else if (!formData.customerId) {
      setSelectedCustomer(null);
    }
  }, [formData.customerId, customers]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Items dropdown
      if (
        itemsDropdownRef.current && 
        !itemsDropdownRef.current.contains(event.target) && 
        itemsSearchInputRef.current && 
        !itemsSearchInputRef.current.contains(event.target)
      ) {
        setIsItemsDropdownOpen(false);
      }
      
      // Customers dropdown
      if (
        customersDropdownRef.current && 
        !customersDropdownRef.current.contains(event.target) && 
        customersSearchInputRef.current && 
        !customersSearchInputRef.current.contains(event.target)
      ) {
        setIsCustomersDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemSelect = (item) => {
    handleChange('itemId', item._id);
    setIsItemsDropdownOpen(false);
    setItemsSearchQuery('');
  };

  const handleCustomerSelect = (customer) => {
    handleChange('customerId', customer._id);
    setIsCustomersDropdownOpen(false);
    setCustomersSearchQuery('');
  };

  const handleItemsSearchChange = (value) => {
    setItemsSearchQuery(value);
    if (!value.trim()) {
      setIsItemsDropdownOpen(false);
    }
  };

  const handleCustomersSearchChange = (value) => {
    setCustomersSearchQuery(value);
    if (!value.trim()) {
      setIsCustomersDropdownOpen(false);
    }
  };

  const handleItemsSearchFocus = () => {
    if (itemsSearchQuery.trim()) {
      setIsItemsDropdownOpen(true);
    }
  };

  const handleCustomersSearchFocus = () => {
    if (customersSearchQuery.trim()) {
      setIsCustomersDropdownOpen(true);
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
    
    // Clear customer search and selection when cash sale is checked
    if (field === 'isCash' && value) {
      setCustomersSearchQuery('');
      setSelectedCustomer(null);
    }
  };

  const totalPriceValue = selectedItem && formData.quantity && selectedItem.price
    ? Number(formData.quantity) * selectedItem.price
    : 0;
  const totalPrice = formatPrice(totalPriceValue);

  const selectedItemName = selectedItem ? selectedItem.name : '';
  const selectedCustomerName = selectedCustomer ? selectedCustomer.name : '';

  return (
    <form onSubmit={handleSubmit}>
      {loadingData ? (
        <div className="text-center py-4 text-gray-300">Loading...</div>
      ) : (
        <>
          <div className="mb-4 relative" ref={itemsDropdownRef}>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Item <span className="text-red-400">*</span>
            </label>
            <div className="mb-2" ref={itemsSearchInputRef}>
              <SearchBar
                value={itemsSearchQuery}
                onChange={handleItemsSearchChange}
                onFocus={handleItemsSearchFocus}
                placeholder={selectedItemName || "Search items by name..."}
                className="w-full"
              />
            </div>
            {isItemsDropdownOpen && items.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                {items.map(item => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => handleItemSelect(item)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none transition-colors border-b border-gray-700 last:border-b-0"
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400">
                      Qty: {formatNumber(item.quantity)}{item.price ? `, Price: ${formatPrice(item.price)}` : ''}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {isItemsDropdownOpen && items.length === 0 && itemsSearchQuery.trim() && (
              <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg p-4 text-center text-sm text-gray-400">
                No items found
              </div>
            )}
            {formData.itemId && !itemsSearchQuery && selectedItem && (
              <div className="mt-2 p-2 bg-gray-700/50 rounded-md border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-200">Selected: {selectedItem.name}</div>
                    {selectedItem.price && (
                      <div className="text-xs text-gray-400 mt-0.5">Price: {formatPrice(selectedItem.price)}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-200">Stock</div>
                    <div className={`text-xs font-medium ${selectedItem.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedItem.quantity} units
                    </div>
                  </div>
                </div>
              </div>
            )}
            {errors.itemId && <p className="mt-1 text-sm text-red-400">{errors.itemId}</p>}
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
                }}
                className="rounded border-gray-600 text-blue-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-300">Cash Sale</span>
            </label>
          </div>

          {!formData.isCash && (
            <div className="mb-4 relative" ref={customersDropdownRef}>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Customer <span className="text-red-400">*</span>
              </label>
              <div className="mb-2" ref={customersSearchInputRef}>
                <SearchBar
                  value={customersSearchQuery}
                  onChange={handleCustomersSearchChange}
                  onFocus={handleCustomersSearchFocus}
                  placeholder={selectedCustomerName || "Search customers by name..."}
                  className="w-full"
                />
              </div>
              {isCustomersDropdownOpen && customers.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {customers.map(customer => (
                    <button
                      key={customer._id}
                      type="button"
                      onClick={() => handleCustomerSelect(customer)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none transition-colors border-b border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium">{customer.name}</div>
                    </button>
                  ))}
                </div>
              )}
              {isCustomersDropdownOpen && customers.length === 0 && customersSearchQuery.trim() && (
                <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg p-4 text-center text-sm text-gray-400">
                  No customers found
                </div>
              )}
              {formData.customerId && !customersSearchQuery && selectedCustomer && (
                <div className="mt-2 p-2 bg-gray-700/50 rounded-md border border-gray-600">
                  <div className="text-sm font-medium text-gray-200">
                    Selected: {selectedCustomer.name}
                  </div>
                </div>
              )}
              {errors.customerId && <p className="mt-1 text-sm text-red-400">{errors.customerId}</p>}
            </div>
          )}

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            required
          />

          {selectedItem && formData.quantity && selectedItem.price && (
            <div className="mb-4 p-3 bg-blue-900 bg-opacity-30 rounded-md border border-blue-800">
              <p className="text-sm text-gray-300">Total Price:</p>
              <p className="text-xl font-bold text-blue-300">{totalPrice}</p>
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
