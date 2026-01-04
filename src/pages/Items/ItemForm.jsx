import { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validators } from '../../utils/validators';

const ItemForm = ({ item, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    price: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        quantity: item.quantity || '',
        price: item.price || ''
      });
    }
  }, [item]);

  const validate = () => {
    const newErrors = {};
    
    const nameError = validators.required(formData.name);
    if (nameError) newErrors.name = nameError;

    const descError = validators.required(formData.description);
    if (descError) newErrors.description = descError;

    const qtyError = validators.required(formData.quantity) || validators.positiveNumber(formData.quantity);
    if (qtyError) newErrors.quantity = qtyError;

    const priceError = validators.required(formData.price) || validators.positiveNumber(formData.price);
    if (priceError) newErrors.price = priceError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price)
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
      />
      <Input
        label="Description"
        type="textarea"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        error={errors.description}
        required
      />
      <Input
        label="Quantity"
        type="number"
        value={formData.quantity}
        onChange={(e) => handleChange('quantity', e.target.value)}
        error={errors.quantity}
        required
      />
      <Input
        label="Price"
        type="number"
        step="0.01"
        value={formData.price}
        onChange={(e) => handleChange('price', e.target.value)}
        error={errors.price}
        required
      />
      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : item ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default ItemForm;

