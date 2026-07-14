import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const storyboard = await prisma.storyboard.findUnique({
      where: { id: params.id },
      include: { panels: { orderBy: { order: 'asc' } } },
    })
    if (!storyboard) return NextResponse.json({ error: 'Storyboard not found' }, { status: 404 })
    return NextResponse.json({ data: storyboard })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const storyboard = await prisma.storyboard.update({
      where: { id: params.id },
      data: {
        ...(body.title       && { title: body.title }),
        ...(body.aspectRatio && { aspectRatio: body.aspectRatio }),
        ...(body.notes       !== undefined && { notes: body.notes }),
      },
      include: { panels: true },
    })
    return NextResponse.json({ data: storyboard })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.storyboard.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Storyboard deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}