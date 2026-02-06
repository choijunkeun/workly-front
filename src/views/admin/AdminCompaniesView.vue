<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import type { Company } from '@/types'
import { Search, Plus, Pencil, Trash2, X, Users, Star } from 'lucide-vue-next'

const adminStore = useAdminStore()
const toastStore = useToastStore()

// 검색
const searchKeyword = ref('')

// 모달 상태
const showModal = ref(false)
const showMembersModal = ref(false)
const isEditing = ref(false)
const editingCompany = ref<Company | null>(null)
const selectedCompanyForMembers = ref<Company | null>(null)

// 폼 데이터
const formData = ref({
  code: '',
  name: '',
  description: ''
})

// 필터링된 회사 목록
const filteredCompanies = computed(() => {
  if (!searchKeyword.value.trim()) {
    return adminStore.companies
  }
  const keyword = searchKeyword.value.toLowerCase()
  return adminStore.companies.filter(c =>
    c.name.toLowerCase().includes(keyword) ||
    c.code.toLowerCase().includes(keyword)
  )
})

// 선택된 회사의 소속 직원
const selectedCompanyMembers = computed(() => {
  if (!selectedCompanyForMembers.value) return []
  return adminStore.members.filter(m =>
    m.companyId === selectedCompanyForMembers.value?.id && m.status === 'ACTIVE'
  )
})

// 소속 가능한 직원 (현재 소속이 없는 협력직)
const availableMembers = computed(() => {
  return adminStore.members.filter(m =>
    m.type === 'partner' &&
    !m.companyId &&
    m.status === 'ACTIVE'
  )
})

// 회사 추가 모달 열기
function openAddModal() {
  isEditing.value = false
  editingCompany.value = null
  formData.value = { code: '', name: '', description: '' }
  showModal.value = true
}

// 회사 수정 모달 열기
function openEditModal(company: Company) {
  isEditing.value = true
  editingCompany.value = company
  formData.value = {
    code: company.code,
    name: company.name,
    description: company.description || ''
  }
  showModal.value = true
}

// 모달 닫기
function closeModal() {
  showModal.value = false
  editingCompany.value = null
}

// 회사 저장
async function saveCompany() {
  if (!formData.value.code.trim() || !formData.value.name.trim()) {
    toastStore.error('회사 코드와 이름을 입력해주세요.')
    return
  }

  try {
    if (isEditing.value && editingCompany.value) {
      await adminStore.updateCompany(editingCompany.value.id, {
        code: formData.value.code,
        name: formData.value.name,
        description: formData.value.description || undefined
      })
      toastStore.success('회사 정보가 수정되었습니다.')
    } else {
      await adminStore.createCompany({
        code: formData.value.code,
        name: formData.value.name,
        description: formData.value.description || undefined
      })
      toastStore.success('회사가 추가되었습니다.')
    }
    closeModal()
  } catch (error) {
    toastStore.error('저장 중 오류가 발생했습니다.')
  }
}

// 회사 삭제
async function deleteCompany(company: Company) {
  const memberCount = adminStore.getMemberCountByCompany(company.id)

  if (memberCount > 0) {
    toastStore.warning(`${company.name}에 소속된 직원 ${memberCount}명이 있습니다. 먼저 직원을 다른 회사로 이동해주세요.`)
    return
  }

  if (confirm(`${company.name} 회사를 삭제하시겠습니까?`)) {
    try {
      await adminStore.deleteCompany(company.id)
      toastStore.success('회사가 삭제되었습니다.')
    } catch (error) {
      toastStore.error('삭제 중 오류가 발생했습니다.')
    }
  }
}

// 직원 관리 모달 열기
function openMembersModal(company: Company) {
  selectedCompanyForMembers.value = company
  showMembersModal.value = true
}

// 직원 관리 모달 닫기
function closeMembersModal() {
  showMembersModal.value = false
  selectedCompanyForMembers.value = null
}

// 직원 소속 추가
async function addMemberToCompany(memberId: number) {
  if (selectedCompanyForMembers.value) {
    await adminStore.assignMemberToCompany(memberId, selectedCompanyForMembers.value.id)
    toastStore.success('직원이 소속되었습니다.')
  }
}

// 직원 소속 제외
async function removeMemberFromCompany(memberId: number) {
  await adminStore.removeMemberFromCompany(memberId)
  toastStore.success('직원 소속이 해제되었습니다.')
}

// 팀 대표 설정
async function setTeamLeader(memberId: number) {
  if (selectedCompanyForMembers.value) {
    await adminStore.setTeamLeader(memberId, selectedCompanyForMembers.value.id)
    toastStore.success('팀 대표가 설정되었습니다.')
  }
}

// 팀 대표 해제
async function removeTeamLeader(memberId: number) {
  await adminStore.removeTeamLeader(memberId)
  toastStore.success('팀 대표가 해제되었습니다.')
}
</script>

