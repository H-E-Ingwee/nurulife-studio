import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎬 Seeding NuruLife Production Studio...')

  // ── 1. Create Team Users ──────────────────────────────────────────────────
  console.log('👥 Creating team members...')

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'brian@nurulifeproductions.com' },
      update: {},
      create: {
        email: 'brian@nurulifeproductions.com',
        name:  'Brian Ingwee',
        role:  'ADMIN',
        bio:   'CEO & Co-Founder. Visionary leader, scriptwriter, director, StoryAI developer.',
        phone: '+254 700 000 001',
      },
    }),
    prisma.user.upsert({
      where: { email: 'grace@nurulifeproductions.com' },
      update: {},
      create: {
        email: 'grace@nurulifeproductions.com',
        name:  'Grace Kanyiri',
        role:  'CREATIVE_DIR',
        bio:   'CCO & Co-Founder. Actor, creative writer, advocate, discipleship champion.',
        phone: '+254 700 000 002',
      },
    }),
    prisma.user.upsert({
      where: { email: 'esther@nurulifeproductions.com' },
      update: {},
      create: {
        email: 'esther@nurulifeproductions.com',
        name:  'Esther Karimeri',
        role:  'HEAD_PROD',
        bio:   'Head of Productions. Production manager who turns creative vision into reality.',
        phone: '+254 700 000 003',
      },
    }),
    prisma.user.upsert({
      where: { email: 'sandra@nurulifeproductions.com' },
      update: {},
      create: {
        email: 'sandra@nurulifeproductions.com',
        name:  'Sandra Mutanu',
        role:  'HEAD_CREATIVE',
        bio:   'Head of Creative Arts & Talent. Visual artist, poet, orator, designer.',
        phone: '+254 700 000 004',
      },
    }),
    prisma.user.upsert({
      where: { email: 'john@nurulifeproductions.com' },
      update: {},
      create: {
        email: 'john@nurulifeproductions.com',
        name:  'John Mwadown',
        role:  'HEAD_MEDIA',
        bio:   'Head of Media & Technology. Cinematographer, graphic designer, journalist.',
        phone: '+254 700 000 005',
      },
    }),
    prisma.user.upsert({
      where: { email: 'david@nurulifeproductions.com' },
      update: {},
      create: {
        email: 'david@nurulifeproductions.com',
        name:  'David Testimony',
        role:  'HEAD_COMMS',
        bio:   'Head of Communications & Publishing. Manuscript writer, Swahili specialist.',
        phone: '+254 700 000 006',
      },
    }),
  ])

  console.log(`✅ ${users.length} team members created`)

  // ── 2. Create "Beneath the Silence" Project ───────────────────────────────
  console.log('🎬 Creating Beneath the Silence project...')

  const project = await prisma.project.upsert({
    where: { id: 'beneath-the-silence-2026' },
    update: {},
    create: {
      id:          'beneath-the-silence-2026',
      title:       'Beneath the Silence',
      type:        'SHORT_FILM',
      status:      'PRE_PRODUCTION',
      logline:     'A gifted but approval-hungry university worship leader, raised in the shadow of an emotionally absent father, falls for a charismatic campus powerbroker whose love is really control. When a secret pregnancy leads to a coerced abortion and blackmail, she must find the courage to break her silence — discovering that the grace she has been singing about is real, and it is waiting for her in the dark.',
      description: 'Genre: Drama / Faith / Social Issue\nFormat: Feature Film — Estimated Runtime: 90–110 minutes\nSetting: Murang\'a University of Technology, Kenya.\nScripture: Psalm 51:10 — "Create in me a clean heart, O God, and renew a right spirit within me."',
      startDate:   new Date('2026-11-01'),
      endDate:     new Date('2027-03-31'),
      budget:      300000,
      spent:       45000,
    },
  })

  // Add team members to project
  for (const user of users) {
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: project.id, userId: user.id } },
      update: {},
      create: { projectId: project.id, userId: user.id, role: user.role },
    })
  }

  // ── 3. Create Script ──────────────────────────────────────────────────────
  console.log('📝 Creating script...')

  const script = await prisma.script.upsert({
    where: { id: 'bts-screenplay-v1' },
    update: {},
    create: {
      id:        'bts-screenplay-v1',
      projectId: project.id,
      title:     'Beneath the Silence — Full Production Screenplay',
      type:      'SCREENPLAY',
      version:   1,
      revisionColor: '#FFFFFF',
      notes:     'Feature Film — Full Production Screenplay. July 2026. Written by NuruLife Productions.',
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'NURULIFE PRODUCTIONS' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'BENEATH THE SILENCE' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Written by NuruLife Productions' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'LOGLINE: A gifted but approval-hungry university worship leader falls for a charismatic campus powerbroker whose love is really control...' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'ACT ONE: THE PERFORMANCE' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'INT. UNIVERSITY CHAPEL / AUDITORIUM — NIGHT' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'OPENING SEQUENCE: We begin in darkness. Not dramatic darkness — the specific, warm darkness of a room full of people who have closed their eyes. Then sound. A congregation singing. Building. We hear it before we see it. Then a single spotlight cuts through.' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'MALAIKA (18) stands in the light. She is mid-song. Eyes closed. One hand raised. Face tilted upward. She looks like the picture of faith — the kind of image that ends up on church posters. Her voice is extraordinary.' }] },
        ],
      },
    },
  })

  // ── 4. Create Breakdown with Scenes ──────────────────────────────────────
  console.log('🎭 Creating scene breakdown...')

  const breakdown = await prisma.breakdown.upsert({
    where: { id: 'bts-breakdown-v1' },
    update: {},
    create: {
      id:        'bts-breakdown-v1',
      projectId: project.id,
      scriptId:  script.id,
    },
  })

  const scenes = [
    { num: '1',  heading: 'INT. UNIVERSITY CHAPEL / AUDITORIUM — NIGHT',         synopsis: 'Opening sequence. Malaika performs worship. Jay watches from the back. Their eyes meet.',                                                    intExt: 'INT', time: 'NIGHT',  loc: 'University Chapel',          pages: 3.0 },
    { num: '2',  heading: 'INT. MALAIKA\'S CHILDHOOD HOME — LIVING ROOM — EVENING', synopsis: 'FLASHBACK: Ten years earlier. Young Malaika tries to get her father\'s attention. He watches TV. She sings for him.',                    intExt: 'INT', time: 'EVENING', loc: 'Childhood Home',             pages: 2.5 },
    { num: '3',  heading: 'EXT. MUT ADMINISTRATION BLOCK — DAY',                  synopsis: 'Registration week chaos. Malaika is lost and overwhelmed. Jay approaches and helps her navigate the system.',                               intExt: 'EXT', time: 'DAY',    loc: 'MUT Administration Block',   pages: 3.5 },
    { num: '4',  heading: 'INT. UNIVERSITY HOSTEL ROOM — DAY',                    synopsis: 'Malaika meets her roommates Sharon and Maggy. She puts up her "Create in Me a Clean Heart" poster. Gets Jay\'s text.',                      intExt: 'INT', time: 'DAY',    loc: 'University Hostel',          pages: 2.0 },
    { num: '5',  heading: 'EXT. MUT CAMPUS GROUNDS — DAY',                        synopsis: 'Malaika and Jay\'s first real conversation. He is charming, attentive. She is drawn to him.',                                              intExt: 'EXT', time: 'DAY',    loc: 'MUT Campus Grounds',         pages: 2.5 },
    { num: '6',  heading: 'INT. KIBANDASKI — EVENING',                            synopsis: 'Jay\'s domain. Malaika sees his power and influence. Nekesa watches with quiet jealousy.',                                                   intExt: 'INT', time: 'EVENING', loc: 'Kibandaski',                 pages: 2.0 },
    { num: '7',  heading: 'INT. UNIVERSITY CHAPEL — REHEARSAL — DAY',             synopsis: 'Worship team rehearsal. Malaika leads. Mercy, Daniel, Tim support. Jay watches from doorway.',                                              intExt: 'INT', time: 'DAY',    loc: 'University Chapel',          pages: 1.5 },
    { num: '8',  heading: 'EXT. MUT CAMPUS — EVENING',                            synopsis: 'Jay and Malaika walk together. He is attentive, asks about her father. She opens up more than she intended.',                               intExt: 'EXT', time: 'EVENING', loc: 'MUT Campus',                 pages: 2.0 },
    { num: '9',  heading: 'INT. HOSTEL ROOM — NIGHT',                             synopsis: 'Sharon warns Malaika about Jay. Maggy is romantic about it. Malaika is caught between them.',                                               intExt: 'INT', time: 'NIGHT',  loc: 'University Hostel',          pages: 1.5 },
    { num: '10', heading: 'INT. UNIVERSITY CLINIC — DAY',                         synopsis: 'Malaika discovers she is pregnant. The nurse asks the right question. Malaika is alone with the truth.',                                    intExt: 'INT', time: 'DAY',    loc: 'University Clinic',          pages: 2.5 },
    { num: '11', heading: 'INT. JAY\'S ROOM — NIGHT',                             synopsis: 'Malaika tells Jay. His reaction is controlled, strategic. He suggests the abortion. She is confused and afraid.',                           intExt: 'INT', time: 'NIGHT',  loc: 'Jay\'s Room',                pages: 3.0 },
    { num: '12', heading: 'EXT. NAIROBI STREET — DAY',                            synopsis: 'Malaika goes to the clinic alone. The weight of the decision. She cannot go through with it.',                                              intExt: 'EXT', time: 'DAY',    loc: 'Nairobi Street',             pages: 2.0 },
    { num: '13', heading: 'INT. NURU\'S ROOM — NIGHT',                            synopsis: 'Malaika breaks down with Nuru. Nuru sits in the dark with her. "I will not be silent." The turning point.',                                intExt: 'INT', time: 'NIGHT',  loc: 'Nuru\'s Room',               pages: 3.5 },
    { num: '14', heading: 'INT. UNIVERSITY CHAPEL — NIGHT',                       synopsis: 'Malaika returns to the stage. She sings differently now. Not for approval. For truth. The congregation feels it.',                          intExt: 'INT', time: 'NIGHT',  loc: 'University Chapel',          pages: 2.5 },
    { num: '15', heading: 'EXT. MUT CAMPUS — DAWN',                               synopsis: 'FINAL SCENE. Malaika walks across campus at dawn. She is not the same. The silence beneath has been broken. Grace was waiting.',           intExt: 'EXT', time: 'DAWN',   loc: 'MUT Campus',                 pages: 2.0 },
  ]

  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i]
    await prisma.scene.upsert({
      where: { id: `bts-scene-${s.num}` },
      update: {},
      create: {
        id:          `bts-scene-${s.num}`,
        breakdownId: breakdown.id,
        sceneNumber: s.num,
        heading:     s.heading,
        synopsis:    s.synopsis,
        pageCount:   s.pages,
        intExt:      s.intExt,
        timeOfDay:   s.time,
        location:    s.loc,
        order:       i,
      },
    })
  }

  // Add elements to key scenes
  await prisma.sceneElement.createMany({
    skipDuplicates: true,
    data: [
      // Scene 1 — Chapel Opening
      { sceneId: 'bts-scene-1', category: 'CAST',        name: 'Malaika',          confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-1', category: 'CAST',        name: 'Jay',              confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-1', category: 'EXTRAS',      name: 'Congregation',     confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-1', category: 'PROPS',       name: 'Microphone',       confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-1', category: 'PROPS',       name: 'Camera (Jay)',     confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-1', category: 'SET_DRESSING',name: 'Church pews',      confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-1', category: 'SET_DRESSING',name: 'Spotlight rig',    confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-1', category: 'SOUND',       name: 'Live worship music',confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-1', category: 'WARDROBE',    name: 'Malaika worship dress', confirmed: true, aiSuggested: false },
      // Scene 3 — Registration
      { sceneId: 'bts-scene-3', category: 'CAST',        name: 'Malaika',          confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-3', category: 'CAST',        name: 'Jay',              confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-3', category: 'CAST',        name: 'Guard',            confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-3', category: 'PROPS',       name: 'Admission documents', confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-3', category: 'PROPS',       name: 'Water bottle',     confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-3', category: 'EXTRAS',      name: 'Registration queue students', confirmed: true, aiSuggested: false },
      // Scene 10 — Clinic
      { sceneId: 'bts-scene-10', category: 'CAST',       name: 'Malaika',          confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-10', category: 'CAST',       name: 'Nurse',            confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-10', category: 'SET_DRESSING',name: 'Clinic examination room', confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-10', category: 'PROPS',      name: 'Pregnancy test',   confirmed: true, aiSuggested: false },
      { sceneId: 'bts-scene-10', category: 'MAKEUP',     name: 'Tear effect makeup', confirmed: true, aiSuggested: false },
    ],
  })

  console.log(`✅ ${scenes.length} scenes created with elements`)

  // ── 5. Create Schedule ────────────────────────────────────────────────────
  console.log('📅 Creating shooting schedule...')

  const schedule = await prisma.schedule.upsert({
    where: { id: 'bts-schedule-v1' },
    update: {},
    create: {
      id:        'bts-schedule-v1',
      projectId: project.id,
      name:      'Version A — November 2026',
      isActive:  true,
    },
  })

  const shootDays = [
    { day: 1, date: new Date('2026-11-02'), call: '06:00', loc: 'MUT University Chapel',        notes: 'Opening sequence + final chapel scene. Two chapel scenes in one day.' },
    { day: 2, date: new Date('2026-11-03'), call: '07:00', loc: 'MUT Administration Block',     notes: 'Registration week exterior scenes. Large crowd needed.' },
    { day: 3, date: new Date('2026-11-05'), call: '07:30', loc: 'MUT University Hostel',        notes: 'Hostel room scenes. Malaika, Sharon, Maggy.' },
    { day: 4, date: new Date('2026-11-06'), call: '06:30', loc: 'MUT Campus Grounds',           notes: 'Campus exterior scenes. Jay and Malaika walks.' },
    { day: 5, date: new Date('2026-11-09'), call: '08:00', loc: 'Kibandaski Location',          notes: 'Jay\'s domain. Interior. Nekesa scenes.' },
    { day: 6, date: new Date('2026-11-10'), call: '06:00', loc: 'University Clinic',            notes: 'Clinic scene. Sensitive. Small crew only.' },
    { day: 7, date: new Date('2026-11-12'), call: '07:00', loc: 'Nuru\'s Room / Hostel',        notes: 'Breakdown scene. Malaika and Nuru. Emotional day.' },
    { day: 8, date: new Date('2026-11-13'), call: '05:30', loc: 'MUT Campus — Dawn',            notes: 'Final scene. Dawn shoot. Early call. Wrap day.' },
  ]

  for (const d of shootDays) {
    await prisma.shootDay.upsert({
      where: { id: `bts-day-${d.day}` },
      update: {},
      create: {
        id:              `bts-day-${d.day}`,
        scheduleId:      schedule.id,
        dayNumber:       d.day,
        date:            d.date,
        generalCallTime: d.call,
        location:        d.loc,
        notes:           d.notes,
        isWrapDay:       d.day === 8,
      },
    })
  }

  console.log(`✅ ${shootDays.length} shoot days created`)

  // ── 6. Create Contacts ────────────────────────────────────────────────────
  console.log('👤 Creating cast & crew contacts...')

  const contacts = [
    { name: 'Grace Kanyiri',   role: 'Lead Actor — Malaika',    dept: 'Cast',      email: 'grace@nurulifeproductions.com', phone: '+254 700 000 002', rate: 3000 },
    { name: 'Brian Ingwee',    role: 'Director',                 dept: 'Direction', email: 'brian@nurulifeproductions.com', phone: '+254 700 000 001', rate: 0 },
    { name: 'John Mwadown',    role: 'Director of Photography',  dept: 'Camera',    email: 'john@nurulifeproductions.com',  phone: '+254 700 000 005', rate: 5000 },
    { name: 'Esther Karimeri', role: 'Production Manager',       dept: 'Production',email: 'esther@nurulifeproductions.com',phone: '+254 700 000 003', rate: 4000 },
    { name: 'Sandra Mutanu',   role: 'Art Director',             dept: 'Art',       email: 'sandra@nurulifeproductions.com',phone: '+254 700 000 004', rate: 3500 },
    { name: 'David Testimony', role: 'Script Supervisor',        dept: 'Production',email: 'david@nurulifeproductions.com', phone: '+254 700 000 006', rate: 2500 },
    { name: 'Actor — Jay',     role: 'Lead Actor — Jay',         dept: 'Cast',      email: 'jay.actor@email.com',           phone: '+254 700 000 010', rate: 3000 },
    { name: 'Actor — Nuru',    role: 'Supporting Lead — Nuru',   dept: 'Cast',      email: 'nuru.actor@email.com',          phone: '+254 700 000 011', rate: 2500 },
    { name: 'Actor — Sharon',  role: 'Supporting — Sharon',      dept: 'Cast',      email: 'sharon.actor@email.com',        phone: '+254 700 000 012', rate: 2000 },
    { name: 'Actor — Maggy',   role: 'Supporting — Maggy',       dept: 'Cast',      email: 'maggy.actor@email.com',         phone: '+254 700 000 013', rate: 2000 },
    { name: 'Sound Engineer',  role: 'Sound Recordist',          dept: 'Sound',     email: 'sound@email.com',               phone: '+254 700 000 020', rate: 4000 },
    { name: 'Gaffer',          role: 'Lighting Gaffer',          dept: 'Lighting',  email: 'gaffer@email.com',              phone: '+254 700 000 021', rate: 3500 },
    { name: 'Makeup Artist',   role: 'Makeup & Hair',            dept: 'Makeup',    email: 'makeup@email.com',              phone: '+254 700 000 022', rate: 3000 },
  ]

  for (const c of contacts) {
    await prisma.contact.upsert({
      where: { id: `bts-contact-${c.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id:         `bts-contact-${c.name.toLowerCase().replace(/\s+/g, '-')}`,
        name:       c.name,
        role:       c.role,
        department: c.dept,
        email:      c.email,
        phone:      c.phone,
        dayRate:    c.rate,
        currency:   'KES',
      },
    })
  }

  console.log(`✅ ${contacts.length} contacts created`)

  // ── 7. Create Tasks ───────────────────────────────────────────────────────
  console.log('✅ Creating production tasks...')

  const tasks = [
    { title: 'Lock final screenplay — Beneath the Silence',          priority: 'CRITICAL', status: 'IN_PROGRESS', board: 'Production', due: '2026-08-31' },
    { title: 'Complete script breakdown for all 15 scenes',          priority: 'HIGH',     status: 'TODO',        board: 'Production', due: '2026-09-15' },
    { title: 'Scout MUT University Chapel location',                 priority: 'HIGH',     status: 'TODO',        board: 'Production', due: '2026-09-20' },
    { title: 'Scout MUT Administration Block — registration scenes', priority: 'HIGH',     status: 'TODO',        board: 'Production', due: '2026-09-20' },
    { title: 'Cast lead actor for Jay role',                         priority: 'CRITICAL', status: 'IN_PROGRESS', board: 'Production', due: '2026-09-30' },
    { title: 'Cast supporting roles — Nuru, Sharon, Maggy',         priority: 'HIGH',     status: 'TODO',        board: 'Production', due: '2026-10-01' },
    { title: 'Confirm equipment rental — cameras, lighting, sound',  priority: 'HIGH',     status: 'TODO',        board: 'Production', due: '2026-10-15' },
    { title: 'Create shot list for Chapel opening sequence',         priority: 'HIGH',     status: 'TODO',        board: 'Production', due: '2026-10-01' },
    { title: 'Create mood board — visual aesthetic for film',        priority: 'MEDIUM',   status: 'TODO',        board: 'Production', due: '2026-09-15' },
    { title: 'Design call sheet template for Beneath the Silence',   priority: 'MEDIUM',   status: 'TODO',        board: 'Production', due: '2026-10-20' },
    { title: 'Secure MUT Christian Union partnership & permissions', priority: 'HIGH',     status: 'IN_PROGRESS', board: 'Production', due: '2026-09-01' },
    { title: 'Budget breakdown — all departments',                   priority: 'HIGH',     status: 'TODO',        board: 'Production', due: '2026-09-10' },
    { title: 'Wardrobe design — Malaika worship dress',              priority: 'MEDIUM',   status: 'TODO',        board: 'Production', due: '2026-10-15' },
    { title: 'Music composition — worship songs for film',           priority: 'HIGH',     status: 'TODO',        board: 'Production', due: '2026-10-01' },
    { title: 'Create NuruLife StoryAI storyboards for key scenes',   priority: 'MEDIUM',   status: 'TODO',        board: 'Production', due: '2026-10-15' },
    { title: 'Social media teaser campaign — pre-production',        priority: 'LOW',      status: 'TODO',        board: 'Marketing',  due: '2026-11-01' },
    { title: 'Press release — Beneath the Silence announcement',     priority: 'LOW',      status: 'TODO',        board: 'Marketing',  due: '2026-11-01' },
    { title: 'Apply for KFCB content classification',                priority: 'HIGH',     status: 'TODO',        board: 'Production', due: '2026-12-01' },
  ]

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i]
    await prisma.task.upsert({
      where: { id: `bts-task-${i + 1}` },
      update: {},
      create: {
        id:        `bts-task-${i + 1}`,
        projectId: project.id,
        title:     t.title,
        priority:  t.priority as any,
        status:    t.status as any,
        board:     t.board,
        dueDate:   new Date(t.due),
        order:     i,
      },
    })
  }

  console.log(`✅ ${tasks.length} tasks created`)

  // ── 8. Create Calendar ────────────────────────────────────────────────────
  console.log('📆 Creating production calendar...')

  const calendar = await prisma.calendar.upsert({
    where: { id: 'bts-calendar-main' },
    update: {},
    create: {
      id:        'bts-calendar-main',
      projectId: project.id,
      name:      'Beneath the Silence — Production Calendar',
      group:     'Production',
      color:     '#730E20',
    },
  })

  const events = [
    { title: 'Script Lock Deadline',           start: '2026-08-31', end: '2026-08-31', desc: 'Final screenplay must be locked by this date.' },
    { title: 'Pre-Production Begins',          start: '2026-08-01', end: '2026-08-01', desc: 'Official start of pre-production phase.' },
    { title: 'Location Scouting',              start: '2026-09-15', end: '2026-09-20', desc: 'Scout all MUT campus locations.' },
    { title: 'Casting Auditions',              start: '2026-09-25', end: '2026-09-30', desc: 'Auditions for Jay, Nuru, Sharon, Maggy, Nurse.' },
    { title: 'Table Read',                     start: '2026-10-10', end: '2026-10-10', desc: 'Full cast table read of the screenplay.' },
    { title: 'Rehearsals Begin',               start: '2026-10-15', end: '2026-10-31', desc: 'Two weeks of rehearsals with full cast.' },
    { title: 'Equipment Rental Confirmed',     start: '2026-10-20', end: '2026-10-20', desc: 'All camera, lighting, and sound equipment confirmed.' },
    { title: 'Principal Photography Begins',   start: '2026-11-02', end: '2026-11-02', desc: 'Day 1 of principal photography — Chapel scenes.' },
    { title: 'Principal Photography Ends',     start: '2026-11-13', end: '2026-11-13', desc: 'Day 8 — Final scene. Dawn shoot. WRAP.' },
    { title: 'Post-Production Begins',         start: '2026-11-16', end: '2026-11-16', desc: 'Editing, colour grading, sound design begins.' },
    { title: 'Rough Cut Review',               start: '2026-12-15', end: '2026-12-15', desc: 'Internal team review of rough cut.' },
    { title: 'Fine Cut Delivery',              start: '2027-01-15', end: '2027-01-15', desc: 'Fine cut delivered for review.' },
    { title: 'Final Cut & Delivery',           start: '2027-02-15', end: '2027-02-15', desc: 'Final cut locked and delivered.' },
    { title: 'Beneath the Silence Premiere',   start: '2027-03-23', end: '2027-03-23', desc: 'Public premiere — one year after the stage play.' },
  ]

  for (let i = 0; i < events.length; i++) {
    const e = events[i]
    await prisma.calendarEvent.upsert({
      where: { id: `bts-event-${i + 1}` },
      update: {},
      create: {
        id:          `bts-event-${i + 1}`,
        calendarId:  calendar.id,
        title:       e.title,
        description: e.desc,
        startDate:   new Date(e.start),
        endDate:     new Date(e.end),
        allDay:      true,
      },
    })
  }

  console.log(`✅ ${events.length} calendar events created`)

  // ── 9. Create Mood Board ──────────────────────────────────────────────────
  console.log('🎨 Creating mood board...')

  await prisma.moodBoard.upsert({
    where: { id: 'bts-moodboard-main' },
    update: {},
    create: {
      id:          'bts-moodboard-main',
      projectId:   project.id,
      title:       'Beneath the Silence — Visual Aesthetic',
      group:       'Overall Film',
      description: 'Dark, intimate, faith-infused. Warm candlelight contrasted with cold institutional spaces. Kenyan university campus authenticity.',
    },
  })

  // ── 10. Create Shot List ──────────────────────────────────────────────────
  console.log('🎥 Creating shot list...')

  const shotList = await prisma.shotList.upsert({
    where: { id: 'bts-shotlist-scene1' },
    update: {},
    create: {
      id:        'bts-shotlist-scene1',
      projectId: project.id,
      title:     'Scene 1 — Chapel Opening Sequence',
      sceneRef:  'Scene 1',
      notes:     'Opening sequence. Establish Malaika\'s world. Intimate yet grand.',
    },
  })

  const shots = [
    { num: '1A', desc: 'WIDE — Congregation in darkness, eyes closed, hands raised',                    size: 'LS',  angle: 'Eye Level', lens: '24mm',  move: 'Static',   dur: '8s' },
    { num: '1B', desc: 'MEDIUM — Spotlight cuts through darkness onto Malaika',                         size: 'MS',  angle: 'Low Angle', lens: '35mm',  move: 'Slow push', dur: '6s' },
    { num: '1C', desc: 'CLOSE — Malaika\'s face, eyes closed, mid-song, genuine worship',               size: 'CU',  angle: 'Eye Level', lens: '85mm',  move: 'Static',   dur: '5s' },
    { num: '1D', desc: 'ECU — Malaika\'s hands on microphone, trembling slightly',                      size: 'ECU', angle: 'High Angle','lens': '100mm', move: 'Static',  dur: '3s' },
    { num: '1E', desc: 'WIDE — Congregation response, raised hands, woman weeping in third row',        size: 'LS',  angle: 'Eye Level', lens: '24mm',  move: 'Slow pan', dur: '6s' },
    { num: '1F', desc: 'MEDIUM — Jay at back of auditorium, watching, camera around neck',              size: 'MS',  angle: 'Eye Level', lens: '50mm',  move: 'Static',   dur: '4s' },
    { num: '1G', desc: 'CLOSE — Malaika opens eyes, sees Jay. Something changes in her face.',          size: 'CU',  angle: 'Eye Level', lens: '85mm',  move: 'Static',   dur: '3s' },
    { num: '1H', desc: 'POV — Malaika\'s POV of Jay at the back. He is watching her.',                  size: 'MS',  angle: 'Eye Level', lens: '50mm',  move: 'Static',   dur: '2s' },
    { num: '1I', desc: 'CLOSE — Jay\'s face. He is not just passing by. He has been watching.',         size: 'CU',  angle: 'Eye Level', lens: '85mm',  move: 'Static',   dur: '3s' },
    { num: '1J', desc: 'WIDE — Malaika finishes. Congregation erupts. She smiles. Cut to black.',       size: 'LS',  angle: 'High Angle','lens': '24mm', move: 'Crane up', dur: '8s' },
  ]

  for (let i = 0; i < shots.length; i++) {
    const s = shots[i]
    await prisma.shot.upsert({
      where: { id: `bts-shot-${s.num}` },
      update: {},
      create: {
        id:          `bts-shot-${s.num}`,
        shotListId:  shotList.id,
        shotNumber:  s.num,
        description: s.desc,
        shotSize:    s.size,
        angle:       s.angle,
        lens:        s.lens,
        movement:    s.move,
        duration:    s.dur,
        order:       i,
      },
    })
  }

  console.log(`✅ ${shots.length} shots created for Scene 1`)

  // ── 11. Create Storyboard ─────────────────────────────────────────────────
  await prisma.storyboard.upsert({
    where: { id: 'bts-storyboard-main' },
    update: {},
    create: {
      id:          'bts-storyboard-main',
      projectId:   project.id,
      title:       'Beneath the Silence — Key Scenes Storyboard',
      aspectRatio: '16:9',
      notes:       'Visual storyboard for key emotional beats. Dark, intimate aesthetic.',
    },
  })

  console.log('\n🎉 ═══════════════════════════════════════════════════')
  console.log('   NuruLife Production Studio — Seed Complete!')
  console.log('═══════════════════════════════════════════════════')
  console.log(`   ✅ Project: Beneath the Silence`)
  console.log(`   ✅ ${users.length} team members`)
  console.log(`   ✅ 1 screenplay imported`)
  console.log(`   ✅ ${scenes.length} scenes with elements`)
  console.log(`   ✅ ${shootDays.length} shoot days scheduled`)
  console.log(`   ✅ ${contacts.length} cast & crew contacts`)
  console.log(`   ✅ ${tasks.length} production tasks`)
  console.log(`   ✅ ${events.length} calendar events`)
  console.log(`   ✅ Shot list for Scene 1 (${shots.length} shots)`)
  console.log('═══════════════════════════════════════════════════')
  console.log('"Shining Light, Transforming Lives." — Matthew 5:14–16\n')
}

main()
  .catch(e => { console.error('Seed error:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })