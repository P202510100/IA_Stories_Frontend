// src/stores/toast.js - STORE PARA NOTIFICACIONES TOAST

import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let toastIdCounter = 0
  
  // ============================================================================
  // 🔧 MÉTODOS PRINCIPALES
  // ============================================================================
  
  function getDefaultDuration(type) {
    const durations = {
      success: 3000,
      error: 5000,
      warning: 4000,
      info: 3000,
      loading: 0
    }
    return durations[type] || 3000
  }
  
  function addToast(options) {
    const {
      type = 'info',
      title,
      message,
      duration = getDefaultDuration(type),
      persistent = false,
      showProgress = true,
      actions = [],
      metadata = {},
      clickable = false,
      onClick = null
    } = options
    
    const id = ++toastIdCounter
    const toast = reactive({
      id,
      type,
      title,
      message,
      duration,
      persistent,
      showProgress: showProgress && duration > 0,
      actions,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        source: metadata.source || 'system'
      },
      clickable,
      onClick,
      progress: 100,
      startTime: Date.now()
    })
    
    toasts.value.push(toast)
    
    // Auto-remove después de duración (si no es persistente)
    if (duration > 0 && !persistent) {
      setupAutoRemoval(toast)
    }
    
    // Limitar número máximo de toasts
    if (toasts.value.length > 5) {
      const oldestNonPersistent = toasts.value
        .filter(t => !t.persistent)
        .sort((a, b) => a.startTime - b.startTime)[0]
      
      if (oldestNonPersistent) {
        removeToast(oldestNonPersistent.id)
      }
    }
    
    console.log(`🍞 Toast añadido: ${type} - ${message}`)
    return id
  }
  
  function removeToast(id) {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      console.log(`🗑️ Toast removido: ${toasts.value[index].message}`)
      toasts.value.splice(index, 1)
    }
  }
  
  function clearAll() {
    console.log('🧹 Limpiando todos los toasts')
    toasts.value = []
  }
  
  function clearByType(type) {
    const initialLength = toasts.value.length
    toasts.value = toasts.value.filter(toast => toast.type !== type)
    console.log(`🗑️ Removidos ${initialLength - toasts.value.length} toasts de tipo ${type}`)
  }
  
  // ============================================================================
  // ⏰ MANEJO DE PROGRESO Y AUTO-REMOVAL
  // ============================================================================
  
  function setupAutoRemoval(toast) {
    const interval = setInterval(() => {
      const elapsed = Date.now() - toast.startTime
      const remaining = Math.max(0, toast.duration - elapsed)
      toast.progress = (remaining / toast.duration) * 100
      
      if (remaining <= 0) {
        clearInterval(interval)
        removeToast(toast.id)
      }
    }, 50)
  }
  
  // ============================================================================
  // 📢 MÉTODOS DE CONVENIENCIA
  // ============================================================================
  
  function success(message, title = '¡Éxito!', options = {}) {
    return addToast({
      type: 'success',
      title,
      message,
      ...options
    })
  }
  
  function error(message, title = 'Error', options = {}) {
    return addToast({
      type: 'error',
      title,
      message,
      duration: 5000,
      ...options
    })
  }
  
  function warning(message, title = 'Advertencia', options = {}) {
    return addToast({
      type: 'warning',
      title,
      message,
      ...options
    })
  }
  
  function info(message, title = 'Información', options = {}) {
    return addToast({
      type: 'info',
      title,
      message,
      ...options
    })
  }
  
  function loading(message, title = 'Cargando...', options = {}) {
    return addToast({
      type: 'loading',
      title,
      message,
      persistent: true,
      showProgress: false,
      ...options
    })
  }
  
  // ============================================================================
  // 🎓 MÉTODOS EDUCATIVOS ESPECÍFICOS
  // ============================================================================
  
  function questionAnswered(isCorrect, points, options = {}) {
    const message = isCorrect 
      ? `¡Respuesta correcta! +${points} puntos`
      : 'Intenta de nuevo'
    
    return addToast({
      type: isCorrect ? 'success' : 'error',
      title: isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto',
      message,
      metadata: { source: 'gamification' },
      ...options
    })
  }
  
  function storyGenerated(storyTitle, options = {}) {
    return success(
      `Tu historia "${storyTitle}" está lista`,
      '📚 ¡Historia generada!',
      {
        actions: [
          {
            id: 'view',
            label: 'Ver Historia',
            icon: '👀',
            style: 'primary'
          }
        ],
        metadata: { source: 'story-generation' },
        clickable: true,
        ...options
      }
    )
  }
  
  function levelUp(newLevel, options = {}) {
    return success(
      `¡Has alcanzado el nivel ${newLevel}!`,
      '🆙 ¡Subiste de nivel!',
      {
        duration: 6000,
        metadata: { source: 'gamification', level: newLevel },
        ...options
      }
    )
  }
  
  function apiError(endpoint, errorMessage, options = {}) {
    return error(
      `Error conectando con el servidor: ${errorMessage}`,
      '🌐 Error de conexión',
      {
        metadata: { source: 'api', endpoint },
        actions: [
          {
            id: 'retry',
            label: 'Reintentar',
            icon: '🔄',
            style: 'secondary'
          }
        ],
        ...options
      }
    )
  }
  
  function studentJoined(studentName, options = {}) {
    return info(
      `${studentName} se ha unido a tu clase`,
      '👋 Nuevo estudiante',
      {
        metadata: { source: 'class-management' },
        ...options
      }
    )
  }
  
  function assignmentCompleted(studentName, assignmentTitle, options = {}) {
    return success(
      `${studentName} ha completado "${assignmentTitle}"`,
      '📋 Actividad completada',
      {
        metadata: { source: 'assignments' },
        actions: [
          {
            id: 'view-results',
            label: 'Ver Resultados',
            icon: '📊',
            style: 'primary'
          }
        ],
        ...options
      }
    )
  }
  
  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    clearByType,
    
    // Métodos básicos
    success,
    error,
    warning,
    info,
    loading,
    
    // Métodos educativos específicos
    questionAnswered,
    storyGenerated,
    levelUp,
    apiError,
    studentJoined,
    assignmentCompleted
  }
})