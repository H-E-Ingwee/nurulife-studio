import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const shotLists = await prisma.shotList.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { shots: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json({ data: shotLists })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { projectId, title, sceneRef, notes, shots } = await req.json()
    if (!projectId || !title) return NextResponse.json({ error: 'projectId and title required' }, { status: 400 })
    const shotList = await prisma.shotList.create({
      data: {
        projectId, title, sceneRef, notes,
        shots: shots ? {
          create: shots.map((s: any, i: number) => ({
            shotNumber:  s.shotNumber  || String(i + 1),
            description: s.description || '',
            shotSize:    s.shotSize,
            angle:       s.angle,
            lens:        s.lens,
            movement:    s.movement,
            duration:    s.duration,
            notes:       s.notes,
            aiGenerated: s.aiGenerated || false,
            order:       i,
          })),
        } : undefined,
      },
      include: { shots: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json({ data: shotList }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}