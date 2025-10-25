<template>
  <transition name="fade">
    <div v-if="visible" class="overlay-loader">
      <LoadingSpinner
          :type="type"
          :message="message"
          :submessage="submessage"
          size="large"
          color="#667eea"
          centered
      />
    </div>
  </transition>
</template>

<script setup>
import LoadingSpinner from '../components/LoadingSpinner.vue'

defineProps({
  visible: { type: Boolean, default: false },
  message: { type: String, default: 'Procesando...' },
  submessage: { type: String, default: '' },
  type: { type: String, default: 'dots' }
})
</script>

<style scoped>
.overlay-loader {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  z-index: 9999;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
