import { NextResponse } from 'next/server'
import { openai, BIBLICAL_ANALYZER_PROMPT } from '@/lib/ai'

export async function POST(req: Request) {
  try {
    const { scriptText, scriptTitle } = await req.json()
    if (!scriptText) return NextResponse.json({ error: 'scriptText is required' }, { status: 400 })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: BIBLICAL_ANALYZER_PROMPT },
        {
          role: 'user',
          content: `Analyze this script titled "${scriptTitle || 'Untitled'}":\n\n${scriptText.slice(0, 8000)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    const analysis = JSON.parse(content)
    return NextResponse.json({ analysis })
  } catch (error: any) {
    console.error('Biblical analyzer error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}