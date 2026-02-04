<script setup lang="ts">
import { ref } from 'vue'
import type { User } from '@/types'

defineProps<{
  user: User | null
}>()

const emit = defineEmits<{
  logout: []
}>()

const showProfileMenu = ref(false)
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
          주간업무 관리
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
              <p class="text-xs text-slate-400">{{ user?.team || '' }}</p>
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
                <p class="text-xs text-slate-500 mt-0.5">{{ user?.email || user?.team }}</p>
              </div>
              <div class="py-1">
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
</template>
