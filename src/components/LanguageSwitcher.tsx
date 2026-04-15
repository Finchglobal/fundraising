"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { translations, type Lang } from "@/lib/i18n/translations"

export type { Lang }
// ── Language Context ──────────────────────────────────────────────
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
