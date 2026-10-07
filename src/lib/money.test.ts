import { describe, expect, it } from 'vitest'
import { cedisToPesewas, formatCedis, sumPesewas } from './money'

describe('cedisToPesewas', () => {
  it('parses whole and decimal amounts', () => {
    expect(cedisToPesewas('12')).toBe(1200)
    expect(cedisToPesewas('12.5')).toBe(1250)
    expect(cedisToPesewas('12.50')).toBe(1250)
    expect(cedisToPesewas('0.05')).toBe(5)
    expect(cedisToPesewas('1,200.75')).toBe(120075)
  })

  it('rejects invalid input', () => {
    expect(cedisToPesewas('')).toBeNull()
    expect(cedisToPesewas('abc')).toBeNull()
    expect(cedisToPesewas('-5')).toBeNull()
    expect(cedisToPesewas('1.234')).toBeNull()
  })
})

describe('sumPesewas', () => {
  it('is exact where floats are not', () => {
    expect(0.1 + 0.2).not.toBe(0.3)
    const total = sumPesewas([cedisToPesewas('0.10')!, cedisToPesewas('0.20')!])
    expect(total).toBe(30)
  })
})

describe('formatCedis', () => {
  it('formats pesewas with two decimals and the cedi sign', () => {
    const out = formatCedis(1250)
    expect(out).toContain('12.50')
    expect(out).toContain('₵')
  })
})
