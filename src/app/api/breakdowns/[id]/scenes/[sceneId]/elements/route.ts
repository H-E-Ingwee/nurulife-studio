import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string; sceneId: string } }) {
  try {
    const { category, name, notes, aiSuggested, confirmed } = await req.json()
    if (!category || !name) return NextResponse.json({ error: 'category and name required' }, { status: 400 })
    const element = await prisma.sceneElement.create({
      data: {
        sceneId: params.sceneId,
        category,
        name,
        notes,
        aiSuggested: aiSuggested || false,
        confirmed: confirmed !== undefined ? confirmed : true,
      },
    })
    return NextResponse.json({ data: element }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(_req: Request, { params }: { params: { id: string; sceneId: string } }) {
  try {
    const elements = await prisma.sceneElement.findMany({
      where: { sceneId: params.sceneId },
    })
    return NextResponse.json({ data: elements })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}