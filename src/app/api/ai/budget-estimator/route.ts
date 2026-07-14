import { NextResponse } from 'next/server'
import { openai, BUDGET_ESTIMATOR_PROMPT } from '@/lib/ai'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { breakdownId, projectId } = await req.json()

    let elementsData = 'No breakdown data available'
    if (breakdownId) {
      const breakdown = await prisma.breakdown.findUnique({
        where: { id: breakdownId },
        include: { scenes: { include: { elements: true } } },
      })
      if (breakdown) {
        const allElements = breakdown.scenes.flatMap(s => s.elements)
        const grouped: Record<string, string[]> = {}
        for (const el of allElements) {
          if (!grouped[el.category]) grouped[el.category] = []
          grouped[el.category].push(el.name)
        }
        elementsData = Object.entries(grouped)
          .map(([cat, items]) => `${cat}: ${items.join(', ')}`)
          .join('\n')
      }
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: BUDGET_ESTIMATOR_PROMPT },
        {
          role: 'user',
          content: `Estimate the production budget in KES for a NuruLife Productions project with these elements:\n\n${elementsData}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')
    const estimate = JSON.parse(content)
    return NextResponse.json({ estimate })
  } catch (error: any) {
    console.error('Budget estimator error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}