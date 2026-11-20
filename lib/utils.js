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

// Accepts a Firestore Timestamp, a Date, a date string/number, or a
// pending serverTimestamp (which reads back as null) and returns a usable
// Date or null -- never an Invalid Date and never 1 Jan 1970.
export function toDate(value) {
  if (!value) return null;

  if (typeof value.toDate === "function") {
    try {
      const converted = value.toDate();
      return Number.isNaN(converted.getTime()) ? null : converted;
    } catch (error) {
      return null;
    }
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(date) {
  const parsed = toDate(date);
  return parsed ? parsed.toLocaleDateString() : "\u2014";
}

export function generateInvoiceNumber() {
  const prefix = "INV";
  const id = crypto.randomBytes(4).toString("hex").toUpperCase();
  const ts = Date.now().toString().slice(-6);
  return `${prefix}-${ts}-${id}`;
}

export function generateReceiptNumber() {
  const prefix = "RCT";
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${ts}-${rand}`;
}
