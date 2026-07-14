import { NextResponse } from 'next/server'
import { openai, SHOT_LIST_PROMPT } from '@/lib/ai'

export async function POST(req: Request) {
  try {
    const { sceneDescription, projectId } = await req.json()
    if (!sceneDescription) {
      return NextResponse.json({ error: 'sceneDescription is required' }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SHOT_LIST_PROMPT },
        {
          role: 'user',
          content: `Generate a complete professional shot list for this scene:\n\n${sceneDescription}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')
    const shotList = JSON.parse(content)
    return NextResponse.json({ shotList })
  } catch (error: any) {
    console.error('Shot list generator error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}