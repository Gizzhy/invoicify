import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const accentColor = "#0EA5D7";
const textColor = "#111827";

function loadImageAsBase64(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      } catch (error) {
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = url;
  });
}

function formatCurrency(value, currency) {
  const amount = Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (currency === "NGN") {
    return `NGN ${amount}`;
  }

  const symbols = {
    GBP: "£",
    USD: "$",
    EUR: "€",
  };

  return `${symbols[currency] || currency || ""}${amount}`;
}

export async function generateReceiptPdf(invoice, profile) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  doc.setTextColor(textColor);
  doc.setFont("helvetica", "bold");

  const logoData = profile?.logoUrl
    ? await loadImageAsBase64(profile.logoUrl)
    : null;

  // Header
  const logoWidth = 80;
  const logoHeight = 80;
  if (logoData) {
    doc.addImage(logoData, "PNG", margin, currentY, logoWidth, logoHeight);
  }

  const headerX = logoData ? margin + logoWidth + 14 : margin;
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(profile?.brandName || "Vendor Receipt", headerX, currentY + 20);

  let infoY = currentY + 36;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const description = profile?.brandDescription || profile?.brandDesc;
  if (description) {
    const descLines = doc.splitTextToSize(
      description,
      contentWidth - (headerX - margin),
    );
    doc.text(descLines, headerX, infoY);
    infoY += descLines.length * 12 + 6;
  }
  if (profile?.phone) {
    doc.text(`Phone: ${profile.phone}`, headerX, infoY);
    infoY += 14;
  }
  if (profile?.address) {
    const addressLines = doc.splitTextToSize(
      profile.address,
      contentWidth - (headerX - margin),
    );
    doc.text(addressLines, headerX, infoY);
    infoY += addressLines.length * 12 + 6;
  }

  const receiptTitleX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(accentColor);
  doc.text("RECEIPT", receiptTitleX, currentY + 20, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(textColor);

  // Get Paid Date (paidAt or createdAt)
  const paidDate = invoice?.paidAt?.toDate
    ? invoice.paidAt.toDate().toLocaleDateString()
    : invoice?.paidAt
      ? new Date(invoice.paidAt).toLocaleDateString()
      : invoice?.createdAt?.toDate
        ? invoice.createdAt.toDate().toLocaleDateString()
        : invoice?.createdAt
          ? new Date(invoice.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString();

  doc.setFont("helvetica", "normal");
  doc.text(
    `Receipt #: ${invoice?.receiptNumber || "-"}`,
    receiptTitleX,
    currentY + 40,
    { align: "right" },
  );
  doc.text(
    `Invoice #: ${invoice?.invoiceNumber || invoice?.id || "-"}`,
    receiptTitleX,
    currentY + 55,
    { align: "right" },
  );
  doc.text(`Date: ${paidDate}`, receiptTitleX, currentY + 70, {
    align: "right",
  });

  // PAID Badge
  doc.setFillColor(76, 175, 80);
  doc.rect(receiptTitleX - 60, currentY + 85, 60, 25, "F");
  doc.setTextColor("#ffffff");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PAID", receiptTitleX - 30, currentY + 103, { align: "center" });
  doc.setTextColor(textColor);

  const headerBottom = Math.max(
    currentY + (logoData ? logoHeight : 0),
    infoY,
    currentY + 120,
  );
  currentY = headerBottom + 24;

  // Bill To
  doc.setDrawColor(accentColor);
  doc.setFillColor("#f8fafc");
  doc.rect(margin, currentY, contentWidth, 50, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textColor);
  doc.text("Bill To", margin + 10, currentY + 18);
  doc.setFont("helvetica", "normal");
  if (invoice?.clientName) {
    doc.text(invoice.clientName, margin + 10, currentY + 34);
  }
  if (invoice?.clientPhone) {
    doc.text(`Phone: ${invoice.clientPhone}`, margin + 10, currentY + 50);
  }

  currentY += 80;

  // Items table
  const rows = (invoice?.items || []).map((item, index) => {
    const name = item?.name || item?.itemName || "Item";
    const qty = item?.quantity != null ? item.quantity : 0;
    const price = Number(item?.price || 0);
    const total = qty * price;
    return [
      index + 1,
      name,
      formatCurrency(price, invoice?.currency),
      qty,
      formatCurrency(total, invoice?.currency),
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "No.", styles: { halign: "center" } },
        { content: "Product / Item Description", styles: { halign: "left" } },
        { content: "Price", styles: { halign: "right" } },
        { content: "Qty", styles: { halign: "center" } },
        { content: "Total", styles: { halign: "right" } },
      ],
    ],
    body: rows,
    styles: {
      overflow: "linebreak",
      cellPadding: 6,
      font: "helvetica",
      fontSize: 10,
      textColor,
    },
    headStyles: {
      fillColor: accentColor,
      textColor: "#ffffff",
      halign: "center",
      fontStyle: "bold",
    },
    bodyStyles: {
      fillColor: [250, 250, 250],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: contentWidth - 30 - 80 - 40 - 80 },
      2: { cellWidth: 80 },
      3: { cellWidth: 40 },
      4: { cellWidth: 80 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        data.cell.styles.valign = "top";
      }
    },
    theme: "grid",
  });

  const finalY = doc.lastAutoTable.finalY || currentY + 20;
  const pageHeight = doc.internal.pageSize.getHeight();
  let summaryY = finalY + 25;
  if (summaryY + 100 > pageHeight - margin) {
    doc.addPage();
    summaryY = margin;
  }

  // Totals section
  // Totals section
