import { describe, expect, it } from 'bun:test'
import memories from '@/data/memories.json'
import { validateMemories } from '@/lib/memories'

describe('validateMemories', () => {
  it('accepts the shipped data', () => {
    const list = validateMemories(memories)
    expect(list.length).toBeGreaterThan(0)
  })

  it('keeps the order it was given and the optional when field', () => {
    const list = validateMemories([
      { src: 'https://a.test/1.jpg', caption: 'First.', when: '2025' },
      { src: 'https://a.test/2.jpg', caption: 'Second.' },
    ])
    expect(list.map((m) => m.caption)).toEqual(['First.', 'Second.'])
    expect(list[0].when).toBe('2025')
    expect(list[1].when).toBeUndefined()
  })

  it('rejects a missing or non-https src', () => {
    expect(() => validateMemories([{ src: '', caption: 'x' }])).toThrow(/src/)
    expect(() => validateMemories([{ src: 'http://a.test/1.jpg', caption: 'x' }])).toThrow(/src/)
  })

  it('rejects an empty caption and a caption with a colon', () => {
    expect(() => validateMemories([{ src: 'https://a.test/1.jpg', caption: ' ' }])).toThrow(/caption/)
    expect(() => validateMemories([{ src: 'https://a.test/1.jpg', caption: 'Note: hi' }])).toThrow(/colon/)
  })

  it('rejects an empty when and duplicate sources', () => {
    expect(() => validateMemories([{ src: 'https://a.test/1.jpg', caption: 'x', when: ' ' }])).toThrow(/when/)
    expect(() =>
      validateMemories([
        { src: 'https://a.test/1.jpg', caption: 'x' },
        { src: 'https://a.test/1.jpg', caption: 'y' },
      ]),
    ).toThrow(/duplicate/)
  })

  it('rejects anything that is not a list', () => {
    expect(() => validateMemories({})).toThrow(/list/)
  })
})
