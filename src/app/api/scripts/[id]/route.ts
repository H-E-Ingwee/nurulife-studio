import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const script = await prisma.script.findUnique({
      where: { id: params.id },
      include: { versions: { orderBy: { version: 'desc' } }, lockedBy: true },
    })
    if (!script) return NextResponse.json({ error: 'Script not found' }, { status: 404 })
    return NextResponse.json({ data: script })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { content, title, revisionColor, notes, isLocked, lockedById } = body
    const script = await prisma.script.update({
      where: { id: params.id },
      data: {
        ...(content       !== undefined && { content }),
        ...(title         && { title }),
        ...(revisionColor !== undefined && { revisionColor }),
        ...(notes         !== undefined && { notes }),
        ...(isLocked      !== undefined && { isLocked }),
        ...(lockedById    !== undefined && { lockedById }),
      },
    })
    return NextResponse.json({ data: script })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.script.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Script deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}