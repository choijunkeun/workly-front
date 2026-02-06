<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Company, Member, System } from '@/types'
import { ChevronDown, Search, Star } from 'lucide-vue-next'

// Mock 데이터 - 회사
const companies = ref<Company[]>([
  { id: 1, code: 'BM', name: '비트맥스', createdAt: '2024-01-01' },
  { id: 2, code: 'EC', name: '에코', createdAt: '2024-01-15' },
  { id: 3, code: 'MR', name: '미라콤', createdAt: '2024-02-01' },
  { id: 4, code: 'DR', name: 'DRCTS', createdAt: '2024-02-15' }
])

// Mock 데이터 - 시스템 (각 시스템은 하나의 회사만 담당, CI담당자 1명)
const systems = ref<System[]>([
  { id: 1, systemCode: 'S1801', name: 'ERP 시스템', companyId: 1 },
  { id: 2, systemCode: 'S1802', name: 'MES 시스템', companyId: 1 },
  { id: 3, systemCode: 'S1901', name: 'WMS 시스템', companyId: 2 },
  { id: 4, systemCode: 'S2001', name: 'SCM 시스템', companyId: 3 },
  { id: 5, systemCode: 'S2002', name: 'PLM 시스템', companyId: 3 },
  { id: 6, systemCode: 'S2101', name: 'BI 시스템', companyId: 4 }
])

// Mock 데이터 - 직원 (시스템별 CI담당자 1명)
const members = ref<Member[]>([
  // 비트맥스 - 팀 대표: 이명환
  { id: 1, knoxId: 'lee.mh', name: '이명환', type: 'partner', role: 'default', companyId: 1, isLeader: true, systemIds: [1] },
  { id: 2, knoxId: 'hong.gd', name: '홍길동', type: 'partner', role: 'default', companyId: 1, isLeader: false, systemIds: [2] },

  // 에코 - 팀 대표: 권혜영
  { id: 3, knoxId: 'kwon.hy', name: '권혜영', type: 'partner', role: 'default', companyId: 2, isLeader: true, systemIds: [3] },

  // 미라콤 - 팀 대표: 김민석
  { id: 4, knoxId: 'kim.ms', name: '김민석', type: 'partner', role: 'default', companyId: 3, isLeader: true, systemIds: [4] },
  { id: 5, knoxId: 'kim.jd', name: '김제동', type: 'partner', role: 'default', companyId: 3, isLeader: false, systemIds: [5] },

  // DRCTS - 팀 대표: 한석규
  { id: 6, knoxId: 'han.sk', name: '한석규', type: 'partner', role: 'default', companyId: 4, isLeader: true, systemIds: [6] },

  // 임직원 (ITO 담당자)
  { id: 7, knoxId: 'park.ito', name: '박담당', type: 'employee', role: 'default', systemIds: [1, 2] },
  { id: 8, knoxId: 'lee.ito', name: '이담당', type: 'employee', role: 'default', systemIds: [3] },
  { id: 9, knoxId: 'kim.ito', name: '김담당', type: 'employee', role: 'default', systemIds: [4, 5] },
  { id: 10, knoxId: 'choi.ito', name: '최담당', type: 'employee', role: 'default', systemIds: [6] }
])

// 필터
const selectedCompanyId = ref<number | null>(null)
const searchKeyword = ref('')

// 회사 이름 가져오기
function getCompanyName(companyId: number) {
  const company = companies.value.find(c => c.id === companyId)
  return company?.name || '-'
}

// CI담당자 가져오기 (시스템별 1명)
function getCIMember(systemId: number) {
  return members.value.find(m => m.type === 'partner' && m.systemIds?.includes(systemId))
}

// ITO담당자 가져오기 (임직원)
function getITOMembers(systemId: number) {
  return members.value.filter(m => m.type === 'employee' && m.systemIds?.includes(systemId))
}

// 필터링된 시스템 목록
const filteredSystems = computed(() => {
  let result = systems.value

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
      getCompanyName(s.companyId).toLowerCase().includes(keyword)
    )
  }

  return result
})
</script>

<template>
  <div>
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">시스템 & 담당자 조회</h2>
        <p class="text-sm text-slate-500 mt-1">시스템별 CI/ITO 담당자를 조회합니다</p>
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
              <option v-for="company in companies" :key="company.id" :value="company.id">
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
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">협력사</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">CI담당자</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-28">ITO담당자</th>
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

              <!-- 협력사 -->
              <td class="px-4 py-3">
                <span class="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                  {{ getCompanyName(system.companyId) }}
                </span>
              </td>

              <!-- CI담당자 -->
              <td class="px-4 py-3">
                <div v-if="getCIMember(system.id)" class="flex items-center gap-1.5">
                  <span class="text-sm text-slate-800">{{ getCIMember(system.id)?.name }}</span>
                  <span
                    v-if="getCIMember(system.id)?.isLeader"
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
                    v-for="member in getITOMembers(system.id)"
                    :key="member.id"
                    class="text-sm text-slate-800"
                  >
                    {{ member.name }}
                  </span>
                  <span v-if="getITOMembers(system.id).length === 0" class="text-sm text-slate-400">-</span>
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
  </div>
</template>
