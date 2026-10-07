//function for convert indian price format
export const formatCurrency = (price) => {
  return Number(price).toLocaleString();
};

export const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};