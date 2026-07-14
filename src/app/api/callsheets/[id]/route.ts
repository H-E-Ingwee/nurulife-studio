import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const callSheet = await prisma.callSheet.findUnique({
      where: { id: params.id },
      include: {
        entries: { include: { contact: true } },
        project: true,
        sentBy:  true,
      },
    })
    if (!callSheet) return NextResponse.json({ error: 'Call sheet not found' }, { status: 404 })
    return NextResponse.json({ data: callSheet })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const callSheet = await prisma.callSheet.update({
      where: { id: params.id },
      data: {
        ...(body.generalCallTime && { generalCallTime: body.generalCallTime }),
        ...(body.location        && { location: body.location }),
        ...(body.nearestHospital !== undefined && { nearestHospital: body.nearestHospital }),
        ...(body.parking         !== undefined && { parking: body.parking }),
        ...(body.weather         !== undefined && { weather: body.weather }),
        ...(body.advanceSchedule !== undefined && { advanceSchedule: body.advanceSchedule }),
        ...(body.prayerFocus     !== undefined && { prayerFocus: body.prayerFocus }),
        ...(body.status          && { status: body.status }),
        ...(body.notes           !== undefined && { notes: body.notes }),
      },
      include: { entries: { include: { contact: true } } },
    })
    return NextResponse.json({ data: callSheet })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.callSheet.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Call sheet deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}