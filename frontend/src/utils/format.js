export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value || 0);

export const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(new Date(value))
    : "";

export const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(new Date(value))
    : "";

export const formatCompactNumber = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value || 0);

export const getStatusClasses = (status = "") => {
  const map = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    completed: "bg-brand-100 text-brand-800",
    cancelled: "bg-rose-100 text-rose-800",
    paid: "bg-emerald-100 text-emerald-800",
    refunded: "bg-slate-200 text-slate-700",
    inactive: "bg-slate-200 text-slate-700",
    active: "bg-brand-100 text-brand-800",
    verified: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800",
    pendingReview: "bg-amber-100 text-amber-800"
  };

  return map[status] || "bg-slate-100 text-slate-700";
};

export const splitCsv = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
