import { NextResponse } from 'next/server'
import { openai, SMART_SCHEDULER_PROMPT } from '@/lib/ai'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { scheduleId, projectId } = await req.json()

    // Fetch scenes from breakdown
    let scenesData = 'No scenes available'
    if (projectId) {
      const breakdown = await prisma.breakdown.findFirst({
        where: { projectId },
        include: { scenes: { include: { elements: true } } },
      })
      if (breakdown?.scenes) {
        scenesData = breakdown.scenes.map(s =>
          `Scene ${s.sceneNumber}: ${s.heading} | ${s.pageCount}p | ${s.timeOfDay || 'DAY'} | ${s.intExt || 'INT'} | Location: ${s.location || 'TBD'}`
        ).join('\n')
      }
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SMART_SCHEDULER_PROMPT },
        {
          role: 'user',
          content: `Suggest the optimal shooting order for these scenes in Nairobi, Kenya:\n\n${scenesData}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')
    const suggestion = JSON.parse(content)
    return NextResponse.json({ suggestion })
  } catch (error: any) {
    console.error('Smart scheduler error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}