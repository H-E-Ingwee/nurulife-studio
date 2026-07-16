import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; dayId: string } }
) {
  try {
    const body = await req.json()
    const shootDay = await prisma.shootDay.update({
      where: { id: params.dayId },
      data: {
        ...(body.date            && { date: new Date(body.date) }),
        ...(body.generalCallTime !== undefined && { generalCallTime: body.generalCallTime }),
        ...(body.location        !== undefined && { location: body.location }),
        ...(body.notes           !== undefined && { notes: body.notes }),
        ...(body.isWrapDay       !== undefined && { isWrapDay: body.isWrapDay }),
      },
      include: { strips: { orderBy: { order: 'asc' }, include: { scene: true } } },
    })
    return NextResponse.json({ data: shootDay })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; dayId: string } }
) {
  try {
    await prisma.shootDay.delete({ where: { id: params.dayId } })
    return NextResponse.json({ message: 'Shoot day deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}