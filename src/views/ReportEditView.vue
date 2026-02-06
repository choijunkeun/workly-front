<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Task } from '@/types'
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const adminStore = useAdminStore()

// 현재 주의 월요일과 일요일 계산
function getWeekRange(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  // 월요일로 이동 (일요일이 0이므로 조정 필요)
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diffToMonday)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return { monday, sunday }
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(dateStr: string) {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
  return `${month}월 ${day}일 (${weekday})`
}

function getWeekNumber(dateStr: string) {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const firstMonday = new Date(firstDayOfMonth)
  const dayOfWeek = firstDayOfMonth.getDay()
  // 첫 번째 월요일 찾기
  const diffToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek
  firstMonday.setDate(1 + diffToMonday)

  // 첫 번째 월요일 이전이면 1주차
  if (date < firstMonday) {
    return `${month}월 1주차`
  }

  // 첫 번째 월요일부터 몇 주차인지 계산
  const weekNum = Math.ceil((date.getDate() - firstMonday.getDate() + 1) / 7)
  return `${month}월 ${weekNum}주차`
}

// 초기 날짜 설정
const { monday, sunday } = getWeekRange(new Date())
const weekStart = ref(formatDate(monday))
const weekEnd = ref(formatDate(sunday))

// 날짜 선택 관련
const showDatePicker = ref(false)
const pickerYear = ref(new Date().getFullYear())
const pickerMonth = ref(new Date().getMonth())

const pickerMonthName = computed(() => {
  return `${pickerYear.value}년 ${pickerMonth.value + 1}월`
})

// 달력에 표시할 날짜 생성
const calendarDays = computed(() => {
  const firstDay = new Date(pickerYear.value, pickerMonth.value, 1)
  const lastDay = new Date(pickerYear.value, pickerMonth.value + 1, 0)
  const startDayOfWeek = firstDay.getDay()

  const days: { date: Date; isCurrentMonth: boolean; isMonday: boolean; isSunday: boolean }[] = []

  // 이전 달의 날짜들
  const prevMonthLastDay = new Date(pickerYear.value, pickerMonth.value, 0)
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(pickerYear.value, pickerMonth.value - 1, prevMonthLastDay.getDate() - i)
    days.push({
      date,
      isCurrentMonth: false,
      isMonday: date.getDay() === 1,
      isSunday: date.getDay() === 0
    })
  }

  // 현재 달의 날짜들
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(pickerYear.value, pickerMonth.value, i)
    days.push({
      date,
      isCurrentMonth: true,
      isMonday: date.getDay() === 1,
      isSunday: date.getDay() === 0
    })
  }

  // 다음 달의 날짜들 (6주 채우기)
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(pickerYear.value, pickerMonth.value + 1, i)
    days.push({
      date,
      isCurrentMonth: false,
      isMonday: date.getDay() === 1,
      isSunday: date.getDay() === 0
    })
  }

  return days
})

function prevMonth() {
  if (pickerMonth.value === 0) {
    pickerMonth.value = 11
    pickerYear.value--
  } else {
    pickerMonth.value--
  }
}

function nextMonth() {
  if (pickerMonth.value === 11) {
    pickerMonth.value = 0
    pickerYear.value++
  } else {
    pickerMonth.value++
  }
}

function selectWeek(date: Date) {
  const { monday: newMonday, sunday: newSunday } = getWeekRange(date)
  weekStart.value = formatDate(newMonday)
  weekEnd.value = formatDate(newSunday)
  showDatePicker.value = false
}

function isInSelectedWeek(date: Date) {
  const dateStr = formatDate(date)
  return dateStr >= weekStart.value && dateStr <= weekEnd.value
}

const goals = ref('')
const issues = ref('')
const nextWeekPlan = ref('')

const tasks = ref<Task[]>([])

const showTaskModal = ref(false)
const newTask = ref({
  systemId: undefined as number | undefined,
  title: '',
  category: '원콜',
  priority: 'medium' as 'high' | 'medium' | 'low',
  requester: '',
  requestDate: '',
  dueDate: '',
  description: ''
})

// 선택된 시스템 정보
const selectedSystem = computed(() => {
  if (!newTask.value.systemId) return null
  return adminStore.systems.find(s => s.id === newTask.value.systemId)
})

function addTask() {
  if (!newTask.value.title.trim()) return
  if (!newTask.value.systemId) {
    alert('시스템을 선택해주세요.')
    return
  }

  tasks.value.push({
    id: Date.now(),
    systemId: newTask.value.systemId,
    title: newTask.value.title,
    category: newTask.value.category,
    priority: newTask.value.priority,
    status: 'pending',
    progress: 0,
    requester: newTask.value.requester,
    requestDate: newTask.value.requestDate,
    dueDate: newTask.value.dueDate || weekEnd.value,
    description: newTask.value.description
  })
  showTaskModal.value = false
  resetNewTask()
}

function resetNewTask() {
  newTask.value = {
    systemId: undefined,
    title: '',
    category: '원콜',
    priority: 'medium',
    requester: '',
    requestDate: '',
    dueDate: '',
    description: ''
  }
}

