import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; dayId: string; stripId: string } }
) {
  try {
    const body  = await req.json()
    const strip = await prisma.strip.update({
      where: { id: params.stripId },
      data: {
        ...(body.status           && { status: body.status }),
        ...(body.estimatedMinutes !== undefined && { estimatedMinutes: body.estimatedMinutes }),
        ...(body.notes            !== undefined && { notes: body.notes }),
        ...(body.order            !== undefined && { order: body.order }),
      },
      include: { scene: true },
    })
    return NextResponse.json({ data: strip })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; dayId: string; stripId: string } }
) {
  try {
    await prisma.strip.delete({ where: { id: params.stripId } })
    return NextResponse.json({ message: 'Strip removed' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}