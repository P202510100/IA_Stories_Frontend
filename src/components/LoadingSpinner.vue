<!-- components/LoadingSpinner.vue - COMPONENTE DE CARGA UNIVERSAL -->
<template>
  <div 
    class="loading-spinner"
    :class="[
      `size-${size}`,
      `type-${type}`,
      { 
        'overlay': overlay,
        'centered': centered,
        'with-backdrop': backdrop
      }
    ]"
  >
    <!-- Backdrop para overlays -->
    <div v-if="backdrop" class="loading-backdrop" @click="handleBackdropClick"></div>
    
    <!-- Contenedor principal -->
    <div class="spinner-container">
      <!-- Diferentes tipos de spinner -->
      
      <!-- Tipo: dots (por defecto) -->
      <div v-if="type === 'dots'" class="spinner-dots">
        <div class="dot" v-for="i in 3" :key="i"></div>
      </div>
      
      <!-- Tipo: circle -->
      <div v-else-if="type === 'circle'" class="spinner-circle">
        <div class="circle-path"></div>
      </div>
      
      <!-- Tipo: bars -->
      <div v-else-if="type === 'bars'" class="spinner-bars">
        <div class="bar" v-for="i in 5" :key="i"></div>
      </div>
      
      <!-- Tipo: pulse -->
      <div v-else-if="type === 'pulse'" class="spinner-pulse">
        <div class="pulse-circle" v-for="i in 3" :key="i"></div>
      </div>
      
      <!-- Tipo: wave -->
      <div v-else-if="type === 'wave'" class="spinner-wave">
        <div class="wave-bar" v-for="i in 5" :key="i"></div>
      </div>
      
      <!-- Tipo: square -->
      <div v-else-if="type === 'square'" class="spinner-square">
        <div class="square" v-for="i in 4" :key="i"></div>
      </div>
      
      <!-- Tipo: heart (para historias infantiles) -->
      <div v-else-if="type === 'heart'" class="spinner-heart">
        <div class="heart">💖</div>
      </div>
      
      <!-- Tipo: book (para generación de historias) -->
      <div v-else-if="type === 'book'" class="spinner-book">
        <div class="book">📚</div>
        <div class="pages">
          <div class="page" v-for="i in 3" :key="i"></div>
        </div>
      </div>
      
      <!-- Tipo: ai (para inteligencia artificial) -->
      <div v-else-if="type === 'ai'" class="spinner-ai">
        <div class="ai-brain">🤖</div>
        <div class="ai-waves">
          <div class="ai-wave" v-for="i in 4" :key="i"></div>
        </div>
      </div>
      
      <!-- Tipo: custom con icono personalizado -->
      <div v-else-if="type === 'custom'" class="spinner-custom">
        <div class="custom-icon">{{ customIcon }}</div>
      </div>
      
      <!-- Mensaje de carga -->
      <div v-if="message" class="loading-message">
        <p class="message-text">{{ message }}</p>
        <p v-if="submessage" class="message-sub">{{ submessage }}</p>
      </div>
      
      <!-- Progreso si está disponible -->
      <div v-if="showProgress && progress !== null" class="loading-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: Math.min(progress, 100) + '%' }"
          ></div>
        </div>
        <div class="progress-text">{{ Math.round(progress) }}%</div>
      </div>
      
      <!-- Tips/consejos mientras carga -->
      <div v-if="showTips && tips.length > 0" class="loading-tips">
        <transition name="tip-fade" mode="out-in">
          <div :key="currentTipIndex" class="tip-content">
            <span class="tip-icon">💡</span>
            <span class="tip-text">{{ tips[currentTipIndex] }}</span>
          </div>
        </transition>
      </div>
      
      <!-- Botón de cancelar si está disponible -->
      <button 
        v-if="showCancel && onCancel" 
        @click="handleCancel"
        class="cancel-button"
      >
        ✕ Cancelar
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'LoadingSpinner',
  props: {
    // Configuración básica
    type: {
      type: String,
      default: 'dots',
      validator: (value) => [
        'dots', 'circle', 'bars', 'pulse', 'wave', 
        'square', 'heart', 'book', 'ai', 'custom'
      ].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large', 'xlarge'].includes(value)
    },
    
    // Mensajes
    message: {
      type: String,
      default: ''
    },
    submessage: {
      type: String,
      default: ''
    },
    
    // Progreso
    progress: {
      type: Number,
      default: null
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    
    // Tips
    tips: {
      type: Array,
      default: () => []
    },
    showTips: {
      type: Boolean,
      default: false
    },
    tipInterval: {
      type: Number,
      default: 3000
    },
    
    // Layout
    overlay: {
      type: Boolean,
      default: false
    },
    centered: {
      type: Boolean,
      default: true
    },
    backdrop: {
      type: Boolean,
      default: false
    },
    
    // Interacciones
    showCancel: {
      type: Boolean,
      default: false
    },
    onCancel: {
      type: Function,
      default: null
    },
    
    // Personalización
    customIcon: {
      type: String,
      default: '⭐'
    },
    color: {
      type: String,
      default: '#667eea'
    },
    
    // Control
    visible: {
      type: Boolean,
      default: true
    }
  },
  emits: ['cancel', 'backdrop-click'],
  setup(props, { emit }) {
    // ============================================================================
    // 🔄 ESTADO REACTIVO
    // ============================================================================
    
    const currentTipIndex = ref(0)
    const tipTimer = ref(null)
    
    // ============================================================================
    // 🔄 COMPUTED PROPERTIES
    // ============================================================================
    
    const spinnerStyle = computed(() => {
      const styles = {}
      
      if (props.color && props.color !== '#667eea') {
        styles['--spinner-color'] = props.color
      }
      
      return styles
    })
    
    // ============================================================================
    // 🎯 MÉTODOS DE INTERACCIÓN
    // ============================================================================
    
    const handleCancel = () => {
      if (props.onCancel) {
        props.onCancel()
      }
      emit('cancel')
    }
    
    const handleBackdropClick = () => {
      emit('backdrop-click')
    }
    
    // ============================================================================
    // 💡 GESTIÓN DE TIPS
    // ============================================================================
    
    const startTipRotation = () => {
      if (!props.showTips || props.tips.length <= 1) return
      
      tipTimer.value = setInterval(() => {
        currentTipIndex.value = (currentTipIndex.value + 1) % props.tips.length
      }, props.tipInterval)
    }
    
    const stopTipRotation = () => {
      if (tipTimer.value) {
        clearInterval(tipTimer.value)
        tipTimer.value = null
      }
    }
    
    // ============================================================================
    // 🚀 LIFECYCLE
    // ============================================================================
    
    onMounted(() => {
      if (props.showTips && props.tips.length > 1) {
        startTipRotation()
      }
    })
    
    onUnmounted(() => {
      stopTipRotation()
    })
    
    return {
      // Estado
      currentTipIndex,
      
      // Computed
      spinnerStyle,
      
      // Métodos
      handleCancel,
      handleBackdropClick
    }
  }
}
</script>

