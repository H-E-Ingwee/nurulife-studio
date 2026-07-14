import { NextResponse } from 'next/server'
import { openai, CULTURAL_CHECKER_PROMPT } from '@/lib/ai'

export async function POST(req: Request) {
  try {
    const { scriptText } = await req.json()
    if (!scriptText) return NextResponse.json({ error: 'scriptText is required' }, { status: 400 })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CULTURAL_CHECKER_PROMPT },
        { role: 'user', content: `Check this script for Kenyan cultural authenticity:\n\n${scriptText.slice(0, 6000)}` },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')
    const analysis = JSON.parse(content)
    return NextResponse.json({ analysis })
  } catch (error: any) {
    console.error('Cultural checker error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}