<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import WebNavbar from '@/components/WebNavbar.vue'
import { fetchSubscriptionPlans, fetchMySubscription } from '@/api/payments'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const plans = ref<Record<string, unknown>[]>([])
const currentSubscription = ref<Record<string, unknown> | null>(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [plansRes, myRes] = await Promise.all([
      fetchSubscriptionPlans() as Promise<{ plans?: Record<string, unknown>[] }>,
      fetchMySubscription() as Promise<{ subscription?: Record<string, unknown>; has_subscription?: boolean }>,
    ])
    plans.value = plansRes?.plans ?? []
    const sub = myRes?.subscription ?? (myRes?.has_subscription ? myRes : null)
    currentSubscription.value = sub && typeof sub === 'object' ? sub as Record<string, unknown> : null
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load plans'
    plans.value = []
    currentSubscription.value = null
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push({ name: 'profile' })
}

onMounted(load)
</script>

<template>
  <div class="subscriptions-page">
    <WebNavbar />
    <main class="subscriptions-main">
      <header class="subscriptions-header">
        <button type="button" class="btn-back" aria-label="Back to profile" @click="goBack">← Back</button>
        <h1 class="subscriptions-title">Subscription Plans</h1>
      </header>

      <div v-if="loading" class="state">Loading…</div>
      <div v-else-if="error" class="state state-error">
        <p>{{ error }}</p>
        <button type="button" class="btn-retry" @click="load">Retry</button>
      </div>
      <template v-else>
        <section v-if="currentSubscription" class="card current-card">
          <h2 class="card-title">Current plan</h2>
          <p class="plan-name">{{ (currentSubscription.plan_name ?? currentSubscription.plan ?? 'Free') }}</p>
        </section>
        <section class="card">
          <h2 class="card-title">Choose a plan</h2>
          <p v-if="!plans.length" class="muted">No plans available.</p>
          <ul v-else class="plan-list">
            <li v-for="(plan, i) in plans" :key="i" class="plan-item">
              <span class="plan-item-name">{{ (plan.name ?? plan.plan_type ?? 'Plan') }}</span>
              <span class="plan-item-price">{{ plan.monthly_price ?? plan.price ?? '—' }} / month</span>
            </li>
          </ul>
          <p class="muted small">Payment via mobile money (M-Pesa, Airtel, Tigo, Halotel) can be completed from the app.</p>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.subscriptions-page { min-height: 100vh; background: #f8fafc; }
.subscriptions-main { max-width: 560px; margin: 0 auto; padding: 24px 16px; }
.subscriptions-header { margin-bottom: 24px; }
.btn-back { background: none; border: none; color: #64748b; cursor: pointer; font-size: 14px; padding: 0; margin-bottom: 8px; }
.btn-back:hover { color: #1e293b; }
.subscriptions-title { font-size: 24px; font-weight: 700; color: #1e293b; margin: 0; }
.state { text-align: center; padding: 48px; color: #64748b; }
.state-error { color: #dc2626; }
.btn-retry { margin-top: 12px; padding: 8px 16px; font-size: 14px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; }
.card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 16px; }
.current-card { border-color: rgba(26, 40, 59, 0.3); }
.card-title { font-size: 18px; font-weight: 700; margin: 0 0 12px; }
.plan-name { font-size: 20px; font-weight: 600; color: #1a283b; margin: 0; }
.plan-list { list-style: none; padding: 0; margin: 0; }
.plan-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.plan-item:last-child { border-bottom: none; }
.plan-item-name { font-weight: 500; color: #1e293b; }
.plan-item-price { color: #64748b; font-size: 14px; }
.muted { color: #94a3b8; font-size: 14px; margin: 12px 0 0; }
.small { font-size: 12px; }
</style>