<style scoped>
/* ============================================================================ */
/* 🎨 VARIABLES CSS PERSONALIZABLES */
/* ============================================================================ */

.loading-spinner {
  --spinner-color: #667eea;
  --spinner-bg: rgba(255, 255, 255, 0.9);
  --spinner-backdrop: rgba(0, 0, 0, 0.5);
}

/* ============================================================================ */
/* 🎨 CONTENEDOR PRINCIPAL */
/* ============================================================================ */

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.loading-spinner.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.loading-spinner.centered {
  min-height: 200px;
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--spinner-backdrop);
  backdrop-filter: blur(3px);
}

.spinner-container {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  background: var(--spinner-bg);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  text-align: center;
}

/* ============================================================================ */
/* 🎪 TAMAÑOS */
/* ============================================================================ */

.loading-spinner.size-small .spinner-container {
  padding: 20px;
  gap: 10px;
}

.loading-spinner.size-medium .spinner-container {
  padding: 25px;
  gap: 15px;
}

.loading-spinner.size-large .spinner-container {
  padding: 35px;
  gap: 20px;
}

.loading-spinner.size-xlarge .spinner-container {
  padding: 45px;
  gap: 25px;
}

/* ============================================================================ */
/* 🎨 SPINNER TIPO: DOTS */
/* ============================================================================ */

.spinner-dots {
  display: flex;
  gap: 8px;
}

.spinner-dots .dot {
  width: 12px;
  height: 12px;
  background: var(--spinner-color);
  border-radius: 50%;
  animation: dot-bounce 0.6s infinite alternate;
}

.spinner-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.spinner-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

.size-small .spinner-dots .dot {
  width: 8px;
  height: 8px;
}

