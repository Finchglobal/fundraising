"use client"

import { useState, useEffect, createContext, useContext } from "react"

// ── Language Context ──────────────────────────────────────────────
export type Lang = "en" | "hi" | "hinglish"

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
})

// ── Translations ──────────────────────────────────────────────────
const translations: Record<Lang, Record<string, string>> = {
  en: {
    donate_now: "Donate Now",
    give_now: "Give Now",
    verified: "Verified",
    tax_benefit: "Tax Benefit (80G)",
    raised: "raised",
    of_goal: "of goal",
    donate_upi: "Donate via UPI",
    scan_pay: "Scan to Pay via Any UPI App",
    already_paid: "Already paid via UPI?",
    copy_upi: "Copy UPI ID",
    tax_deduction: "Tax Deduction Available",
    claim_deduction: "Claim 50% deduction under Section 80G",
    share_campaign: "Share this Campaign",
    active_campaigns: "Active Campaigns",
    past_impact: "Past Impact",
    funded: "Successfully Funded",
    view_profile: "View Profile",
    organising_campaign: "Organising this campaign",
    read_more: "Read More",
    recent_supporters: "Recent Supporters",
    first_to_donate: "Be the first to donate to this cause!",
    impact_timeline: "Impact Timeline",
    zero_fee: "Secure, Zero-Fee UPI Transfer",
    confirm_receipt: "Confirm my Receipt",
  },
  hi: {
    donate_now: "अभी दान करें",
    give_now: "अभी दें",
    verified: "सत्यापित",
    tax_benefit: "कर लाभ (80G)",
    raised: "जुटाया गया",
    of_goal: "लक्ष्य का",
    donate_upi: "UPI से दान करें",
    scan_pay: "किसी भी UPI ऐप से स्कैन करके पेमेंट करें",
    already_paid: "क्या आपने UPI ऐप से पेमेंट कर दी है?",
    copy_upi: "UPI ID कॉपी करें",
    tax_deduction: "टैक्स कटौती उपलब्ध",
    claim_deduction: "धारा 80G के तहत 50% कटौती का दावा करें",
    share_campaign: "इस अभियान को साझा करें",
    active_campaigns: "सक्रिय अभियान",
    past_impact: "पिछले प्रभाव",
    funded: "सफलतापूर्वक वित्त पोषित",
    view_profile: "प्रोफ़ाइल देखें",
    organising_campaign: "यह अभियान चला रहा है",
    read_more: "और पढ़ें",
    recent_supporters: "हाल के समर्थक",
    first_to_donate: "इस अभियान को पहला दान दें!",
    impact_timeline: "प्रभाव समयरेखा",
    zero_fee: "सुरक्षित, बिना शुल्क UPI ट्रांसफर",
    confirm_receipt: "रसीद की पुष्टि करें",
  },
  hinglish: {
    donate_now: "Abhi Donate Karein",
    give_now: "De Do Abhi",
    verified: "Verified ✓",
    tax_benefit: "Tax Bachao (80G)",
    raised: "Jama Hua",
    of_goal: "Target ka",
    donate_upi: "UPI se Donate Karein",
    scan_pay: "Kisi bhi UPI App se Scan karke Pay karein",
    already_paid: "Kya aapne UPI se payment kar di?",
    copy_upi: "UPI ID Copy Karein",
    tax_deduction: "Tax Mein Chhoot Milegi",
    claim_deduction: "Section 80G mein 50% tax chhoot claim karein",
    share_campaign: "Yeh Campaign Share Karein",
    active_campaigns: "Active Campaigns",
    past_impact: "Pichle Kaam",
    funded: "Safaltapoorvak Fund Kiya",
    view_profile: "Profile Dekho",
    organising_campaign: "Yeh campaign chala raha hai",
    read_more: "Aur Padhein",
    recent_supporters: "Hamare Supporters",
    first_to_donate: "Pehle aap donate karein!",
    impact_timeline: "Kab Kya Hua",
    zero_fee: "Safe, Bina Fee UPI Transfer",
    confirm_receipt: "Receipt Confirm Karein",
  },
}

// ── Provider ──────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    const stored = localStorage.getItem("pf_lang") as Lang | null
    if (stored && ["en", "hi", "hinglish"].includes(stored)) {
      setLangState(stored)
    }
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem("pf_lang", l)
  }

  const t = (key: string): string => translations[lang][key] ?? translations["en"][key] ?? key

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}

// ── Switcher UI Component ─────────────────────────────────────────
export function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const OPTIONS: { value: Lang; label: string; flag: string }[] = [
    { value: "en", label: "EN", flag: "🇬🇧" },
    { value: "hinglish", label: "HG", flag: "🤝" },
    { value: "hi", label: "हि", flag: "🇮🇳" },
  ]

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-full p-0.5 border border-slate-200">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => setLang(opt.value)}
          title={opt.value === "en" ? "English" : opt.value === "hi" ? "हिंदी" : "Hinglish"}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
            lang === opt.value
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {opt.flag} {opt.label}
        </button>
      ))}
    </div>
  )
}
