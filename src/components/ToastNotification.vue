<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast" tag="div" class="toast-group">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="getToastClass(toast)"
          @click="handleToastClick(toast)"
        >
          <!-- Barra de progreso -->
          <div v-if="toast.showProgress && toast.progress > 0" class="toast-progress">
            <div 
              class="toast-progress-bar" 
              :style="{ width: toast.progress + '%' }"
              :class="getProgressClass(toast.type)"
            ></div>
          </div>
          
          <!-- Contenido principal -->
          <div class="toast-main">
            <div class="toast-icon" :class="getIconClass(toast.type)">
              {{ getToastIcon(toast.type) }}
            </div>
            
            <div class="toast-content">
              <div v-if="toast.title" class="toast-title">
                {{ toast.title }}
              </div>
              <div class="toast-message">
                {{ toast.message }}
              </div>
              
              <!-- Metadata -->
              <div v-if="toast.metadata" class="toast-metadata">
                <span v-if="toast.metadata.source" class="toast-source">
                  {{ formatSource(toast.metadata.source) }}
                </span>
                <span v-if="toast.metadata.timestamp" class="toast-time">
                  {{ formatTime(toast.metadata.timestamp) }}
                </span>
              </div>
              
              <!-- Acciones -->
              <div v-if="toast.actions && toast.actions.length > 0" class="toast-actions">
                <button
                  v-for="action in toast.actions"
                  :key="action.id"
                  @click.stop="handleAction(action, toast)"
                  class="toast-action-btn"
                  :class="action.style || 'primary'"
                >
                  <span v-if="action.icon" class="action-icon">{{ action.icon }}</span>
                  {{ action.label }}
                </button>
              </div>
            </div>
            
            <!-- Botón cerrar -->
            <button 
              @click.stop="removeToast(toast.id)"
              class="toast-close"
              :aria-label="`Cerrar notificación: ${toast.title || toast.message}`"
            >
              ✕
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script>
import { computed } from 'vue'
import { useToastStore } from '@/stores/toast'

export default {
  name: 'ToastNotification',
  setup() {
    const toastStore = useToastStore()
    
    const toasts = computed(() => toastStore.toasts)
    
    const getToastClass = (toast) => {
      const classes = [`toast-${toast.type}`]
      if (toast.clickable) classes.push('toast-clickable')
      if (toast.persistent) classes.push('toast-persistent')
      if (toast.actions && toast.actions.length > 0) classes.push('toast-with-actions')
      return classes
    }
    
    const getIconClass = (type) => {
      const classes = {
        success: 'toast-icon-success',
        error: 'toast-icon-error',
        warning: 'toast-icon-warning',
        info: 'toast-icon-info',
        loading: 'toast-icon-loading'
      }
      return classes[type] || 'toast-icon-info'
    }
    
    const getToastIcon = (type) => {
      const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        loading: '⏳'
      }
      return icons[type] || 'ℹ️'
    }
    
    const getProgressClass = (type) => {
      return `progress-${type}`
    }
    
    const formatSource = (source) => {
      const sources = {
        'system': 'Sistema',
        'api': 'Servidor',
        'gamification': 'Gamificación',
        'story-generation': 'Generación de Historias',
        'class-management': 'Gestión de Clase',
        'assignments': 'Actividades'
      }
      return sources[source] || source
    }
    
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diffSeconds = Math.floor((now - date) / 1000)
      
      if (diffSeconds < 60) return 'Ahora'
      if (diffSeconds < 3600) return `Hace ${Math.floor(diffSeconds / 60)}m`
      if (diffSeconds < 86400) return `Hace ${Math.floor(diffSeconds / 3600)}h`
      
      return date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const handleToastClick = (toast) => {
      if (toast.clickable && toast.onClick) {
        toast.onClick(toast)
      }
    }
    
    const handleAction = (action, toast) => {
      console.log(`🎯 Acción ejecutada: ${action.label}`)
      
      const event = new CustomEvent('toast-action', {
        detail: { action, toast }
      })
      window.dispatchEvent(event)
      
      if (!toast.persistent) {
        setTimeout(() => {
          toastStore.removeToast(toast.id)
        }, 300)
      }
    }
    
    const removeToast = (id) => {
      toastStore.removeToast(id)
    }
    
    return {
      toasts,
      getToastClass,
      getIconClass,
      getToastIcon,
      getProgressClass,
      formatSource,
      formatTime,
      handleToastClick,
      handleAction,
      removeToast
    }
  }
}
</script>

<style scoped>
/* ============================================================================ */
/* 🎨 CONTENEDOR PRINCIPAL */
/* ============================================================================ */

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  pointer-events: none;
  max-width: 420px;
  width: 100%;
}

.toast-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ============================================================================ */
/* 🍞 ESTILOS BASE DEL TOAST */
/* ============================================================================ */

