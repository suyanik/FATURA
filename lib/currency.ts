import { Currency } from '@prisma/client'

export function formatCurrency(
  amount: number | string,
  currency: Currency = 'EUR',
  locale: string = 'de-DE'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

export function formatNumber(
  value: number | string,
  locale: string = 'de-DE',
  decimals: number = 2
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue)
}

export const currencySymbols: Record<Currency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
}

export const currencyNames: Record<Currency, string> = {
  TRY: 'Türkische Lira',
  USD: 'US-Dollar',
  EUR: 'Euro',
}
