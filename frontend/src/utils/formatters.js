/**
 * Formats a numeric value as Indian Rupee (INR ₹).
 */
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Formats an ISO date string into a user-friendly format (e.g. 18 Sep 2026).
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

/**
 * Returns month name from month number (1-12).
 */
export const getMonthName = (monthNumber) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[(monthNumber || 1) - 1] || "";
};
