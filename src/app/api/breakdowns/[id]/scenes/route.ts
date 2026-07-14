import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const scenes = await prisma.scene.findMany({
      where: { breakdownId: params.id },
      orderBy: { order: 'asc' },
      include: { elements: true },
    })
    return NextResponse.json({ data: scenes })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { sceneNumber, heading, synopsis, pageCount, storyDay, prepMinutes, shootMinutes, intExt, timeOfDay, location } = await req.json()
    if (!sceneNumber || !heading) return NextResponse.json({ error: 'sceneNumber and heading required' }, { status: 400 })
    const count = await prisma.scene.count({ where: { breakdownId: params.id } })
    const scene = await prisma.scene.create({
      data: {
        breakdownId: params.id,
        sceneNumber,
        heading,
        synopsis,
        pageCount: pageCount || 1,
        storyDay,
        prepMinutes,
        shootMinutes,
        intExt,
        timeOfDay,
        location,
        order: count,
      },
      include: { elements: true },
    })
    return NextResponse.json({ data: scene }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}