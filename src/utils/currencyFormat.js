//function for convert indian price format
export const formatCurrency = (price) => {
  return Number(price).toLocaleString();
};