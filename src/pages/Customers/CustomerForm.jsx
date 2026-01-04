import { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validators } from '../../utils/validators';

const CustomerForm = ({ customer, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mobileNumber: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        address: customer.address || '',
        mobileNumber: customer.mobileNumber || ''
      });
    }
  }, [customer]);

  const validate = () => {
    const newErrors = {};
    
    const nameError = validators.required(formData.name);
    if (nameError) newErrors.name = nameError;

    const addressError = validators.required(formData.address);
    if (addressError) newErrors.address = addressError;

    const mobileError = validators.required(formData.mobileNumber) || validators.mobileNumber(formData.mobileNumber);
    if (mobileError) newErrors.mobileNumber = mobileError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
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
        label="Address"
        type="textarea"
        value={formData.address}
        onChange={(e) => handleChange('address', e.target.value)}
        error={errors.address}
        required
      />
      <Input
        label="Mobile Number"
        type="tel"
        value={formData.mobileNumber}
        onChange={(e) => handleChange('mobileNumber', e.target.value)}
        error={errors.mobileNumber}
        placeholder="10-digit mobile number"
        required
      />
      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : customer ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;

