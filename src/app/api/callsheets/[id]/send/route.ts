import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendCallSheet } from '@/lib/email'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const callSheet = await prisma.callSheet.findUnique({
      where: { id: params.id },
      include: {
        entries: { include: { contact: true } },
        project: true,
      },
    })
    if (!callSheet) return NextResponse.json({ error: 'Call sheet not found' }, { status: 404 })

    // Collect recipient emails
    const recipients = callSheet.entries
      .filter(e => e.contact.email)
      .map(e => e.contact.email!)

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients with email addresses found' }, { status: 400 })
    }

    // Build email data
    const emailData = {
      projectName:    callSheet.project.title,
      dayNumber:      callSheet.dayNumber,
      date:           callSheet.date.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      generalCallTime: callSheet.generalCallTime,
      location:       callSheet.location,
      weather:        callSheet.weather || undefined,
      nearestHospital: callSheet.nearestHospital || undefined,
      parking:        callSheet.parking || undefined,
      prayerFocus:    callSheet.prayerFocus as any || undefined,
      advanceSchedule: callSheet.advanceSchedule || undefined,
      entries: callSheet.entries.map(e => ({
        contactName: e.contact.name,
        role:        e.contact.role,
        callTime:    e.callTime,
        onSetTime:   e.onSetTime || undefined,
        makeupTime:  e.makeupTime || undefined,
        notes:       e.notes || undefined,
      })),
    }

    const result = await sendCallSheet(recipients, emailData)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Update call sheet status
    await prisma.callSheet.update({
      where: { id: params.id },
      data: { status: 'SENT', sentAt: new Date() },
    })

    // Update delivery status for all entries
    await prisma.callSheetEntry.updateMany({
      where: { callSheetId: params.id },
      data: { deliveryStatus: 'sent' },
    })

    return NextResponse.json({ message: `Call sheet sent to ${recipients.length} recipients` })
  } catch (error: any) {
    console.error('Send call sheet error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}