import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Member, Company, System, MemberStatus } from '@/types'

export const useAdminStore = defineStore('admin', () => {
  // 회원 목록
  const members = ref<Member[]>([
    // 임직원 (ITO 담당자) - 관리자 역할
    {
      id: 7,
      knoxId: 'admin',
      name: '관리자',
      type: 'employee',
      role: 'admin',
      systemIds: [1, 2],
      status: 'ACTIVE',
      createdAt: '2024-01-01'
    },
    // 임직원 (ITO 담당자) - 일반 역할
    {
      id: 8,
      knoxId: 'lee.ito',
      name: '이담당',
      type: 'employee',
      role: 'default',
      systemIds: [3],
      status: 'ACTIVE',
      createdAt: '2024-01-05'
    },
    {
      id: 9,
      knoxId: 'kim.ito',
      name: '김담당',
      type: 'employee',
      role: 'default',
      systemIds: [4, 5],
      status: 'ACTIVE',
      createdAt: '2024-01-10'
    },
    {
      id: 10,
      knoxId: 'choi.ito',
      name: '최담당',
      type: 'employee',
      role: 'default',
      systemIds: [6],
      status: 'ACTIVE',
      createdAt: '2024-01-12'
    },
    // 협력직 - 비트맥스
    {
      id: 1,
      knoxId: 'lee.mh',
      name: '이명환',
      type: 'partner',
      role: 'default',
      companyId: 1,
      isLeader: true,
      systemIds: [1],
      status: 'ACTIVE',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      knoxId: 'hong.gd',
      name: '홍길동',
      type: 'partner',
      role: 'default',
      companyId: 1,
      isLeader: false,
      systemIds: [2],
      status: 'ACTIVE',
      createdAt: '2024-01-20'
    },
    // 협력직 - 에코
    {
      id: 3,
      knoxId: 'kwon.hy',
      name: '권혜영',
      type: 'partner',
      role: 'default',
      companyId: 2,
      isLeader: true,
      systemIds: [3],
      status: 'ACTIVE',
      createdAt: '2024-02-01'
    },
    // 협력직 - 미라콤
    {
      id: 4,
      knoxId: 'kim.ms',
      name: '김민석',
      type: 'partner',
      role: 'default',
      companyId: 3,
      isLeader: true,
      systemIds: [4],
      status: 'ACTIVE',
      createdAt: '2024-02-10'
    },
    {
      id: 5,
      knoxId: 'kim.jd',
      name: '김제동',
      type: 'partner',
      role: 'default',
      companyId: 3,
      isLeader: false,
      systemIds: [5],
      status: 'ACTIVE',
      createdAt: '2024-02-15'
    },
    // 협력직 - DRCTS
    {
      id: 6,
      knoxId: 'han.sk',
      name: '한석규',
      type: 'partner',
      role: 'default',
      companyId: 4,
      isLeader: true,
      systemIds: [6],
      status: 'ACTIVE',
      createdAt: '2024-02-20'
    },
    // 승인 대기 회원들
    {
      id: 11,
      knoxId: 'new.user1',
      name: '신규회원1',
      type: 'partner',
      role: 'default',
      companyId: 1,
      isLeader: false,
      systemIds: [],
      status: 'PENDING',
      createdAt: '2024-03-01'
    },
    {
      id: 12,
      knoxId: 'new.user2',
      name: '신규회원2',
      type: 'employee',
      role: 'default',
      systemIds: [],
      status: 'PENDING',
      createdAt: '2024-03-02'
    }
  ])

  // 회사 목록
  const companies = ref<Company[]>([
    { id: 1, code: 'BM', name: '비트맥스', description: '비트맥스 협력사', createdAt: '2024-01-01' },
    { id: 2, code: 'EC', name: '에코', description: '에코 협력사', createdAt: '2024-01-15' },
    { id: 3, code: 'MR', name: '미라콤', description: '미라콤 협력사', createdAt: '2024-02-01' },
    { id: 4, code: 'DR', name: 'DRCTS', description: 'DRCTS 협력사', createdAt: '2024-02-15' }
  ])

  // 시스템 목록
  const systems = ref<System[]>([
    { id: 1, systemCode: 'S1801', name: 'ERP 시스템', companyId: 1, ciMemberId: 1, itoMemberIds: [7, 8] },
    { id: 2, systemCode: 'S1802', name: 'MES 시스템', companyId: 1, ciMemberId: 2, itoMemberIds: [7] },
    { id: 3, systemCode: 'S1901', name: 'WMS 시스템', companyId: 2, ciMemberId: 3, itoMemberIds: [8] },
    { id: 4, systemCode: 'S2001', name: 'SCM 시스템', companyId: 3, ciMemberId: 4, itoMemberIds: [9] },
    { id: 5, systemCode: 'S2002', name: 'PLM 시스템', companyId: 3, ciMemberId: 5, itoMemberIds: [9] },
    { id: 6, systemCode: 'S2101', name: 'BI 시스템', companyId: 4, ciMemberId: 6, itoMemberIds: [10] }
  ])

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
    // TODO: API 연동
    console.log('회원 목록 조회')
  }

  async function changeStatus(memberId: number, newStatus: MemberStatus) {
    const member = members.value.find(m => m.id === memberId)
    if (member) {
      // 상태 전환 규칙 검증
      if (member.status === 'PENDING' && newStatus === 'DEACTIVATED') {
        // PENDING → DEACTIVATED는 거절로 처리
        member.status = newStatus
      } else if (member.status === 'PENDING' && newStatus === 'ACTIVE') {
        // PENDING → ACTIVE는 승인
        member.status = newStatus
      } else if (member.status === 'ACTIVE' && newStatus === 'DEACTIVATED') {
        // ACTIVE → DEACTIVATED는 비활성화
        member.status = newStatus
      } else if (member.status === 'DEACTIVATED' && newStatus === 'ACTIVE') {
        // DEACTIVATED → ACTIVE는 재활성화
        member.status = newStatus
      }
      // PENDING으로 재전환은 불가
    }
  }

  async function resetPassword(memberId: number) {
    // TODO: API 연동
    console.log('비밀번호 초기화:', memberId)
    return true
  }

  // 회사 관리 액션
  async function fetchCompanies() {
    // TODO: API 연동
    console.log('회사 목록 조회')
  }

  async function createCompany(company: { code: string; name: string; description?: string }) {
    const newId = Math.max(...companies.value.map(c => c.id)) + 1
    const dateStr = new Date().toISOString().split('T')[0] || ''
    const newCompany: Company = {
      id: newId,
      code: company.code,
      name: company.name,
      description: company.description,
      createdAt: dateStr
    }
    companies.value.push(newCompany)
    return newId
  }

  async function updateCompany(id: number, updates: Partial<Omit<Company, 'id' | 'createdAt'>>) {
    const company = companies.value.find(c => c.id === id)
    if (company) {
      Object.assign(company, updates)
    }
  }

  async function deleteCompany(id: number) {
    // 소속 직원이 있는지 확인
    const hasMembers = members.value.some(m => m.companyId === id)
    if (hasMembers) {
      throw new Error('소속 직원이 있는 회사는 삭제할 수 없습니다.')
    }
    const index = companies.value.findIndex(c => c.id === id)
    if (index > -1) {
      companies.value.splice(index, 1)
    }
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
    const member = members.value.find(m => m.id === memberId)
    if (member) {
      member.isLeader = false
    }
  }

  // 시스템 관리 액션
  async function fetchSystems() {
    // TODO: API 연동
    console.log('시스템 목록 조회')
  }

  async function updateSystemAssignment(
    systemId: number,
    updates: { companyId?: number; ciMemberId?: number; itoMemberIds?: number[] }
  ) {
    const system = systems.value.find(s => s.id === systemId)
    if (system) {
      if (updates.companyId !== undefined) {
        system.companyId = updates.companyId
        // 회사가 변경되면 CI담당자 초기화
        system.ciMemberId = undefined
      }
      if (updates.ciMemberId !== undefined) {
        system.ciMemberId = updates.ciMemberId
      }
      if (updates.itoMemberIds !== undefined) {
        system.itoMemberIds = updates.itoMemberIds
      }
    }
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
