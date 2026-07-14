// ─── User Types ───────────────────────────────────────────────────────────────
export type UserRole =
  | 'ADMIN'
  | 'CREATIVE_DIR'
  | 'HEAD_PROD'
  | 'HEAD_CREATIVE'
  | 'HEAD_MEDIA'
  | 'HEAD_COMMS'
  | 'COLLABORATOR'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  bio?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

// ─── Project Types ────────────────────────────────────────────────────────────
export type ProjectType =
  | 'SHORT_FILM'
  | 'FEATURE_FILM'
  | 'STAGE_PRODUCTION'
  | 'PODCAST'
  | 'DOCUMENTARY'
  | 'MUSIC_VIDEO'
  | 'COMMERCIAL'

export type ProjectStatus =
  | 'DEVELOPMENT'
  | 'PRE_PRODUCTION'
  | 'PRODUCTION'
  | 'POST_PRODUCTION'
  | 'DISTRIBUTION'
  | 'ARCHIVED'

export interface Project {
  id: string
  title: string
  type: ProjectType
  status: ProjectStatus
  description?: string
  logline?: string
  startDate?: string
  endDate?: string
  budget?: number
  spent?: number
  coverImage?: string
  createdAt: string
  updatedAt: string
  members?: ProjectMember[]
  _count?: {
    scripts: number
    tasks: number
    callSheets: number
  }
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  role?: string
  joinedAt: string
  user?: User
}

// ─── Script Types ─────────────────────────────────────────────────────────────
export type ScriptType = 'SCREENPLAY' | 'AV_SCRIPT' | 'DOCUMENT' | 'TEMPLATE'

export interface Script {
  id: string
  projectId: string
  title: string
  type: ScriptType
  content: any
  version: number
  revisionColor?: string
  isLocked: boolean
  lockedById?: string
  notes?: string
  createdAt: string
  updatedAt: string
  versions?: ScriptVersion[]
  lockedBy?: User
}

export interface ScriptVersion {
  id: string
  scriptId: string
  version: number
  content: any
  revisionColor?: string
  notes?: string
  createdAt: string
  createdById: string
  createdBy?: User
}

// ─── Breakdown Types ──────────────────────────────────────────────────────────
export type ElementCategory =
  | 'CAST'
  | 'EXTRAS'
  | 'PROPS'
  | 'SET_DRESSING'
  | 'WARDROBE'
  | 'MAKEUP'
  | 'VFX'
  | 'SOUND'
  | 'VEHICLES'
  | 'ANIMALS'
  | 'SPECIAL_EQUIPMENT'

export interface Breakdown {
  id: string
  projectId: string
  scriptId: string
  createdAt: string
  updatedAt: string
  scenes?: Scene[]
}

export interface Scene {
  id: string
  breakdownId: string
  sceneNumber: string
  heading: string
  synopsis?: string
  pageCount: number
  storyDay?: number
  prepMinutes?: number
  shootMinutes?: number
  intExt?: string
  timeOfDay?: string
  location?: string
  order: number
  elements?: SceneElement[]
}

export interface SceneElement {
  id: string
  sceneId: string
  category: ElementCategory
  name: string
  notes?: string
  aiSuggested: boolean
  confirmed: boolean
}

// ─── Schedule Types ───────────────────────────────────────────────────────────
export type StripStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED'

export interface Schedule {
  id: string
  projectId: string
  name: string
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt: string
  shootDays?: ShootDay[]
}

export interface ShootDay {
  id: string
  scheduleId: string
  dayNumber: number
  date?: string
  generalCallTime?: string
  location?: string
  notes?: string
  isWrapDay: boolean
  strips?: Strip[]
}

export interface Strip {
  id: string
  shootDayId: string
  sceneId: string
  order: number
  status: StripStatus
  estimatedMinutes?: number
  notes?: string
  scene?: Scene
}

// ─── Vision Room Types ────────────────────────────────────────────────────────
export interface MoodBoard {
  id: string
  projectId: string
  title: string
  group?: string
  description?: string
  shareToken?: string
  createdAt: string
  updatedAt: string
  items?: MoodBoardItem[]
}

export interface MoodBoardItem {
  id: string
  moodBoardId: string
  imageUrl: string
  caption?: string
  aiGenerated: boolean
  order: number
  width?: number
  height?: number
}

