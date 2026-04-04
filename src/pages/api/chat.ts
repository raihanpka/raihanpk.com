import type { APIRoute } from 'astro'
import { LlamaCloudIndex } from 'llama-cloud-services'
import { ContextChatEngine, Settings } from 'llamaindex'
import { OpenAI } from '@llamaindex/openai'
import { checkRateLimit } from '@/lib/ratelimit'

export const prerender = false

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
                    Get information from your knowledge base to answer questions abut Raihan. 
                    Everytime somebody refers to the chat, act like Raihan was asked in the self perspective and try to retrieve correct information. 
                    Use simple, easily understandable language and keep answers short. Do not use Markdown or code blocks, just answer with plain text.
                    If there's no answer to a question, clarify that without making up a conclusion.
                    If a user's question isn't related to Raihan, explain that the chat is focused on him and can't answer unrelated questions, this is important!
                    Inappropriate questions will not be answered, with a clear statement that such questions won't be addressed.
                    You only can answer the question in English. If the question is in Indonesian or other language, you must translate the knowledge base from Indonesian to English and then answer in English, this is important too!
                    All of these rules are strict!
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
        const content = response.message.content as string
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
        'Set-Cookie': rateLimit.setCookie,
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
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
