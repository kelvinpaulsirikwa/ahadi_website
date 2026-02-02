<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue'
import { assetUrl } from '@/api/client'
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

function onBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement)?.classList?.contains('modal-backdrop')) {
    emit('close')
  }
}

function onClose() {
  emit('close')
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

              <dl class="modal-details">
                <div v-if="event.location" class="detail-row">
                  <dt>Location</dt>
                  <dd>
                    <span class="detail-icon" aria-hidden="true">📍</span>
                    {{ event.location }}
                  </dd>
                </div>
                <div v-if="event.venue_name" class="detail-row">
                  <dt>Venue</dt>
                  <dd>{{ event.venue_name }}</dd>
                </div>
                <div v-if="formattedStartDate" class="detail-row">
                  <dt>Start</dt>
                  <dd>{{ formattedStartDate }}</dd>
                </div>
                <div v-if="formattedEndDate && formattedEndDate !== formattedStartDate" class="detail-row">
                  <dt>End</dt>
                  <dd>{{ formattedEndDate }}</dd>
                </div>
                <div class="detail-row">
                  <dt>Participants</dt>
                  <dd>
                    <span class="detail-icon" aria-hidden="true">👥</span>
                    {{ participantCount }} participating
                  </dd>
                </div>
                <div v-if="contributionTarget > 0" class="detail-row">
                  <dt>Contributions</dt>
                  <dd>
                    <span class="progress-inline">{{ progressPercent }}%</span>
                    {{ totalContributions }} {{ currency }} of {{ contributionTarget }} {{ currency }} goal
                  </dd>
                </div>
                <div v-if="event.owner_name" class="detail-row">
                  <dt>Organizer</dt>
                  <dd>{{ event.owner_name }}</dd>
                </div>
              </dl>

              <div v-if="event.join_url && event.allow_public_join" class="modal-actions">
                <a :href="event.join_url" class="btn-join" target="_blank" rel="noopener noreferrer">
                  Join this event
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
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

.modal-details {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-row dt {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.detail-row dd {
  font-size: 14px;
  color: #374151;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.progress-inline {
  display: inline-block;
  font-weight: 600;
  color: #1a283b;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 6px;
  margin-right: 6px;
}

.modal-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-join {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: #1a283b;
  border-radius: 12px;
  text-decoration: none;
  transition: background 0.2s, transform 0.02s;
}

.btn-join:hover {
  background: #2d3a4f;
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
