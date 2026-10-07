// All money is stored as integer pesewas (100 pesewas = GH₵1) to avoid float errors.

/** Parse user text like "12", "12.5", "12.50", "1,200.75" into pesewas. Returns null if invalid. */
export function cedisToPesewas(input: string): number | null {
  const cleaned = input.trim().replace(/,/g, '')
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(cleaned)
  if (!match) return null
  const cedis = Number(match[1])
  const pesewas = Number((match[2] ?? '').padEnd(2, '0'))
  const total = cedis * 100 + pesewas
  return Number.isSafeInteger(total) ? total : null
}

const formatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  currencyDisplay: 'narrowSymbol',
})

/** Format pesewas as GH₵ with two decimals. */
export function formatCedis(pesewas: number): string {
  return formatter.format(pesewas / 100)
}

export function sumPesewas(amounts: number[]): number {
  return amounts.reduce((total, a) => total + a, 0)
}
