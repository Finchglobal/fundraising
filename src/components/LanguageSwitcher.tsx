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
    // Forced reload to ensure all components (including potential non-reactive ones) reflect the change
    setTimeout(() => window.location.reload(), 100)
  }

  const t = (key: string): string => translations[lang][key] ?? translations["en"][key] ?? key

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}

// ── Switcher UI Component ─────────────────────────────────────────
const OPTIONS: { value: Lang; label: string; flag: string; short: string; title: string }[] = [
  { value: "en", label: "English", short: "EN", flag: "🇬🇧", title: "English" },
  { value: "hinglish", label: "Hinglish", short: "HG", flag: "🤝", title: "Hinglish" },
  { value: "hi", label: "Hindi", short: "हि", flag: "🇮🇳", title: "हिंदी" },
]

// ── Switcher UI Component ─────────────────────────────────────────
export function LanguageSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <div className="inline-flex items-center gap-0.5 bg-slate-100/80 backdrop-blur-sm rounded-full p-1 border border-slate-200 shadow-sm">
      {OPTIONS.map(opt => {
        const isActive = lang === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLang(opt.value)
            }}
            title={opt.title}
            aria-pressed={isActive}
            className={`
              relative flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full 
              text-[11px] font-bold transition-all duration-200 ease-out
              active:scale-95 touch-manipulation cursor-pointer select-none
              ${isActive 
                ? "bg-teal-600 text-white shadow-md ring-1 ring-teal-500/20" 
                : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
              }
            `}
          >
            <span className="text-sm leading-none drop-shadow-sm pointer-events-none">{opt.flag}</span>
            <span className="pointer-events-none">{opt.short}</span>
          </button>
        )
      })}
    </div>
  )
}
