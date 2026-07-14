import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const breakdowns = await prisma.breakdown.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { scenes: true } } },
    })
    return NextResponse.json({ data: breakdowns })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { projectId, scriptId } = await req.json()
    if (!projectId) return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    // Use first script if none specified
    let resolvedScriptId = scriptId
    if (!resolvedScriptId) {
      const script = await prisma.script.findFirst({ where: { projectId } })
      resolvedScriptId = script?.id
    }
    if (!resolvedScriptId) return NextResponse.json({ error: 'No script found for this project' }, { status: 400 })
    const breakdown = await prisma.breakdown.create({
      data: { projectId, scriptId: resolvedScriptId },
    })
    return NextResponse.json({ data: breakdown }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}