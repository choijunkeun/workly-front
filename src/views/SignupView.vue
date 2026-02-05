<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { User, Lock, Eye, EyeOff, Loader2, CheckCircle, IdCard } from 'lucide-vue-next'
import type { MemberType } from '@/types'
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
const toastStore = useToastStore()

const knoxId = ref('')
const name = ref('')
const password = ref('')
const passwordConfirm = ref('')
const memberType = ref<MemberType>('employee')
const isLoading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

async function handleSignup() {
  if (!knoxId.value || !name.value || !password.value || !passwordConfirm.value) {
    error.value = '모든 필드를 입력해주세요.'
    return
  }

  if (password.value !== passwordConfirm.value) {
    error.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  if (password.value.length < 4) {
    error.value = '비밀번호는 4자 이상이어야 합니다.'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await authStore.signup({
      knoxId: knoxId.value,
      name: name.value,
      password: password.value,
      type: memberType.value
    })
    toastStore.success('회원가입이 완료되었습니다. 관리자 승인 후 로그인 가능합니다.', 5000)
    router.push('/login')
  } catch (e) {
    error.value = '회원가입에 실패했습니다.'
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

    <!-- 오른쪽: 회원가입 폼 -->
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
              회원가입
            </CardTitle>
            <CardDescription class="text-center">
              계정을 생성하여 서비스를 시작하세요
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

            <form @submit.prevent="handleSignup" class="space-y-4">
              <!-- Knox ID -->
              <div class="space-y-2">
                <Label for="knoxId">Knox ID</Label>
                <div class="relative">
                  <IdCard class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="knoxId"
                    v-model="knoxId"
                    type="text"
                    placeholder="Knox ID를 입력하세요"
                    class="pl-10"
                  />
                </div>
              </div>

              <!-- 이름 -->
              <div class="space-y-2">
                <Label for="name">이름</Label>
                <div class="relative">
                  <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    v-model="name"
                    type="text"
                    placeholder="이름을 입력하세요"
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

              <!-- 비밀번호 확인 -->
              <div class="space-y-2">
                <Label for="passwordConfirm">비밀번호 확인</Label>
                <div class="relative">
                  <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="passwordConfirm"
                    v-model="passwordConfirm"
                    :type="showPasswordConfirm ? 'text' : 'password'"
                    placeholder="비밀번호를 다시 입력하세요"
                    class="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    @click="showPasswordConfirm = !showPasswordConfirm"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <EyeOff v-if="showPasswordConfirm" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- 사용자 타입 -->
              <div class="space-y-2">
                <Label>사용자 유형</Label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    @click="memberType = 'employee'"
                    :class="[
                      'p-3 rounded-lg border-2 text-sm font-medium transition-all',
                      memberType === 'employee'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-input hover:border-primary/50 text-muted-foreground'
                    ]"
                  >
                    임직원
                  </button>
                  <button
                    type="button"
                    @click="memberType = 'partner'"
                    :class="[
                      'p-3 rounded-lg border-2 text-sm font-medium transition-all',
                      memberType === 'partner'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-input hover:border-primary/50 text-muted-foreground'
                    ]"
                  >
                    협력직
                  </button>
                </div>
              </div>

              <!-- 회원가입 버튼 -->
              <Button
                type="submit"
                :loading="isLoading"
                :disabled="isLoading"
                class="w-full h-11"
              >
                <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
                {{ isLoading ? '가입 중...' : '회원가입' }}
              </Button>
            </form>

            <!-- 로그인 링크 -->
            <p class="mt-6 text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?
              <router-link to="/login" class="text-primary font-medium hover:underline">
                로그인
              </router-link>
            </p>
          </CardContent>
        </Card>

        <p class="mt-6 text-center text-xs text-muted-foreground">
          회원가입 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  </div>
</template>
