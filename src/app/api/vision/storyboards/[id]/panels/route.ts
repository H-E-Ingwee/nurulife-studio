import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { uploadImage } from '@/lib/cloudinary'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const panels = await prisma.storyboardPanel.findMany({
      where: { storyboardId: params.id },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ data: panels })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let imageUrl    = ''
    let description = ''
    let audioNote   = ''
    let cameraNote  = ''
    let aiGenerated = false

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      description = (formData.get('description') as string) || ''
      audioNote   = (formData.get('audioNote')   as string) || ''
      cameraNote  = (formData.get('cameraNote')  as string) || ''
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await uploadImage(buffer, 'nurulife-studio/storyboards')
        imageUrl = result.url
      }
    } else {
      const body = await req.json()
      imageUrl    = body.imageUrl    || ''
      description = body.description || ''
      audioNote   = body.audioNote   || ''
      cameraNote  = body.cameraNote  || ''
      aiGenerated = body.aiGenerated || false
    }

    const count = await prisma.storyboardPanel.count({ where: { storyboardId: params.id } })
    const panel = await prisma.storyboardPanel.create({
      data: {
        storyboardId: params.id,
        panelNumber:  count + 1,
        imageUrl:     imageUrl || undefined,
        description,
        audioNote,
        cameraNote,
        aiGenerated,
        order: count,
      },
    })
    return NextResponse.json({ data: panel }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}