import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const contact = await prisma.contact.findUnique({ where: { id: params.id } })
    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    return NextResponse.json({ data: contact })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        ...body,
        dayRate: body.dayRate ? parseFloat(body.dayRate) : undefined,
      },
    })
    return NextResponse.json({ data: contact })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.contact.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Contact deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}