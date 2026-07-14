import { NextResponse } from 'next/server'
import { openai, PRAYER_FOCUS_PROMPT } from '@/lib/ai'

export async function POST(req: Request) {
  try {
    const { scenesDescription, projectName } = await req.json()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: PRAYER_FOCUS_PROMPT },
        {
          role: 'user',
          content: `Generate a prayer focus for a NuruLife Productions shoot day.
Project: ${projectName || 'NuruLife Production'}
Scenes being filmed today: ${scenesDescription || 'General production day'}

Please provide an encouraging scripture and prayer for the team.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')
    const prayerFocus = JSON.parse(content)
    return NextResponse.json({ prayerFocus })
  } catch (error: any) {
    console.error('Prayer focus error:', error)
    // Return a default prayer focus if AI fails
    return NextResponse.json({
      prayerFocus: {
        scripture: 'I can do all things through Christ who strengthens me.',
        reference: 'Philippians 4:13',
        prayer: 'Lord, guide our hands and hearts as we create today. May every frame we capture reflect Your light and bring transformation to those who watch. Give us creativity, patience, and excellence in all we do.',
        theme: 'Strength',
        affirmation: 'We are called to shine His light through every story we tell.',
      },
    })
  }
}