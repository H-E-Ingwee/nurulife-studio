import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const scripts = await prisma.script.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { updatedAt: 'desc' },
      include: { lockedBy: true },
    })
    return NextResponse.json({ data: scripts })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { title, type, projectId, notes } = await req.json()
    if (!title || !projectId) {
      return NextResponse.json({ error: 'Title and projectId are required' }, { status: 400 })
    }
    const script = await prisma.script.create({
      data: { title, type: type || 'SCREENPLAY', projectId, notes, content: {} },
    })
    return NextResponse.json({ data: script }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}