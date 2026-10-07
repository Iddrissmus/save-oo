// The PIN is never stored, only a salted PBKDF2 hash of it. This is a privacy screen, not encryption:
// the data itself stays readable to anyone with access to the device's browser storage.

const ITERATIONS = 100_000
export const PIN_LENGTH = 4

const toHex = (bytes: Uint8Array) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')

export function generateSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)))
}

export async function hashPin(pin: string, saltHex: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits'])
  const salt = Uint8Array.from(saltHex.match(/.{2}/g) ?? [], (h) => parseInt(h, 16))
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256)
  return toHex(new Uint8Array(bits))
}

export async function verifyPin(pin: string, saltHex: string, expectedHash: string): Promise<boolean> {
  return (await hashPin(pin, saltHex)) === expectedHash
}
