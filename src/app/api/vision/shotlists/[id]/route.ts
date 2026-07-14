import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const shotList = await prisma.shotList.findUnique({
      where: { id: params.id },
      include: { shots: { orderBy: { order: 'asc' } } },
    })
    if (!shotList) return NextResponse.json({ error: 'Shot list not found' }, { status: 404 })
    return NextResponse.json({ data: shotList })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.shotList.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Shot list deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}