export interface ShotList {
  id: string
  projectId: string
  title: string
  sceneRef?: string
  notes?: string
  createdAt: string
  updatedAt: string
  shots?: Shot[]
}

export interface Shot {
  id: string
  shotListId: string
  shotNumber: string
  description: string
  shotSize?: string
  angle?: string
  lens?: string
  movement?: string
  frameRate?: string
  duration?: string
  notes?: string
  imageUrl?: string
  aiGenerated: boolean
  order: number
}

export interface Storyboard {
  id: string
  projectId: string
  title: string
  aspectRatio: string
  notes?: string
  shareToken?: string
  createdAt: string
  updatedAt: string
  panels?: StoryboardPanel[]
}

export interface StoryboardPanel {
  id: string
  storyboardId: string
  panelNumber: number
  imageUrl?: string
  description?: string
  audioNote?: string
  cameraNote?: string
  aiGenerated: boolean
  order: number
}

// ─── Call Room Types ──────────────────────────────────────────────────────────
export interface Contact {
  id: string
  name: string
  role: string
  department?: string
  email?: string
  phone?: string
  whatsapp?: string
  dayRate?: number
  currency: string
  emergencyName?: string
  emergencyPhone?: string
  dietary?: string
  transport?: string
  tshirtSize?: string
  notes?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CallSheet {
  id: string
  projectId: string
  shootDayId?: string
  dayNumber: number
  date: string
  generalCallTime: string
  location: string
  locationAddress?: string
  locationGps?: string
  nearestHospital?: string
  parking?: string
  weather?: string
  advanceSchedule?: string
  prayerFocus?: PrayerFocus
  status: 'DRAFT' | 'SENT' | 'CONFIRMED'
  sentAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
  entries?: CallSheetEntry[]
}

export interface CallSheetEntry {
  id: string
  callSheetId: string
  contactId: string
  callTime: string
  onSetTime?: string
  makeupTime?: string
  notes?: string
  deliveryStatus?: string
  openedAt?: string
  contact?: Contact
}

export interface PrayerFocus {
  scripture: string
  reference: string
  prayer: string
  theme?: string
  affirmation?: string
}

// ─── Command Room Types ───────────────────────────────────────────────────────
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  assigneeId?: string
  createdById?: string
  dueDate?: string
  priority: Priority
  status: TaskStatus
  board?: string
  order: number
  attachments: string[]
  createdAt: string
  updatedAt: string
  assignee?: User
  createdBy?: User
  checklists?: Checklist[]
  comments?: Comment[]
}

export interface Checklist {
  id: string
  taskId: string
  title: string
  completed: boolean
  order: number
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  user?: User
}

export interface Calendar {
  id: string
  projectId: string
  name: string
  group?: string
  color?: string
  createdAt: string
  events?: CalendarEvent[]
}

export interface CalendarEvent {
  id: string
  calendarId: string
  title: string
  description?: string
  startDate: string
  endDate: string
  allDay: boolean
  color?: string
  dependsOn?: string
  createdAt: string
}

// ─── AI Response Types ────────────────────────────────────────────────────────
export interface BiblicalAnalysis {
  redemptionArc: {
    present: boolean
    strength: 'weak' | 'moderate' | 'strong'
    scenes: string[]
    suggestion: string
  }
  biblicalThemes: string[]
  moralComplexity: 'low' | 'medium' | 'high'
  scriptureParallels: Array<{
    scene: string
    reference: string
    relevance: string
  }>
  faithDepthScore: number
  characterArcs: string[]
  recommendations: string[]
  overallAssessment: string
}

export interface AutoTaggerResult {
  cast: string[]
  extras: string[]
  props: string[]
  setDressing: string[]
  wardrobe: string[]
  makeup: string[]
  vfx: string[]
  sound: string[]
  vehicles: string[]
  animals: string[]
  specialEquipment: string[]
  estimatedShootMinutes: number
  complexity: 'simple' | 'moderate' | 'complex'
  notes: string
}

export interface ProjectHealth {
  overallHealth: 'on_track' | 'at_risk' | 'critical'
  healthScore: number
  alerts: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    message: string
    recommendation: string
  }>
  positives: string[]
  nextMilestone: string
  daysToNextMilestone: number
  weeklyFocus: string
  prayerPoint: string
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}