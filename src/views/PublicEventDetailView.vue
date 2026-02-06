<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WebNavbar from '@/components/WebNavbar.vue'
import { assetUrl } from '@/api/client'
import { fetchEventById } from '@/api/event'
import ContributeDialog from '@/components/ContributeDialog.vue'
import JoinDialog from '@/components/JoinDialog.vue'
import type { PublicEvent } from '@/types/events'

const route = useRoute()
const router = useRouter()

const event = ref<PublicEvent | null>(null)
const loading = ref(true)
const error = ref<Error | null>(null)
const showContributeDialog = ref(false)
const showJoinDialog = ref(false)

const eventId = computed(() => {
  const id = route.params.id
  if (typeof id !== 'string') return 0
  const n = Number(id)
  return Number.isFinite(n) && n > 0 ? n : 0
})

async function loadEvent() {
  if (!eventId.value) return
  try {
    event.value = await fetchEventById(eventId.value) as PublicEvent
    error.value = null
  } catch (e) {
    error.value = e instanceof Error ? e : new Error('Failed to load event')
    event.value = null
  }
}

async function load() {
  if (!eventId.value) {
    loading.value = false
    return
  }
  loading.value = true
  error.value = null
  await loadEvent()
  loading.value = false
}

onMounted(() => load())
watch(() => route.params.id, () => load())

const coverImageUrl = computed(() => {
  const raw = event.value?.cover_image
  return raw ? assetUrl(raw) : ''
})

const startDate = computed(() => {
  const s = event.value?.start_date
  if (!s) return null
  try {
    return new Date(s)
  } catch {
    return null
  }
})

const formattedStartDate = computed(() => {
  const d = startDate.value
  if (!d) return ''
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const participantCount = computed(() => {
  const n = event.value?.participant_count
  if (n === undefined || n === null || n === '') return 0
  const num = Number(n)
  return Number.isFinite(num) ? num : 0
})

const contributionTarget = computed(() => {
  const t = event.value?.contribution_target
  if (t === undefined || t === null || t === '') return 0
  const num = Number(t)
  return Number.isFinite(num) && num > 0 ? num : 0
})

const totalContributions = computed(() => {
  const t = event.value?.total_contributions
  if (t === undefined || t === null || t === '') return 0
  const num = Number(t)
  return Number.isFinite(num) ? num : 0
})

const progressPercent = computed(() => {
  const target = contributionTarget.value
  if (target <= 0) return 0
  return Math.min(100, Math.round((totalContributions.value / target) * 100))
})

const currency = computed(() => event.value?.currency || 'TZS')

function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString()
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'home' })
  }
}

function openContribute() {
  showContributeDialog.value = true
}

function openJoin() {
  showJoinDialog.value = true
}

function shareEvent() {
  const ev = event.value
  if (!ev) return
  const text = `You're invited to "${ev.title}"!\nJoin using code: ${ev.join_code || ''}\n\nPowered by Ahadi - Event Contributions Made Easy`
  const url = window.location.href
  if (navigator.share) {
    navigator.share({
      title: ev.title,
      text,
      url,
    }).catch(() => {
      copyShareToClipboard(text, url)
    })
  } else {
    copyShareToClipboard(text, url)
  }
}

function copyShareToClipboard(text: string, url: string) {
  const full = `${text}\n${url}`
  navigator.clipboard.writeText(full).then(() => {
    // Could show a small toast
  }).catch(() => {})
}
</script>