const amountPaid = formatCurrency(invoice?.total || 0, invoice?.currency);

const summaryBoxX = pageWidth - margin - 240;
const summaryBoxWidth = 240;
const summaryBoxHeight = 42;

// light background box
doc.setFillColor("#f8fafc");
doc.roundedRect(summaryBoxX, summaryY - 18, summaryBoxWidth, summaryBoxHeight, 6, 6, "F");

doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(textColor);
doc.text("Amount Paid", summaryBoxX + 12, summaryY + 4);

doc.setFontSize(11);
doc.text(amountPaid, summaryBoxX + summaryBoxWidth - 12, summaryY + 4, {
  align: "right",
});

  // Payment details / Bank details section
  let paymentY = summaryY + 50;
  if (paymentY + 60 > pageHeight - margin) {
    doc.addPage();
    paymentY = margin;
  }

  const paymentX = margin;
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", paymentX, paymentY);
  doc.setFont("helvetica", "normal");

  let bankInfo = invoice?.bankAccount;
  if (!bankInfo) {
    bankInfo =
      invoice?.selectedBankAccount ||
      invoice?.bankAccountId ||
      invoice?.selectedAccount ||
      invoice?.account;
  }

  if (bankInfo) {
    if (typeof bankInfo === "object") {
      let bankY = paymentY + 18;
      if (bankInfo.accountName) {
        doc.text(`Account Name: ${bankInfo.accountName}`, paymentX, bankY);
        bankY += 14;
      }
      if (bankInfo.accountNumber) {
        doc.text(`Account Number: ${bankInfo.accountNumber}`, paymentX, bankY);
        bankY += 14;
      }
      if (bankInfo.bankName) {
        doc.text(`Bank Name: ${bankInfo.bankName}`, paymentX, bankY);
        bankY += 14;
      }
    } else {
      doc.text(`Account ID: ${bankInfo}`, paymentX, paymentY + 18);
    }
  } else {
    doc.text("Account info not available.", paymentX, paymentY + 18);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - margin;
  doc.setDrawColor("#e5e7eb");
  doc.line(margin, footerY - 20, pageWidth - margin, footerY - 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your payment.", margin, footerY - 5);
  doc.text("Generated with Invoicify.", pageWidth - margin, footerY - 5, {
    align: "right",
  });

  const fileName = `receipt-${invoice?.receiptNumber || invoice?.invoiceNumber || invoice?.id || "document"}.pdf`;
  doc.save(fileName);
}