.size-large .spinner-dots .dot {
  width: 16px;
  height: 16px;
}

.size-xlarge .spinner-dots .dot {
  width: 20px;
  height: 20px;
}

@keyframes dot-bounce {
  to {
    transform: translateY(-15px);
    opacity: 0.7;
  }
}

/* ============================================================================ */
/* 🎨 SPINNER TIPO: CIRCLE */
/* ============================================================================ */

.spinner-circle {
  width: 40px;
  height: 40px;
  position: relative;
}

.circle-path {
  width: 100%;
  height: 100%;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top: 3px solid var(--spinner-color);
  border-radius: 50%;
  animation: circle-spin 1s linear infinite;
}

.size-small .spinner-circle {
  width: 30px;
  height: 30px;
}

.size-large .spinner-circle {
  width: 50px;
  height: 50px;
}

.size-xlarge .spinner-circle {
  width: 60px;
  height: 60px;
}

@keyframes circle-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================================ */
/* 🎨 SPINNER TIPO: BARS */
/* ============================================================================ */

.spinner-bars {
  display: flex;
  gap: 4px;
  align-items: end;
}

.spinner-bars .bar {
  width: 4px;
  height: 20px;
  background: var(--spinner-color);
  border-radius: 2px;
  animation: bar-scale 0.8s infinite ease-in-out;
}

.spinner-bars .bar:nth-child(2) { animation-delay: 0.1s; }
.spinner-bars .bar:nth-child(3) { animation-delay: 0.2s; }
.spinner-bars .bar:nth-child(4) { animation-delay: 0.3s; }
.spinner-bars .bar:nth-child(5) { animation-delay: 0.4s; }

.size-small .spinner-bars .bar {
  width: 3px;
  height: 15px;
}

.size-large .spinner-bars .bar {
  width: 5px;
  height: 25px;
}

.size-xlarge .spinner-bars .bar {
  width: 6px;
  height: 30px;
}

