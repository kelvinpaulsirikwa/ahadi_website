<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import WebNavbar from '@/components/WebNavbar.vue'
import { fetchMyTransactions } from '@/api/payments'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const transactions = ref<Record<string, unknown>[]>([])

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetchMyTransactions() as { results?: Record<string, unknown>[] } | Record<string, unknown>[]
    const list = Array.isArray(res) ? res : (res?.results ?? [])
    transactions.value = Array.isArray(list) ? list : []
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load transactions'
    transactions.value = []
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
  <div class="transactions-page">
    <WebNavbar />
    <main class="transactions-main">
      <header class="transactions-header">
        <button type="button" class="btn-back" aria-label="Back to profile" @click="goBack">← Back</button>
        <h1 class="transactions-title">Transaction History</h1>
      </header>

      <div v-if="loading" class="state">Loading…</div>
      <div v-else-if="error" class="state state-error">
        <p>{{ error }}</p>
        <button type="button" class="btn-retry" @click="load">Retry</button>
      </div>
      <template v-else>
        <p v-if="!transactions.length" class="muted">No transactions yet.</p>
        <ul v-else class="tx-list">
          <li v-for="(tx, i) in transactions" :key="i" class="tx-item">
            <div class="tx-main">
              <span class="tx-amount">{{ (tx.amount ?? 0).toLocaleString() }} {{ tx.currency ?? 'TZS' }}</span>
              <span class="tx-ref">{{ tx.reference ?? tx.external_id ?? '—' }}</span>
            </div>
            <span class="tx-status" :class="(tx.status as string)?.toLowerCase()">{{ (tx.status as string) ?? '—' }}</span>
          </li>
        </ul>
      </template>
    </main>
  </div>
</template>

<style scoped>
.transactions-page { min-height: 100vh; background: #f8fafc; }
.transactions-main { max-width: 560px; margin: 0 auto; padding: 24px 16px; }
.transactions-header { margin-bottom: 24px; }
.btn-back { background: none; border: none; color: #64748b; cursor: pointer; font-size: 14px; padding: 0; margin-bottom: 8px; }
.btn-back:hover { color: #1e293b; }
.transactions-title { font-size: 24px; font-weight: 700; color: #1e293b; margin: 0; }
.state { text-align: center; padding: 48px; color: #64748b; }
.state-error { color: #dc2626; }
.btn-retry { margin-top: 12px; padding: 8px 16px; font-size: 14px; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; }
.muted { color: #94a3b8; font-size: 14px; margin: 0; }
.tx-list { list-style: none; padding: 0; margin: 0; }
.tx-item { display: flex; justify-content: space-between; align-items: center; padding: 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 8px; }
.tx-main { display: flex; flex-direction: column; gap: 4px; }
.tx-amount { font-weight: 600; color: #1e293b; }
.tx-ref { font-size: 12px; color: #64748b; }
.tx-status { font-size: 12px; font-weight: 500; text-transform: uppercase; }
.tx-status.success { color: #16a34a; }
.tx-status.pending { color: #d97706; }
.tx-status.failed { color: #dc2626; }
</style>
