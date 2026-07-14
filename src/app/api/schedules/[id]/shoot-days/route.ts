import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const shootDays = await prisma.shootDay.findMany({
      where: { scheduleId: params.id },
      orderBy: { dayNumber: 'asc' },
      include: {
        strips: {
          orderBy: { order: 'asc' },
          include: { scene: true },
        },
      },
    })
    return NextResponse.json({ data: shootDays })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { dayNumber, date, generalCallTime, location, notes, isWrapDay } = await req.json()
    const shootDay = await prisma.shootDay.create({
      data: {
        scheduleId: params.id,
        dayNumber: dayNumber || 1,
        date: date ? new Date(date) : undefined,
        generalCallTime,
        location,
        notes,
        isWrapDay: isWrapDay || false,
      },
      include: { strips: { include: { scene: true } } },
    })
    return NextResponse.json({ data: shootDay }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}