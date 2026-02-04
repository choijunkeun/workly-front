<script setup lang="ts">
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
</script>

<template>
  <button
    @click="chatStore.toggleChat"
    class="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 transition-colors z-50"
  >
    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
    <!-- 읽지 않은 메시지 뱃지 -->
    <span
      v-if="chatStore.totalUnread > 0"
      class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
    >
      {{ chatStore.totalUnread > 9 ? '9+' : chatStore.totalUnread }}
    </span>
  </button>
</template>
