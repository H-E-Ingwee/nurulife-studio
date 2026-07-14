import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const schedules = await prisma.schedule.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { shootDays: true } } },
    })
    return NextResponse.json({ data: schedules })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { projectId, name } = await req.json()
    if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    // Deactivate other schedules for this project
    await prisma.schedule.updateMany({ where: { projectId }, data: { isActive: false } })
    const schedule = await prisma.schedule.create({
      data: { projectId, name: name || 'Version A', isActive: true },
    })
    return NextResponse.json({ data: schedule }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}