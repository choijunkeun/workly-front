<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const reports = ref([
  {
    id: 1,
    weekStart: '2024-02-05',
    weekEnd: '2024-02-09',
    status: 'submitted',
    taskCount: 8,
    completedCount: 6,
    createdAt: '2024-02-05'
  },
  {
    id: 2,
    weekStart: '2024-01-29',
    weekEnd: '2024-02-02',
    status: 'approved',
    taskCount: 10,
    completedCount: 10,
    createdAt: '2024-01-29'
  },
  {
    id: 3,
    weekStart: '2024-01-22',
    weekEnd: '2024-01-26',
    status: 'approved',
    taskCount: 7,
    completedCount: 7,
    createdAt: '2024-01-22'
  }
])

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: '임시저장',
    submitted: '제출완료',
    approved: '승인됨',
    rejected: '반려됨'
  }
  return labels[status] || status
}

function getStatusClass(status: string) {
  const classes: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    submitted: 'bg-blue-100 text-blue-600',
    approved: 'bg-green-100 text-green-600',
    rejected: 'bg-red-100 text-red-600'
  }
  return classes[status] || 'bg-slate-100 text-slate-600'
}
</script>

<template>
  <div>
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-slate-800">내 주간보고</h2>
      <router-link
        to="/reports/new"
        class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
      >
        + 새 보고서 작성
      </router-link>
    </div>

    <!-- 보고서 목록 -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="px-6 py-4 text-left text-sm font-medium text-slate-500">기간</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-slate-500">업무 현황</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-slate-500">진척률</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-slate-500">상태</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-slate-500">작성일</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="report in reports" :key="report.id" class="hover:bg-slate-50">
              <td class="px-6 py-4">
                <span class="text-sm text-slate-800">
                  {{ formatDate(report.weekStart) }} ~ {{ formatDate(report.weekEnd) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-slate-600">
                  {{ report.completedCount }} / {{ report.taskCount }} 완료
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-20 h-2 bg-slate-100 rounded-full">
                    <div
                      class="h-2 bg-primary-500 rounded-full"
                      :style="{ width: (report.completedCount / report.taskCount * 100) + '%' }"
                    ></div>
                  </div>
                  <span class="text-sm text-slate-600">
                    {{ Math.round(report.completedCount / report.taskCount * 100) }}%
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="getStatusClass(report.status)"
                >
                  {{ getStatusLabel(report.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-slate-500">{{ report.createdAt }}</span>
              </td>
              <td class="px-6 py-4">
                <button
                  @click="router.push(`/reports/${report.id}/edit`)"
                  class="text-sm text-primary-600 hover:text-primary-700"
                >
                  상세보기
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