<template>
  <div>
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">회사 관리</h2>
        <p class="text-sm text-slate-500 mt-1">협력사 정보 및 소속 직원 관리</p>
      </div>
      <button
        @click="openAddModal"
        class="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Plus class="w-4 h-4" />
        회사 추가
      </button>
    </div>

    <!-- 검색 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 flex-1 max-w-xs">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="회사명, 코드 검색"
              class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <span class="text-sm text-slate-500 ml-auto">
          총 {{ filteredCompanies.length }}개 회사
        </span>
      </div>
    </div>

    <!-- 회사 테이블 -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">코드</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">회사명</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">비고</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">소속 인원</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">생성일</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">작업</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="company in filteredCompanies"
              :key="company.id"
              class="hover:bg-slate-50/50 transition-colors"
            >
              <td class="px-4 py-3">
                <span class="inline-flex px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono rounded">
                  {{ company.code }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm font-medium text-slate-800">{{ company.name }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-slate-600">{{ company.description || '-' }}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <button
                  @click="openMembersModal(company)"
                  class="inline-flex items-center gap-1 px-2 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded transition-colors"
                >
                  <Users class="w-4 h-4" />
                  {{ adminStore.getMemberCountByCompany(company.id) }}명
                </button>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-slate-500">{{ company.createdAt }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="openEditModal(company)"
                    class="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    title="수정"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteCompany(company)"
                    class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="삭제"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 데이터 없음 -->
      <div
        v-if="filteredCompanies.length === 0"
        class="text-center py-12 text-slate-400"
      >
        <p>검색 결과가 없습니다</p>
      </div>
    </div>

    <!-- 회사 추가/수정 모달 -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/50" @click="closeModal"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-800">
              {{ isEditing ? '회사 수정' : '회사 추가' }}
            </h3>
            <button
              @click="closeModal"
              class="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="saveCompany" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">회사 코드</label>
              <input
                v-model="formData.code"
                type="text"
                placeholder="예: BM"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                :disabled="isEditing"
              />
              <p v-if="isEditing" class="text-xs text-slate-500 mt-1">회사 코드는 수정할 수 없습니다</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">회사명</label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="예: 비트맥스"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">비고</label>
              <textarea
                v-model="formData.description"
                rows="3"
                placeholder="회사에 대한 간단한 설명"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
              >
                {{ isEditing ? '수정' : '추가' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- 직원 관리 모달 -->
    <Teleport to="body">
      <div
        v-if="showMembersModal && selectedCompanyForMembers"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/50" @click="closeMembersModal"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-hidden flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-800">
              {{ selectedCompanyForMembers.name }} 소속 직원
            </h3>
            <button
              @click="closeMembersModal"
              class="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4">
            <!-- 현재 소속 직원 -->
            <div>
              <h4 class="text-sm font-medium text-slate-600 mb-2">소속 직원 ({{ selectedCompanyMembers.length }}명)</h4>
              <div v-if="selectedCompanyMembers.length > 0" class="space-y-2">
                <div
                  v-for="member in selectedCompanyMembers"
                  :key="member.id"
                  class="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-slate-800">{{ member.name }}</span>
                    <span class="text-xs text-slate-500">({{ member.knoxId }})</span>
                    <span
                      v-if="member.isLeader"
                      class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded"
                    >
                      <Star class="w-3 h-3 fill-amber-500" />
                      팀 대표
                    </span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button
                      v-if="member.isLeader"
                      @click="removeTeamLeader(member.id)"
                      class="text-xs text-amber-600 hover:bg-amber-50 px-2 py-1 rounded transition-colors"
                    >
                      대표 해제
                    </button>
                    <button
                      v-else
                      @click="setTeamLeader(member.id)"
                      class="text-xs text-primary-600 hover:bg-primary-50 px-2 py-1 rounded transition-colors"
                    >
                      대표 지정
                    </button>
                    <button
                      @click="removeMemberFromCompany(member.id)"
                      class="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                      제외
                    </button>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-slate-400 py-4 text-center">소속 직원이 없습니다</p>
            </div>

            <!-- 소속 가능한 직원 -->
            <div v-if="availableMembers.length > 0">
              <h4 class="text-sm font-medium text-slate-600 mb-2">소속 가능한 직원</h4>
              <div class="space-y-2">
                <div
                  v-for="member in availableMembers"
                  :key="member.id"
                  class="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-slate-800">{{ member.name }}</span>
                    <span class="text-xs text-slate-500">({{ member.knoxId }})</span>
                  </div>
                  <button
                    @click="addMemberToCompany(member.id)"
                    class="text-xs text-primary-600 hover:bg-primary-50 px-2 py-1 rounded transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-slate-200 mt-4">
            <button
              @click="closeMembersModal"
              class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
