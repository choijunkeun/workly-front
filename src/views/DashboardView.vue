<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const currentWeek = ref('2024년 2월 1주')

const stats = ref([
  { label: '이번주 업무', value: 12, icon: 'tasks', color: 'from-blue-500 to-blue-600' },
  { label: '완료 업무', value: 8, icon: 'check', color: 'from-emerald-500 to-emerald-600' },
  { label: '진행중 업무', value: 4, icon: 'progress', color: 'from-amber-500 to-amber-600' }
])

const recentReports = ref([
  { date: '2/1', title: '주간보고 작성완료', status: 'submitted' },
  { date: '1/25', title: '주간보고 승인됨', status: 'approved' }
])

// Mock 데이터 - 팀별 진척도 (companyId로 구분)
const allTeamProgress = ref([
  { companyId: 1, team: '비트맥스', progress: 85 },
  { companyId: 2, team: '에코', progress: 70 },
  { companyId: 3, team: '미라콤', progress: 78 },
  { companyId: 4, team: 'DRCTS', progress: 92 }
])

// 표시할 팀 진척도 (관리자: 전체, 팀 대표: 본인 팀만)
const teamProgress = computed(() => {
  if (authStore.isAdmin) {
    // 관리자는 모든 팀 조회 가능
    return allTeamProgress.value
  } else if (authStore.isLeader && authStore.member?.companyId) {
    // 팀 대표는 본인 팀만 조회
    return allTeamProgress.value.filter(t => t.companyId === authStore.member?.companyId)
  }
  return []
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">대시보드</h2>
        <p class="text-slate-500 mt-1">업무 현황을 한눈에 확인하세요</p>
      </div>
      <div class="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200/60 text-sm text-slate-600">
        {{ currentWeek }}
      </div>
    </div>

    <!-- 통계 카드 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-slate-500 text-sm font-medium">{{ stat.label }}</p>
            <p class="text-4xl font-bold text-slate-800 mt-2">{{ stat.value }}</p>
          </div>
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
            :class="stat.color"
            :style="{ boxShadow: `0 8px 16px -4px ${stat.color.includes('blue') ? 'rgba(59,130,246,0.3)' : stat.color.includes('emerald') ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }"
          >
            <svg v-if="stat.icon === 'tasks'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <svg v-if="stat.icon === 'check'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-if="stat.icon === 'progress'" class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 진척도 & 최근 보고 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 내 주간 진척도 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
        <h3 class="font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <span class="w-1.5 h-5 bg-primary-500 rounded-full"></span>
          내 주간 진척도
        </h3>
        <div class="flex items-center gap-8">
          <div class="relative w-32 h-32">
            <svg class="w-32 h-32 transform -rotate-90">
              <circle
                cx="64" cy="64" r="54"
                stroke="#f1f5f9" stroke-width="12" fill="none"
              />
              <circle
                cx="64" cy="64" r="54"
                stroke="url(#progressGradient)" stroke-width="12" fill="none"
                stroke-linecap="round"
                :stroke-dasharray="339.3"
                :stroke-dashoffset="339.3 * (1 - 0.75)"
                class="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#3b82f6" />
                  <stop offset="100%" stop-color="#2563eb" />
                </linearGradient>
              </defs>
            </svg>
            <span class="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-800">
              75%
            </span>
          </div>
          <div class="space-y-3 flex-1">
            <div class="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                <span class="text-sm text-slate-600">완료</span>
              </div>
              <span class="font-semibold text-slate-800">6건</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                <span class="text-sm text-slate-600">진행중</span>
              </div>
              <span class="font-semibold text-slate-800">4건</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-slate-400 rounded-full"></span>
                <span class="text-sm text-slate-600">대기</span>
              </div>
              <span class="font-semibold text-slate-800">2건</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 최근 주간보고 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
        <h3 class="font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <span class="w-1.5 h-5 bg-primary-500 rounded-full"></span>
          최근 주간보고
        </h3>
        <div class="space-y-3">
          <div
            v-for="report in recentReports"
            :key="report.date"
            class="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-sm font-semibold text-slate-600">
                {{ report.date }}
              </div>
              <span class="text-sm font-medium text-slate-700">{{ report.title }}</span>
            </div>
            <span
              class="px-3 py-1.5 text-xs font-medium rounded-full"
              :class="report.status === 'approved'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-blue-100 text-blue-700'"
            >
              {{ report.status === 'approved' ? '승인됨' : '제출완료' }}
            </span>
          </div>
        </div>
        <router-link
          to="/reports"
          class="flex items-center justify-center gap-2 mt-4 py-3 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors"
        >
          전체보기
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>
    </div>

    <!-- 팀 진척도 요약 (관리자 또는 팀 대표만 표시) -->
    <div v-if="authStore.canViewTeamProgress" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
      <h3 class="font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <span class="w-1.5 h-5 bg-primary-500 rounded-full"></span>
        {{ authStore.isAdmin ? '전체 팀 주간 진척도' : '우리 팀 주간 진척도' }}
      </h3>
      <div class="space-y-5">
        <div v-for="team in teamProgress" :key="team.team" class="group">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-700">{{ team.team }}</span>
            <span class="text-sm font-bold text-slate-800">{{ team.progress }}%</span>
          </div>
          <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-3 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500 group-hover:shadow-lg"
              :style="{ width: team.progress + '%' }"
            ></div>
          </div>
        </div>
      </div>
      <router-link
        to="/team-progress"
        class="flex items-center justify-center gap-2 mt-6 py-3 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors"
      >
        상세보기
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </router-link>
    </div>
  </div>
</template>
