<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import type { System } from '@/types'
import { Search, ChevronDown, Star, Pencil, X, Check } from 'lucide-vue-next'

const adminStore = useAdminStore()
const toastStore = useToastStore()

// 필터
const selectedCompanyId = ref<number | null>(null)
const searchKeyword = ref('')

// 모달 상태
const showModal = ref(false)
const editingSystem = ref<System | null>(null)
const editFormData = ref({
  companyId: 0,
  ciMemberId: undefined as number | undefined,
  itoMemberIds: [] as number[]
})

// 모달 내 검색
const ciSearchKeyword = ref('')
const itoSearchKeyword = ref('')

// 필터링된 시스템 목록
const filteredSystems = computed(() => {
  let result = adminStore.systems

  // 회사 필터
  if (selectedCompanyId.value) {
    result = result.filter(s => s.companyId === selectedCompanyId.value)
  }

  // 검색어 필터
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(s =>
      s.name.toLowerCase().includes(keyword) ||
      s.systemCode.toLowerCase().includes(keyword) ||
      adminStore.getCompanyName(s.companyId).toLowerCase().includes(keyword)
    )
  }

  return result
})

// CI 담당자 가져오기
function getCIMember(system: System) {
  if (!system.ciMemberId) return null
  return adminStore.members.find(m => m.id === system.ciMemberId)
}

// ITO 담당자들 가져오기
function getITOMembers(system: System) {
  if (!system.itoMemberIds || system.itoMemberIds.length === 0) return []
  return adminStore.members.filter(m => system.itoMemberIds?.includes(m.id))
}

// 모달 열기
function openEditModal(system: System) {
  editingSystem.value = system
  editFormData.value = {
    companyId: system.companyId,
    ciMemberId: system.ciMemberId,
    itoMemberIds: system.itoMemberIds ? [...system.itoMemberIds] : []
  }
  ciSearchKeyword.value = ''
  itoSearchKeyword.value = ''
  showModal.value = true
}

// 모달 닫기
function closeModal() {
  showModal.value = false
  editingSystem.value = null
}

// 저장
async function saveChanges() {
  if (!editingSystem.value) return

  try {
    await adminStore.updateSystemAssignment(editingSystem.value.id, {
      companyId: editFormData.value.companyId,
      ciMemberId: editFormData.value.ciMemberId,
      itoMemberIds: editFormData.value.itoMemberIds
    })
    toastStore.success('시스템 담당자가 변경되었습니다.')
    closeModal()
  } catch (error) {
    toastStore.error('저장 중 오류가 발생했습니다.')
  }
}

// 회사가 변경되면 CI담당자 초기화
function onCompanyChange() {
  editFormData.value.ciMemberId = undefined
}

// 해당 회사의 협력직 목록 (CI담당자 선택용) - 검색 필터 적용
const filteredPartners = computed(() => {
  const partners = adminStore.getPartnersByCompany(editFormData.value.companyId)
  if (!ciSearchKeyword.value.trim()) return partners

  const keyword = ciSearchKeyword.value.toLowerCase()
  return partners.filter(m =>
    m.name.toLowerCase().includes(keyword) ||
    m.knoxId.toLowerCase().includes(keyword)
  )
})

// 임직원 목록 (ITO담당자 선택용) - 검색 필터 적용
const filteredEmployees = computed(() => {
  const employees = adminStore.employeeMembers
  if (!itoSearchKeyword.value.trim()) return employees

  const keyword = itoSearchKeyword.value.toLowerCase()
  return employees.filter(m =>
    m.name.toLowerCase().includes(keyword) ||
    m.knoxId.toLowerCase().includes(keyword)
  )
})

// CI 담당자 선택
function selectCIMember(memberId: number) {
  editFormData.value.ciMemberId = memberId
}

// CI 담당자 선택 해제
function clearCIMember() {
  editFormData.value.ciMemberId = undefined
}