@keyframes bar-scale {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

/* ============================================================================ */
/* 🎨 SPINNER TIPO: PULSE */
/* ============================================================================ */

.spinner-pulse {
  display: flex;
  gap: 8px;
}

.pulse-circle {
  width: 15px;
  height: 15px;
  background: var(--spinner-color);
  border-radius: 50%;
  animation: pulse-scale 1.5s infinite ease-in-out;
}

.pulse-circle:nth-child(2) { animation-delay: 0.3s; }
.pulse-circle:nth-child(3) { animation-delay: 0.6s; }

@keyframes pulse-scale {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ============================================================================ */
/* 🎨 SPINNER TIPO: WAVE */
/* ============================================================================ */

.spinner-wave {
  display: flex;
  gap: 3px;
  align-items: center;
}

.wave-bar {
  width: 3px;
  height: 20px;
  background: var(--spinner-color);
  border-radius: 2px;
  animation: wave-move 1.2s infinite ease-in-out;
}

.wave-bar:nth-child(2) { animation-delay: 0.1s; }
.wave-bar:nth-child(3) { animation-delay: 0.2s; }
.wave-bar:nth-child(4) { animation-delay: 0.3s; }
.wave-bar:nth-child(5) { animation-delay: 0.4s; }

@keyframes wave-move {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

/* ============================================================================ */
/* 🎨 SPINNER TIPO: SQUARE */
/* ============================================================================ */

.spinner-square {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  width: 30px;
  height: 30px;
}

.square {
  background: var(--spinner-color);
  border-radius: 2px;
  animation: square-fade 1.2s infinite ease-in-out;
}

.square:nth-child(1) { animation-delay: 0s; }
.square:nth-child(2) { animation-delay: 0.2s; }
.square:nth-child(3) { animation-delay: 0.4s; }
.square:nth-child(4) { animation-delay: 0.6s; }

@keyframes square-fade {
  0%, 70%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  35% {
    opacity: 1;
    transform: scale(1);
  }
}

/* ============================================================================ */
/* 🎨 SPINNER TIPO: HEART */
/* ============================================================================ */

.spinner-heart {
  font-size: 2em;
  animation: heart-beat 1s infinite ease-in-out;
}

.size-small .spinner-heart {
  font-size: 1.5em;
}

.size-large .spinner-heart {
  font-size: 2.5em;
}

.size-xlarge .spinner-heart {
  font-size: 3em;
}

@keyframes heart-beat {
  0%, 50%, 100% {
    transform: scale(1);
  }
  25%, 75% {
    transform: scale(1.2);
  }
}

/* ============================================================================ */
/* 🎨 SPINNER TIPO: BOOK */
/* ============================================================================ */

.spinner-book {
  position: relative;
  font-size: 2em;
}

.book {
  animation: book-float 2s infinite ease-in-out;
}

.pages {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.page {
  position: absolute;
  width: 20px;
  height: 2px;
  background: var(--spinner-color);
  border-radius: 1px;
  animation: page-flip 2s infinite ease-in-out;
}

.page:nth-child(2) {
  animation-delay: 0.3s;
  transform: translateY(4px);
}

.page:nth-child(3) {
  animation-delay: 0.6s;
  transform: translateY(8px);
}

@keyframes book-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes page-flip {
  0%, 20%, 80%, 100% {
    opacity: 0;
    transform: rotateY(90deg);
  }
  50% {
    opacity: 1;
    transform: rotateY(0);
  }
}

/* ============================================================================ */
/* 🎨 SPINNER TIPO: AI */
/* ============================================================================ */

.spinner-ai {
  position: relative;
}

.ai-brain {
  font-size: 2em;
  animation: ai-think 2s infinite ease-in-out;
}

.ai-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ai-wave {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 2px solid var(--spinner-color);
  border-radius: 50%;
  opacity: 0;
  animation: ai-wave 2s infinite ease-out;
}

.ai-wave:nth-child(2) { animation-delay: 0.5s; }
.ai-wave:nth-child(3) { animation-delay: 1s; }
.ai-wave:nth-child(4) { animation-delay: 1.5s; }

@keyframes ai-think {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes ai-wave {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* ============================================================================ */
/* 🎨 SPINNER TIPO: CUSTOM */
/* ============================================================================ */

.spinner-custom {
  font-size: 2em;
  animation: custom-rotate 2s infinite linear;
}

@keyframes custom-rotate {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================================ */
/* 💬 MENSAJES */
/* ============================================================================ */

.loading-message {
  text-align: center;
  max-width: 250px;
}

.message-text {
  font-size: 1.1em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 5px;
}

.message-sub {
  font-size: 0.9em;
  color: #6c757d;
  line-height: 1.4;
}

/* ============================================================================ */
/* 📊 PROGRESO */
/* ============================================================================ */

.loading-progress {
  width: 100%;
  max-width: 200px;
}

.progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, var(--spinner-color), #764ba2);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.85em;
  color: #6c757d;
  font-weight: 500;
  text-align: center;
}

/* ============================================================================ */
/* 💡 TIPS */
/* ============================================================================ */

.loading-tips {
  max-width: 250px;
  min-height: 30px;
}

.tip-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid var(--spinner-color);
}

.tip-icon {
  font-size: 1.2em;
  flex-shrink: 0;
}

.tip-text {
  font-size: 0.85em;
  color: #495057;
  line-height: 1.3;
}

.tip-fade-enter-active,
.tip-fade-leave-active {
  transition: all 0.5s ease;
}

.tip-fade-enter-from,
.tip-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ============================================================================ */
/* 🚫 BOTÓN CANCELAR */
/* ============================================================================ */

.cancel-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: #c82333;
  transform: translateY(-1px);
}

/* ============================================================================ */
/* 📱 RESPONSIVE */
/* ============================================================================ */

@media (max-width: 768px) {
  .spinner-container {
    max-width: 280px;
    padding: 20px;
  }
  
  .loading-message {
    max-width: 200px;
  }
  
  .message-text {
    font-size: 1em;
  }
  
  .message-sub {
    font-size: 0.85em;
  }
  
  .tip-content {
    padding: 8px;
  }
  
  .tip-text {
    font-size: 0.8em;
  }
}

/* ============================================================================ */
/* 🌙 MODO OSCURO (OPCIONAL) */
/* ============================================================================ */

@media (prefers-color-scheme: dark) {
  .loading-spinner {
    --spinner-bg: rgba(33, 37, 41, 0.95);
    --spinner-backdrop: rgba(0, 0, 0, 0.7);
  }
  
  .message-text {
    color: #f8f9fa;
  }
  
  .message-sub {
    color: #adb5bd;
  }
  
  .tip-content {
    background: #495057;
  }
  
  .tip-text {
    color: #f8f9fa;
  }
  
  .progress-text {
    color: #adb5bd;
  }
}
</style>