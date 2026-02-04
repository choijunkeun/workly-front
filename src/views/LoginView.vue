<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-vue-next'
import Card from '@/components/ui/card.vue'
import CardHeader from '@/components/ui/card-header.vue'
import CardContent from '@/components/ui/card-content.vue'
import CardTitle from '@/components/ui/card-title.vue'
import CardDescription from '@/components/ui/card-description.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Label from '@/components/ui/label.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')
const showPassword = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = '이메일과 비밀번호를 입력해주세요.'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = '로그인에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- 왼쪽: 브랜딩 영역 -->
    <div class="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
      <!-- 배경 패턴 -->
      <div class="absolute inset-0">
        <div class="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div class="absolute top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <!-- 컨텐츠 -->
      <div class="relative z-10 flex flex-col justify-center items-center w-full p-12">
        <div class="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-8">
          <CheckCircle class="w-8 h-8 text-white" />
        </div>
        <h2 class="text-4xl font-bold text-white mb-4 text-center">
          주간업무 관리
        </h2>
        <p class="text-lg text-white/70 text-center max-w-md leading-relaxed">
          팀의 주간 업무를 체계적으로 관리하고<br/>
          진척도를 한눈에 파악하세요
        </p>

        <!-- Features -->
        <div class="mt-12 space-y-4 text-white/80">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle class="w-4 h-4" />
            </div>
            <span>주간 보고서 작성 및 관리</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle class="w-4 h-4" />
            </div>
            <span>실시간 업무 진척도 확인</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle class="w-4 h-4" />
            </div>
            <span>팀원간 실시간 채팅</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 오른쪽: 로그인 폼 -->
    <div class="flex-1 flex items-center justify-center p-8 bg-muted/30">
      <div class="w-full max-w-[400px]">
        <!-- 모바일 로고 -->
        <div class="lg:hidden flex justify-center mb-8">
          <div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <CheckCircle class="w-6 h-6 text-white" />
          </div>
        </div>

        <Card class="border-0 shadow-lg">
          <CardHeader class="space-y-1 pb-4">
            <CardTitle class="text-2xl font-bold text-center">
              로그인
            </CardTitle>
            <CardDescription class="text-center">
              계정에 로그인하여 업무를 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <!-- 에러 메시지 -->
            <div
              v-if="error"
              class="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm text-destructive"
            >
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ error }}
            </div>

            <form @submit.prevent="handleLogin" class="space-y-4">
              <!-- 이메일 -->
              <div class="space-y-2">
                <Label for="email">이메일</Label>
                <div class="relative">
                  <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    v-model="email"
                    type="email"
                    placeholder="name@company.com"
                    class="pl-10"
                  />
                </div>
              </div>

              <!-- 비밀번호 -->
              <div class="space-y-2">
                <Label for="password">비밀번호</Label>
                <div class="relative">
                  <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="비밀번호를 입력하세요"
                    class="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <EyeOff v-if="showPassword" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- 옵션 -->
              <div class="flex items-center justify-between text-sm">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    class="w-4 h-4 rounded border-input text-primary focus:ring-primary/20"
                  />
                  <span class="text-muted-foreground">로그인 상태 유지</span>
                </label>
                <a href="#" class="text-primary hover:underline">
                  비밀번호 찾기
                </a>
              </div>

              <!-- 로그인 버튼 -->
              <Button
                type="submit"
                :loading="isLoading"
                :disabled="isLoading"
                class="w-full h-11"
              >
                <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
                {{ isLoading ? '로그인 중...' : '로그인' }}
              </Button>
            </form>

            <!-- 회원가입 -->
            <p class="mt-6 text-center text-sm text-muted-foreground">
              아직 계정이 없으신가요?
              <a href="#" class="text-primary font-medium hover:underline">
                회원가입
              </a>
            </p>
          </CardContent>
        </Card>

        <p class="mt-6 text-center text-xs text-muted-foreground">
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  </div>
</template>
