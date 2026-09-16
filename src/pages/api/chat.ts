import type { APIRoute } from 'astro'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { checkRateLimit } from '@/lib/ratelimit'
import { searchKnowledge } from '@/lib/rag/pinecone'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text()
    if (!body) {
      throw new Error('Empty request body')
    }

    const { messages } = JSON.parse(body)
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Rate limiting with signed cookies (privacy-friendly, no IP stored)
    const rateLimit = checkRateLimit(request)

    if (!rateLimit.allowed) {
      const payload = {
        error: 'rate_limited',
        message: `Limit daily chat reached (${rateLimit.limit} per day). Try again tomorrow.`,
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
      }
      return new Response(JSON.stringify(payload), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': rateLimit.setCookie,
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      })
    }

    // API Keys
    const googleApiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY
    const openaiApiKey =
      process.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY

    // Retrieve context from Pinecone (Integrated Inference or vector fallback)
    const lastUserMessage = messages[messages.length - 1]
    let contextText = ''

    try {
      const matches = await searchKnowledge(lastUserMessage.content, 4)
      if (matches.length > 0) {
        contextText = matches
          .map((m) => `[Source: ${m.source}]\n${m.text}`)
          .join('\n\n')
      }
    } catch (err) {
      console.warn('Knowledge retrieval skipped:', err)
    }

    const systemPrompt = `You are chatting with a user that landed on Raihan PK's personal website. Write as if you were Raihan, using the data available.
Get information from your knowledge base context below to answer questions about Raihan.
Every time somebody refers to the chat, act like Raihan was asked in the first-person perspective and retrieve correct information.
Use simple, easily understandable language and keep answers concise and friendly.
If there is no answer to a question in the knowledge base, clarify that honestly without making up false facts.
If a user's question isn't related to Raihan or his work, explain politely that this chat is focused on him.
Inappropriate questions will not be answered, with a clear statement that such questions won't be addressed.

KNOWLEDGE BASE CONTEXT:
${contextText || 'No specific document context retrieved. Answer from general profile knowledge.'}
`

    // Map messages to Vercel AI SDK format
    const modelMessages = messages.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content as string,
    }))

    // Stream text using Google Gemini (Primary) with OpenAI (Fallback)
    let resultStream: ReturnType<typeof streamText> | null = null

    if (googleApiKey) {
      try {
        resultStream = streamText({
          model: google('gemini-3.5-flash-lite'),
          system: systemPrompt,
          messages: modelMessages,
        })
      } catch (geminiError) {
        console.warn('Google Gemini chat initialization failed, falling back to OpenAI:', geminiError)
      }
    }

    if (!resultStream && openaiApiKey) {
      resultStream = streamText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        messages: modelMessages,
      })
    }

    if (!resultStream) {
      throw new Error('No available LLM provider. Configure GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY.')
    }

    // Stream out chunks in Vercel AI SDK text-delta protocol (consumed by ChatInterface.tsx)
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const textDelta of resultStream.textStream) {
            const payload = JSON.stringify({
              type: 'text-delta',
              textDelta,
            })
            controller.enqueue(encoder.encode(`0:${payload}\n`))
          }
        } catch (streamError) {
          console.error('Error during streaming text output:', streamError)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Set-Cookie': rateLimit.setCookie,
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
