<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const messageInput = ref('')

function sendMessage() {
  if (!messageInput.value.trim()) return
  chatStore.sendMessage(messageInput.value)
  messageInput.value = ''
}

function goBack() {
  chatStore.currentRoom = null
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 헤더 -->
    <div class="flex items-center gap-3 p-3 border-b border-slate-200">
      <button @click="goBack" class="p-1 hover:bg-slate-100 rounded">
        <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="font-medium text-slate-800">{{ chatStore.currentRoom?.name }}</span>
    </div>

    <!-- 메시지 목록 -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
        v-for="message in chatStore.messages"
        :key="message.id"
        class="flex"
        :class="message.senderId === 1 ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[70%] px-3 py-2 rounded-lg"
          :class="message.senderId === 1 ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-800'"
        >
          <p class="text-sm">{{ message.content }}</p>
          <span
            class="text-xs mt-1 block"
            :class="message.senderId === 1 ? 'text-primary-200' : 'text-slate-400'"
          >
            {{ formatTime(message.timestamp) }}
          </span>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-if="chatStore.messages.length === 0" class="h-full flex items-center justify-center text-slate-400">
        메시지를 시작하세요
      </div>
    </div>

    <!-- 입력 -->
    <div class="p-3 border-t border-slate-200">
      <div class="flex gap-2">
        <button class="p-2 hover:bg-slate-100 rounded-lg">
          <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          v-model="messageInput"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="메시지 입력..."
          class="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          @click="sendMessage"
          class="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
