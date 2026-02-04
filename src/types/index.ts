// 사용자 타입
export interface User {
  id: number
  name: string
  email: string
  team: string
  role: 'employee' | 'manager' | 'admin'
  avatar?: string
}

// 업무 타입
export interface Task {
  id: number
  title: string
  category: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold'
  progress: number
  dueDate: string
  description?: string
  estimatedHours?: number
}

// 주간보고 타입
export interface WeeklyReport {
  id: number
  userId: number
  weekStart: string
  weekEnd: string
  goals: string
  tasks: Task[]
  issues: string
  nextWeekPlan: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

// 진척도 타입
export interface Progress {
  userId: number
  userName: string
  team: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  progressRate: number
}

// 팀 진척도 타입
export interface TeamProgress {
  teamName: string
  members: Progress[]
  totalProgress: number
  targetProgress: number
  previousWeekProgress: number
}

// 채팅 메시지 타입
export interface ChatMessage {
  id: number
  roomId: number
  senderId: number
  senderName: string
  content: string
  timestamp: string
  isRead: boolean
  attachments?: Attachment[]
}

// 채팅방 타입
export interface ChatRoom {
  id: number
  name: string
  type: 'direct' | 'group'
  participants: User[]
  lastMessage?: ChatMessage
  unreadCount: number
  createdAt: string
}

// 첨부파일 타입
export interface Attachment {
  id: number
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
}
