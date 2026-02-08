/**
 * 팀 현황 API
 *
 * 실제 백엔드 서버와 통신합니다.
 */
import api from '@/api/axios'

export interface TeamData {
  companyId: number
  name: string
  progress: { total: number; target: number; previousWeek: number }
  members: { id: number; name: string; progress: number; isLeader: boolean }[]
  tasks: { id: number; assignee: string; title: string; status: string; progress: number; priority: string }[]
}

export interface FetchTeamProgressResponse {
  allowed: true
  teams: TeamData[]
}

export interface FetchTeamProgressDenied {
  allowed: false
  reason: 'TIME_RESTRICTED'
  nextViewing: { date: string; startTime: string; endTime: string }
  scheduleSummary: string
}

/**
 * 팀 현황 데이터 API
 * - 서버에서 요청자의 역할과 현재 시간을 기반으로 데이터 반환 여부를 결정
 * - 임직원(비관리자)은 열람 시간 외 접근 불가
 */
export async function fetchTeamProgress(): Promise<FetchTeamProgressResponse | FetchTeamProgressDenied> {
  const { data } = await api.get('/team-progress')
  return data
}

/** 현재 서버 스케줄 조회 (관리자 설정 페이지용) */
export async function getServerSchedule() {
  const { data } = await api.get('/admin/settings/team-progress-schedule')
  return data as { dayOfWeek: number; startTime: string; endTime: string }
}

/** 관리자가 스케줄을 변경할 때 호출 */
export async function updateServerSchedule(schedule: { dayOfWeek: number; startTime: string; endTime: string }) {
  await api.put('/admin/settings/team-progress-schedule', schedule)
}
