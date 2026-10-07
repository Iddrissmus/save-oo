export const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back']

/** Apply one keypad press to the amount text, keeping it a valid cedi amount. */
export function pressKey(amount: string, key: string): string {
  if (key === 'back') return amount.slice(0, -1)
  if (key === '.') {
    if (amount.includes('.')) return amount
    return amount === '' ? '0.' : amount + '.'
  }
  if (amount.length >= 9) return amount
  const decimals = amount.split('.')[1]
  if (decimals !== undefined && decimals.length >= 2) return amount
  return amount === '0' ? key : amount + key
}
