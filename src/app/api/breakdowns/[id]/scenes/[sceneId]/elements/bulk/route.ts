import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { id: string; sceneId: string } }
) {
  try {
    const { elements, aiSuggested } = await req.json()

    if (!elements || !Array.isArray(elements)) {
      return NextResponse.json({ error: 'elements array is required' }, { status: 400 })
    }

    // Map category keys to enum values
    const categoryMap: Record<string, string> = {
      cast:             'CAST',
      extras:           'EXTRAS',
      props:            'PROPS',
      setDressing:      'SET_DRESSING',
      wardrobe:         'WARDROBE',
      makeup:           'MAKEUP',
      vfx:              'VFX',
      sound:            'SOUND',
      vehicles:         'VEHICLES',
      animals:          'ANIMALS',
      specialEquipment: 'SPECIAL_EQUIPMENT',
    }

    const toCreate: Array<{
      sceneId: string
      category: any
      name: string
      aiSuggested: boolean
      confirmed: boolean
    }> = []

    for (const el of elements) {
      // Support both flat {category, name} and nested {cast: [...], props: [...]}
      if (el.category && el.name) {
        const cat = categoryMap[el.category] || el.category
        toCreate.push({
          sceneId:     params.sceneId,
          category:    cat as any,
          name:        el.name,
          aiSuggested: aiSuggested ?? el.aiSuggested ?? true,
          confirmed:   false,
        })
      }
    }

    if (toCreate.length === 0) {
      return NextResponse.json({ data: [], message: 'No valid elements to create' })
    }

    const created = await prisma.sceneElement.createMany({
      data:            toCreate,
      skipDuplicates:  true,
    })

    // Return updated scene with elements
    const scene = await prisma.scene.findUnique({
      where:   { id: params.sceneId },
      include: { elements: true },
    })

    return NextResponse.json({
      data:    scene,
      created: created.count,
      message: `${created.count} elements added`,
    }, { status: 201 })

  } catch (error: any) {
    console.error('Bulk elements error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; sceneId: string } }
) {
  try {
    const deleted = await prisma.sceneElement.deleteMany({
      where: { sceneId: params.sceneId },
    })
    return NextResponse.json({ message: `${deleted.count} elements deleted` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}