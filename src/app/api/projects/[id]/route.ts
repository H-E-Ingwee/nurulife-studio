import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        members: { include: { user: true } },
        scripts: { orderBy: { updatedAt: 'desc' } },
        schedules: true,
        _count: { select: { scripts: true, tasks: true, callSheets: true, breakdowns: true } },
      },
    })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    return NextResponse.json({ data: project })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { title, type, status, description, logline, startDate, endDate, budget, spent } = body
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(title       && { title }),
        ...(type        && { type }),
        ...(status      && { status }),
        ...(description !== undefined && { description }),
        ...(logline     !== undefined && { logline }),
        ...(startDate   && { startDate: new Date(startDate) }),
        ...(endDate     && { endDate:   new Date(endDate) }),
        ...(budget      !== undefined && { budget: parseFloat(budget) }),
        ...(spent       !== undefined && { spent:  parseFloat(spent) }),
      },
    })
    return NextResponse.json({ data: project })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.project.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Project deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}