.toast {
  pointer-events: all;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-height: 70px;
}

.toast:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.1);
}

.toast.toast-clickable {
  cursor: pointer;
}

.toast.toast-persistent {
  border-left: 4px solid #2196f3;
}

.toast.toast-with-actions {
  min-height: 100px;
}

/* ============================================================================ */
/* 📊 BARRA DE PROGRESO */
/* ============================================================================ */

.toast-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  transition: width 0.05s linear;
  border-radius: 0 3px 3px 0;
}

.progress-success {
  background: linear-gradient(45deg, #4caf50, #8bc34a);
}

.progress-error {
  background: linear-gradient(45deg, #f44336, #ff5722);
}

.progress-warning {
  background: linear-gradient(45deg, #ff9800, #ffc107);
}

.progress-info {
  background: linear-gradient(45deg, #2196f3, #03a9f4);
}

.progress-loading {
  background: linear-gradient(45deg, #667eea, #764ba2);
}

/* ============================================================================ */
/* 📄 CONTENIDO PRINCIPAL */
/* ============================================================================ */

.toast-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.toast-icon {
  font-size: 1.3em;
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toast-icon-success {
  background: linear-gradient(45deg, #e8f5e8, #c8e6c9);
  color: #2e7d32;
}

.toast-icon-error {
  background: linear-gradient(45deg, #ffebee, #ffcdd2);
  color: #c62828;
}

.toast-icon-warning {
  background: linear-gradient(45deg, #fff3c4, #ffeaa7);
  color: #f57c00;
}

.toast-icon-info {
  background: linear-gradient(45deg, #e3f2fd, #bbdefb);
  color: #1565c0;
}

.toast-icon-loading {
  background: linear-gradient(45deg, #f3e5f5, #e1bee7);
  color: #7b1fa2;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 700;
  font-size: 0.95em;
  margin-bottom: 4px;
  line-height: 1.3;
  color: #2c3e50;
}

.toast-message {
  font-size: 0.9em;
  line-height: 1.4;
  color: #34495e;
  word-wrap: break-word;
}

.toast-metadata {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 0.75em;
  color: #7f8c8d;
}

.toast-source {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.toast-time {
  font-style: italic;
}

/* ============================================================================ */
/* 🎯 ACCIONES */
/* ============================================================================ */

.toast-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.toast-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.8em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toast-action-btn.primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.toast-action-btn.secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.toast-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 1em;
}

/* ============================================================================ */
/* ❌ BOTÓN CERRAR */
/* ============================================================================ */

.toast-close {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 1.1em;
  padding: 6px;
  border-radius: 6px;
  opacity: 0.7;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
}

.toast-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
  transform: scale(1.1);
}

/* ============================================================================ */
/* 🎨 VARIANTES DE TIPO */
/* ============================================================================ */

.toast-success {
  border-left: 4px solid #4caf50;
}

.toast-error {
  border-left: 4px solid #f44336;
}

.toast-warning {
  border-left: 4px solid #ff9800;
}

.toast-info {
  border-left: 4px solid #2196f3;
}

.toast-loading {
  border-left: 4px solid #667eea;
}

/* ============================================================================ */
/* 🎭 ANIMACIONES */
/* ============================================================================ */

.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.toast-enter-from {
  transform: translateX(100%) scale(0.8);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%) scale(0.9);
  opacity: 0;
}

.toast-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* ============================================================================ */
/* 📱 RESPONSIVE */
/* ============================================================================ */

@media (max-width: 768px) {
  .toast-container {
    left: 15px;
    right: 15px;
    top: 15px;
    max-width: none;
  }
  
  .toast-main {
    padding: 14px;
    gap: 10px;
  }
  
  .toast-icon {
    width: 28px;
    height: 28px;
    font-size: 1.1em;
  }
  
  .toast-title {
    font-size: 0.9em;
  }
  
  .toast-message {
    font-size: 0.85em;
  }
  
  .toast-actions {
    flex-direction: column;
    gap: 6px;
  }
  
  .toast-action-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .toast-container {
    left: 10px;
    right: 10px;
    top: 10px;
  }
  
  .toast-main {
    padding: 12px;
  }
  
  .toast-metadata {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* ============================================================================ */
/* 🌙 MODO OSCURO */
/* ============================================================================ */

@media (prefers-color-scheme: dark) {
  .toast {
    background: rgba(45, 55, 72, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .toast-title {
    color: #e2e8f0;
  }
  
  .toast-message {
    color: #cbd5e0;
  }
  
  .toast-metadata {
    color: #a0aec0;
  }
  
  .toast-source {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
  }
  
  .toast-close {
    color: #a0aec0;
  }
  
  .toast-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
  }
  
  .toast-action-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    border-color: rgba(255, 255, 255, 0.2);
  }
}
</style>