// 시스템 정보 가져오기
function getSystemInfo(systemId?: number) {
  if (!systemId) return null
  return adminStore.systems.find(s => s.id === systemId)
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

onMounted(() => {
  // 날짜 선택기 초기 월 설정
  const startDate = new Date(weekStart.value)
  pickerYear.value = startDate.getFullYear()
  pickerMonth.value = startDate.getMonth()
})
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

    <!-- 기간 설정 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-500 mb-1">보고 기간</p>
          <div class="flex items-center gap-2">
            <span class="text-lg font-semibold text-primary-600">{{ getWeekNumber(weekStart) }}</span>
            <span class="text-slate-400">|</span>
            <span class="text-slate-700">{{ formatDisplayDate(weekStart) }} ~ {{ formatDisplayDate(weekEnd) }}</span>
          </div>
        </div>
        <div class="relative">
          <button
            @click="showDatePicker = !showDatePicker"
            class="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Calendar class="w-4 h-4 text-slate-500" />
            <span class="text-sm text-slate-700">기간 변경</span>
          </button>

          <!-- 날짜 선택기 -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-if="showDatePicker"
              class="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 w-[320px]"
            >
              <p class="text-xs text-slate-500 mb-3">원하는 주를 클릭하여 선택하세요 (월~일)</p>

              <!-- 월 네비게이션 -->
              <div class="flex items-center justify-between mb-4">
                <button
                  @click="prevMonth"
                  class="p-1 rounded hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft class="w-5 h-5 text-slate-600" />
                </button>
                <span class="font-medium text-slate-800">{{ pickerMonthName }}</span>
                <button
                  @click="nextMonth"
                  class="p-1 rounded hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight class="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <!-- 요일 헤더 -->
              <div class="grid grid-cols-7 gap-1 mb-2">
                <div
                  v-for="day in ['일', '월', '화', '수', '목', '금', '토']"
                  :key="day"
                  class="text-center text-xs font-medium py-1"
                  :class="day === '일' ? 'text-red-500' : day === '토' ? 'text-blue-500' : 'text-slate-500'"
                >
                  {{ day }}
                </div>
              </div>

              <!-- 날짜 그리드 -->
              <div class="grid grid-cols-7 gap-1">
                <button
                  v-for="(dayInfo, index) in calendarDays"
                  :key="index"
                  @click="selectWeek(dayInfo.date)"
                  class="relative h-8 text-sm rounded transition-colors"
                  :class="[
                    !dayInfo.isCurrentMonth ? 'text-slate-300' : 'text-slate-700',
                    isInSelectedWeek(dayInfo.date) ? 'bg-primary-100 text-primary-700 font-medium' : 'hover:bg-slate-100',
                    dayInfo.isMonday && isInSelectedWeek(dayInfo.date) ? 'rounded-l-lg' : '',
                    dayInfo.isSunday && isInSelectedWeek(dayInfo.date) ? 'rounded-r-lg' : ''
                  ]"
                >
                  {{ dayInfo.date.getDate() }}
                </button>
              </div>

              <!-- 선택된 기간 표시 -->
              <div class="mt-4 pt-3 border-t border-slate-100">
                <p class="text-sm text-slate-600">
                  선택: <span class="font-medium text-primary-600">{{ getWeekNumber(weekStart) }}</span>
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
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

      <!-- 업무가 없을 때 -->
      <div v-if="tasks.length === 0" class="text-center py-12 text-slate-400">
        <p>등록된 업무가 없습니다.</p>
        <p class="text-sm mt-1">위의 '업무 추가' 버튼을 클릭하여 업무를 추가하세요.</p>
      </div>

      <!-- 업무 테이블 -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">시스템</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">업무명</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">카테고리</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">상태</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">진척도</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-slate-500">납기일</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="task in tasks" :key="task.id">
              <td class="px-4 py-3">
                <div v-if="getSystemInfo(task.systemId)" class="flex flex-col gap-0.5">
                  <span class="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-mono rounded w-fit">
                    {{ getSystemInfo(task.systemId)?.systemCode }}
                  </span>
                  <span class="text-xs text-slate-500">{{ getSystemInfo(task.systemId)?.name }}</span>
                </div>
                <span v-else class="text-sm text-slate-400">-</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-slate-800">{{ task.title }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                  {{ task.category }}
                </span>
              </td>
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
                <div class="flex items-center gap-2">
                  <input
                    v-model="task.progress"
                    type="range"
                    min="0"
                    max="100"
                    class="w-20"
                  />
                  <span class="text-sm text-slate-600 w-10">{{ task.progress }}%</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-slate-600">{{ task.dueDate }}</span>
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
          <!-- 시스템 선택 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">시스템 <span class="text-red-500">*</span></label>
            <div class="relative">
              <select
                v-model="newTask.systemId"
                class="appearance-none w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option :value="undefined">시스템 선택</option>
                <option v-for="system in adminStore.systems" :key="system.id" :value="system.id">
                  {{ system.systemCode }} - {{ system.name }}
                </option>
              </select>
              <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <!-- 선택된 시스템 정보 표시 -->
            <div v-if="selectedSystem" class="mt-2 p-2 bg-primary-50 border border-primary-200 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono rounded">{{ selectedSystem.systemCode }}</span>
                <span class="text-sm font-medium text-primary-800">{{ selectedSystem.name }}</span>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">업무명 <span class="text-red-500">*</span></label>
            <input
              v-model="newTask.title"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">요청자</label>
            <input
              v-model="newTask.requester"
              type="text"
              placeholder="요청자 이름"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">카테고리</label>
            <div class="relative">
              <select
                v-model="newTask.category"
                class="appearance-none w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option>원콜</option>
                <option>원콜CI</option>
                <option>데이터변경</option>
              </select>
              <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">우선순위</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="newTask.priority" value="high" class="text-primary-500" />
                <span class="text-sm">높음</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="newTask.priority" value="medium" class="text-primary-500" />
                <span class="text-sm">보통</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="newTask.priority" value="low" class="text-primary-500" />
                <span class="text-sm">낮음</span>
              </label>
            </div>
          </div>

          <!-- 요청일 / 납기일 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">요청일</label>
              <input
                v-model="newTask.requestDate"
                type="date"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">납기일</label>
              <input
                v-model="newTask.dueDate"
                type="date"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
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
