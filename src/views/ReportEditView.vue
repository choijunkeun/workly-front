<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Task } from '@/types'

const router = useRouter()

const weekStart = ref('2024-02-05')
const weekEnd = ref('2024-02-09')
const goals = ref('')
const issues = ref('')
const nextWeekPlan = ref('')

const tasks = ref<Task[]>([
  {
    id: 1,
    title: 'API 개발',
    category: '개발',
    priority: 'high',
    status: 'in_progress',
    progress: 80,
    dueDate: '2024-02-07'
  },
  {
    id: 2,
    title: '문서화 작업',
    category: '문서',
    priority: 'medium',
    status: 'in_progress',
    progress: 50,
    dueDate: '2024-02-09'
  }
])

const showTaskModal = ref(false)
const newTask = ref({
  title: '',
  category: '개발',
  priority: 'medium' as 'high' | 'medium' | 'low',
  estimatedHours: 0,
  description: ''
})

function addTask() {
  tasks.value.push({
    id: Date.now(),
    title: newTask.value.title,
    category: newTask.value.category,
    priority: newTask.value.priority,
    status: 'pending',
    progress: 0,
    dueDate: weekEnd.value,
    description: newTask.value.description,
    estimatedHours: newTask.value.estimatedHours
  })
  showTaskModal.value = false
  resetNewTask()
}

function resetNewTask() {
  newTask.value = {
    title: '',
    category: '개발',
    priority: 'medium',
    estimatedHours: 0,
    description: ''
  }
}

function removeTask(id: number) {
  tasks.value = tasks.value.filter(t => t.id !== id)
}

function saveDraft() {
  console.log('임시저장')
  alert('임시저장 되었습니다.')
}

function submitReport() {
  console.log('제출')
  alert('제출되었습니다.')
  router.push('/reports')
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
      <h2 class="text-2xl font-bold text-slate-800">주간보고 작성</h2>
      <div class="flex gap-3">
        <button
          @click="saveDraft"
          class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          임시저장
        </button>
        <button
          @click="submitReport"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          제출
        </button>
      </div>
    </div>

    <!-- 기간 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
      <p class="text-slate-600">
        기간: <span class="font-medium text-slate-800">{{ weekStart }} ~ {{ weekEnd }}</span>
      </p>
    </div>

    <!-- 금주 업무 목표 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
      <h3 class="font-semibold text-slate-800 mb-4">금주 업무 목표</h3>
      <textarea
        v-model="goals"
        rows="4"
        placeholder="이번 주 달성하고자 하는 목표를 작성해주세요."
        class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      ></textarea>
    </div>

    <!-- 업무 목록 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-slate-800">업무 목록</h3>
        <button
          @click="showTaskModal = true"
          class="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          + 업무 추가
        </button>
      </div>

      <!-- 업무 테이블 -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">상태</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">업무명</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">우선순위</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">진척도</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="task in tasks" :key="task.id">
              <td class="px-4 py-3">
                <select
                  v-model="task.status"
                  class="text-sm border border-slate-200 rounded px-2 py-1"
                >
                  <option value="pending">대기</option>
                  <option value="in_progress">진행중</option>
                  <option value="completed">완료</option>
                  <option value="on_hold">보류</option>
                </select>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-slate-800">{{ task.title }}</span>
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
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <input
                    v-model="task.progress"
                    type="range"
                    min="0"
                    max="100"
                    class="w-24"
                  />
                  <span class="text-sm text-slate-600 w-10">{{ task.progress }}%</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <button
                  @click="removeTask(task.id)"
                  class="text-red-500 hover:text-red-600"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 특이사항/이슈 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
      <h3 class="font-semibold text-slate-800 mb-4">특이사항 / 이슈</h3>
      <textarea
        v-model="issues"
        rows="4"
        placeholder="업무 진행 중 발생한 이슈나 공유사항을 작성해주세요."
        class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      ></textarea>
    </div>

    <!-- 차주 계획 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 class="font-semibold text-slate-800 mb-4">차주 계획</h3>
      <textarea
        v-model="nextWeekPlan"
        rows="4"
        placeholder="다음 주 예정된 업무를 작성해주세요."
        class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      ></textarea>
    </div>

    <!-- 업무 추가 모달 -->
    <div
      v-if="showTaskModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showTaskModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-800">업무 추가</h3>
          <button @click="showTaskModal = false" class="text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">업무명</label>
            <input
              v-model="newTask.title"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">카테고리</label>
            <select
              v-model="newTask.category"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option>개발</option>
              <option>기획</option>
              <option>디자인</option>
              <option>문서</option>
              <option>기타</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">우선순위</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2">
                <input type="radio" v-model="newTask.priority" value="high" />
                <span class="text-sm">높음</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" v-model="newTask.priority" value="medium" />
                <span class="text-sm">보통</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" v-model="newTask.priority" value="low" />
                <span class="text-sm">낮음</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">예상 소요시간 (시간)</label>
            <input
              v-model.number="newTask.estimatedHours"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">상세 내용</label>
            <textarea
              v-model="newTask.description"
              rows="3"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showTaskModal = false"
            class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            @click="addTask"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
