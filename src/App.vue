<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Toast from '@/components/ui/toast.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.loadUser()
})
</script>

<template>
  <router-view />
  <Toast />
</template>
