import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const entries = await prisma.callSheetEntry.findMany({
      where: { callSheetId: params.id },
      include: { contact: true },
    })
    return NextResponse.json({ data: entries })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { contactId, callTime, onSetTime, makeupTime, notes } = await req.json()
    if (!contactId || !callTime) {
      return NextResponse.json({ error: 'contactId and callTime are required' }, { status: 400 })
    }
    const entry = await prisma.callSheetEntry.create({
      data: {
        callSheetId: params.id,
        contactId,
        callTime,
        onSetTime,
        makeupTime,
        notes,
        deliveryStatus: 'pending',
      },
      include: { contact: true },
    })
    return NextResponse.json({ data: entry }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { entryId } = await req.json()
    await prisma.callSheetEntry.delete({ where: { id: entryId } })
    return NextResponse.json({ message: 'Entry removed' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}