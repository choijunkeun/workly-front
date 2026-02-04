<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SideBar from '@/components/common/SideBar.vue'
import TopHeader from '@/components/common/TopHeader.vue'
import ChatButton from '@/components/chat/ChatButton.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- 상단 헤더 -->
    <TopHeader
      :user="authStore.user"
      @logout="handleLogout"
    />

    <div class="flex">
      <!-- 사이드바 -->
      <SideBar />

      <!-- 메인 콘텐츠 -->
      <main
        class="flex-1 p-8"
        style="margin-top: 64px; margin-left: 80px;"
      >
        <router-view />
      </main>
    </div>

    <!-- 채팅 버튼 & 패널 -->
    <ChatButton />
    <ChatPanel />
  </div>
</template>
