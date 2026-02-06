import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/views/SignupView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue')
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/ReportsView.vue')
      },
      {
        path: 'reports/new',
        name: 'NewReport',
        component: () => import('@/views/ReportEditView.vue')
      },
      {
        path: 'reports/:id/edit',
        name: 'EditReport',
        component: () => import('@/views/ReportEditView.vue')
      },
      {
        path: 'my-progress',
        name: 'MyProgress',
        component: () => import('@/views/MyProgressView.vue')
      },
      {
        path: 'team-progress',
        name: 'TeamProgress',
        component: () => import('@/views/TeamProgressView.vue')
      },
      {
        path: 'systems',
        name: 'Systems',
        component: () => import('@/views/SystemView.vue')
      },
      {
        path: 'admin',
        meta: { requiresAdmin: true },
        children: [
          { path: '', redirect: '/admin/members' },
          {
            path: 'members',
            name: 'AdminMembers',
            component: () => import('@/views/admin/AdminMembersView.vue')
          },
          {
            path: 'companies',
            name: 'AdminCompanies',
            component: () => import('@/views/admin/AdminCompaniesView.vue')
          },
          {
            path: 'systems',
            name: 'AdminSystems',
            component: () => import('@/views/admin/AdminSystemsView.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 인증 가드
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('accessToken')
  const memberStr = localStorage.getItem('member')
  const member = memberStr ? JSON.parse(memberStr) : null

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/signup') && isAuthenticated) {
    next('/')
  } else if (to.meta.requiresAdmin && member?.role !== 'admin') {
    // 관리자 권한이 필요한 페이지에 접근 시 권한 체크
    next('/')
  } else {
    next()
  }
})

export default router
