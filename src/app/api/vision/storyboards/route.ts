import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const storyboards = await prisma.storyboard.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { panels: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json({ data: storyboards })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { projectId, title, aspectRatio, notes } = await req.json()
    if (!projectId || !title) return NextResponse.json({ error: 'projectId and title required' }, { status: 400 })
    const storyboard = await prisma.storyboard.create({
      data: { projectId, title, aspectRatio: aspectRatio || '16:9', notes },
      include: { panels: true },
    })
    return NextResponse.json({ data: storyboard }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}