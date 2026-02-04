<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isHovered = ref(false)

const menuItems = [
  { path: '/', name: '대시보드', icon: 'dashboard' },
  { path: '/reports', name: '주간보고', icon: 'reports' },
  { path: '/my-progress', name: '내 진척도', icon: 'progress' },
  { path: '/team-progress', name: '팀 현황', icon: 'team' }
]
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
            <span
              v-if="isHovered"
              class="font-medium text-sm"
            >
              {{ item.name }}
            </span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>
