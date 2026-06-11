export const formatINR = (amount, mode = 'symbol') => {
  const value = Number(amount || 0);
  if (mode === 'code') {
    return `INR ${new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(value)}`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};
