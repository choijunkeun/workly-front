import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)
  const isManager = computed(() => user.value?.role === 'manager' || user.value?.role === 'admin')

  async function login(email: string, _password: string) {
    // TODO: API 연동
    // const response = await axios.post('/api/auth/login', { email, _password })

    // 임시 로그인 처리
    const mockUser: User = {
      id: 1,
      name: '홍길동',
      email: email,
      team: '개발팀',
      role: 'employee'
    }

    user.value = mockUser
    token.value = 'mock-token-' + Date.now()
    localStorage.setItem('token', token.value)
    localStorage.setItem('user', JSON.stringify(mockUser))
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function loadUser() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isManager,
    login,
    logout,
    loadUser
  }
})
