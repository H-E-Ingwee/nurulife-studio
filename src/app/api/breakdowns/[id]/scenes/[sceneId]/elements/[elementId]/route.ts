import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(_req: Request, { params }: { params: { elementId: string } }) {
  try {
    await prisma.sceneElement.delete({ where: { id: params.elementId } })
    return NextResponse.json({ message: 'Element deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { elementId: string } }) {
  try {
    const body = await req.json()
    const element = await prisma.sceneElement.update({
      where: { id: params.elementId },
      data: body,
    })
    return NextResponse.json({ data: element })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}