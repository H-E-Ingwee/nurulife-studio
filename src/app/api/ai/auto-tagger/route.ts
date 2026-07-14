import { NextResponse } from 'next/server'
import { openai, AUTO_TAGGER_PROMPT } from '@/lib/ai'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { sceneText, sceneId } = await req.json()
    if (!sceneText) return NextResponse.json({ error: 'sceneText is required' }, { status: 400 })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: AUTO_TAGGER_PROMPT },
        { role: 'user', content: `Tag all production elements in this scene:\n\n${sceneText}` },
      ],
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')
    const result = JSON.parse(content)

    // Build flat elements array for bulk creation
    const elements: Array<{ category: string; name: string; aiSuggested: boolean }> = []
    const categoryMap: Record<string, string> = {
      cast: 'CAST', extras: 'EXTRAS', props: 'PROPS',
      setDressing: 'SET_DRESSING', wardrobe: 'WARDROBE', makeup: 'MAKEUP',
      vfx: 'VFX', sound: 'SOUND', vehicles: 'VEHICLES',
      animals: 'ANIMALS', specialEquipment: 'SPECIAL_EQUIPMENT',
    }

    for (const [key, category] of Object.entries(categoryMap)) {
      const items = result[key] as string[] || []
      for (const name of items) {
        if (name && typeof name === 'string') {
          elements.push({ category, name, aiSuggested: true })
        }
      }
    }

    // If sceneId provided, save elements to DB
    if (sceneId && elements.length > 0) {
      await prisma.sceneElement.createMany({
        data: elements.map(el => ({
          sceneId,
          category: el.category as any,
          name: el.name,
          aiSuggested: true,
          confirmed: false,
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ elements, raw: result })
  } catch (error: any) {
    console.error('Auto-tagger error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}