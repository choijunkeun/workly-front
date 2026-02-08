<script setup lang="ts">
import { ref } from 'vue'
import type { Member } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { Lock, Eye, EyeOff, X, Loader2 } from 'lucide-vue-next'

defineProps<{
  user: Member | null
}>()

const emit = defineEmits<{
  logout: []
}>()

const authStore = useAuthStore()
const toastStore = useToastStore()

const showProfileMenu = ref(false)
const showPasswordModal = ref(false)

// 비밀번호 변경 폼
const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showNewPasswordConfirm = ref(false)
const isChangingPassword = ref(false)
const passwordError = ref('')

function openPasswordModal() {
  showProfileMenu.value = false
  showPasswordModal.value = true
  resetPasswordForm()
}

function closePasswordModal() {
  showPasswordModal.value = false
  resetPasswordForm()
}

function resetPasswordForm() {
  currentPassword.value = ''
  newPassword.value = ''
  newPasswordConfirm.value = ''
  showCurrentPassword.value = false
  showNewPassword.value = false
  showNewPasswordConfirm.value = false
  passwordError.value = ''
}

async function handleChangePassword() {
  if (!currentPassword.value || !newPassword.value || !newPasswordConfirm.value) {
    passwordError.value = '모든 필드를 입력해주세요.'
    return
  }

  if (newPassword.value.length < 4) {
    passwordError.value = '새 비밀번호는 4자 이상이어야 합니다.'
    return
  }

  if (newPassword.value !== newPasswordConfirm.value) {
    passwordError.value = '새 비밀번호가 일치하지 않습니다.'
    return
  }

  isChangingPassword.value = true
  passwordError.value = ''

  try {
    await authStore.changePassword(currentPassword.value, newPassword.value)
    toastStore.success('비밀번호가 변경되었습니다.')
    closePasswordModal()
  } catch (e) {
    passwordError.value = '비밀번호 변경에 실패했습니다.'
  } finally {
    isChangingPassword.value = false
  }
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-50 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)]">
    <div class="flex items-center justify-between h-full px-6">
      <!-- 좌측: 로고 -->
      <div class="flex items-center gap-4">
        <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h1 class="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Workly
        </h1>
      </div>

      <!-- 우측: 알림 & 프로필 -->
      <div class="flex items-center gap-2">
        <!-- 알림 -->
        <button class="relative p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200 group">
          <svg class="w-5 h-5 text-slate-500 group-hover:text-slate-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        <!-- 구분선 -->
        <div class="w-px h-8 bg-slate-200 mx-2"></div>

        <!-- 프로필 -->
        <div class="relative">
          <button
            @click="showProfileMenu = !showProfileMenu"
            class="flex items-center gap-3 p-2 pr-3 rounded-xl hover:bg-slate-100 transition-all duration-200"
          >
            <div class="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary-500/20">
              {{ user?.name?.charAt(0) || 'U' }}
            </div>
            <div class="text-left hidden sm:block">
              <p class="text-sm font-medium text-slate-700">{{ user?.name || '사용자' }}</p>
              <p class="text-xs text-slate-400">{{ user?.type === 'employee' ? '임직원' : user?.type === 'partner' ? '협력직' : '' }}</p>
            </div>
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- 드롭다운 메뉴 -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-if="showProfileMenu"
              class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/60 py-2 overflow-hidden"
            >
              <div class="px-4 py-3 border-b border-slate-100">
                <p class="text-sm font-semibold text-slate-800">{{ user?.name }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ user?.knoxId }}</p>
              </div>
              <div class="py-1">
                <button
                  @click="openPasswordModal"
                  class="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Lock class="w-4 h-4" />
                  비밀번호 변경
                </button>
                <button
                  @click="emit('logout')"
                  class="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  로그아웃
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>

  <!-- 비밀번호 변경 모달 -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showPasswordModal"
        class="fixed inset-0 z-[100] flex items-center justify-center"
      >
        <!-- 배경 오버레이 -->
        <div
          class="absolute inset-0 bg-black/50"
          @click="closePasswordModal"
        ></div>

        <!-- 모달 컨텐츠 -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
          <!-- 헤더 -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 class="text-lg font-semibold text-slate-800">비밀번호 변경</h2>
            <button
              @click="closePasswordModal"
              class="p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X class="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <!-- 바디 -->
          <div class="px-6 py-4">
            <!-- 에러 메시지 -->
            <div
              v-if="passwordError"
              class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600"
            >
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ passwordError }}
            </div>

            <form @submit.prevent="handleChangePassword" class="space-y-4">
              <!-- 현재 비밀번호 -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700">현재 비밀번호</label>
                <div class="relative">
                  <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    v-model="currentPassword"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    placeholder="현재 비밀번호를 입력하세요"
                    class="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    @click="showCurrentPassword = !showCurrentPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <EyeOff v-if="showCurrentPassword" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- 새 비밀번호 -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700">새 비밀번호</label>
                <div class="relative">
                  <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    v-model="newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    placeholder="새 비밀번호를 입력하세요"
                    class="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <EyeOff v-if="showNewPassword" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- 새 비밀번호 확인 -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700">새 비밀번호 확인</label>
                <div class="relative">
                  <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    v-model="newPasswordConfirm"
                    :type="showNewPasswordConfirm ? 'text' : 'password'"
                    placeholder="새 비밀번호를 다시 입력하세요"
                    class="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    @click="showNewPasswordConfirm = !showNewPasswordConfirm"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <EyeOff v-if="showNewPasswordConfirm" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- 버튼 -->
              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  @click="closePasswordModal"
                  class="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  :disabled="isChangingPassword"
                  class="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Loader2 v-if="isChangingPassword" class="w-4 h-4 animate-spin" />
                  {{ isChangingPassword ? '변경 중...' : '변경하기' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
