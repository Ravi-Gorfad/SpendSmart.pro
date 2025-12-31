/**
 * Currency conversion utility
 * Converts USD amounts to Indian Rupees (INR)
 */

// USD to INR exchange rate (can be updated or fetched from an API)
// Current approximate rate: 1 USD = 83.5 INR
let USD_TO_INR_RATE = 83.5;

/**
 * Converts USD amount to INR
 * @param {number|string} usdAmount - Amount in USD
 * @returns {number} Amount in INR
 */
export const convertUsdToInr = (usdAmount) => {
  const amount = typeof usdAmount === 'number' ? usdAmount : Number(usdAmount || 0);
  return amount * USD_TO_INR_RATE;
};

/**
 * Formats amount in Indian Rupees
 * @param {number|string} value - Amount value (assumed to be in USD, will be converted to INR)
 * @returns {string} Formatted currency string in INR
 */
export const formatCurrency = (value = 0) => {
  const num = typeof value === 'number' ? value : Number(value || 0);
  const inrAmount = convertUsdToInr(num);
  return inrAmount.toLocaleString('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
};

/**
 * Gets the current USD to INR exchange rate
 * @returns {number} Exchange rate
 */
export const getExchangeRate = () => USD_TO_INR_RATE;

/**
 * Updates the exchange rate (useful if fetching from an API)
 * @param {number} newRate - New exchange rate
 */
export const setExchangeRate = (newRate) => {
  if (typeof newRate === 'number' && newRate > 0) {
    USD_TO_INR_RATE = newRate;
  }
};

