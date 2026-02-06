<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { registerEventByJoinCode } from '@/api/event'
import type { PublicEvent } from '@/types/events'

const props = defineProps<{
  event: PublicEvent | null
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const authStore = useAuthStore()
const { isLoggedIn, user } = storeToRefs(authStore)

const name = ref('')
const phone = ref('')
const email = ref('')
const submitting = ref(false)
const error = ref('')

const joinCode = computed(() => props.event?.join_code?.trim() || '')

const hasUserName = computed(() => {
  const n = user.value?.full_name
  return typeof n === 'string' && n.trim().length > 0
})

const showAsLoggedIn = computed(() => isLoggedIn.value && hasUserName.value)

// Prefill when dialog opens and user is logged in
watch(
  () => [props.open, user.value],
  () => {
    if (props.open && isLoggedIn.value && user.value) {
      name.value = user.value.full_name?.trim() || ''
      phone.value = user.value.phone?.trim() || ''
      email.value = (user.value.email ?? '')?.trim() || ''
    } else if (props.open) {
      name.value = ''
      phone.value = ''
      email.value = ''
    }
  },
  { immediate: true }
)

function validate(): boolean {
  error.value = ''
  if (!showAsLoggedIn.value && !name.value?.trim()) {
    error.value = 'Please enter your name.'
    return false
  }
  if (!phone.value?.trim()) {
    error.value = 'Please enter your phone number.'
    return false
  }
  const clean = phone.value.replace(/\D/g, '')
  if (clean.length < 9) {
    error.value = 'Please enter a valid phone number.'
    return false
  }
  if (!joinCode.value) {
    error.value = 'Event code is missing.'
    return false
  }
  return true
}

async function onSubmit() {
  if (!validate()) return
  submitting.value = true
  error.value = ''
  try {
    const payload = {
      name: showAsLoggedIn.value ? (user.value?.full_name?.trim() || name.value) : name.value.trim(),
      phone: phone.value.trim(),
      ...(email.value?.trim() ? { email: email.value.trim() } : {}),
    }
    await registerEventByJoinCode(joinCode.value, payload)
    emit('success')
    emit('close')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Could not join event. Try again.'
  } finally {
    submitting.value = false
  }
}

function onClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="join-backdrop" @click.self="onClose">
        <div class="join-dialog">
          <button type="button" class="join-close" aria-label="Close" @click="onClose">
            <span aria-hidden="true">&times;</span>
          </button>
          <h2 class="join-title">Join Event</h2>

          <div v-if="event" class="join-event-name">
            <span class="join-event-icon">📅</span>
            {{ event.title }}
          </div>

          <!-- Logged in with name: show "Joining as X" and phone -->
          <div v-if="showAsLoggedIn" class="join-as-block">
            <p class="join-as-label">Joining as</p>
            <p class="join-as-name">{{ user?.full_name }}</p>
          </div>

          <template v-if="!showAsLoggedIn">
            <label class="join-label">
              Your Name *
              <input
                v-model="name"
                type="text"
                class="join-input"
                placeholder="Full name"
              />
            </label>
          </template>

          <label class="join-label">
            Phone Number *
            <input
              v-model="phone"
              type="tel"
              class="join-input"
              placeholder="e.g. 0712345678"
            />
          </label>

          <label v-if="!showAsLoggedIn" class="join-label">
            Email (optional)
            <input
              v-model="email"
              type="email"
              class="join-input"
              placeholder="your@email.com"
            />
          </label>

          <p v-if="error" class="join-error">{{ error }}</p>

          <button
            type="button"
            class="join-submit"
            :disabled="submitting"
            @click="onSubmit"
          >
            <span v-if="submitting">Joining…</span>
            <span v-else>Join Event</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.join-backdrop {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow-y: auto;
}
.join-dialog {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
}
.join-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  color: #374151;
}
.join-close:hover {
  background: #e5e7eb;
}
.join-title {
  margin: 0 0 16px;
  font-size: 1.25rem;
  font-weight: 700;
}
.join-event-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px;
  background: #eef2ff;
  border-radius: 10px;
  font-weight: 600;
  color: #3730a3;
}
.join-event-icon { font-size: 1.125rem; }
.join-as-block {
  margin-bottom: 16px;
  padding: 12px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 10px;
}
.join-as-label {
  margin: 0 0 4px;
  font-size: 0.75rem;
  color: #047857;
}
.join-as-name {
  margin: 0;
  font-weight: 700;
  color: #065f46;
}
.join-label {
  display: block;
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 8px;
  color: #374151;
}
.join-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  margin-bottom: 12px;
  box-sizing: border-box;
}
.join-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin: 8px 0;
}
.join-submit {
  width: 100%;
  padding: 14px 20px;
  background: #1f2937;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}
.join-submit:hover:not(:disabled) {
  background: #111827;
}
.join-submit:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
