"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, UserCheck, XCircle, Search, FileText } from "lucide-react"

export default function BeneficiaryQueue() {
  const supabase = createClient()
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchApplications = async () => {
    setLoading(true)
    
    // MVP Fallback: Fetch all pending applications for the demo
    const { data } = await supabase
      .from("beneficiary_applications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      
    if (data) {
      setApplications(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Beneficiary Applications</h1>
          <p className="text-slate-600">Review incoming requests for help. Approve valid cases to draft them into campaigns.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="text-center py-20 text-slate-500 bg-white border border-slate-200 rounded-xl">
                 Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-xl px-4 flex flex-col items-center justify-center">
                 <ShieldCheck className="h-12 w-12 text-teal-200 mb-4" />
                 <h3 className="text-xl font-bold text-slate-900 mb-2">You're all caught up!</h3>
                 <p className="text-slate-500 max-w-md mx-auto">
                   There are no pending beneficiary applications in your queue. When individuals submit a request, it will appear here for your vetting.
                 </p>
              </div>
            ) : (
               applications.map((app) => (
                  <Card key={app.id} className="border-slate-200">
                     <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-start justify-between pb-4">
                        <div>
                           <CardTitle className="text-xl text-slate-900">{app.applicant_name}</CardTitle>
                           <CardDescription className="mt-1">Applied on {new Date(app.created_at).toLocaleDateString()}</CardDescription>
                        </div>
                        <div className="font-bold text-lg text-teal-700">
                           Request: ₹{app.required_amount.toLocaleString('en-IN')}
                        </div>
                     </CardHeader>
                     <CardContent className="pt-6">
                        <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100 mb-6">
                           {app.story_description}
                        </div>
                        
                        <div className="flex gap-4">
                           <Button className="flex-1 bg-teal-600 hover:bg-teal-500 text-white gap-2">
                             <UserCheck className="h-4 w-4" /> Verify & Draft Campaign
                           </Button>
                           <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2">
                             <XCircle className="h-4 w-4" /> Reject Case
                           </Button>
                        </div>
                     </CardContent>
                  </Card>
               ))
            )}
         </div>

         {/* Sidebar info */}
         <div className="lg:col-span-1">
            <Card className="border-slate-200 sticky top-10">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                     <FileText className="h-5 w-5 text-teal-600" /> Vetting Guidelines
                  </CardTitle>
               </CardHeader>
               <CardContent className="text-sm text-slate-600 space-y-4">
                  <p>As a verified NGO on Philanthroforge, you are responsible for the authenticity of the campaigns you publish.</p>
                  <ul className="list-disc pl-4 space-y-2">
                     <li>Always verify the identity of the beneficiary.</li>
                     <li>Collect physical or digital proof of medical estimates or fee structures.</li>
                     <li>Ensure the requested amount accurately reflects the documentation provided.</li>
                     <li>Philanthroforge will automatically add the 2% support fee on top of this requested amount.</li>
                  </ul>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  )
}
