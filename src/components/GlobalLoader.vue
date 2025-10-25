<template>
  <transition name="fade">
    <LoadingSpinner
        v-if="visible"
        overlay
        backdrop
        centered
        :type="type"
        :message="message"
        :submessage="submessage"
        size="large"
        color="#667eea"
    />
  </transition>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useLoaderStore } from '../stores/loaderStore'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const loader = useLoaderStore()
const { visible, message, submessage, type } = storeToRefs(loader)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
