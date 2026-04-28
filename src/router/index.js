import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '@/views/LandingView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import HomeView from '@/views/HomeView.vue'
import AppDashboardLayout from '@/layouts/AppDashboardLayout.vue'
import AppHomeView from '@/views/AppHomeView.vue'
import AppEventsView from '@/views/AppEventsView.vue'
import AppEventNewView from '@/views/AppEventNewView.vue'
import AppEventSettingsView from '@/views/AppEventSettingsView.vue'
import AppEventSheetView from '@/views/AppEventSheetView.vue'
import AppEventPublishView from '@/views/AppEventPublishView.vue'
import AppEventQrCardsView from '@/views/AppEventQrCardsView.vue'
import AppEventCheckinsView from '@/views/AppEventCheckinsView.vue'
import AppHelpView from '@/views/AppHelpView.vue'
import ReceptionScanView from '@/views/ReceptionScanView.vue'
import ReceptionHostView from '@/views/ReceptionHostView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guestOnly: true },
    },
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: ForgotPasswordView,
      meta: { guestOnly: true },
    },
    {
      path: '/e/:eventSlug',
      name: 'publicEvent',
      component: HomeView,
    },
    {
      path: '/reception/scan/:token',
      name: 'receptionScan',
      component: ReceptionScanView,
    },
    {
      path: '/reception/host/:token',
      name: 'receptionHost',
      component: ReceptionHostView,
    },
    {
      path: '/app',
      component: AppDashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'appHome',
          component: AppHomeView,
        },
        {
          path: 'events',
          name: 'appEvents',
          component: AppEventsView,
        },
        {
          path: 'events/new',
          name: 'appEventNew',
          component: AppEventNewView,
        },
        {
          path: 'events/:eventSlug/settings',
          name: 'appEventSettings',
          component: AppEventSettingsView,
        },
        {
          path: 'events/:eventSlug/sheet',
          name: 'appEventSheet',
          component: AppEventSheetView,
        },
        {
          path: 'events/:eventSlug/publish',
          name: 'appEventPublish',
          component: AppEventPublishView,
        },
        {
          path: 'events/:eventSlug/qrcards',
          name: 'appEventQrCards',
          component: AppEventQrCardsView,
        },
        {
          path: 'events/:eventSlug/checkins',
          name: 'appEventCheckins',
          component: AppEventCheckinsView,
        },
        {
          path: 'help',
          name: 'appHelp',
          component: AppHelpView,
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { path: '/app' }
  }

  return true
})

export default router
