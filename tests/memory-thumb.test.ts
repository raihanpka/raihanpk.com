import { describe, expect, it } from 'bun:test'
import sharp from 'sharp'
import { makeThumb } from '@/lib/memory-thumb'

const photo = () => sharp({ create: { width: 400, height: 300, channels: 3, background: '#888' } }).jpeg().toBuffer()
const respond = (body: Buffer | string, init: ResponseInit = {}) => async () => new Response(body as BodyInit, { status: 200, ...init })

describe('makeThumb', () => {
  it('returns a square webp data uri', async () => {
    const uri = await makeThumb('https://a.test/p.jpg', { fetchImpl: respond(await photo()) })
    expect(uri).toMatch(/^data:image\/webp;base64,/)
    const meta = await sharp(Buffer.from(uri!.split(',')[1], 'base64')).metadata()
    expect([meta.width, meta.height]).toEqual([144, 144])
  })

  it('uses the requested size', async () => {
    const uri = await makeThumb('https://a.test/p.jpg', { size: 72, fetchImpl: respond(await photo()) })
    expect((await sharp(Buffer.from(uri!.split(',')[1], 'base64')).metadata()).width).toBe(72)
  })

  it('retries once after a failed request', async () => {
    let calls = 0
    const body = await photo()
    const flaky = async () => {
      if (++calls === 1) throw new Error('reset')
      return new Response(body as BodyInit, { status: 200 })
    }
    expect(await makeThumb('https://a.test/p.jpg', { fetchImpl: flaky })).toMatch(/^data:image\/webp/)
    expect(calls).toBe(2)
  })

  it('returns null when the request fails, is not ok, or is not an image', async () => {
    expect(await makeThumb('https://a.test/p.jpg', { fetchImpl: async () => { throw new Error('offline') } })).toBeNull()
    expect(await makeThumb('https://a.test/p.jpg', { fetchImpl: async () => new Response('no', { status: 404 }) })).toBeNull()
    expect(await makeThumb('https://a.test/p.jpg', { fetchImpl: respond('<html>not an image</html>') })).toBeNull()
  })
})
