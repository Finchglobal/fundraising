"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { LanguageSwitcher, useLang } from "@/components/LanguageSwitcher"

export function SiteNavbar() {
  const { t } = useLang()
  const NAV_LINKS = [
    { label: t("nav_home"), href: "https://www.philanthroforge.com" },
    { label: t("nav_about"), href: "https://www.philanthroforge.com/about" },
    { label: t("nav_services"), href: "https://www.philanthroforge.com/services" },
    { 
      label: t("nav_case_studies"),
      subLinks: [
        { label: t("nav_case_1") || "Rewarding Generosity Unlocks New Giving", href: "https://www.philanthroforge.com/case-studies/rewarding-generosity" },
        { label: t("nav_case_2") || "Referral Rewards Turn Supporters Into Fundraisers", href: "https://www.philanthroforge.com/case-studies/turning-supporters-into-fundraisers" },
        { label: t("nav_case_3") || "Integrated ecosystems make complex impact simple", href: "https://www.philanthroforge.com/case-studies/integrated-ecosystems" },
      ]
    },
    { label: t("nav_fundraising"), href: "/", active: true },
    { label: t("nav_login"), href: "/login" },
    { label: t("nav_register"), href: "/signup" },
    { label: t("nav_lets_talk"), href: "https://www.philanthroforge.com/lets-talk", cta: true },
  ]

  const [open, setOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm relative">
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

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center justify-center gap-5 lg:gap-7 text-sm font-medium text-gray-700 px-4" ref={dropdownRef}>
          {NAV_LINKS.map(link => {
            if (link.cta) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-5 py-2 rounded transition-colors"
                >
                  {link.label}
                </a>
              )
            }
            
            if (link.subLinks) {
              return (
                <div key={link.label} className="relative group">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                    className={`flex items-center gap-1 hover:text-gray-900 transition-colors ${link.active ? "font-bold text-green-700" : ""}`}
                  >
                    {link.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`} />
                  </button>
                  
                  {/* Dropdown panel */}
                  {openDropdown === link.label && (
                    <div className="absolute top-full right-0 mt-4 w-80 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden py-2 z-50">
                      {link.subLinks.map(sub => (
                        <a 
                          key={sub.label} 
                          href={sub.href}
                          className="block px-5 py-3 hover:bg-gray-50 text-gray-700 hover:text-green-700 transition-colors font-medium text-sm"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {sub.label}
                        </a>
                      ))}
                      <div className="h-2"></div>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`hover:text-gray-900 transition-colors ${link.active ? "font-bold text-green-700 border-b-2 border-green-600" : ""}`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Language Switcher + Mobile Toggle */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto relative z-[60]">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <button
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-gray-800 transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-6 pt-2 flex flex-col gap-1 shadow-lg max-h-[80vh] overflow-y-auto">
        {/* Mobile Language Switcher */}
        <div className="px-4 pt-3 pb-1">
          <LanguageSwitcher />
        </div>

          {NAV_LINKS.map(link => {
            if (link.cta) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="mt-4 block text-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-5 py-3 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              )
            }

            if (link.subLinks) {
              return (
                <div key={link.label} className="mt-1">
                  <div className="px-3 py-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {link.label}
                  </div>
                  <div className="flex flex-col gap-1 pl-4 border-l-2 border-gray-100 ml-4 mb-2">
                    {link.subLinks.map(sub => (
                      <a
                        key={sub.label}
                        href={sub.href}
                        className="block px-3 py-2 rounded text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-gray-50"
                        onClick={() => setOpen(false)}
                      >
                        {sub.label}
                      </a>
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 ${
                  link.active ? "text-green-700 font-bold bg-green-50" : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}

export function SiteFooter() {
  const { t } = useLang()
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
            <p className="text-sm text-gray-700 mt-2">{t("footer_tagline")}</p>
            <a href="https://linkedin.com/company/philanthroforge" target="_blank" rel="noopener noreferrer" className="mt-1">
              <div className="w-9 h-9 bg-blue-700 rounded flex items-center justify-center text-white font-bold text-sm">in</div>
            </a>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">{t("footer_services")}</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><a href="https://www.philanthroforge.com/services/digital-fundraising-strategy" className="hover:text-gray-900 transition-colors">{t("svc_strategy") || "Digital Strategy"}</a></li>
              <li><a href="https://www.philanthroforge.com/services/consultancy-advisory" className="hover:text-gray-900 transition-colors">{t("svc_consultancy") || "Consultancy & Advice"}</a></li>
              <li><a href="https://www.philanthroforge.com/services/website-donation-optimization" className="hover:text-gray-900 transition-colors">{t("svc_ux") || "UX Optimization"}</a></li>
              <li><a href="https://www.philanthroforge.com/services/donation-form-optimization" className="hover:text-gray-900 transition-colors">{t("svc_donation") || "Donation Optimization"}</a></li>
              <li><a href="https://www.philanthroforge.com/services/fundraising-campaign-journey-design" className="hover:text-gray-900 transition-colors">{t("svc_campaign") || "Campaign Design"}</a></li>
              <li><a href="https://www.philanthroforge.com/services/donor-behaviour-analysis-revenue-growth" className="hover:text-gray-900 transition-colors">{t("svc_analysis") || "Analysis & Growth"}</a></li>
              <li><a href="https://www.philanthroforge.com/services/brand-identity-impact-communication" className="hover:text-gray-900 transition-colors">{t("svc_comm") || "Communication"}</a></li>
              <li><a href="https://www.philanthroforge.com/services/csr-major-donor-support" className="hover:text-gray-900 transition-colors">{t("svc_csr") || "CSR & Major Donor"}</a></li>
              <li><a href="https://www.philanthroforge.com/services/brand-identity-impact-communication" className="hover:text-gray-900 transition-colors">{t("svc_kpi") || "KPIs & Dashboards"}</a></li>
            </ul>
          </div>

          {/* Col 3: About & Case Studies */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">{t("footer_about")}</h4>
            <ul className="space-y-2 text-sm text-gray-700 mb-8">
              <li><a href="https://www.philanthroforge.com/about" className="hover:text-gray-900">Our Story</a></li>
            </ul>
            <h4 className="font-bold text-gray-900 mb-4">{t("nav_case_studies")}</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><a href="https://www.philanthroforge.com/case-studies/rewarding-generosity" className="hover:text-gray-900">Rewarding Generosity</a></li>
              <li><a href="https://www.philanthroforge.com/case-studies/turning-supporters-into-fundraisers" className="hover:text-gray-900">Supporters Into Fundraisers</a></li>
              <li><a href="https://www.philanthroforge.com/case-studies/integrated-ecosystems" className="hover:text-gray-900">Integrated Ecosystems</a></li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="font-bold text-gray-900 mb-2">{t("footer_legal")}</h4>
            <a href="https://www.philanthroforge.com/privacy-policy" className="text-sm text-gray-700 hover:text-gray-900 block mb-1">{t("privacy_policy") || "Privacy Policy"}</a>
            <a href="https://www.philanthroforge.com/terms-and-conditions" className="text-sm text-gray-700 hover:text-gray-900 block mb-6">{t("terms_conditions") || "Terms and Conditions"}</a>
            <h4 className="font-bold text-gray-900 mb-1">{t("footer_email")}</h4>
            <a href="mailto:hello@philanthroforge.com" className="text-sm text-gray-700 hover:text-gray-900 block mb-6">hello@philanthroforge.com</a>
            <h4 className="font-bold text-gray-900 mb-3">{t("footer_meeting")}</h4>
            <Link
              href="/onboarding"
              className="block w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-center py-3 px-6 rounded transition-colors"
            >
              {t("book_now")}
            </Link>
          </div>
        </div>

        <div className="border-t border-yellow-300 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm font-semibold text-gray-800">
          <span>{t("footer_copyright")}</span>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/login" className="hover:text-gray-800 transition-colors">{t("ngo_login")}</Link>
            <span>·</span>
            <Link href="/admin" className="hover:text-gray-800 transition-colors">{t("platform_admin")}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
