<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { assetUrl } from '@/api/client'
import ContributeDialog from '@/components/ContributeDialog.vue'
import JoinDialog from '@/components/JoinDialog.vue'
import type { PublicEvent } from '@/types/events'

const props = defineProps<{
  event: PublicEvent | null
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const coverImageUrl = computed(() => {
  const raw = props.event?.cover_image
  return raw ? assetUrl(raw) : ''
})

const startDate = computed(() => {
  const s = props.event?.start_date
  if (!s) return null
  try {
    return new Date(s)
  } catch {
    return null
  }
})

const endDate = computed(() => {
  const s = props.event?.end_date
  if (!s) return null
  try {
    return new Date(s)
  } catch {
    return null
  }
})

const dateDay = computed(() => {
  const d = startDate.value
  return d ? d.getDate() : '—'
})

const dateMonth = computed(() => {
  const d = startDate.value
  if (!d) return '—'
  return d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
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

const formattedEndDate = computed(() => {
  const d = endDate.value
  if (!d) return ''
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const participantCount = computed(() => {
  const n = props.event?.participant_count
  if (n === undefined || n === null || n === '') return 0
  const num = Number(n)
  return Number.isFinite(num) ? num : 0
})

const contributionTarget = computed(() => {
  const t = props.event?.contribution_target
  if (t === undefined || t === null || t === '') return 0
  const num = Number(t)
  return Number.isFinite(num) && num > 0 ? num : 0
})

const totalContributions = computed(() => {
  const t = props.event?.total_contributions
  if (t === undefined || t === null || t === '') return 0
  const num = Number(t)
  return Number.isFinite(num) ? num : 0
})

const progressPercent = computed(() => {
  const target = contributionTarget.value
  if (target <= 0) return 0
  const total = totalContributions.value
  return Math.min(100, Math.round((total / target) * 100))
})

const currency = computed(() => props.event?.currency || '')

function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString()
}

const formattedTotal = computed(() => formatAmount(totalContributions.value))
const formattedTarget = computed(() => formatAmount(contributionTarget.value))

function onBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement)?.classList?.contains('modal-backdrop')) {
    emit('close')
  }
}

function onClose() {
  emit('close')
}

const showContributeDialog = ref(false)
const showJoinDialog = ref(false)

function openContribute() {
  showContributeDialog.value = true
}

function openJoin() {
  showJoinDialog.value = true
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    } else {
      document.removeEventListener('keydown', handleEscape)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open && event"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        @click="onBackdropClick"
      >
        <div class="modal-box" @click.stop>
          <button
            type="button"
            class="modal-close"
            aria-label="Close"
            @click="onClose"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>

          <div class="modal-content">
            <!-- Image -->
            <div class="modal-image-wrap">
              <img
                v-if="coverImageUrl"
                :src="coverImageUrl"
                :alt="event.title"
                class="modal-image"
                @error="($event.target as HTMLImageElement)?.classList?.add('img-error')"
              />
              <div v-else class="modal-image modal-image-placeholder">
                <span class="placeholder-text">No image</span>
              </div>
              <div class="modal-badges">
                <div class="modal-badge-date">
                  <span class="date-day">{{ dateDay }}</span>
                  <span class="date-month">{{ dateMonth }}</span>
                </div>
                <div v-if="event.event_type_name" class="modal-badge-type">
                  {{ event.event_type_name }}
                </div>
              </div>
            </div>

            <!-- Body -->
            <div class="modal-body">
              <h2 id="event-modal-title" class="modal-title">{{ event.title }}</h2>

              <div v-if="event.description" class="modal-description">
                {{ event.description }}
              </div>

              <!-- Event details: Date, Location, Participants -->
              <div class="modal-details">
                <div v-if="formattedStartDate" class="detail-item">
                  <span class="detail-icon-wrap" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  </span>
                  <div class="detail-text">
                    <div class="detail-label">Date</div>
                    <div class="detail-value">{{ formattedStartDate }}</div>
                  </div>
                </div>
                <div class="detail-item">
                  <span class="detail-icon-wrap" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <div class="detail-text">
                    <div class="detail-label">Location</div>
                    <div class="detail-value">{{ event.location || 'Online' }}</div>
                  </div>
                </div>
                <div class="detail-item">
                  <span class="detail-icon-wrap" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  <div class="detail-text">
                    <div class="detail-label">Participants</div>
                    <div class="detail-value">{{ participantCount }} participating</div>
                  </div>
                </div>
              </div>

              <!-- Progress block -->
              <div v-if="contributionTarget > 0" class="progress-block">
                <div class="progress-header">
                  <span class="progress-title">Progress</span>
                  <span class="progress-percent">{{ progressPercent }}%</span>
                </div>
                <div class="progress-bar-wrap">
                  <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }" />
                </div>
                <div class="progress-amounts">
                  <span class="progress-current">{{ currency }}{{ formattedTotal }}</span>
                  <span class="progress-of">of {{ currency }}{{ formattedTarget }}</span>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="modal-actions">
                <button type="button" class="btn btn-contribute" @click="openContribute">
                  <span class="btn-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </span>
                  Contribute
                </button>
                <button type="button" class="btn btn-join" @click="openJoin">
                  <span class="btn-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" x2="19" y1="8" y2="14" />
                      <line x1="22" x2="16" y1="11" y2="11" />
                    </svg>
                  </span>
                  Join
                </button>
                <a href="#" class="btn btn-share">
                  <span class="btn-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" x2="15.41" y1="13.51" y2="17.49" />
                      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                    </svg>
                  </span>
                  Share Event
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

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
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-box {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - 32px);
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: auto;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #374151;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: background 0.2s, transform 0.2s;
}

