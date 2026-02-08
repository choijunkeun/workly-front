<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchTeamProgress, type TeamData, type FetchTeamProgressDenied } from '@/api/teamProgress'
import { ShieldAlert, Clock, Lock, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// 접근 권한 체크 (관리자, 팀 대표, 임직원)
const hasAccess = computed(() => authStore.canViewTeamProgress)

// API 응답 상태
const isLoading = ref(true)
const isRestricted = ref(false)
const restrictedInfo = ref<FetchTeamProgressDenied | null>(null)
const allTeamsData = ref<TeamData[]>([])

let timer: ReturnType<typeof setInterval> | null = null

async function loadTeamData() {
  if (!authStore.member) return

  try {
    const response = await fetchTeamProgress()

    if (response.allowed) {
      isRestricted.value = false
      restrictedInfo.value = null
      allTeamsData.value = response.teams
      // 첫 로드 시 팀 선택 초기화
      if (!selectedTeamId.value && response.teams.length > 0) {
        selectedTeamId.value = response.teams[0].companyId
      }
    } else {
      isRestricted.value = true
      restrictedInfo.value = response
      allTeamsData.value = []
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (!hasAccess.value) {
    router.replace('/')
    return
  }
  loadTeamData()
  // 주기적으로 서버에 재확인 (열람 시간 진입/종료 감지)
  timer = setInterval(loadTeamData, 30000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 잠금 화면에 표시할 다음 열람 시간 텍스트
const nextViewingText = computed(() => {
  if (!restrictedInfo.value) return ''
  const nv = restrictedInfo.value.nextViewing
  const date = new Date(nv.date + 'T00:00:00')
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayOfWeek = dayNames[date.getDay()]
  return `${month}월 ${day}일 (${dayOfWeek}) ${nv.startTime} ~ ${nv.endTime}`
})

const selectedWeek = ref('2024.02 1주')

// 선택된 팀 (기본: 첫 번째 팀)
const selectedTeamId = ref<number | null>(null)

// 현재 선택된 팀 데이터
const currentTeam = computed(() => {
  return allTeamsData.value.find(t => t.companyId === selectedTeamId.value)
})

function getStatusIcon(status: string) {
  const icons: Record<string, string> = {
    completed: '✅',
    in_progress: '🔄',
    pending: '⏸'
  }
  return icons[status] || '⏸'
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    completed: '완료',
    in_progress: '진행중',
    pending: '대기'
  }
  return labels[status] || status
}

function getPriorityLabel(priority: string) {
  const labels: Record<string, string> = {
    high: '높음',
    medium: '보통',
    low: '낮음'
  }
  return labels[priority] || priority
}

function getProgressDiff(current: number, compare: number) {
  const diff = current - compare
  return diff >= 0 ? `+${diff}` : `${diff}`
}

function getProgressDiffClass(current: number, compare: number) {
  return current >= compare ? 'text-green-600' : 'text-red-600'
}

// 헤더 설명 텍스트
const headerDescription = computed(() => {
  if (authStore.isAdmin || authStore.isEmployee) {
    return '전체 팀의 업무 현황을 조회합니다'
  }
  return '우리 팀의 업무 현황을 조회합니다'
})
</script>

<template>
  <div>
    <!-- 접근 권한 없음 -->
    <div v-if="!hasAccess" class="flex flex-col items-center justify-center py-20">
      <ShieldAlert class="w-16 h-16 text-slate-300 mb-4" />
      <h3 class="text-lg font-medium text-slate-600 mb-2">접근 권한이 없습니다</h3>
      <p class="text-sm text-slate-400">팀 대표 또는 관리자만 조회할 수 있습니다</p>
    </div>

    <!-- 로딩 -->
    <div v-else-if="isLoading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 text-primary-500 animate-spin" />
    </div>

    <!-- 임직원 시간 제한 잠금 화면 (서버가 거부한 경우) -->
    <div v-else-if="isRestricted && restrictedInfo" class="flex flex-col items-center justify-center py-20">
      <div class="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center max-w-md">
        <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock class="w-10 h-10 text-slate-400" />
        </div>
        <h3 class="text-xl font-semibold text-slate-800 mb-3">열람 시간이 아닙니다</h3>
        <p class="text-sm text-slate-500 mb-6">
          팀 현황은 지정된 미팅 시간에만 열람할 수 있습니다.
        </p>
        <div class="bg-primary-50 rounded-xl p-4">
          <div class="flex items-center justify-center gap-2 mb-2">
            <Clock class="w-4 h-4 text-primary-600" />
            <span class="text-sm font-medium text-primary-700">다음 열람 가능 시간</span>
          </div>
          <p class="text-lg font-semibold text-primary-800">{{ nextViewingText }}</p>
        </div>
        <p class="text-xs text-slate-400 mt-4">
          현재 기본 설정: {{ restrictedInfo.scheduleSummary }}
        </p>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <template v-else>
      <!-- 헤더 -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">팀 업무 현황</h2>
          <p class="text-sm text-slate-500 mt-1">{{ headerDescription }}</p>
        </div>
        <div class="flex gap-3">
          <!-- 팀 선택 -->
          <select
            v-model="selectedTeamId"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            :disabled="allTeamsData.length <= 1"
          >
            <option v-for="team in allTeamsData" :key="team.companyId" :value="team.companyId">
              {{ team.name }}
            </option>
          </select>
          <select
            v-model="selectedWeek"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option>2024.02 1주</option>
            <option>2024.01 4주</option>
          </select>
        </div>
      </div>

      <template v-if="currentTeam">
        <!-- 팀 전체 진척률 -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <h3 class="font-semibold text-slate-800 mb-4">{{ currentTeam.name }} 팀 전체 진척률</h3>
          <div class="mb-4">
            <div class="flex items-center gap-4 mb-2">
              <div class="flex-1 h-4 bg-slate-100 rounded-full">
                <div
                  class="h-4 bg-primary-500 rounded-full transition-all"
                  :style="{ width: currentTeam.progress.total + '%' }"
                ></div>
              </div>
              <span class="text-2xl font-bold text-slate-800">{{ currentTeam.progress.total }}%</span>
            </div>
            <div class="flex gap-6 text-sm">
              <span class="text-slate-500">
                목표 대비:
                <span :class="getProgressDiffClass(currentTeam.progress.total, currentTeam.progress.target)" class="font-medium">
                  {{ getProgressDiff(currentTeam.progress.total, currentTeam.progress.target) }}%
                </span>
              </span>
              <span class="text-slate-500">
                지난주 대비:
                <span :class="getProgressDiffClass(currentTeam.progress.total, currentTeam.progress.previousWeek)" class="font-medium">
                  {{ getProgressDiff(currentTeam.progress.total, currentTeam.progress.previousWeek) }}%
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- 팀원별 진척도 -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <h3 class="font-semibold text-slate-800 mb-4">팀원별 진척도</h3>
          <div class="space-y-4">
            <div v-for="member in currentTeam.members" :key="member.id" class="flex items-center gap-4">
              <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span class="text-primary-600 font-medium">{{ member.name.charAt(0) }}</span>
              </div>
              <div class="w-24 flex items-center gap-1.5">
                <span class="text-sm text-slate-700">{{ member.name }}</span>
                <span
                  v-if="member.isLeader"
                  class="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-xs rounded"
                >
                  팀 대표
                </span>
              </div>
              <div class="flex-1 h-3 bg-slate-100 rounded-full">
                <div
                  class="h-3 rounded-full transition-all"
                  :class="member.progress >= 80 ? 'bg-green-500' : member.progress >= 50 ? 'bg-primary-500' : 'bg-amber-500'"
                  :style="{ width: member.progress + '%' }"
                ></div>
              </div>
              <span class="w-12 text-sm font-medium text-slate-700 text-right">{{ member.progress }}%</span>
              <button class="text-sm text-primary-600 hover:text-primary-700">상세보기</button>
            </div>
          </div>
        </div>

        <!-- 팀 업무 현황표 -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 class="font-semibold text-slate-800 mb-4">팀 업무 현황표</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-200">
                  <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">담당자</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">업무명</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">상태</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">진척도</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">우선순위</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="task in currentTeam.tasks" :key="task.id">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span class="text-primary-600 text-sm font-medium">{{ task.assignee.charAt(0) }}</span>
                      </div>
                      <span class="text-sm text-slate-800">{{ task.assignee }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-800">{{ task.title }}</td>
                  <td class="px-4 py-3">
                    <span class="text-sm">
                      {{ getStatusIcon(task.status) }} {{ getStatusLabel(task.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-20 h-2 bg-slate-100 rounded-full">
                        <div
                          class="h-2 bg-primary-500 rounded-full"
                          :style="{ width: task.progress + '%' }"
                        ></div>
                      </div>
                      <span class="text-sm text-slate-600">{{ task.progress }}%</span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="px-2 py-1 text-xs rounded-full"
                      :class="{
                        'bg-red-100 text-red-600': task.priority === 'high',
                        'bg-amber-100 text-amber-600': task.priority === 'medium',
                        'bg-slate-100 text-slate-600': task.priority === 'low'
                      }"
                    >
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
