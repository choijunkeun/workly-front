import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Member, SignupRequest, LoginRequest } from '@/types'

// 쿠키 유틸리티 함수
function setCookie(name: string, value: string, days: number) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`
}

function getCookie(name: string): string | null {
  const nameEQ = `${name}=`
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length)
    }
  }
  return null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

export const useAuthStore = defineStore('auth', () => {
  const member = ref<Member | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(getCookie('refreshToken'))

  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => member.value?.role === 'admin')
  const isPartner = computed(() => member.value?.type === 'partner')
  const isLeader = computed(() => member.value?.type === 'partner' && member.value?.isLeader === true)

  // 팀 진척도 조회 가능 여부 (관리자 또는 팀 대표)
  const canViewTeamProgress = computed(() => isAdmin.value || isLeader.value)

  // Mock 사용자 데이터 (실제로는 API에서 조회)
  // role은 관리자가 부여하는 것이므로 knoxId와 무관하게 DB에서 관리됨
  const mockUsers: Record<string, Member> = {
    // 임직원 (ITO 담당자) - 관리자 역할
    'park.ito': {
      id: 7,
      knoxId: 'park.ito',
      name: '박담당',
      type: 'employee',
      role: 'admin',
      systemIds: [1, 2]
    },
    // 임직원 (ITO 담당자) - 일반 역할
    'lee.ito': {
      id: 8,
      knoxId: 'lee.ito',
      name: '이담당',
      type: 'employee',
      role: 'default',
      systemIds: [3]
    },
    // 협력직 - 비트맥스 팀 대표
    'lee.mh': {
      id: 1,
      knoxId: 'lee.mh',
      name: '이명환',
      type: 'partner',
      role: 'default',
      companyId: 1,
      isLeader: true,
      systemIds: [1]
    },
    // 협력직 - 비트맥스 일반 CI담당자
    'hong.gd': {
      id: 2,
      knoxId: 'hong.gd',
      name: '홍길동',
      type: 'partner',
      role: 'default',
      companyId: 1,
      isLeader: false,
      systemIds: [2]
    },
    // 협력직 - 에코 팀 대표
    'kwon.hy': {
      id: 3,
      knoxId: 'kwon.hy',
      name: '권혜영',
      type: 'partner',
      role: 'default',
      companyId: 2,
      isLeader: true,
      systemIds: [3]
    }
  }

  async function login(request: LoginRequest) {
    // TODO: API 연동
    // const response = await axios.post('/api/auth/login', request)

    // Mock 사용자 조회 (실제로는 API 응답)
    const mockMember = mockUsers[request.knoxId] || {
      // 등록되지 않은 계정은 기본 일반 CI담당자로 처리
      id: 999,
      knoxId: request.knoxId,
      name: request.knoxId,
      type: 'partner' as const,
      role: 'default' as const,
      companyId: 1,
      isLeader: false,
      systemIds: []
    }

    // 임시 토큰 생성
    const mockAccessToken = 'mock-access-token-' + Date.now()
    const mockRefreshToken = 'mock-refresh-token-' + Date.now()

    member.value = mockMember
    accessToken.value = mockAccessToken
    refreshToken.value = mockRefreshToken

    // accessToken은 localStorage에 저장
    localStorage.setItem('accessToken', mockAccessToken)
    localStorage.setItem('member', JSON.stringify(mockMember))

    // refreshToken은 쿠키에 저장 (7일)
    setCookie('refreshToken', mockRefreshToken, 7)
  }

  async function signup(request: SignupRequest) {
    // TODO: API 연동
    // const response = await axios.post('/api/auth/signup', request)

    // 임시 회원가입 처리 (실제로는 서버에 저장)
    // 관리자 승인 전까지 로그인 불가하므로 토큰/멤버 설정 안함
    console.log('회원가입 요청:', request)
  }

  function logout() {
    member.value = null
    accessToken.value = null
    refreshToken.value = null

    localStorage.removeItem('accessToken')
    localStorage.removeItem('member')
    deleteCookie('refreshToken')
  }

  function loadMember() {
    const savedMember = localStorage.getItem('member')
    if (savedMember) {
      member.value = JSON.parse(savedMember)
    }
  }

  // 토큰 갱신 함수 (추후 API 연동 시 사용)
  async function refreshAccessToken() {
    if (!refreshToken.value) {
      logout()
      return false
    }

    // TODO: API 연동
    // const response = await axios.post('/api/auth/refresh', { refreshToken: refreshToken.value })

    // 임시 토큰 갱신
    const newAccessToken = 'mock-access-token-' + Date.now()
    accessToken.value = newAccessToken
    localStorage.setItem('accessToken', newAccessToken)

    return true
  }

  // 비밀번호 변경 함수
  async function changePassword(_currentPassword: string, _newPassword: string) {
    // TODO: API 연동
    // const response = await axios.post('/api/auth/change-password', {
    //   currentPassword: _currentPassword,
    //   newPassword: _newPassword
    // })

    // 임시 비밀번호 변경 처리
    console.log('비밀번호 변경 요청')
  }

  // 하위 호환성을 위한 별칭
  const user = member
  const token = accessToken
  const loadUser = loadMember

  return {
    member,
    user, // 하위 호환성
    accessToken,
    refreshToken,
    token, // 하위 호환성
    isAuthenticated,
    isAdmin,
    isPartner,
    isLeader,
    canViewTeamProgress,
    login,
    signup,
    logout,
    loadMember,
    loadUser, // 하위 호환성
    refreshAccessToken,
    changePassword
  }
})