<template>
  <div class="public-event-page">
    <WebNavbar />

    <main class="public-event-main">
      <div v-if="loading && !event" class="state state-loading">
        <div class="loader" aria-hidden="true" />
        <p>Loading event…</p>
      </div>

      <div v-else-if="error" class="state state-error">
        <p class="error-message">{{ error.message }}</p>
        <button type="button" class="btn-back" @click="goBack">Go back</button>
      </div>

      <template v-else-if="event">
        <button type="button" class="back-link" aria-label="Go back" @click="goBack">
          <span class="back-icon" aria-hidden="true">←</span>
          Back
        </button>

        <!-- Cover -->
        <div class="cover-wrap">
          <img
            v-if="coverImageUrl"
            :src="coverImageUrl"
            :alt="event.title"
            class="cover-image"
            @error="($event.target as HTMLImageElement)?.classList?.add('img-error')"
          />
          <div v-else class="cover-placeholder">
            <span>No image</span>
          </div>
          <div class="cover-badges">
            <span v-if="event.event_type_name" class="badge-type">{{ event.event_type_name }}</span>
          </div>
        </div>

        <!-- Content -->
        <div class="content-wrap">
          <h1 class="page-title">{{ event.title }}</h1>
          <p v-if="event.description" class="page-description">{{ event.description }}</p>

          <!-- Details -->
          <div class="details-block">
            <div v-if="formattedStartDate" class="detail-item">
              <span class="detail-icon">📅</span>
              <span>{{ formattedStartDate }}</span>
            </div>
            <div v-if="event.location" class="detail-item">
              <span class="detail-icon">📍</span>
              <span>{{ event.location }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">👥</span>
              <span>{{ participantCount }} participating</span>
            </div>
          </div>

          <!-- Progress -->
          <div v-if="contributionTarget > 0" class="progress-block">
            <div class="progress-header">
              <span class="progress-title">Progress</span>
              <span class="progress-percent">{{ progressPercent }}%</span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }" />
            </div>
            <div class="progress-amounts">
              <span class="progress-current">{{ currency }}{{ formatAmount(totalContributions) }}</span>
              <span class="progress-of">of {{ currency }}{{ formatAmount(contributionTarget) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions-row">
            <button type="button" class="btn btn-contribute" @click="openContribute">
              <span class="btn-icon">❤️</span>
              Contribute
            </button>
            <button type="button" class="btn btn-join" @click="openJoin">
              <span class="btn-icon">👤</span>
              Join
            </button>
            <button type="button" class="btn btn-share" @click="shareEvent">
              <span class="btn-icon">📤</span>
              Share Event
            </button>
          </div>
        </div>
      </template>
    </main>

    <ContributeDialog
      :event="event"
      :open="showContributeDialog"
      @close="showContributeDialog = false"
      @success="showContributeDialog = false"
    />
    <JoinDialog
      :event="event"
      :open="showJoinDialog"
      @close="showJoinDialog = false"
      @success="showJoinDialog = false"
    />
  </div>
</template>

<style scoped>
.public-event-page {
  min-height: 100vh;
  background: #f5f2ed;
}

.public-event-main {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 24px 48px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 8px 0;
  background: none;
  border: none;
  font-size: 1rem;
  color: #374151;
  cursor: pointer;
  font-family: inherit;
}

.back-link:hover {
  color: #111827;
}

.back-icon {
  font-size: 1.25rem;
}

.cover-wrap {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  aspect-ratio: 16 / 9;
  background: #e5e7eb;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-image.img-error {
  display: none;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 1rem;
}

.cover-badges {
  position: absolute;
  top: 12px;
  right: 12px;
}

.badge-type {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.content-wrap {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.page-title {
  margin: 0 0 12px;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a2e;
}

.page-description {
  margin: 0 0 20px;
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
}

.details-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9375rem;
  color: #374151;
}

.detail-icon {
  font-size: 1.125rem;
}

.progress-block {
  margin-bottom: 28px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #374151;
}

.progress-percent {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #16a34a;
}

.progress-bar-wrap {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar-fill {
  height: 100%;
  background: #16a34a;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-amounts {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-current {
  font-weight: 600;
  color: #111827;
}

.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.actions-row .btn {
  flex: 1;
  min-width: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

.btn-contribute {
  background: #22c55e;
  color: #fff;
}

.btn-contribute:hover {
  background: #16a34a;
}

.btn-join {
  background: #1a283b;
  color: #fff;
}

.btn-join:hover {
  background: #2d3a4f;
}

.btn-share {
  background: #fff;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-share:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-icon {
  font-size: 1.125rem;
}

/* States */
.state {
  text-align: center;
  padding: 48px 24px;
}

.state-loading .loader {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.state-loading p,
.state-error p {
  margin: 0;
  font-size: 1rem;
  color: #6b7280;
}

.state-error .error-message {
  color: #dc2626;
  margin-bottom: 16px;
}

.btn-back {
  padding: 10px 20px;
  background: #1a283b;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
