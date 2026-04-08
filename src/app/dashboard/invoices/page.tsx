"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, IndianRupee, CheckCircle2, Clock, RefreshCw, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import "jspdf-autotable"

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: { finalY: number }
  }
}

interface InvoiceLineItem {
  campaign_id: string
  campaign_title: string
  raised_amount: number
  fee_rate: number
  fee_due: number
  period: string
}

export default function InvoicesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [orgData, setOrgData] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([])
  const [totalDue, setTotalDue] = useState(0)
  const [totalRaised, setTotalRaised] = useState(0)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const { data: org } = await supabase.from("organizations").select("*").limit(1).single()
      if (org) setOrgData(org)

      const { data: camps } = await supabase
        .from("campaigns")
        .select("id, title, public_goal, raised_amount, platform_buffer, status, created_at")
        .order("created_at", { ascending: false })

      if (camps) {
        setCampaigns(camps)
        
        // Build line items only for campaigns that have raised money
        const items: InvoiceLineItem[] = camps
          .filter(c => (c.raised_amount || 0) > 0)
          .map(c => {
            const feeRate = 0.02 // 2% SaaS usage fee
            const feeDue = Math.round(c.raised_amount * feeRate)
            const period = new Date(c.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
            return {
              campaign_id: c.id,
              campaign_title: c.title,
              raised_amount: c.raised_amount,
              fee_rate: feeRate,
              fee_due: feeDue,
              period,
            }
          })
        
        setLineItems(items)
        setTotalRaised(items.reduce((s, i) => s + i.raised_amount, 0))
        setTotalDue(items.reduce((s, i) => s + i.fee_due, 0))
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const generateInvoicePDF = () => {
    if (!orgData) return
    setGeneratingPdf(true)

    const doc = new jsPDF()
    const invoiceNo = `PF-INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`

    // Header block
    doc.setFont("helvetica", "bold")
    doc.setFontSize(24)
    doc.setTextColor(15, 118, 110)
    doc.text("PHILANTHROFORGE", 14, 20)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text("Fundraising Infrastructure for Indian NGOs & Trusts", 14, 27)
    doc.text("contact@philanthroforge.com | www.philanthroforge.com", 14, 33)

    // Invoice metadata (right-aligned)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(30, 30, 30)
    doc.text("TAX INVOICE", 196, 20, { align: "right" })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Invoice No: ${invoiceNo}`, 196, 28, { align: "right" })
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 196, 34, { align: "right" })
    doc.text(`Due Date: ${new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN")}`, 196, 40, { align: "right" })

    // Divider
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(14, 48, 196, 48)

    // Bill To block
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(30, 30, 30)
    doc.text("BILLED TO:", 14, 58)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(orgData.name || "NGO Partner", 14, 65)
    doc.text(`PAN: ${orgData.pan_number || "On file"}`, 14, 71)
    doc.text(`Reg No: ${orgData.registration_number || "On file"}`, 14, 77)

    // Service Description table
    doc.autoTable({
      startY: 90,
      head: [["Campaign Title", "Funds Raised (₹)", "Fee Rate", "Amount Due (₹)"]],
      body: lineItems.map(item => [
        item.campaign_title,
        item.raised_amount.toLocaleString("en-IN"),
        "2%",
        item.fee_due.toLocaleString("en-IN"),
      ]),
      foot: [
        ["", `Total Raised: ₹${totalRaised.toLocaleString("en-IN")}`, "", `Total Due: ₹${totalDue.toLocaleString("en-IN")}`]
      ],
      theme: "grid",
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: "bold" },
      footStyles: { fillColor: [241, 245, 249], textColor: [30, 30, 30], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 5 },
    })

    const finalY = doc.lastAutoTable.finalY || 160

    // Payment Instructions
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(30, 30, 30)
    doc.text("Payment Instructions", 14, finalY + 18)
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text("Please transfer the total amount due to the Philanthroforge account within 15 days of this invoice date.", 14, finalY + 26)
    doc.text("Payment via NEFT/IMPS/UPI to: philanthroforge@hdfcbank | A/C: 1234567890 | IFSC: HDFC0001234", 14, finalY + 33)

    // Disclaimer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text("This invoice is generated automatically by the Philanthroforge Fundraising Platform. The 2% usage fee covers:", 14, finalY + 50)
    doc.text("verification infrastructure, campaign hosting, AI share tools, receipt management, and technical support.", 14, finalY + 56)

    doc.save(`Philanthroforge_Invoice_${invoiceNo}.pdf`)
    setGeneratingPdf(false)
  }

  const statCards = [
    { label: "Total Raised Across Campaigns", value: `₹${totalRaised.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Platform Fee Due (2%)", value: `₹${totalDue.toLocaleString("en-IN")}`, icon: FileSpreadsheet, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Active Campaigns", value: campaigns.filter(c => c.status === "published").length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Settlement", value: campaigns.filter(c => (c.raised_amount || 0) > 0).length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
            <FileSpreadsheet className="h-8 w-8 text-indigo-500" /> Platform Invoices
          </h1>
          <p className="text-slate-600">Monthly billing summary for your 2% Philanthroforge platform usage fee.</p>
        </div>
        <Button
          onClick={generateInvoicePDF}
          disabled={loading || generatingPdf || lineItems.length === 0}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
        >
          {generatingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download Invoice PDF
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label} className="border-slate-200">
            <CardContent className="p-5">
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className={`text-2xl font-extrabold ${s.color}`}>{loading ? "—" : s.value}</div>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Line Items Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Fee Breakdown by Campaign</CardTitle>
          <CardDescription>
            The 2% platform support fee is calculated on successfully raised funds and billed monthly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Campaign</th>
                  <th className="px-6 py-4 font-semibold">Period</th>
                  <th className="px-6 py-4 font-semibold">Raised Amount</th>
                  <th className="px-6 py-4 font-semibold text-center">Fee Rate</th>
                  <th className="px-6 py-4 font-semibold text-right">Fee Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" /> Loading billing data...
                    </td>
                  </tr>
                ) : lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No billable campaigns yet. Invoice will generate once campaigns start raising funds.
                    </td>
                  </tr>
                ) : (
                  lineItems.map((item) => (
                    <tr key={item.campaign_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 truncate max-w-[260px]">{item.campaign_title}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{item.period}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">₹{item.raised_amount.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">2%</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-indigo-700">₹{item.fee_due.toLocaleString("en-IN")}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {!loading && lineItems.length > 0 && (
                <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 font-bold text-slate-900">Total</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{totalRaised.toLocaleString("en-IN")}</td>
                    <td></td>
                    <td className="px-6 py-4 text-right text-xl font-extrabold text-indigo-700">₹{totalDue.toLocaleString("en-IN")}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex gap-3 items-start">
        <FileSpreadsheet className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-1">Transparent Billing Policy</strong>
          Philanthroforge charges 2% of successfully raised funds as a monthly software support fee. This covers campaign hosting, verification infrastructure, AI tools, receipt management, and technical support. 
          You are never charged upfront. Invoices are generated after funds are raised.
        </div>
      </div>
    </div>
  )
}
