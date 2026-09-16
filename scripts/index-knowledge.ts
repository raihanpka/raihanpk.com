import fs from 'node:fs'
import path from 'node:path'
import { chunkDocument, type Chunk } from '../src/lib/rag/chunker'
import { getEmbeddings } from '../src/lib/rag/embedding'
import { upsertRecords, type PineconeRecord, getIndexName, getNamespace } from '../src/lib/rag/pinecone'

const KNOWLEDGE_DIR = path.resolve(process.cwd(), 'knowledge')

/**
 * Parse a PDF or DOCX file using LlamaParse REST API v2.
 */
async function parseWithLlamaParse(filePath: string, apiKey: string): Promise<string> {
  const fileName = path.basename(filePath)
  console.log(`[LlamaParse v2] Uploading ${fileName}...`)

  const fileBuffer = fs.readFileSync(filePath)
  const blob = new Blob([fileBuffer])

  // 1. Upload file
  const formData = new FormData()
  formData.append('file', blob, fileName)
  formData.append('purpose', 'parse')

  const uploadRes = await fetch('https://api.cloud.llamaindex.ai/api/v1/beta/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!uploadRes.ok) {
    const errText = await uploadRes.text()
    throw new Error(`LlamaParse file upload failed (${uploadRes.status}): ${errText}`)
  }

  const uploadData = await uploadRes.json()
  const fileId = uploadData.id
  console.log(`[LlamaParse v2] File uploaded with ID: ${fileId}. Starting parse job...`)

  // 2. Trigger parse job (API v2)
  const parseRes = await fetch('https://api.cloud.llamaindex.ai/api/v2/parse', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_id: fileId,
      tier: 'agentic',
      version: 'latest',
    }),
  })

  if (!parseRes.ok) {
    const errText = await parseRes.text()
    throw new Error(`LlamaParse job creation failed (${parseRes.status}): ${errText}`)
  }

  const parseData = await parseRes.json()
  const jobId = parseData.id

  // 3. Poll for completion
  console.log(`[LlamaParse v2] Waiting for parsing job ${jobId} to finish...`)
  let attempts = 0
  const maxAttempts = 60 // 2 minutes max

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 2000))
    attempts++

    const statusRes = await fetch(`https://api.cloud.llamaindex.ai/api/v2/parse/${jobId}?expand=markdown`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!statusRes.ok) {
      continue
    }

    const jobStatus = await statusRes.json()
    if (jobStatus.status === 'SUCCESS') {
      console.log(`[LlamaParse v2] Successfully parsed ${fileName}!`)
      return jobStatus.markdown || jobStatus.text || ''
    }

    if (jobStatus.status === 'ERROR') {
      throw new Error(`LlamaParse job failed: ${JSON.stringify(jobStatus.error)}`)
    }
  }

  throw new Error(`LlamaParse job timed out for ${fileName}`)
}

/**
 * Main indexing function.
 */
async function main() {
  console.log('--- RAG Knowledge Base Ingestion ---')
  console.log(`Target Pinecone Index: ${getIndexName()} | Namespace: ${getNamespace()}`)

  const llamaKey = process.env.LLAMA_CLOUD_API_KEY

  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true })
  }

  const files = fs.readdirSync(KNOWLEDGE_DIR).filter((f) => {
    return !f.startsWith('.') && f !== 'README.md'
  })

  const documents: Array<{ name: string; content: string }> = []

  // Ingest from knowledge directory
  for (const file of files) {
    const filePath = path.join(KNOWLEDGE_DIR, file)
    const ext = path.extname(file).toLowerCase()

    if (ext === '.md' || ext === '.txt') {
      console.log(`Reading text document: ${file}`)
      const content = fs.readFileSync(filePath, 'utf-8')
      documents.push({ name: file, content })
    } else if (ext === '.pdf' || ext === '.docx') {
      if (!llamaKey) {
        console.warn(`[Warning] Skipping ${file}: LLAMA_CLOUD_API_KEY is required to parse PDF/DOCX via LlamaParse.`)
        continue
      }
      try {
        const content = await parseWithLlamaParse(filePath, llamaKey)
        documents.push({ name: file, content })
      } catch (err) {
        console.error(`Failed to parse ${file}:`, err)
      }
    }
  }

  // Also include author bio as baseline knowledge if available
  const authorPath = path.resolve(process.cwd(), 'src/content/authors/raihanpk.md')
  if (fs.existsSync(authorPath)) {
    console.log('Adding baseline author profile (src/content/authors/raihanpk.md)...')
    documents.push({
      name: 'author-raihanpk.md',
      content: fs.readFileSync(authorPath, 'utf-8'),
    })
  }

  if (documents.length === 0) {
    console.log('No documents found to index. Place .md, .txt, or .pdf files in the knowledge/ folder.')
    return
  }

  console.log(`\nFound ${documents.length} document(s). Chunking...`)

  const allChunks: Chunk[] = []
  for (const doc of documents) {
    const chunks = chunkDocument(doc.content, doc.name, {
      chunkSize: 800,
      chunkOverlap: 120,
    })
    console.log(` - ${doc.name}: generated ${chunks.length} chunks`)
    allChunks.push(...chunks)
  }

  console.log(`\nTotal chunks across all documents: ${allChunks.length}`)
  console.log('Generating vector embeddings (Gemini primary / OpenAI fallback)...')

  const BATCH_SIZE = 50
  const records: PineconeRecord[] = []

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE)
    const texts = batch.map((c) => c.text)

    console.log(`Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allChunks.length / BATCH_SIZE)} (${batch.length} chunks)...`)
    const embeddings = await getEmbeddings(texts)

    for (let j = 0; j < batch.length; j++) {
      records.push({
        id: batch[j].id,
        values: embeddings[j],
        metadata: {
          text: batch[j].text,
          source: batch[j].source,
          chunkIndex: batch[j].chunkIndex,
        },
      })
    }
  }

  console.log(`\nUpserting ${records.length} records to Pinecone...`)
  await upsertRecords(records)

  console.log('Ingestion completed successfully!')
}

main().catch((err) => {
  console.error('Ingestion failed with error:', err)
  process.exit(1)
})
