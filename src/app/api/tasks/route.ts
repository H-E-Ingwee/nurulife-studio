import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const board     = searchParams.get('board')
    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(board     && { board }),
      },
      orderBy: [{ status: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
      include: {
        assignee:  { select: { id: true, name: true, avatar: true } },
        createdBy: { select: { id: true, name: true } },
        checklists: { orderBy: { order: 'asc' } },
        _count: { select: { comments: true } },
      },
    })
    return NextResponse.json({ data: tasks })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const {
      projectId, title, description, assigneeId,
      createdById, dueDate, priority, status, board,
    } = await req.json()
    if (!projectId || !title) {
      return NextResponse.json({ error: 'projectId and title are required' }, { status: 400 })
    }
    const count = await prisma.task.count({ where: { projectId, status: status || 'TODO' } })
    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        assigneeId,
        createdById,
        dueDate:  dueDate ? new Date(dueDate) : undefined,
        priority: priority || 'MEDIUM',
        status:   status   || 'TODO',
        board:    board    || 'Production',
        order:    count,
      },
      include: {
        assignee:  { select: { id: true, name: true, avatar: true } },
        checklists: true,
      },
    })
    return NextResponse.json({ data: task }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}