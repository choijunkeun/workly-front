<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import type { ChatRoom } from '@/types'

defineProps<{
  rooms: ChatRoom[]
}>()

const chatStore = useChatStore()

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="h-full overflow-y-auto">
    <!-- 검색 -->
    <div class="p-3">
      <input
        type="text"
        placeholder="검색..."
        class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>

    <!-- 채팅방 목록 -->
    <div class="divide-y divide-slate-100">
      <button
        v-for="room in rooms"
        :key="room.id"
        @click="chatStore.selectRoom(room)"
        class="w-full p-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div class="flex items-start gap-3">
          <!-- 아바타 -->
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            :class="room.type === 'direct' ? 'bg-primary-100 text-primary-600' : 'bg-green-100 text-green-600'"
          >
            <svg v-if="room.type === 'direct'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>

          <!-- 내용 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span class="font-medium text-slate-800 truncate">{{ room.name }}</span>
              <span v-if="room.lastMessage" class="text-xs text-slate-400">
                {{ formatTime(room.lastMessage.timestamp) }}
              </span>
            </div>
            <p v-if="room.lastMessage" class="text-sm text-slate-500 truncate mt-0.5">
              {{ room.lastMessage.content }}
            </p>
          </div>

          <!-- 읽지 않은 메시지 뱃지 -->
          <span
            v-if="room.unreadCount > 0"
            class="w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0"
          >
            {{ room.unreadCount }}
          </span>
        </div>
      </button>
    </div>

    <!-- 빈 상태 -->
    <div v-if="rooms.length === 0" class="p-8 text-center text-slate-400">
      채팅방이 없습니다
    </div>

    <!-- 하단 버튼 -->
    <div class="p-3 border-t border-slate-200">
      <button class="w-full py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
        + 새 채팅 시작
      </button>
    </div>
  </div>
</template>
