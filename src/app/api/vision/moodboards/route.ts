import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const moodBoards = await prisma.moodBoard.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { items: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json({ data: moodBoards })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { projectId, title, group, description } = await req.json()
    if (!projectId || !title) return NextResponse.json({ error: 'projectId and title required' }, { status: 400 })
    const moodBoard = await prisma.moodBoard.create({
      data: { projectId, title, group, description },
      include: { items: true },
    })
    return NextResponse.json({ data: moodBoard }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}