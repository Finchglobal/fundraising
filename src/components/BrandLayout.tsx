import Link from "next/link"
import Image from "next/image"

export function SiteNavbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="https://www.philanthroforge.com" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="PhilanthroForge Fundraising"
            width={220}
            height={85}
            priority
            className="h-10 w-auto"
          />
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <Link href="https://www.philanthroforge.com" className="hover:text-gray-900 transition-colors">Home</Link>
          <Link href="https://www.philanthroforge.com/about" className="hover:text-gray-900 transition-colors">About</Link>
          <Link href="https://www.philanthroforge.com/services" className="hover:text-gray-900 transition-colors">Services</Link>
          <Link href="/" className="font-bold text-green-700 border-b-2 border-green-600">Fundraising</Link>
          <Link href="https://www.philanthroforge.com/contact" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-5 py-2 rounded transition-colors">
            Let&apos;s Talk
          </Link>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-3">
          <Link href="/" className="font-semibold text-green-700 text-sm">Fundraising</Link>
          <Link href="https://www.philanthroforge.com/contact" className="bg-yellow-400 text-gray-900 font-bold px-4 py-1.5 rounded text-sm">
            Let&apos;s Talk
          </Link>
        </div>
      </div>
    </nav>
  )
}

export function SiteFooter() {
  return (
    <footer style={{ backgroundColor: "#E8D48B" }} className="border-t border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Col 1: Brand */}
          <div className="flex flex-col items-start gap-4">
            <Image
              src="/logo.svg"
              alt="PhilanthroForge Fundraising"
              width={200}
              height={77}
              className="w-48 h-auto"
            />
            <p className="text-sm text-gray-700 mt-2">Forging The Next Era of Fundraising</p>
            <a href="https://linkedin.com/company/philanthroforge" target="_blank" rel="noopener noreferrer" className="mt-1">
              <div className="w-9 h-9 bg-blue-700 rounded flex items-center justify-center text-white font-bold text-sm">in</div>
            </a>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {["Digital Strategy", "Consultancy & Advice", "UX Optimization", "Donation Optimization", "Campaign Design", "Analysis & Growth", "CSR & Major Donor", "KPIs & Dashboards"].map(s => (
                <li key={s}><a href="https://www.philanthroforge.com/services" className="hover:text-gray-900 transition-colors">{s}</a></li>
              ))}
            </ul>
          </div>

          {/* Col 3: About & Case Studies */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">About</h4>
            <ul className="space-y-2 text-sm text-gray-700 mb-8">
              <li><a href="https://www.philanthroforge.com/about" className="hover:text-gray-900">Our Story</a></li>
            </ul>
            <h4 className="font-bold text-gray-900 mb-4">Case Studies</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {["Rewarding Generosity", "Supporters Into Fundraisers", "Integrated Ecosystems"].map(s => (
                <li key={s}><a href="https://www.philanthroforge.com/case-studies" className="hover:text-gray-900">{s}</a></li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Legal</h4>
            <a href="https://www.philanthroforge.com/privacy" className="text-sm text-gray-700 hover:text-gray-900 block mb-1">Privacy Policy</a>
            <a href="https://www.philanthroforge.com/terms" className="text-sm text-gray-700 hover:text-gray-900 block mb-6">Terms and Conditions</a>
            <h4 className="font-bold text-gray-900 mb-1">Email</h4>
            <a href="mailto:hello@philanthroforge.com" className="text-sm text-gray-700 hover:text-gray-900 block mb-6">hello@philanthroforge.com</a>
            <h4 className="font-bold text-gray-900 mb-3">Schedule a Meeting</h4>
            <a href="https://www.philanthroforge.com/contact" className="block w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-center py-3 px-6 rounded transition-colors">
              Book Now
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-yellow-300 mt-12 pt-6 text-center text-sm font-semibold text-gray-800">
          © 2025 PhilanthroForge. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}
