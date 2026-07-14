import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { title, description, assigneeId, dueDate, priority, status, board } = body
    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(title       && { title }),
        ...(description !== undefined && { description }),
        ...(assigneeId  !== undefined && { assigneeId }),
        ...(dueDate     && { dueDate: new Date(dueDate) }),
        ...(priority    && { priority }),
        ...(status      && { status }),
        ...(board       && { board }),
      },
      include: { assignee: true, checklists: true },
    })
    return NextResponse.json({ data: task })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.task.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Task deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}