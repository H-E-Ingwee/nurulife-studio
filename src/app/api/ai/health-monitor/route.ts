import { NextResponse } from 'next/server'
import { openai, HEALTH_MONITOR_PROMPT } from '@/lib/ai'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json()
    if (!projectId) return NextResponse.json({ error: 'projectId is required' }, { status: 400 })

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks:      { where: { status: { not: 'DONE' } } },
        scripts:    true,
        schedules:  { include: { _count: { select: { shootDays: true } } } },
        callSheets: { orderBy: { date: 'desc' }, take: 3 },
        _count:     { select: { tasks: true, scripts: true, callSheets: true } },
      },
    })

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const projectData = `
Project: ${project.title}
Type: ${project.type}
Status: ${project.status}
Budget: KES ${project.budget || 'Not set'}
Spent: KES ${project.spent || 0}
Start Date: ${project.startDate ? project.startDate.toLocaleDateString() : 'Not set'}
End Date: ${project.endDate ? project.endDate.toLocaleDateString() : 'Not set'}
Scripts: ${project._count.scripts}
Open Tasks: ${project.tasks.length}
Call Sheets: ${project._count.callSheets}
Schedules: ${project.schedules.length}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: HEALTH_MONITOR_PROMPT },
        { role: 'user', content: `Analyze this NuruLife production project:\n\n${projectData}` },
      ],
      temperature: 0.4,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')
    const health = JSON.parse(content)
    return NextResponse.json({ health, project: { title: project.title, status: project.status } })
  } catch (error: any) {
    console.error('Health monitor error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}