import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { shotNumber, description, shotSize, angle, lens, movement, frameRate, duration, notes } = await req.json()
    if (!description) return NextResponse.json({ error: 'description is required' }, { status: 400 })
    const count = await prisma.shot.count({ where: { shotListId: params.id } })
    const shot  = await prisma.shot.create({
      data: {
        shotListId: params.id,
        shotNumber: shotNumber || String(count + 1),
        description,
        shotSize,
        angle,
        lens,
        movement,
        frameRate,
        duration,
        notes,
        order: count,
      },
    })
    return NextResponse.json({ data: shot }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const shots = await prisma.shot.findMany({
      where: { shotListId: params.id },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ data: shots })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}