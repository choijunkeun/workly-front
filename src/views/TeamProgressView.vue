<script setup lang="ts">
import { ref } from 'vue'

const selectedTeam = ref('개발팀')
const selectedWeek = ref('2024.02 1주')

const teamProgress = ref({
  total: 68,
  target: 65,
  previousWeek: 56
})

const members = ref([
  { id: 1, name: '김철수', progress: 80 },
  { id: 2, name: '이영희', progress: 70 },
  { id: 3, name: '박민수', progress: 60 },
  { id: 4, name: '정수진', progress: 90 }
])

const teamTasks = ref([
  { id: 1, assignee: '김철수', title: 'API 개발', status: 'completed', progress: 100, priority: 'high' },
  { id: 2, assignee: '이영희', title: '프론트 개발', status: 'in_progress', progress: 70, priority: 'high' },
  { id: 3, assignee: '박민수', title: '테스트 자동화', status: 'in_progress', progress: 40, priority: 'medium' }
])

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
</script>

<template>
  <div>
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-slate-800">팀 업무 현황</h2>
      <div class="flex gap-3">
        <select
          v-model="selectedTeam"
          class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option>개발팀</option>
          <option>기획팀</option>
          <option>디자인팀</option>
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

    <!-- 팀 전체 진척률 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
      <h3 class="font-semibold text-slate-800 mb-4">팀 전체 진척률</h3>
      <div class="mb-4">
        <div class="flex items-center gap-4 mb-2">
          <div class="flex-1 h-4 bg-slate-100 rounded-full">
            <div
              class="h-4 bg-primary-500 rounded-full transition-all"
              :style="{ width: teamProgress.total + '%' }"
            ></div>
          </div>
          <span class="text-2xl font-bold text-slate-800">{{ teamProgress.total }}%</span>
        </div>
        <div class="flex gap-6 text-sm">
          <span class="text-slate-500">
            목표 대비: <span class="text-green-600 font-medium">+{{ teamProgress.total - teamProgress.target }}%</span>
          </span>
          <span class="text-slate-500">
            지난주 대비: <span class="text-green-600 font-medium">+{{ teamProgress.total - teamProgress.previousWeek }}%</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 팀원별 진척도 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
      <h3 class="font-semibold text-slate-800 mb-4">팀원별 진척도</h3>
      <div class="space-y-4">
        <div v-for="member in members" :key="member.id" class="flex items-center gap-4">
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-600 font-medium">{{ member.name.charAt(0) }}</span>
          </div>
          <span class="w-20 text-sm text-slate-700">{{ member.name }}</span>
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
            <tr v-for="task in teamTasks" :key="task.id">
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
  </div>
</template>
