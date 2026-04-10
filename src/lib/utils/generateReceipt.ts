import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Type definition for autoTable usage
export interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF
  lastAutoTable: { finalY: number }
}

interface ReceiptData {
  receiptNumber: string
  date: string
  donorName: string
  donorPan?: string
  donorEmail?: string
  amount: number
  amountWords: string
  paymentMode: string
  utr: string
  campaignName: string
  ngoContext: {
    name: string
    address: string
    pan: string
    registration_detail: string
  }
}

export const generate80GReceipt = (data: ReceiptData) => {
  const doc = new jsPDF()

  // 1. Header Section (NGO Details)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.setTextColor(15, 118, 110) // Teal 600
  doc.text(data.ngoContext.name.toUpperCase(), 105, 20, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(data.ngoContext.address, 105, 28, { align: "center" })
  doc.text(`PAN: ${data.ngoContext.pan} | Reg: ${data.ngoContext.registration_detail}`, 105, 34, { align: "center" })

  doc.setLineWidth(0.5)
  doc.setDrawColor(200, 200, 200)
  doc.line(14, 40, 196, 40)

  // 2. Receipt Title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text("DONATION RECEIPT (UNDER SECTION 80G)", 105, 52, { align: "center" })

  // 3. Info Block
  doc.setFontSize(11)
  doc.text(`Receipt No:`, 14, 65)
  doc.setFont("helvetica", "normal")
  doc.text(data.receiptNumber, 42, 65)

  doc.setFont("helvetica", "bold")
  doc.text(`Date:`, 150, 65)
  doc.setFont("helvetica", "normal")
  doc.text(data.date, 165, 65)

  // 4. Donor Acknowledgment Block
  doc.setFont("helvetica", "normal")
  doc.text("Received with thanks from:", 14, 80)
  
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text(data.donorName, 14, 87)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  if (data.donorPan) {
    doc.text(`Donor PAN: ${data.donorPan}`, 14, 94)
  }
  if (data.donorEmail) {
    doc.text(`Email: ${data.donorEmail}`, data.donorPan ? 80 : 14, 94)
  }

  // 5. Payment Details Box (using jspdf-autotable correctly as a function)
  autoTable(doc, {
    startY: 105,
    head: [['Amount', 'Payment Mode', 'Reference / UTR', 'Campaign Supported']],
    body: [
      [`Rs. ${data.amount.toLocaleString('en-IN')}/-`, data.paymentMode, data.utr, data.campaignName]
    ],
    theme: 'grid',
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 6 },
    columnStyles: { 0: { fontStyle: 'bold' } }
  })

  // 6. Words & Disclaimer
  const finalY = (doc as any).lastAutoTable?.finalY || 135
  
  doc.setFont("helvetica", "bold")
  doc.text(`Sum of Rupees: ${data.amountWords} Only`, 14, finalY + 15)

  doc.setFont("helvetica", "italic")
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  
  const disclaimer = `Donations to ${data.ngoContext.name} are eligible for tax exemption under section 80G of the Income Tax Act, 1961.\nThis is a computer-generated receipt issued through Philanthroforge Fundraising Infrastructure and does not require a physical signature.`
  doc.text(disclaimer, 14, finalY + 30)

  // 7. Download
  doc.save(`Receipt_${data.receiptNumber}.pdf`)
}

// Simple Indian Number to Words converter for the receipt
export const numToWords = (num: number): string => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const numStr = num.toString();
  if (numStr.length > 9) return 'overflow';
  const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  
  let str = '';
  str += (n[1] !== '00') ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
  str += (n[2] !== '00') ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
  str += (n[3] !== '00') ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
  str += (n[4] !== '0') ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
  str += (n[5] !== '00') ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';
  
  return str.trim();
}
