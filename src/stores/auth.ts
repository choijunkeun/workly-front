import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Member, SignupRequest, LoginRequest } from '@/types'
import api from '@/api/axios'

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

  const isEmployee = computed(() => member.value?.type === 'employee')

  // 팀 진척도 조회 가능 여부 (관리자, 팀 대표, 임직원)
  const canViewTeamProgress = computed(() => isAdmin.value || isLeader.value || isEmployee.value)

  async function login(request: LoginRequest) {
    const { data } = await api.post('/auth/login', request)

    member.value = data.member
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken

    // accessToken은 localStorage에 저장
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('member', JSON.stringify(data.member))

    // refreshToken은 쿠키에 저장 (7일)
    setCookie('refreshToken', data.refreshToken, 7)
  }

  async function signup(request: SignupRequest) {
    await api.post('/members', {
      knoxId: request.knoxId,
      name: request.name,
      password: request.password,
      type: request.type.toUpperCase(),
      companyId: request.companyId ?? null
    })
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

  // 토큰 갱신 함수
  async function refreshAccessToken() {
    if (!refreshToken.value) {
      logout()
      return false
    }

    try {
      const { data } = await api.post('/auth/refresh', { refreshToken: refreshToken.value })

      accessToken.value = data.accessToken
      localStorage.setItem('accessToken', data.accessToken)

      return true
    } catch {
      logout()
      return false
    }
  }

  // 비밀번호 변경 함수
  async function changePassword(currentPassword: string, newPassword: string) {
    await api.post('/auth/change-password', { currentPassword, newPassword })
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
    isEmployee,
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
