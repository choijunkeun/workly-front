<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import type { MemberStatus, MemberType } from '@/types'
import { Search, ChevronDown, Check, RefreshCw, UserCheck, UserX } from 'lucide-vue-next'

const adminStore = useAdminStore()
const toastStore = useToastStore()

// 탭 상태
const activeTab = ref<'pending' | 'all'>('pending')

// 필터 상태
const statusFilter = ref<MemberStatus | 'ALL'>('ALL')
const typeFilter = ref<MemberType | 'ALL'>('ALL')
const companyFilter = ref<number | null>(null)
const searchKeyword = ref('')

// 임직원 선택 시 회사 필터 초기화
watch(typeFilter, (newType) => {
  if (newType === 'employee') {
    companyFilter.value = null
  }
})

// 승인 대기 회원
const pendingMembers = computed(() => adminStore.pendingMembers)

// 전체 회원 (필터링)
const filteredMembers = computed(() => {
  let result = adminStore.members

  // 상태 필터
  if (statusFilter.value !== 'ALL') {
    result = result.filter(m => m.status === statusFilter.value)
  }

  // 유형 필터
  if (typeFilter.value !== 'ALL') {
    result = result.filter(m => m.type === typeFilter.value)
  }

  // 회사 필터 (협력직만)
  if (companyFilter.value !== null) {
    result = result.filter(m => m.companyId === companyFilter.value)
  }

  // 검색어 필터
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(m =>
      m.name.toLowerCase().includes(keyword) ||
      m.knoxId.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 회원 승인
async function approveMember(memberId: number) {
  await adminStore.changeStatus(memberId, 'ACTIVE')
  toastStore.success('회원이 승인되었습니다.')
}

// 상태 변경
async function changeStatus(memberId: number, newStatus: MemberStatus) {
  await adminStore.changeStatus(memberId, newStatus)
  toastStore.success('회원 상태가 변경되었습니다.')
}

// 비밀번호 초기화
async function resetPassword(memberId: number, memberName: string) {
  if (confirm(`${memberName}님의 비밀번호를 초기화하시겠습니까?`)) {
    await adminStore.resetPassword(memberId)
    toastStore.success('비밀번호가 초기화되었습니다.')
  }
}

// 상태 라벨
function getStatusLabel(status?: MemberStatus) {
  switch (status) {
    case 'PENDING': return '승인 대기'
    case 'ACTIVE': return '활성'
    case 'DEACTIVATED': return '비활성'
    default: return '-'
  }
}

// 상태 스타일
function getStatusClass(status?: MemberStatus) {
  switch (status) {
    case 'PENDING': return 'bg-amber-50 text-amber-700'
    case 'ACTIVE': return 'bg-green-50 text-green-700'
    case 'DEACTIVATED': return 'bg-slate-100 text-slate-500'
    default: return 'bg-slate-100 text-slate-500'
  }
}

// 유형 라벨
function getTypeLabel(type: MemberType) {
  return type === 'employee' ? '임직원' : '협력직'
}
</script>

<template>
  <div>
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">회원 관리</h2>
        <p class="text-sm text-slate-500 mt-1">회원 승인 및 상태 관리</p>
      </div>
    </div>

    <!-- 탭 -->
    <div class="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
      <button
        @click="activeTab = 'pending'"
        class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
        :class="activeTab === 'pending'
          ? 'bg-white text-primary-600 shadow-sm'
          : 'text-slate-600 hover:text-slate-800'"
      >
        승인 대기
        <span
          v-if="pendingMembers.length > 0"
          class="ml-1.5 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full"
        >
          {{ pendingMembers.length }}
        </span>
      </button>
      <button
        @click="activeTab = 'all'"
        class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
        :class="activeTab === 'all'
          ? 'bg-white text-primary-600 shadow-sm'
          : 'text-slate-600 hover:text-slate-800'"
      >
        전체 회원
      </button>
    </div>

    <!-- 승인 대기 탭 -->
    <div v-if="activeTab === 'pending'">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Knox ID</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">이름</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">유형</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">소속 회사</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">신청일</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">작업</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="member in pendingMembers"
                :key="member.id"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <td class="px-4 py-3">
                  <span class="text-sm font-mono text-slate-700">{{ member.knoxId }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="text-sm font-medium text-slate-800">{{ member.name }}</span>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex px-2 py-0.5 text-xs font-medium rounded"
                    :class="member.type === 'employee' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'"
                  >
                    {{ getTypeLabel(member.type) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="text-sm text-slate-600">
                    {{ member.companyId ? adminStore.getCompanyName(member.companyId) : '-' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="text-sm text-slate-500">{{ member.createdAt }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center">
                    <button
                      @click="approveMember(member.id)"
                      class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                    >
                      <Check class="w-3.5 h-3.5" />
                      승인
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 데이터 없음 -->
        <div
          v-if="pendingMembers.length === 0"
          class="text-center py-12 text-slate-400"
        >
          <p>승인 대기 중인 회원이 없습니다</p>
        </div>
      </div>
    </div>

    <!-- 전체 회원 탭 -->
    <div v-if="activeTab === 'all'">
      <!-- 필터 영역 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <!-- 상태 필터 -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-slate-600">상태</label>
            <div class="relative">
              <select
                v-model="statusFilter"
                class="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[120px]"
              >
                <option value="ALL">전체</option>
                <option value="ACTIVE">활성</option>
                <option value="PENDING">승인 대기</option>
                <option value="DEACTIVATED">비활성</option>
              </select>
              <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <!-- 유형 필터 -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-slate-600">유형</label>
            <div class="relative">
              <select
                v-model="typeFilter"
                class="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[120px]"
              >
                <option value="ALL">전체</option>
                <option value="employee">임직원</option>
                <option value="partner">협력직</option>
              </select>
              <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <!-- 회사 필터 (협력직일 때만 표시) -->
          <div v-if="typeFilter !== 'employee'" class="flex items-center gap-2">
            <label class="text-sm font-medium text-slate-600">회사</label>
            <div class="relative">
              <select
                v-model="companyFilter"
                class="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
              >
                <option :value="null">전체</option>
                <option v-for="company in adminStore.companies" :key="company.id" :value="company.id">
                  {{ company.name }}
                </option>
              </select>
              <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <!-- 검색 -->
          <div class="flex items-center gap-2 flex-1 max-w-xs">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="이름, Knox ID 검색"
                class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <span class="text-sm text-slate-500 ml-auto">
            총 {{ filteredMembers.length }}명
          </span>
        </div>
      </div>

      <!-- 회원 테이블 -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Knox ID</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">이름</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">유형</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">소속 회사</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">상태</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">가입일</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-48">작업</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="member in filteredMembers"
                :key="member.id"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <td class="px-4 py-3">
                  <span class="text-sm font-mono text-slate-700">{{ member.knoxId }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-slate-800">{{ member.name }}</span>
                    <span
                      v-if="member.role === 'admin'"
                      class="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded"
                    >
                      관리자
                    </span>
                    <span
                      v-if="member.isLeader"
                      class="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded"
                    >
                      팀 대표
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex px-2 py-0.5 text-xs font-medium rounded"
                    :class="member.type === 'employee' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'"
                  >
                    {{ getTypeLabel(member.type) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="text-sm text-slate-600">
                    {{ member.companyId ? adminStore.getCompanyName(member.companyId) : '-' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex px-2 py-0.5 text-xs font-medium rounded"
                    :class="getStatusClass(member.status)"
                  >
                    {{ getStatusLabel(member.status) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span class="text-sm text-slate-500">{{ member.createdAt }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-2">
                    <!-- 승인 대기 -> 승인 -->
                    <template v-if="member.status === 'PENDING'">
                      <button
                        @click="changeStatus(member.id, 'ACTIVE')"
                        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="승인"
                      >
                        <UserCheck class="w-4 h-4" />
                      </button>
                    </template>

                    <!-- 활성 -> 비활성화 -->
                    <template v-else-if="member.status === 'ACTIVE'">
                      <button
                        @click="changeStatus(member.id, 'DEACTIVATED')"
                        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="비활성화"
                      >
                        <UserX class="w-4 h-4" />
                      </button>
                    </template>

                    <!-- 비활성 -> 활성화 -->
                    <template v-else-if="member.status === 'DEACTIVATED'">
                      <button
                        @click="changeStatus(member.id, 'ACTIVE')"
                        class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="활성화"
                      >
                        <UserCheck class="w-4 h-4" />
                      </button>
                    </template>

                    <!-- 비밀번호 초기화 (활성 회원만) -->
                    <button
                      v-if="member.status === 'ACTIVE'"
                      @click="resetPassword(member.id, member.name)"
                      class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
                      title="비밀번호 초기화"
                    >
                      <RefreshCw class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 데이터 없음 -->
        <div
          v-if="filteredMembers.length === 0"
          class="text-center py-12 text-slate-400"
        >
          <p>검색 결과가 없습니다</p>
        </div>
      </div>
    </div>
  </div>
</template>
