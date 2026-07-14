import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const callSheets = await prisma.callSheet.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { date: 'desc' },
      include: {
        entries: { include: { contact: true } },
        sentBy: true,
      },
    })
    return NextResponse.json({ data: callSheets })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      projectId, shootDayId, dayNumber, date, generalCallTime,
      location, locationAddress, locationGps, nearestHospital,
      parking, weather, advanceSchedule, prayerFocus, notes,
    } = body
    if (!projectId || !date || !generalCallTime || !location) {
      return NextResponse.json({ error: 'projectId, date, generalCallTime, and location are required' }, { status: 400 })
    }
    const callSheet = await prisma.callSheet.create({
      data: {
        projectId,
        shootDayId,
        dayNumber: dayNumber || 1,
        date: new Date(date),
        generalCallTime,
        location,
        locationAddress,
        locationGps,
        nearestHospital,
        parking,
        weather,
        advanceSchedule,
        prayerFocus: prayerFocus || undefined,
        notes,
        status: 'DRAFT',
      },
      include: { entries: { include: { contact: true } } },
    })
    return NextResponse.json({ data: callSheet }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}