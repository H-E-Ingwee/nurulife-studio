import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        members: { include: { user: true } },
        _count: { select: { scripts: true, tasks: true, callSheets: true } },
      },
    })
    return NextResponse.json({ data: projects })
  } catch (error: any) {
    console.error('GET /api/projects error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, type, description, logline, startDate, endDate, budget } = body
    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 })
    }
    const project = await prisma.project.create({
      data: {
        title,
        type,
        description,
        logline,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate:   endDate   ? new Date(endDate)   : undefined,
        budget:    budget    ? parseFloat(budget)   : undefined,
      },
    })
    return NextResponse.json({ data: project }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/projects error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}