<script setup lang="ts">
import { ref } from 'vue'

const selectedWeek = ref('2024.02 1주')
const progressRate = ref(75)

const statusCounts = ref({
  completed: 6,
  inProgress: 4,
  pending: 2
})

const weeklyTrend = ref([
  { week: '1주차', progress: 50 },
  { week: '2주차', progress: 65 },
  { week: '3주차', progress: 75 },
  { week: '4주차', progress: 75 }
])

const tasks = ref([
  { id: 1, title: 'API 개발', status: 'completed', progress: 100, dueDate: '02/07' },
  { id: 2, title: 'DB 설계', status: 'in_progress', progress: 60, dueDate: '02/09' },
  { id: 3, title: '테스트 작성', status: 'pending', progress: 0, dueDate: '02/09' }
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
</script>

<template>
  <div>
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-slate-800">내 업무 진척도</h2>
      <select
        v-model="selectedWeek"
        class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option>2024.02 1주</option>
        <option>2024.01 4주</option>
        <option>2024.01 3주</option>
      </select>
    </div>

    <!-- 전체 진척률 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
      <h3 class="font-semibold text-slate-800 mb-6">전체 진척률</h3>
      <div class="flex items-center justify-center gap-12">
        <!-- 도넛 차트 -->
        <div class="relative w-40 h-40">
          <svg class="w-40 h-40 transform -rotate-90">
            <circle
              cx="80" cy="80" r="60"
              stroke="#e2e8f0" stroke-width="16" fill="none"
            />
            <circle
              cx="80" cy="80" r="60"
              stroke="#2563eb" stroke-width="16" fill="none"
              stroke-linecap="round"
              :stroke-dasharray="377"
              :stroke-dashoffset="377 * (1 - progressRate / 100)"
            />
          </svg>
          <span class="absolute inset-0 flex items-center justify-center text-3xl font-bold text-slate-800">
            {{ progressRate }}%
          </span>
        </div>

        <!-- 상태별 카운트 -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="w-4 h-4 bg-green-500 rounded-full"></span>
            <span class="text-slate-600">완료:</span>
            <span class="font-semibold text-slate-800">{{ statusCounts.completed }}건</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="w-4 h-4 bg-blue-500 rounded-full"></span>
            <span class="text-slate-600">진행중:</span>
            <span class="font-semibold text-slate-800">{{ statusCounts.inProgress }}건</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="w-4 h-4 bg-slate-300 rounded-full"></span>
            <span class="text-slate-600">대기:</span>
            <span class="font-semibold text-slate-800">{{ statusCounts.pending }}건</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 주간 진척도 추이 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
      <h3 class="font-semibold text-slate-800 mb-6">주간 진척도 추이 (최근 4주)</h3>
      <div class="flex items-end justify-around h-48">
        <div
          v-for="item in weeklyTrend"
          :key="item.week"
          class="flex flex-col items-center gap-2"
        >
          <span class="text-sm font-medium text-slate-600">{{ item.progress }}%</span>
          <div
            class="w-16 bg-primary-500 rounded-t-lg transition-all"
            :style="{ height: item.progress * 1.5 + 'px' }"
          ></div>
          <span class="text-sm text-slate-500">{{ item.week }}</span>
        </div>
      </div>
    </div>

    <!-- 업무 상세 목록 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 class="font-semibold text-slate-800 mb-4">업무 상세 목록</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">업무명</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">상태</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">진척도</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">마감일</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="task in tasks" :key="task.id">
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
              <td class="px-4 py-3 text-sm text-slate-500">{{ task.dueDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
