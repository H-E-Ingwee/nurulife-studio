import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string; dayId: string } }) {
  try {
    const { activeId, overId } = await req.json()
    const strips = await prisma.strip.findMany({
      where: { shootDayId: params.dayId },
      orderBy: { order: 'asc' },
    })
    const activeIndex = strips.findIndex(s => s.id === activeId)
    const overIndex   = strips.findIndex(s => s.id === overId)
    if (activeIndex === -1 || overIndex === -1) {
      return NextResponse.json({ error: 'Strip not found' }, { status: 404 })
    }
    // Reorder
    const reordered = [...strips]
    const [moved] = reordered.splice(activeIndex, 1)
    reordered.splice(overIndex, 0, moved)
    // Update order in DB
    await Promise.all(
      reordered.map((strip, index) =>
        prisma.strip.update({ where: { id: strip.id }, data: { order: index } })
      )
    )
    return NextResponse.json({ message: 'Reordered successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}