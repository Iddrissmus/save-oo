import { describe, expect, it } from 'vitest'
import { pressKey } from './keypad'

const type = (keys: string[]) => keys.reduce(pressKey, '')

describe('pressKey', () => {
  it('builds amounts', () => {
    expect(type(['1', '2', '.', '5'])).toBe('12.5')
  })
  it('starts a decimal with a leading zero', () => {
    expect(type(['.', '5'])).toBe('0.5')
  })
  it('limits to two decimals and one dot', () => {
    expect(type(['1', '.', '2', '3', '4'])).toBe('1.23')
    expect(type(['1', '.', '.', '5'])).toBe('1.5')
  })
  it('does not stack leading zeros', () => {
    expect(type(['0', '0', '7'])).toBe('7')
  })
  it('backspaces', () => {
    expect(type(['1', '2', 'back'])).toBe('1')
    expect(type(['back'])).toBe('')
  })
})
