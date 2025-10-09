// main.js - INTEGRADO 100% CON EL BACKEND
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'

// ============================================================================
// 🚀 CONFIGURACIÓN INICIAL DE LA APLICACIÓN
// ============================================================================

console.log('🚀 Iniciando aplicación IaStories...')
console.log(`📍 Entorno: ${import.meta.env.MODE}`)
console.log(`🔗 API URL: ${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/'}`)

// ============================================================================
// 🎯 CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ============================================================================

// Configurar URL base de la API
window.API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/'

// Configuraciones globales
window.APP_CONFIG = {
  name: 'IaStories',
  version: '1.0.0',
  description: 'Plataforma educativa con IA para crear historias interactivas',
  apiUrl: window.API_BASE_URL,
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  
  // Configuraciones específicas del backend
  features: {
    openaiEnabled: true,
    pdfExport: true,
    imageGeneration: true,
    gamification: true,
    analytics: true
  },
  
  // Configuraciones de la aplicación educativa
  education: {
    maxHistoryLength: 500,          // Máximo de palabras por historia
    questionsPerStory: 6,           // Preguntas por historia (2 inferenciales, 2 críticas, 2 creativas)
    maxRetries: 3,                  // Máximo de reintentos por pregunta
    timeoutPerQuestion: 300,        // 5 minutos por pregunta (en segundos)
    pointsPerCorrectAnswer: 25,     // Puntos por respuesta correcta
    minimumAge: 6,                  // Edad mínima
    maximumAge: 18                  // Edad máxima
  },
  
  // Configuraciones de UI
  ui: {
    animationDuration: 300,         // Duración de animaciones en ms
    loadingTimeout: 30000,          // Timeout para operaciones de carga (30s)
    toastDuration: 5000,            // Duración de notificaciones toast
    autoSaveInterval: 30000         // Auto-guardado cada 30 segundos
  }
}

// ============================================================================
//  CREACIÓN DE LA APLICACIÓN VUE
// ============================================================================

const app = createApp(App)
const pinia = createPinia()

// ============================================================================
//  CONFIGURACIONES DE PINIA (STORE)
// ============================================================================

// Plugin para persistir estado crítico
pinia.use(({ store }) => {
  // Auto-persist para stores críticos
  if (store.$id === 'auth') {
    store.$subscribe((mutation, state) => {
      // Solo persistir datos críticos, no sensibles
      if (state.user && state.profile) {
        const persistData = {
          user: state.user,
          profile: state.profile,
          lastUpdate: new Date().toISOString()
        }
        try {
          localStorage.setItem(`pinia-${store.$id}`, JSON.stringify(persistData))
        } catch (error) {
          console.warn('⚠️ No se pudo persistir el estado de auth:', error)
        }
      }
    })
  }
})

// ============================================================================
//  CONFIGURACIONES GLOBALES DE LA APP
// ============================================================================

// Configurar propiedades globales
app.config.globalProperties.$appConfig = window.APP_CONFIG

// Error handler global
app.config.errorHandler = (err, instance, info) => {
  console.error('🚨 Error global de Vue:', err)
  console.error('📍 Información del error:', info)
  console.error('🔍 Instancia del componente:', instance)
  
  // En desarrollo, mostrar más detalles
  if (window.APP_CONFIG.isDevelopment) {
    console.error('📋 Stack trace completo:', err.stack)
  }
  
  // Reportar errores críticos (en producción podrías enviar a un servicio de monitoreo)
  if (window.APP_CONFIG.isProduction) {
    // Aquí podrías integrar con servicios como Sentry, LogRocket, etc.
    console.log('📊 Error reportado para análisis en producción')
  }
}

// Warning handler para desarrollo
if (window.APP_CONFIG.isDevelopment) {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('⚠️ Vue Warning:', msg)
    console.warn('📍 Trace:', trace)
  }
}

// ============================================================================
// 🔌 PLUGINS Y MIDDLEWARE
// ============================================================================

