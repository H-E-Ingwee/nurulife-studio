import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { id: string; dayId: string } }
) {
  try {
    const strips = await prisma.strip.findMany({
      where:   { shootDayId: params.dayId },
      orderBy: { order: 'asc' },
      include: { scene: true },
    })
    return NextResponse.json({ data: strips })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string; dayId: string } }
) {
  try {
    const { sceneId, estimatedMinutes, notes } = await req.json()
    if (!sceneId) return NextResponse.json({ error: 'sceneId is required' }, { status: 400 })

    // Check if strip already exists for this scene in this day
    const existing = await prisma.strip.findFirst({
      where: { shootDayId: params.dayId, sceneId },
    })
    if (existing) {
      return NextResponse.json({ error: 'Scene already added to this shoot day' }, { status: 409 })
    }

    const count = await prisma.strip.count({ where: { shootDayId: params.dayId } })
    const strip = await prisma.strip.create({
      data: {
        shootDayId:       params.dayId,
        sceneId,
        order:            count,
        status:           'NOT_STARTED',
        estimatedMinutes: estimatedMinutes || null,
        notes:            notes || null,
      },
      include: { scene: true },
    })
    return NextResponse.json({ data: strip }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}