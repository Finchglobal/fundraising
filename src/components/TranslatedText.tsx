"use client"
import { useLang } from "@/components/LanguageSwitcher"

export function TranslatedText({ tKey }: { tKey: string }) {
  const { t } = useLang()
  return <>{t(tKey)}</>
}
