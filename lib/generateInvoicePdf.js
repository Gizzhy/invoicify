import jsPDF from "jspdf";

const currencySymbols = { NGN: "₦", GBP: "£", USD: "$", EUR: "€" };

export async function generateInvoicePdf(invoice, profile) {
  const doc = new jsPDF();

  let yPosition = 20; // Starting Y position

  // Header Section
  if (profile.logoUrl) {
    try {
      // Note: Loading images from Firebase Storage may cause CORS issues in browser
      // For now, skip logo to avoid errors; can be improved with proper CORS setup later
      // const img = new Image();
      // img.crossOrigin = 'anonymous';
      // img.src = profile.logoUrl;
      // await new Promise((resolve) => { img.onload = resolve; });
      // doc.addImage(img, 'JPEG', 20, yPosition, 30, 30);
      // yPosition += 35;
    } catch (error) {
      console.warn("Logo loading failed, skipping:", error);
    }
  }

  doc.setFontSize(18);
  doc.text(profile.brandName || "Vendor Invoice", 20, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  if (profile.phone) {
    doc.text(`Phone: ${profile.phone}`, 20, yPosition);
    yPosition += 6;
  }
  if (profile.address) {
    doc.text(`Address: ${profile.address}`, 20, yPosition);
    yPosition += 10;
  }

  // Client/Invoice Section
  doc.setFontSize(14);
  doc.text("Invoice Details", 20, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.text(`Client: ${invoice.clientName}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Client Phone: ${invoice.clientPhone}`, 20, yPosition);
  yPosition += 6;
  const date = invoice.createdAt.toDate
    ? invoice.createdAt.toDate().toLocaleDateString()
    : new Date(invoice.createdAt).toLocaleDateString();
  doc.text(`Date: ${date}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Invoice ID: ${invoice.invoiceNumber}`, 20, yPosition);
  yPosition += 15;

  // Order Details Table
  doc.setFontSize(14);
  doc.text("Order Details", 20, yPosition);
  yPosition += 10;

  // Table Header
  doc.setFontSize(12);
  doc.text("Item", 20, yPosition);
  doc.text("Qty", 100, yPosition);
  doc.text("Price", 130, yPosition);
  doc.text("Amount", 170, yPosition);
  yPosition += 5;
  doc.line(20, yPosition, 190, yPosition); // Horizontal line
  yPosition += 10;

  // Table Rows
  invoice.items.forEach((item) => {
    const amount = item.quantity * item.price;
    doc.text(item.itemName || item.name || "Item", 20, yPosition);
    doc.text(item.quantity.toString(), 100, yPosition);
    doc.text(
      `${currencySymbols[invoice.currency] || invoice.currency}${item.price.toFixed(2)}`,
      130,
      yPosition,
    );
    doc.text(
      `${currencySymbols[invoice.currency] || invoice.currency}${amount.toFixed(2)}`,
      170,
      yPosition,
    );
    yPosition += 8;
  });

  // Total
  yPosition += 5;
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;
  doc.setFontSize(14);
  doc.text(
    `Total: ${currencySymbols[invoice.currency] || invoice.currency}${invoice.total.toFixed(2)}`,
    20,
    yPosition,
  );

  // Download the PDF
  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}
