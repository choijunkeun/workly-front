<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import ChatRoomList from './ChatRoomList.vue'
import ChatRoom from './ChatRoom.vue'

const chatStore = useChatStore()
const activeTab = ref<'direct' | 'group'>('direct')

onMounted(() => {
  chatStore.loadRooms()
})
</script>

<template>
  <Transition name="slide">
    <div
      v-if="chatStore.isOpen"
      class="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col z-50"
    >
      <!-- 헤더 -->
      <div class="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 class="font-semibold text-slate-800">채팅</h3>
        <div class="flex gap-2">
          <button
            @click="chatStore.closeChat"
            class="p-1 hover:bg-slate-100 rounded"
          >
            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 탭 -->
      <div v-if="!chatStore.currentRoom" class="flex border-b border-slate-200">
        <button
          @click="activeTab = 'direct'"
          class="flex-1 py-2 text-sm font-medium transition-colors"
          :class="activeTab === 'direct' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500'"
        >
          1:1 채팅
        </button>
        <button
          @click="activeTab = 'group'"
          class="flex-1 py-2 text-sm font-medium transition-colors"
          :class="activeTab === 'group' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500'"
        >
          단체 채팅
        </button>
      </div>

      <!-- 채팅방 목록 또는 채팅방 -->
      <div class="flex-1 overflow-hidden">
        <ChatRoom v-if="chatStore.currentRoom" />
        <ChatRoomList v-else :rooms="activeTab === 'direct' ? chatStore.directRooms : chatStore.groupRooms" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
