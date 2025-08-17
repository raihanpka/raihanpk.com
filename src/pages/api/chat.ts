import type { APIRoute } from 'astro'
import { LlamaCloudIndex } from 'llama-cloud-services'
import { ContextChatEngine, Settings } from 'llamaindex'
import { OpenAI } from '@llamaindex/openai'

export const prerender = false

const DAILY_LIMIT = 20
const QUOTA_COOKIE = 'chat_quota'

function getTodayUTC() {
  return new Date().toISOString().slice(0, 10)
}

function parseCookies(header: string | null) {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf('=')
    if (eq > -1) {
      const k = part.slice(0, eq).trim()
      const v = part.slice(eq + 1).trim()
      out[k] = decodeURIComponent(v)
    }
  }
  return out
}

function serializeCookie(name: string, value: string, maxAgeSeconds: number) {
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'SameSite=Lax',
    'HttpOnly',
  ]
  return attrs.join('; ')
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text()
    if (!body) {
      throw new Error('Empty request body')
    }
    
    const { messages } = JSON.parse(body)

    // Check if API keys are available
    const llamaApiKey = process.env.LLAMA_CLOUD_API_KEY || import.meta.env.LLAMA_CLOUD_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY
    const organizationId = process.env.LLAMA_CLOUD_ORGANIZATION_ID || import.meta.env.LLAMA_CLOUD_ORGANIZATION_ID

    // Configure LLM
    Settings.llm = new OpenAI({
      apiKey: openaiApiKey,
      model: 'gpt-4o-mini',
    })

    // Per-browser quota check (cookie-based)
    const cookies = parseCookies(request.headers.get('cookie'))
    const raw = cookies[QUOTA_COOKIE]
    const today = getTodayUTC()
    let count = 0
    let cookieDate = today

    if (raw) {
      const [d, c] = raw.split(':')
      if (d === today) {
        cookieDate = d
        const n = Number(c)
        if (!Number.isNaN(n)) count = n
      }
    }

    if (count >= DAILY_LIMIT) {
      const payload = {
        error: 'rate_limited',
        message: `Batas penggunaan chat harian tercapai (25/hari). Coba lagi besok.`,
        limit: DAILY_LIMIT,
        remaining: 0,
      }
      return new Response(JSON.stringify(payload), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          // keep existing cookie as-is, refresh max-age to 24h
          'Set-Cookie': serializeCookie(QUOTA_COOKIE, `${today}:${count}`, 60 * 60 * 24),
        },
      })
    }

    // Accept request -> increment count and set cookie
    const newCount = count + 1
    const setCookie = serializeCookie(QUOTA_COOKIE, `${today}:${newCount}`, 60 * 60 * 24)

    const index = new LlamaCloudIndex({
      name: "Personal Chatbot",
      projectName: "Website",
      organizationId: organizationId,
      apiKey: llamaApiKey,
    })

    const retriever = index.asRetriever({
      similarityTopK: 5,
    })

    const chatEngine = new ContextChatEngine({ 
      retriever,
      systemPrompt: `You are chatting with a user that landed on Raihan PK's personal website. Write as if you were Raihan, using the data available.
                    - Get information from your knowledge base to answer questions abut Raihan. 
                    - Everytime somebody refers to the chat, act like Raihan was asked in the self perspective and try to retrieve correct information. 
                    - Use simple, easily understandable language and keep answers short. Do not use Markdown or code blocks, just answer with plain text.
                    - If there's no answer to a question, clarify that without making up a conclusion.
                    - If a user's question isn't related to Raihan, explain that the chat is focused on him and can't answer unrelated questions, this is important!
                    - Inappropriate questions will not be answered, with a clear statement that such questions won't be addressed.
                    - You only can answer the question in Indonesian or English, if the question is in Indonesian, you must answer in Indonesian.
                    - Otherwise, if the question is in English or other language (except Indonesian), first you must translate the knowledge base and then answer in English. 
                    All of this rule are strict!
                    `
    })

    const lastMessage = messages[messages.length - 1]
    
    const response = await chatEngine.chat({
      message: lastMessage.content,
      chatHistory: messages.slice(0, -1).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const content = response.response
        const chunks = content.split(' ')
        
        chunks.forEach((chunk, index) => {
          setTimeout(() => {
            const data = JSON.stringify({
              type: 'text-delta',
              textDelta: chunk + (index < chunks.length - 1 ? ' ' : '')
            })
            controller.enqueue(encoder.encode(`0:${data}\n`))
            
            if (index === chunks.length - 1) {
              controller.close()
            }
          }, index * 50)
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Set-Cookie': setCookie,
      },
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request'}),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
