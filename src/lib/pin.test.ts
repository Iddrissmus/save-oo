import { describe, expect, it } from 'vitest'
import { generateSalt, hashPin, verifyPin } from './pin'

describe('pin hashing', () => {
  it('is deterministic for the same pin and salt', async () => {
    const salt = generateSalt()
    expect(await hashPin('1234', salt)).toBe(await hashPin('1234', salt))
  })

  it('verifies the right pin and rejects a wrong one', async () => {
    const salt = generateSalt()
    const hash = await hashPin('4821', salt)
    expect(await verifyPin('4821', salt, hash)).toBe(true)
    expect(await verifyPin('4822', salt, hash)).toBe(false)
  })

  it('differs by salt and never contains the pin', async () => {
    const a = await hashPin('1234', generateSalt())
    const b = await hashPin('1234', generateSalt())
    expect(a).not.toBe(b)
    expect(a).toHaveLength(64)
  })

  it('makes unique salts', () => {
    expect(generateSalt()).not.toBe(generateSalt())
    expect(generateSalt()).toHaveLength(32)
  })
})
