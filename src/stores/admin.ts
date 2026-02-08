import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Member, Company, System, MemberStatus } from '@/types'
import api from '@/api/axios'

export const useAdminStore = defineStore('admin', () => {
  // 회원 목록
  const members = ref<Member[]>([])

  // 회사 목록
  const companies = ref<Company[]>([])

  // 시스템 목록
  const systems = ref<System[]>([])

  // 회원 상태별 필터
  const pendingMembers = computed(() => members.value.filter(m => m.status === 'PENDING'))
  const activeMembers = computed(() => members.value.filter(m => m.status === 'ACTIVE'))
  const deactivatedMembers = computed(() => members.value.filter(m => m.status === 'DEACTIVATED'))

  // 임직원 목록 (ITO 담당자 선택용)
  const employeeMembers = computed(() => members.value.filter(m => m.type === 'employee' && m.status === 'ACTIVE'))

  // 협력직 목록 (회사별)
  function getPartnersByCompany(companyId: number) {
    return members.value.filter(m => m.type === 'partner' && m.companyId === companyId && m.status === 'ACTIVE')
  }

  // 회사별 소속 인원 수
  function getMemberCountByCompany(companyId: number) {
    return members.value.filter(m => m.companyId === companyId && m.status === 'ACTIVE').length
  }

  // 회원 관리 액션
  async function fetchMembers() {
    const { data } = await api.get('/admin/members')
    members.value = data.members
  }

  async function changeStatus(memberId: number, newStatus: MemberStatus) {
    await api.post(`/admin/members/${memberId}/status`, { status: newStatus })
    // 로컬 상태도 업데이트
    const member = members.value.find(m => m.id === memberId)
    if (member) {
      member.status = newStatus
    }
  }

  async function resetPassword(memberId: number) {
    await api.post(`/admin/members/${memberId}/reset-password`)
    return true
  }

  // 회사 관리 액션
  async function fetchCompanies() {
    const { data } = await api.get('/admin/companies')
    companies.value = data.companies
  }

  async function createCompany(company: { code: string; name: string; description?: string }) {
    const { data } = await api.post('/admin/companies', company)
    await fetchCompanies()
    return data.id
  }

  async function updateCompany(id: number, updates: Partial<Omit<Company, 'id' | 'createdAt'>>) {
    await api.put(`/admin/companies/${id}`, updates)
    await fetchCompanies()
  }

  async function deleteCompany(id: number) {
    await api.delete(`/admin/companies/${id}`)
    await fetchCompanies()
  }

  // 직원 소속 관리
  async function assignMemberToCompany(memberId: number, companyId: number) {
    const member = members.value.find(m => m.id === memberId)
    if (member) {
      member.companyId = companyId
    }
  }

  async function removeMemberFromCompany(memberId: number) {
    const member = members.value.find(m => m.id === memberId)
    if (member) {
      member.companyId = undefined
      member.isLeader = false
    }
  }

  // 팀 대표 설정
  async function setTeamLeader(memberId: number, companyId: number) {
    await api.post(`/admin/members/${memberId}/set-leader`, { leader: true })
    // 기존 팀 대표 해제
    const currentLeader = members.value.find(m => m.companyId === companyId && m.isLeader)
    if (currentLeader) {
      currentLeader.isLeader = false
    }
    // 새 팀 대표 설정
    const member = members.value.find(m => m.id === memberId)
    if (member) {
      member.isLeader = true
    }
  }

  // 팀 대표 해제
  async function removeTeamLeader(memberId: number) {
    await api.post(`/admin/members/${memberId}/set-leader`, { leader: false })
    const member = members.value.find(m => m.id === memberId)
    if (member) {
      member.isLeader = false
    }
  }

  // 시스템 관리 액션
  async function fetchSystems() {
    const { data } = await api.get('/admin/systems')
    systems.value = data.systems
  }

  async function updateSystemAssignment(
    systemId: number,
    updates: { companyId?: number; ciMemberId?: number; itoMemberIds?: number[] }
  ) {
    await api.put(`/admin/systems/${systemId}/assign`, updates)
    await fetchSystems()
  }

  // 회사명 조회
  function getCompanyName(companyId: number) {
    const company = companies.value.find(c => c.id === companyId)
    return company?.name || '-'
  }

  // 회원명 조회
  function getMemberName(memberId: number) {
    const member = members.value.find(m => m.id === memberId)
    return member?.name || '-'
  }

  return {
    members,
    companies,
    systems,
    pendingMembers,
    activeMembers,
    deactivatedMembers,
    employeeMembers,
    getPartnersByCompany,
    getMemberCountByCompany,
    fetchMembers,
    changeStatus,
    resetPassword,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    assignMemberToCompany,
    removeMemberFromCompany,
    setTeamLeader,
    removeTeamLeader,
    fetchSystems,
    updateSystemAssignment,
    getCompanyName,
    getMemberName
  }
})
