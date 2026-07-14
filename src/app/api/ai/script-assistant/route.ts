import { NextResponse } from 'next/server'
import { openai } from '@/lib/ai'
import { SCRIPT_ASSISTANT_PROMPT } from '@/lib/ai'

export async function POST(req: Request) {
  try {
    const { messages, scriptContext, scriptTitle } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 })
    }

    const systemPrompt = `${SCRIPT_ASSISTANT_PROMPT}

Current script: "${scriptTitle || 'Untitled'}"
${scriptContext ? `\nScript context (first 2000 chars):\n${scriptContext}` : ''}`

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
      stream: true,
      max_tokens: 1000,
      temperature: 0.8,
    })

    // Stream the response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Script assistant error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}