import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const versions = await prisma.scriptVersion.findMany({
      where:   { scriptId: params.id },
      orderBy: { version: 'desc' },
      include: { createdBy: { select: { name: true, email: true } } },
    })
    return NextResponse.json({ data: versions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { content, notes, createdById } = await req.json()
    if (!content) return NextResponse.json({ error: 'content is required' }, { status: 400 })

    // Get current script version number
    const script = await prisma.script.findUnique({ where: { id: params.id } })
    if (!script) return NextResponse.json({ error: 'Script not found' }, { status: 404 })

    const newVersion = script.version + 1

    // Create version record
    const version = await prisma.scriptVersion.create({
      data: {
        scriptId:     params.id,
        version:      newVersion,
        content,
        notes:        notes || `Version ${newVersion}`,
        createdById:  createdById || '',
      },
    })

    // Update script version number
    await prisma.script.update({
      where: { id: params.id },
      data:  { version: newVersion },
    })

    return NextResponse.json({ data: version }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}