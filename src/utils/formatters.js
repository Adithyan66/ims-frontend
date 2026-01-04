/**
 * Format a number with space as thousands separator
 * @param {number|string} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number with space separator
 * 
 * @example
 * formatNumber(1000) // "1 000"
 * formatNumber(10000) // "10 000"
 * formatNumber(1234567.89, 2) // "1 234 567.89"
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || value === '') {
    return decimals > 0 ? '0.' + '0'.repeat(decimals) : '0';
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return decimals > 0 ? '0.' + '0'.repeat(decimals) : '0';
  }
  
  // Format to specified decimal places
  const fixed = num.toFixed(decimals);
  
  // Split into integer and decimal parts
  const parts = fixed.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add space every 3 digits from the right
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  // Combine with decimal part if it exists
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

/**
 * Format a price value with currency symbol and thousands separator
 * @param {number|string} price - The price to format
 * @param {string} currencySymbol - The currency symbol (default: '₹')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted price with currency symbol
 * 
 * @example
 * formatPrice(1000) // "₹1 000.00"
 * formatPrice(10000.5) // "₹10 000.50"
 * formatPrice(1234567.89) // "₹1 234 567.89"
 */
export const formatPrice = (price, currencySymbol = '₹', decimals = 2) => {
  if (price === null || price === undefined || price === '') {
    const zero = decimals > 0 ? '0.' + '0'.repeat(decimals) : '0';
    return `${currencySymbol}${zero}`;
  }
  
  const num = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(num)) {
    const zero = decimals > 0 ? '0.' + '0'.repeat(decimals) : '0';
    return `${currencySymbol}${zero}`;
  }
  
  // Format to specified decimal places
  const fixed = num.toFixed(decimals);
  
  // Split into integer and decimal parts
  const parts = fixed.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add space every 3 digits from the right
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  return `${currencySymbol}${formattedInteger}.${decimalPart}`;
};

