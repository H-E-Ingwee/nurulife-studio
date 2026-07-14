import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const board = await prisma.moodBoard.findUnique({
      where: { id: params.id },
      include: { items: { orderBy: { order: 'asc' } } },
    })
    if (!board) return NextResponse.json({ error: 'Mood board not found' }, { status: 404 })
    return NextResponse.json({ data: board })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const board = await prisma.moodBoard.update({
      where: { id: params.id },
      data: {
        ...(body.title       && { title: body.title }),
        ...(body.group       !== undefined && { group: body.group }),
        ...(body.description !== undefined && { description: body.description }),
      },
      include: { items: true },
    })
    return NextResponse.json({ data: board })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.moodBoard.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Mood board deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}