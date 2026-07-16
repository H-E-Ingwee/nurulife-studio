import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { id, name, email, role } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const user = await prisma.user.upsert({
      where:  { email },
      update: { name: name || email.split('@')[0], role: role || 'COLLABORATOR' },
      create: {
        id:    id || undefined,
        email,
        name:  name || email.split('@')[0],
        role:  role || 'COLLABORATOR',
      },
    })
    return NextResponse.json({ data: user })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}