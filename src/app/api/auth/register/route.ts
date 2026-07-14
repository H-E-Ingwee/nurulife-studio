import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { id, name, email, role } = await req.json()
    if (!id || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, role: role || 'COLLABORATOR' },
      create: { id, email, name, role: role || 'COLLABORATOR' },
    })
    return NextResponse.json({ data: user })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}