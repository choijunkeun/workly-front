<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const isHovered = ref(false)

const menuItems = [
  { path: '/', name: '대시보드', icon: 'dashboard' },
  { path: '/reports', name: '내 주간보고', icon: 'reports' },
  { path: '/my-progress', name: '내 진척도', icon: 'progress' },
  { path: '/team-progress', name: '팀 현황', icon: 'team' },
  { path: '/systems', name: '시스템&담당자', icon: 'company' }
]

const adminMenuItems = [
  { path: '/admin/members', name: '회원 관리', icon: 'users' },
  { path: '/admin/companies', name: '회사 관리', icon: 'building' },
  { path: '/admin/systems', name: '시스템 관리', icon: 'cog' }
]

const isAdmin = computed(() => authStore.isAdmin)
</script>

<template>
  <aside
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    class="fixed left-0 top-16 h-[calc(100vh-64px)] bg-white/80 backdrop-blur-sm border-r border-slate-200/60 transition-all duration-300 z-40 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]"
    :class="isHovered ? 'w-48' : 'w-16'"
  >
    <nav class="py-4 px-2">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="flex items-center py-3 rounded-xl transition-all duration-200 whitespace-nowrap overflow-hidden"
            :class="[
              route.path === item.path
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'text-slate-600 hover:bg-slate-100',
              isHovered ? 'px-3 gap-3' : 'justify-center'
            ]"
          >
            <!-- 대시보드 아이콘 -->
            <svg v-if="item.icon === 'dashboard'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <!-- 주간보고 아이콘 -->
            <svg v-if="item.icon === 'reports'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <!-- 진척도 아이콘 -->
            <svg v-if="item.icon === 'progress'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <!-- 팀 아이콘 -->
            <svg v-if="item.icon === 'team'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <!-- 협력사 아이콘 -->
            <svg v-if="item.icon === 'company'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span
              v-if="isHovered"
              class="font-medium text-sm"
            >
              {{ item.name }}
            </span>
          </router-link>
        </li>
      </ul>

      <!-- 관리자 메뉴 -->
      <template v-if="isAdmin">
        <div class="my-4 mx-2 border-t border-slate-200/60"></div>
        <div v-if="isHovered" class="px-3 mb-2">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">관리</span>
        </div>
        <ul class="space-y-1">
          <li v-for="item in adminMenuItems" :key="item.path">
            <router-link
              :to="item.path"
              class="flex items-center py-3 rounded-xl transition-all duration-200 whitespace-nowrap overflow-hidden"
              :class="[
                route.path === item.path || route.path.startsWith(item.path)
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'text-slate-600 hover:bg-slate-100',
                isHovered ? 'px-3 gap-3' : 'justify-center'
              ]"
            >
              <!-- 회원 관리 아이콘 -->
              <svg v-if="item.icon === 'users'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <!-- 회사 관리 아이콘 -->
              <svg v-if="item.icon === 'building'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <!-- 시스템 관리 아이콘 -->
              <svg v-if="item.icon === 'cog'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span
                v-if="isHovered"
                class="font-medium text-sm"
              >
                {{ item.name }}
              </span>
            </router-link>
          </li>
        </ul>
      </template>
    </nav>
  </aside>
</template>
