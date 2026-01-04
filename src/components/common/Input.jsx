const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  placeholder, 
  required = false,
  className = '' 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2 bg-gray-800 text-gray-200 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-600'
          }`}
          rows={4}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2 bg-gray-800 text-gray-200 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-600'
          }`}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
