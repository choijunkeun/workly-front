<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast'
import { getServerSchedule, updateServerSchedule } from '@/api/teamProgress'
import { Clock, Save, Calendar } from 'lucide-vue-next'

const toastStore = useToastStore()

// 서버에서 현재 스케줄 조회
const currentSchedule = ref({ dayOfWeek: 2, startTime: '14:00', endTime: '15:00' })

// 편집 폼
const editDayOfWeek = ref(2)
const editStartTime = ref('14:00')
const editEndTime = ref('15:00')

onMounted(async () => {
  try {
    const schedule = await getServerSchedule()
    currentSchedule.value = schedule
    editDayOfWeek.value = schedule.dayOfWeek
    editStartTime.value = schedule.startTime
    editEndTime.value = schedule.endTime
  } catch {
    // 기본값 유지
  }
})

const dayOptions = [
  { value: 0, label: '일요일' },
  { value: 1, label: '월요일' },
  { value: 2, label: '화요일' },
  { value: 3, label: '수요일' },
  { value: 4, label: '목요일' },
  { value: 5, label: '금요일' },
  { value: 6, label: '토요일' }
]

const dayNames = ['일', '월', '화', '수', '목', '금', '토']

const scheduleSummary = computed(() => {
  const s = currentSchedule.value
  return `${dayNames[s.dayOfWeek]}요일 ${s.startTime} ~ ${s.endTime}`
})

// 서버 기준 현재 열람 가능 여부
const isCurrentlyViewable = computed(() => {
  const now = new Date()
  const s = currentSchedule.value
  if (now.getDay() !== s.dayOfWeek) return false
  const [startH, startM] = s.startTime.split(':').map(Number)
  const [endH, endM] = s.endTime.split(':').map(Number)
  const cur = now.getHours() * 60 + now.getMinutes()
  return cur >= startH * 60 + startM && cur < endH * 60 + endM
})

const nextViewing = computed(() => {
  const s = currentSchedule.value
  const now = new Date()
  const targetDay = s.dayOfWeek
  let daysUntil = targetDay - now.getDay()
  if (daysUntil < 0) {
    daysUntil += 7
  } else if (daysUntil === 0) {
    const [endH, endM] = s.endTime.split(':').map(Number)
    if (now.getHours() * 60 + now.getMinutes() >= endH * 60 + endM) {
      daysUntil = 7
    }
  }
  const nextDate = new Date(now)
  nextDate.setDate(now.getDate() + daysUntil)
  const month = nextDate.getMonth() + 1
  const day = nextDate.getDate()
  const dayOfWeek = dayNames[nextDate.getDay()]
  return `${month}월 ${day}일 (${dayOfWeek}) ${s.startTime} ~ ${s.endTime}`
})

async function saveDefaultSchedule() {
  if (editStartTime.value >= editEndTime.value) {
    toastStore.error('종료 시간은 시작 시간보다 뒤여야 합니다.')
    return
  }
  const schedule = {
    dayOfWeek: editDayOfWeek.value,
    startTime: editStartTime.value,
    endTime: editEndTime.value
  }
  try {
    await updateServerSchedule(schedule)
    currentSchedule.value = { ...schedule }
    toastStore.success('열람 스케줄이 저장되었습니다.')
  } catch {
    toastStore.error('스케줄 저장에 실패했습니다.')
  }
}
</script>

<template>
  <div>
    <!-- 헤더 -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-slate-800">열람 설정</h2>
      <p class="text-sm text-slate-500 mt-1">임직원의 팀 현황 열람 가능 시간을 관리합니다</p>
    </div>

    <!-- 현재 상태 카드 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
      <div class="flex items-center gap-3 mb-4">
        <Clock class="w-5 h-5 text-primary-600" />
        <h3 class="font-semibold text-slate-800">현재 상태</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-slate-50 rounded-lg p-4">
          <p class="text-xs text-slate-500 mb-1">기본 스케줄</p>
          <p class="text-sm font-medium text-slate-800">{{ scheduleSummary }}</p>
        </div>
        <div class="bg-slate-50 rounded-lg p-4">
          <p class="text-xs text-slate-500 mb-1">현재 열람 가능</p>
          <div class="flex items-center gap-2">
            <span
              class="w-2.5 h-2.5 rounded-full"
              :class="isCurrentlyViewable ? 'bg-green-500' : 'bg-red-500'"
            ></span>
            <p class="text-sm font-medium text-slate-800">
              {{ isCurrentlyViewable ? '열람 가능' : '열람 불가' }}
            </p>
          </div>
          <p v-if="!isCurrentlyViewable" class="text-xs text-slate-500 mt-1">
            다음: {{ nextViewing }}
          </p>
        </div>
      </div>
    </div>

    <!-- 기본 스케줄 설정 -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200 max-w-lg">
      <div class="flex items-center gap-3 mb-6">
        <Calendar class="w-5 h-5 text-primary-600" />
        <h3 class="font-semibold text-slate-800">기본 스케줄</h3>
      </div>
      <p class="text-sm text-slate-500 mb-4">매주 반복되는 열람 시간을 설정합니다.</p>

      <div class="space-y-4">
        <!-- 요일 선택 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">요일</label>
          <select
            v-model="editDayOfWeek"
            class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option v-for="opt in dayOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- 시작 시간 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">시작 시간</label>
          <input
            v-model="editStartTime"
            type="time"
            class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>

        <!-- 종료 시간 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">종료 시간</label>
          <input
            v-model="editEndTime"
            type="time"
            class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>

        <button
          @click="saveDefaultSchedule"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Save class="w-4 h-4" />
          저장
        </button>
      </div>
    </div>
  </div>
</template>
