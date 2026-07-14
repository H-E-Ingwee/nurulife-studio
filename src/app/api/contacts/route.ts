import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const contacts = await prisma.contact.findMany({
      where: search ? {
        OR: [
          { name:       { contains: search, mode: 'insensitive' } },
          { role:       { contains: search, mode: 'insensitive' } },
          { department: { contains: search, mode: 'insensitive' } },
          { email:      { contains: search, mode: 'insensitive' } },
        ],
      } : undefined,
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: contacts })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      name, role, department, email, phone, whatsapp,
      dayRate, emergencyName, emergencyPhone,
      dietary, transport, tshirtSize, notes,
    } = body
    if (!name || !role) return NextResponse.json({ error: 'Name and role are required' }, { status: 400 })
    const contact = await prisma.contact.create({
      data: {
        name, role, department, email, phone, whatsapp,
        dayRate: dayRate ? parseFloat(dayRate) : undefined,
        emergencyName, emergencyPhone,
        dietary, transport, tshirtSize, notes,
      },
    })
    return NextResponse.json({ data: contact }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}