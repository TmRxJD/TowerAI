export async function sha256Hex(value: string, label = 'payload hash verification'): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error(`WebCrypto subtle API is required for ${label}`)
  }

  const encoded = new TextEncoder().encode(value)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encoded)
  const bytes = Array.from(new Uint8Array(digest))
  return bytes.map(byte => byte.toString(16).padStart(2, '0')).join('')
}
