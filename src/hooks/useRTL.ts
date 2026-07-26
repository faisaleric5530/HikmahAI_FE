import { useTranslation } from 'react-i18next'

export function useRTL() {
  const { i18n } = useTranslation()
  const dir = i18n.dir()
  return { isRTL: dir === 'rtl', dir }
}
