import { SiteNavbar, SiteFooter } from "@/components/BrandLayout"
import { ArrowRight, BarChart3, Users, Network } from "lucide-react"
import Link from "next/link"

const studies = [
  {
    title: "Rewarding Generosity",
    category: "Donor Retention",
    metric: "42%",
    metricLabel: "Increase in Repeat Donations",
    description: "Discover how Automated AI-driven Receipts and instant tax beneficiary documents built unprecedented donor trust for a tier-2 city medical trust.",
    icon: <BarChart3 className="h-6 w-6 text-yellow-600" />,
    color: "bg-yellow-50",
  },
  {
    title: "Supporters Into Fundraisers",
    category: "Network Growth",
    metric: "3x",
    metricLabel: "Creator Led Amplification",
    description: "Learn how one grassroots education NGO seamlessly converted 100+ passive donors into active, WhatsApp-driven sub-campaign fundraisers using our simple Native Share API tools.",
    icon: <Users className="h-6 w-6 text-green-600" />,
    color: "bg-green-50",
  },
  {
    title: "Integrated Ecosystems",
    category: "Operational Efficiency",
    metric: "15hrs",
    metricLabel: "Saved Per Admin Weekly",
    description: "A deep dive into managing 100+ individual beneficiaries smoothly. How migrating from Google Forms and manual UPI matching to PhilanthroForge saved hundreds of man-hours.",
    icon: <Network className="h-6 w-6 text-blue-600" />,
    color: "bg-blue-50",
  }
]

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SiteNavbar />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gray-950 text-white py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-400 via-gray-900 to-gray-950"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              Impact <span className="text-green-400">Forged.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl leading-relaxed">
              Real-world examples of how Indian NGOs are transforming their fundraising capacity using our trust-first digital infrastructure.
            </p>
          </div>
        </section>

        {/* Case Studies Grid */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {studies.map((study, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-2xl ${study.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                    {study.icon}
                  </div>
                  
                  <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-3">
                    {study.category}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{study.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-10 flex-1">
                    {study.description}
                  </p>
                  
                  <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black text-gray-900 leading-none mb-1">{study.metric}</div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{study.metricLabel}</div>
                    </div>
                    <button className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-green-500 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
            <h2 className="text-4xl font-black text-white mb-6">Ready to write your own success story?</h2>
            <p className="text-xl text-green-50 mb-10">
              Join the growing network of verified NGOs building trust and scaling their impact.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="https://www.philanthroforge.com/lets-talk" className="w-full sm:w-auto bg-gray-950 hover:bg-gray-900 text-white font-bold py-4 px-10 rounded-xl transition-colors shadow-xl shadow-gray-950/20">
                Talk to Sales
              </Link>
              <Link href="/login" className="w-full sm:w-auto bg-white hover:bg-green-50 text-green-700 font-bold py-4 px-10 rounded-xl transition-colors">
                Login to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  )
}
