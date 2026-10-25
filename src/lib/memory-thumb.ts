import sharp from 'sharp'

/**
 * Makes a small square thumbnail of a remote photo as an inline webp data uri.
 * Returns null on any failure, so a slow or missing photo never breaks a build: the caller
 * falls back to the original url.
 */

interface Options {
  size?: number
  fetchImpl?: (input: string, init?: RequestInit) => Promise<Response>
}

export async function makeThumb(url: string, { size = 144, fetchImpl = fetch }: Options = {}): Promise<string | null> {
  // One retry: the gallery host is slow and occasionally drops a connection.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchImpl(url, { signal: AbortSignal.timeout(15000) })
      if (!res.ok) return null
      const input = Buffer.from(await res.arrayBuffer())
      const out = await sharp(input).rotate().resize(size, size, { fit: 'cover' }).webp({ quality: 70 }).toBuffer()
      return `data:image/webp;base64,${out.toString('base64')}`
    } catch {
      // Try again once, then give up with null.
    }
  }
  return null
}
