// 사용자 타입
export type MemberType = 'employee' | 'partner' // 임직원 | 협력직
export type MemberRole = 'admin' | 'default' // 관리자 | 일반
export type MemberStatus = 'PENDING' | 'ACTIVE' | 'DEACTIVATED' // 승인대기 | 활성 | 비활성

export interface Member {
  id: number
  knoxId: string
  name: string
  type: MemberType
  role: MemberRole
  companyId?: number // 소속 회사 ID (협력직인 경우)
  isLeader?: boolean // 팀장 여부
  systemIds?: number[] // 담당 시스템 ID 목록
  avatar?: string
  status?: MemberStatus // 회원 상태
  createdAt?: string // 가입 일시
}

// 회사(협력사) 타입
export interface Company {
  id: number
  code: string // 회사 고유 코드
  name: string
  description?: string
  createdAt: string
}

// 담당 시스템 타입
export interface System {
  id: number
  systemCode: string // 시스템 ID (예: S1801)
  name: string
  companyId: number // 담당 협력사 ID
  description?: string
  ciMemberId?: number // CI 담당자 (협력직)
  itoMemberIds?: number[] // ITO 담당자들 (임직원)
}

// 회원가입 요청 타입
export interface SignupRequest {
  knoxId: string
  name: string
  password: string
  type: MemberType
  companyId?: number // 협력직인 경우 소속 회사
}

// 로그인 요청 타입
export interface LoginRequest {
  knoxId: string
  password: string
}

// 하위 호환성을 위한 User 타입 별칭 (추후 제거)
export type User = Member

// 업무 타입
export interface Task {
  id: number
  systemId?: number // 담당 시스템
  title: string
  category: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold'
  progress: number
  requester?: string // 요청자
  requestDate?: string // 요청일
  dueDate: string // 납기일
  description?: string
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