// Plugin personalizado para configuraciones del backend
app.use({
  install(app) {
    // Método global para verificar conectividad con el backend
    app.config.globalProperties.$checkBackendHealth = async () => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${window.API_BASE_URL}/health`, {  // ← Ya está bien, sin /api/
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Backend health check exitoso:', data)
      return { healthy: true, data }
    } else {
      console.warn('⚠️ Backend respondió con error:', response.status)
      return { healthy: false, status: response.status }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Backend timeout')
      return { healthy: false, error: 'timeout' }
    }
    console.error('❌ Backend no responde:', error)
    return { healthy: false, error: error.message }
  }
}
    
    // Método global para formatear fechas según el contexto educativo
    app.config.globalProperties.$formatEducationDate = (date) => {
      if (!date) return 'Sin fecha'
      
      const dateObj = new Date(date)
      const now = new Date()
      const diffTime = now - dateObj
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Hoy'
      if (diffDays === 1) return 'Ayer'
      if (diffDays < 7) return `Hace ${diffDays} días`
      if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
      
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    // Método global para calcular nivel educativo basado en puntos
    app.config.globalProperties.$calculateEducationLevel = (points) => {
      const levels = [
        { min: 0, max: 99, name: 'Explorador', icon: '🌱', color: '#4caf50' },
        { min: 100, max: 299, name: 'Aventurero', icon: '⭐', color: '#2196f3' },
        { min: 300, max: 599, name: 'Narrador', icon: '📚', color: '#ff9800' },
        { min: 600, max: 999, name: 'Maestro Cuentista', icon: '👑', color: '#9c27b0' },
        { min: 1000, max: Infinity, name: 'Leyenda Literaria', icon: '🏆', color: '#f44336' }
      ]
      
      return levels.find(level => points >= level.min && points <= level.max) || levels[0]
    }
  }
})

// ============================================================================
// 🎨 DIRECTIVAS PERSONALIZADAS
// ============================================================================

// Directiva para elementos que necesitan focus educativo
app.directive('education-focus', {
  mounted(el, binding) {
    if (binding.value) {
      setTimeout(() => {
        el.focus()
        // Agregar estilo visual para indicar focus educativo
        el.style.outline = '2px solid #667eea'
        el.style.outlineOffset = '2px'
      }, 100)
    }
  }
})

// Directiva para animaciones de aparición suave
app.directive('fade-in', {
  mounted(el, binding) {
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    el.style.transition = `all ${binding.value || 300}ms ease`
    
    setTimeout(() => {
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, 50)
  }
})

// ============================================================================
// 📦 INSTALACIÓN DE PLUGINS
// ============================================================================

app.use(pinia)
app.use(router)

// ============================================================================
// 🚀 MONTAJE DE LA APLICACIÓN
// ============================================================================

// Función para inicializar la aplicación
async function initializeApp() {
  try {
    console.log('🔧 Inicializando configuraciones...')
    
    // Verificar conectividad con el backend (opcional, no bloquea la carga)
    const healthCheck = await app.config.globalProperties.$checkBackendHealth()
    if (healthCheck.healthy) {
      console.log('✅ Backend conectado correctamente')
      window.APP_CONFIG.backendConnected = true
    } else {
      console.warn('⚠️ Backend no disponible, la app funcionará en modo offline')
      window.APP_CONFIG.backendConnected = false
    }
    
    // Configurar manejadores de eventos globales
    window.addEventListener('online', () => {
      console.log('🌐 Conexión a internet restaurada')
      window.APP_CONFIG.isOnline = true
    })
    
    window.addEventListener('offline', () => {
      console.log('📡 Conexión a internet perdida')
      window.APP_CONFIG.isOnline = false
    })
    
    // Configurar estado inicial de conectividad
    window.APP_CONFIG.isOnline = navigator.onLine
    
    // Configurar tema de la aplicación basado en preferencias del usuario
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    window.APP_CONFIG.prefersDarkMode = prefersDark
    
    // Configurar viewport para móviles
    const viewport = document.querySelector('meta[name=viewport]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    }
    
    console.log('✅ Configuraciones inicializadas')
    
  } catch (error) {
    console.error('❌ Error inicializando la aplicación:', error)
    // No bloqueamos el montaje por errores de inicialización
  }
}

// Inicializar y montar la aplicación
initializeApp().then(() => {
  try {
    app.mount('#app')
    console.log('🎉 ¡Aplicación IaStories montada correctamente!')
    console.log('📊 Configuración final:', window.APP_CONFIG)
    
    // Emitir evento personalizado de aplicación lista
    window.dispatchEvent(new CustomEvent('iaStoriesReady', {
      detail: {
        config: window.APP_CONFIG,
        timestamp: new Date().toISOString()
      }
    }))
    
  } catch (error) {
    console.error('💥 Error crítico montando la aplicación:', error)
    
    // Mostrar mensaje de error amigable al usuario
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: system-ui;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        text-align: center;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
        ">
          <h1 style="margin-bottom: 20px; font-size: 2em;">🚨 Error de Inicialización</h1>
          <p style="margin-bottom: 20px; font-size: 1.1em;">
            Hubo un problema iniciando IaStories. Por favor:
          </p>
          <ul style="text-align: left; margin-bottom: 30px;">
            <li>Recarga la página</li>
            <li>Verifica tu conexión a internet</li>
            <li>Asegúrate de que el backend esté ejecutándose</li>
          </ul>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #fff;
              color: #667eea;
              border: none;
              padding: 12px 24px;
              border-radius: 25px;
              cursor: pointer;
              font-size: 16px;
              font-weight: 600;
            "
          >
            🔄 Recargar Página
          </button>
        </div>
      </div>
    `
  }
}).catch(error => {
  console.error('💥 Error crítico en inicialización:', error)
})

// ============================================================================
// 🔍 DEBUGGING Y DESARROLLO
// ============================================================================

// Herramientas de desarrollo disponibles en la consola
if (window.APP_CONFIG.isDevelopment) {
  console.log('🛠️ Herramientas de desarrollo disponibles:')
  console.log('   - window.APP_CONFIG: Configuración global')
  console.log('   - window.vueApp: Instancia de la aplicación')
  console.log('   - window.router: Router de Vue')
  console.log('   - window.pinia: Store de Pinia')
  
  // Hacer disponibles globalmente para debugging
  window.vueApp = app
  window.router = router  
  window.pinia = pinia
  
  // Comando para verificar el estado de la aplicación
  window.debugApp = () => {
    console.log('🔍 Estado actual de la aplicación:')
    console.log('   - Configuración:', window.APP_CONFIG)
    console.log('   - Router actual:', router.currentRoute.value)
    console.log('   - Stores:', pinia.state.value)
    console.log('   - Conectividad:', {
      online: window.APP_CONFIG.isOnline,
      backend: window.APP_CONFIG.backendConnected
    })
  }
  
  console.log('💡 Usa window.debugApp() para ver el estado actual')
}