// ITO 담당자 토글
function toggleITOMember(memberId: number) {
  const index = editFormData.value.itoMemberIds.indexOf(memberId)
  if (index > -1) {
    editFormData.value.itoMemberIds.splice(index, 1)
  } else {
    editFormData.value.itoMemberIds.push(memberId)
  }
}

// 선택된 CI 담당자 정보
const selectedCIMember = computed(() => {
  if (!editFormData.value.ciMemberId) return null
  return adminStore.members.find(m => m.id === editFormData.value.ciMemberId)
})

// 선택된 ITO 담당자들 정보
const selectedITOMembers = computed(() => {
  return adminStore.members.filter(m => editFormData.value.itoMemberIds.includes(m.id))
})
</script>

<template>
  <div>
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">시스템 관리</h2>
        <p class="text-sm text-slate-500 mt-1">시스템별 담당 회사 및 담당자 설정</p>
      </div>
    </div>

    <!-- 필터 영역 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <!-- 회사 선택 -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-600">협력사</label>
          <div class="relative">
            <select
              v-model="selectedCompanyId"
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
              placeholder="시스템명, 시스템ID 검색"
              class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <span class="text-sm text-slate-500 ml-auto">
          총 {{ filteredSystems.length }}개 시스템
        </span>
      </div>
    </div>

    <!-- 테이블 -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">시스템ID</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">시스템명</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">담당 협력사</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">CI담당자</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ITO담당자</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-20">작업</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="system in filteredSystems"
              :key="system.id"
              class="hover:bg-slate-50/50 transition-colors"
            >
              <!-- 시스템ID -->
              <td class="px-4 py-3">
                <span class="inline-flex px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono rounded">
                  {{ system.systemCode }}
                </span>
              </td>

              <!-- 시스템명 -->
              <td class="px-4 py-3">
                <span class="text-sm font-medium text-slate-800">{{ system.name }}</span>
              </td>

              <!-- 담당 협력사 -->
              <td class="px-4 py-3">
                <span class="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                  {{ adminStore.getCompanyName(system.companyId) }}
                </span>
              </td>

              <!-- CI담당자 -->
              <td class="px-4 py-3">
                <div v-if="getCIMember(system)" class="flex items-center gap-1.5">
                  <span class="text-sm text-slate-800">{{ getCIMember(system)?.name }}</span>
                  <span
                    v-if="getCIMember(system)?.isLeader"
                    class="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-600 text-xs rounded"
                  >
                    <Star class="w-3 h-3 fill-amber-500" />
                    팀 대표
                  </span>
                </div>
                <span v-else class="text-sm text-slate-400">-</span>
              </td>

              <!-- ITO담당자 -->
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="member in getITOMembers(system)"
                    :key="member.id"
                    class="inline-flex px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded"
                  >
                    {{ member.name }}
                  </span>
                  <span v-if="getITOMembers(system).length === 0" class="text-sm text-slate-400">-</span>
                </div>
              </td>

              <!-- 작업 -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-center">
                  <button
                    @click="openEditModal(system)"
                    class="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    title="수정"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 데이터 없음 -->
      <div
        v-if="filteredSystems.length === 0"
        class="text-center py-12 text-slate-400"
      >
        <p>검색 결과가 없습니다</p>
      </div>
    </div>

    <!-- 담당자 설정 모달 -->
    <Teleport to="body">
      <div
        v-if="showModal && editingSystem"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/50" @click="closeModal"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col">
          <!-- 모달 헤더 -->
          <div class="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h3 class="text-lg font-semibold text-slate-800">담당자 설정</h3>
              <p class="text-sm text-slate-500 mt-0.5">
                {{ editingSystem.systemCode }} - {{ editingSystem.name }}
              </p>
            </div>
            <button
              @click="closeModal"
              class="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- 모달 내용 -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- 담당 협력사 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">담당 협력사</label>
              <div class="relative">
                <select
                  v-model="editFormData.companyId"
                  @change="onCompanyChange"
                  class="appearance-none w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option v-for="company in adminStore.companies" :key="company.id" :value="company.id">
                    {{ company.name }}
                  </option>
                </select>
                <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <!-- CI 담당자 (협력직) -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                CI 담당자
                <span class="font-normal text-slate-500">(협력직)</span>
              </label>

              <!-- 선택된 CI 담당자 -->
              <div v-if="selectedCIMember" class="mb-3 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Check class="w-4 h-4 text-primary-600" />
                  <span class="text-sm font-medium text-primary-800">{{ selectedCIMember.name }}</span>
                  <span class="text-xs text-primary-600">({{ selectedCIMember.knoxId }})</span>
                  <span
                    v-if="selectedCIMember.isLeader"
                    class="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded"
                  >
                    <Star class="w-3 h-3 fill-amber-500" />
                    팀 대표
                  </span>
                </div>
                <button
                  @click="clearCIMember"
                  class="text-xs text-primary-600 hover:text-primary-800"
                >
                  선택 해제
                </button>
              </div>

              <!-- 검색 -->
              <div class="relative mb-3">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  v-model="ciSearchKeyword"
                  type="text"
                  placeholder="이름 또는 Knox ID 검색"
                  class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <!-- 협력직 목록 -->
              <div class="border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                <div v-if="filteredPartners.length > 0" class="divide-y divide-slate-100">
                  <button
                    v-for="member in filteredPartners"
                    :key="member.id"
                    @click="selectCIMember(member.id)"
                    class="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left"
                    :class="editFormData.ciMemberId === member.id ? 'bg-primary-50' : ''"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-slate-800">{{ member.name }}</span>
                      <span class="text-xs text-slate-500">({{ member.knoxId }})</span>
                      <span
                        v-if="member.isLeader"
                        class="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded"
                      >
                        <Star class="w-3 h-3 fill-amber-500" />
                        팀 대표
                      </span>
                    </div>
                    <Check
                      v-if="editFormData.ciMemberId === member.id"
                      class="w-4 h-4 text-primary-600"
                    />
                  </button>
                </div>
                <div v-else class="p-4 text-center text-sm text-slate-400">
                  {{ ciSearchKeyword ? '검색 결과가 없습니다' : '해당 회사에 소속된 협력직이 없습니다' }}
                </div>
              </div>
            </div>

            <!-- ITO 담당자 (임직원) -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                ITO 담당자
                <span class="font-normal text-slate-500">(임직원, 다중 선택)</span>
              </label>

              <!-- 선택된 ITO 담당자들 -->
              <div v-if="selectedITOMembers.length > 0" class="mb-3 flex flex-wrap gap-2">
                <span
                  v-for="member in selectedITOMembers"
                  :key="member.id"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-lg"
                >
                  {{ member.name }}
                  <button
                    @click="toggleITOMember(member.id)"
                    class="hover:text-primary-600"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </span>
              </div>

              <!-- 검색 -->
              <div class="relative mb-3">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  v-model="itoSearchKeyword"
                  type="text"
                  placeholder="이름 또는 Knox ID 검색"
                  class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <!-- 임직원 목록 -->
              <div class="border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                <div v-if="filteredEmployees.length > 0" class="divide-y divide-slate-100">
                  <button
                    v-for="member in filteredEmployees"
                    :key="member.id"
                    @click="toggleITOMember(member.id)"
                    class="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left"
                    :class="editFormData.itoMemberIds.includes(member.id) ? 'bg-primary-50' : ''"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium text-slate-800">{{ member.name }}</span>
                      <span class="text-xs text-slate-500">({{ member.knoxId }})</span>
                    </div>
                    <Check
                      v-if="editFormData.itoMemberIds.includes(member.id)"
                      class="w-4 h-4 text-primary-600"
                    />
                  </button>
                </div>
                <div v-else class="p-4 text-center text-sm text-slate-400">
                  {{ itoSearchKeyword ? '검색 결과가 없습니다' : '등록된 임직원이 없습니다' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 모달 푸터 -->
          <div class="flex justify-end gap-3 p-6 border-t border-slate-200">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              @click="saveChanges"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