.modal-close:hover {
  background: #fff;
  transform: scale(1.05);
}

.modal-content {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.modal-image-wrap {
  position: relative;
  width: 100%;
  height: 220px;
  flex-shrink: 0;
  background: #f3f4f6;
}

@media (min-width: 480px) {
  .modal-image-wrap {
    height: 260px;
  }
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.modal-image.img-error {
  object-fit: none;
  background: #e5e7eb;
}

.modal-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
}

.placeholder-text {
  font-size: 14px;
  color: #9ca3af;
}

.modal-badges {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
}

.modal-badge-date {
  padding: 8px 12px;
  background: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-badge-date .date-day {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.modal-badge-date .date-month {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.modal-badge-type {
  padding: 6px 12px;
  background: #1a283b;
  color: #fff;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.modal-body {
  padding: 24px 20px 32px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

@media (min-width: 480px) {
  .modal-body {
    padding: 28px 24px 36px;
  }
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 12px;
  line-height: 1.3;
}

@media (min-width: 480px) {
  .modal-title {
    font-size: 24px;
  }
}

.modal-description {
  font-size: 15px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 20px;
  white-space: pre-wrap;
}

/* Event details: Date, Location, Participants */
.modal-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 0 20px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-icon-wrap {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 2px;
}

.detail-value {
  font-size: 14px;
  color: #374151;
  margin: 0;
  line-height: 1.4;
}

.detail-text {
  min-width: 0;
}

.detail-item .detail-label,
.detail-item .detail-value {
  display: block;
}

/* Progress block */
.progress-block {
  background: #f3f4f6;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.progress-percent {
  font-size: 14px;
  font-weight: 600;
  color: #1a283b;
}

.progress-bar-wrap {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar-fill {
  height: 100%;
  background: #1a283b;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-amounts {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #6b7280;
}

.progress-current {
  font-weight: 600;
  color: #374151;
}

/* Action buttons */
.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-actions .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
  box-sizing: border-box;
  border: 2px solid transparent;
  cursor: pointer;
  font-family: inherit;
}

.btn-contribute {
  width: 100%;
  background: #22c55e;
  color: #fff;
}

.btn-contribute:hover {
  background: #16a34a;
}

.btn-join {
  width: 100%;
  background: #1a283b;
  color: #fff;
}

.btn-join:hover {
  background: #2d3a4f;
}

.modal-actions .btn-join {
  margin-top: 0;
}

.btn-share {
  width: 100%;
  background: #fff;
  color: #374151;
  border-color: #e5e7eb;
}

.btn-share:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 400px) {
  .modal-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .modal-actions .btn-contribute,
  .modal-actions .btn-join {
    flex: 1;
    min-width: 0;
  }

  .modal-actions .btn-share {
    width: 100%;
  }
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.96);
}
</style>
