import { Pinecone } from '@pinecone-database/pinecone'

export interface PineconeRecord {
  id: string
  values: number[]
  metadata: {
    text: string
    source: string
    chunkIndex: number
    [key: string]: any
  }
}

export interface SearchMatch {
  id: string
  score?: number
  text: string
  source: string
  chunkIndex: number
}

function getPineconeClient(): Pinecone {
  const apiKey = process.env.PINECONE_API_KEY || import.meta.env.PINECONE_API_KEY
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is not configured in environment variables.')
  }
  return new Pinecone({ apiKey })
}

export function getIndexName(): string {
  return process.env.PINECONE_INDEX || import.meta.env.PINECONE_INDEX || 'personal-chatbot'
}

export function getNamespace(): string {
  return process.env.PINECONE_NAMESPACE || import.meta.env.PINECONE_NAMESPACE || 'raihanpk-knowledge'
}

/**
 * Upsert records into Pinecone in batches of up to 100.
 */
export async function upsertRecords(records: PineconeRecord[]): Promise<void> {
  const pc = getPineconeClient()
  const index = pc.index({ name: getIndexName(), namespace: getNamespace() })

  const BATCH_SIZE = 100
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    await index.upsert({ records: batch })
  }
}

/**
 * Query Pinecone using a query vector and return top matches.
 */
export async function querySimilarChunks(
  vector: number[],
  topK = 4
): Promise<SearchMatch[]> {
  try {
    const pc = getPineconeClient()
    const index = pc.index({ name: getIndexName(), namespace: getNamespace() })

    const response = await index.query({
      vector,
      topK,
      includeMetadata: true,
    })

    if (!response.matches || response.matches.length === 0) {
      return []
    }

    return response.matches.map((m) => {
      const meta = (m.metadata || {}) as Record<string, any>
      return {
        id: m.id,
        score: m.score,
        text: (meta.text as string) || '',
        source: (meta.source as string) || '',
        chunkIndex: (meta.chunkIndex as number) || 0,
      }
    })
  } catch (error) {
    console.error('Pinecone query error:', error)
    return []
  }
}
