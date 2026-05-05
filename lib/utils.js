import crypto from "crypto";

export function formatCurrency(value, currency) {
  const symbols = { GBP: "£", USD: "$", EUR: "€" };
  const symbol = symbols[currency] || currency;
  return `${symbol} ${Number(value).toFixed(2)}`;
}

export function calculateRowAmount(quantity, price) {
  const q = Number(quantity);
  const p = Number(price);
  if (Number.isNaN(q) || Number.isNaN(p)) return 0;
  return q * p;
}

export function calculateTotal(items) {
  return items.reduce(
    (acc, item) => acc + calculateRowAmount(item.quantity, item.price),
    0,
  );
}

export function formatDate(date) {
  if (date && typeof date.toDate === "function") {
    return date.toDate().toLocaleDateString();
  }
  return new Date(date).toLocaleDateString();
}

export function generateInvoiceNumber() {
  const prefix = "INV";
  const id = crypto.randomBytes(4).toString("hex").toUpperCase();
  const ts = Date.now().toString().slice(-6);
  return `${prefix}-${ts}-${id}`;
}
