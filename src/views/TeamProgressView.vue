<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ShieldAlert } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// 접근 권한 체크 (관리자 또는 팀 대표만)
const hasAccess = computed(() => authStore.canViewTeamProgress)

onMounted(() => {
  if (!hasAccess.value) {
    // 권한 없으면 대시보드로 리다이렉트
    router.replace('/')
  }
})

const selectedWeek = ref('2024.02 1주')

// Mock 데이터 - 팀별 정보 (companyId로 구분)
const allTeamsData = ref([
  {
    companyId: 1,
    name: '비트맥스',
    progress: { total: 72, target: 70, previousWeek: 65 },
    members: [
      { id: 1, name: '이명환', progress: 85, isLeader: true },
      { id: 2, name: '홍길동', progress: 60, isLeader: false }
    ],
    tasks: [
      { id: 1, assignee: '이명환', title: 'ERP 시스템 유지보수', status: 'completed', progress: 100, priority: 'high' },
      { id: 2, assignee: '홍길동', title: 'MES 시스템 모듈 개발', status: 'in_progress', progress: 60, priority: 'high' }
    ]
  },
  {
    companyId: 2,
    name: '에코',
    progress: { total: 78, target: 75, previousWeek: 70 },
    members: [
      { id: 3, name: '권혜영', progress: 78, isLeader: true }
    ],
    tasks: [
      { id: 3, assignee: '권혜영', title: 'WMS 시스템 개선', status: 'in_progress', progress: 78, priority: 'medium' }
    ]
  },
  {
    companyId: 3,
    name: '미라콤',
    progress: { total: 65, target: 70, previousWeek: 60 },
    members: [
      { id: 4, name: '김민석', progress: 70, isLeader: true },
      { id: 5, name: '김제동', progress: 60, isLeader: false }
    ],
    tasks: [
      { id: 4, assignee: '김민석', title: 'SCM 시스템 연동', status: 'in_progress', progress: 70, priority: 'high' },
      { id: 5, assignee: '김제동', title: 'PLM 시스템 테스트', status: 'pending', progress: 30, priority: 'medium' }
    ]
  },
  {
    companyId: 4,
    name: 'DRCTS',
    progress: { total: 92, target: 80, previousWeek: 85 },
    members: [
      { id: 6, name: '한석규', progress: 92, isLeader: true }
    ],
    tasks: [
      { id: 6, assignee: '한석규', title: 'BI 시스템 대시보드 구축', status: 'completed', progress: 100, priority: 'high' }
    ]
  }
])

// 조회 가능한 팀 목록 (관리자: 전체, 팀 대표: 본인 팀만)
const availableTeams = computed(() => {
  if (authStore.isAdmin) {
    return allTeamsData.value
  } else if (authStore.isLeader && authStore.member?.companyId) {
    return allTeamsData.value.filter(t => t.companyId === authStore.member?.companyId)
  }
  return []
})

// 선택된 팀 (기본: 첫 번째 팀)
const selectedTeamId = ref<number | null>(null)

// 선택된 팀 초기화
onMounted(() => {
  if (availableTeams.value.length > 0 && !selectedTeamId.value) {
    selectedTeamId.value = availableTeams.value[0].companyId
  }
})

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
</script>

<template>
  <div>
    <!-- 접근 권한 없음 -->
    <div v-if="!hasAccess" class="flex flex-col items-center justify-center py-20">
      <ShieldAlert class="w-16 h-16 text-slate-300 mb-4" />
      <h3 class="text-lg font-medium text-slate-600 mb-2">접근 권한이 없습니다</h3>
      <p class="text-sm text-slate-400">팀 대표 또는 관리자만 조회할 수 있습니다</p>
    </div>

    <!-- 메인 콘텐츠 -->
    <template v-else>
      <!-- 헤더 -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">팀 업무 현황</h2>
          <p class="text-sm text-slate-500 mt-1">
            {{ authStore.isAdmin ? '전체 팀의 업무 현황을 조회합니다' : '우리 팀의 업무 현황을 조회합니다' }}
          </p>
        </div>
        <div class="flex gap-3">
          <!-- 팀 선택 (관리자만 여러 팀 선택 가능) -->
          <select
            v-model="selectedTeamId"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            :disabled="availableTeams.length <= 1"
          >
            <option v-for="team in availableTeams" :key="team.companyId" :value="team.companyId">
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
