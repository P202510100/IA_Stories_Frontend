<!-- App.vue - INTEGRADO 100% CON EL BACKEND -->
<template>
  <div id="app">
    <!-- Barra de navegación (solo si está autenticado) -->
    <NavBar v-if="isAuthenticated" />
    
    <!-- Contenido principal -->
    <main class="main-content" :class="{ 'with-navbar': isAuthenticated }">
      <router-view v-slot="{ Component, route }">
        <transition 
          :name="getTransitionName(route)" 
          mode="out-in"
          @enter="onPageEnter"
          @leave="onPageLeave"
        >
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    
    <!-- Sistema de notificaciones -->
    <ToastNotification />
    <GlobalLoader />

    
    <!-- Conexión perdida -->
    <div v-if="!isOnline" class="offline-banner">
      📡 Sin conexión a internet
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'
import ToastNotification from './components/ToastNotification.vue'
import GlobalLoader from "@/components/GlobalLoader.vue";

export default {
  name: 'App',
  components: {
    GlobalLoader,
    NavBar,
    ToastNotification
  },
  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    
    // ============================================================================
    //  ESTADOS REACTIVOS
    // ============================================================================
    
    const globalLoading = ref(false)
    const isOnline = ref(navigator.onLine)
    
    // ============================================================================
    //  COMPUTED PROPERTIES
    // ============================================================================
    
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)
    
    // ============================================================================
    //  MÉTODOS DE TRANSICIONES
    // ============================================================================
    
    const getTransitionName = (route) => {
      // Transiciones específicas según el tipo de ruta
      if (route.meta?.userType === 'alumno') {
        return 'slide-student'
      } else if (route.meta?.userType === 'docente') {
        return 'slide-teacher'
      } else if (route.meta?.requiresGuest) {
        return 'fade'
      } else {
        return 'slide-default'
      }
    }
    
    const onPageEnter = (el) => {
      // Animación al entrar a una página
      console.log('📄 Página cargada:', route.name)
    }
    
    const onPageLeave = (el) => {
      // Limpiar al salir de una página
      console.log('🚪 Saliendo de página:', route.name)
    }
    
    // ============================================================================
    //  MANEJO DE CONECTIVIDAD
    // ============================================================================
    
    const handleOnline = () => {
      isOnline.value = true
      console.log('Conexión restaurada')
    }
    
    const handleOffline = () => {
      isOnline.value = false
      console.log(' Conexión perdida')
    }
    
    // ============================================================================
    //  INICIALIZACIÓN Y LIMPIEZA
    // ============================================================================
    
    onMounted(async () => {
      console.log(' Iniciando aplicación IaStories...')
      
      try {
        // Mostrar loading global
        globalLoading.value = true
        
        // Inicializar autenticación
        console.log(' Inicializando autenticación...')
        authStore.initAuth()
        
        // Configurar listeners de conectividad
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        
        // Configurar favicon dinámico según el tipo de usuario
        updateFavicon()
        
        console.log(' Aplicación iniciada correctamente')
        
      } catch (error) {
        console.error(' Error iniciando aplicación:', error)
      } finally {
        // Ocultar loading después de un breve delay
        setTimeout(() => {
          globalLoading.value = false
        }, 500)
      }
    })
    
    onUnmounted(() => {
      // Limpiar listeners
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    })
    
    // ============================================================================
    // 👤 WATCHER PARA CAMBIOS DE USUARIO
    // ============================================================================
    
    watch(user, (newUser, oldUser) => {
      if (newUser && (!oldUser || newUser.id !== oldUser.id)) {
        console.log(' Usuario cambiado:', newUser.nombre)
        updateFavicon()
        updatePageTitle()
      } else if (!newUser && oldUser) {
        console.log('🚪 Usuario deslogueado')
        resetFavicon()
      }
    }, { immediate: true })
    
    // ============================================================================
    //  MÉTODOS AUXILIARES
    // ============================================================================
    
    const updateFavicon = () => {
      try {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link')
        link.type = 'image/x-icon'
        link.rel = 'shortcut icon'
        
        if (user.value?.tipo === 'student') {
          link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎓</text></svg>'
        } else if (user.value?.tipo === 'teacher') {
          link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👨‍🏫</text></svg>'
        } else {
          link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📚</text></svg>'
        }
        
        document.getElementsByTagName('head')[0].appendChild(link)
      } catch (error) {
        console.error('Error actualizando favicon:', error)
      }
    }
    
    const resetFavicon = () => {
      const link = document.querySelector("link[rel*='icon']")
      if (link) {
        link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📚</text></svg>'
      }
    }
    
    const updatePageTitle = () => {
      if (user.value) {
        document.title = `IaStories - ${user.value.nombre}`
      } else {
        document.title = 'IaStories - Educación con IA'
      }
    }
    
    return {
      isAuthenticated,
      user,
      globalLoading,
      isOnline,
      getTransitionName,
      onPageEnter,
      onPageLeave
    }
  }
}
</script>

<style>
/* ============================================================================ */
/* ESTILOS GLOBALES */
/* ============================================================================ */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: 'Segoe UI', 'San Francisco', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  position: relative;
}

/* ============================================================================ */
/*  CONTENIDO PRINCIPAL */
/* ============================================================================ */

.main-content {
  min-height: 100vh;
  transition: all 0.3s ease;
}

.main-content.with-navbar {
  padding-top: 70px;
}

/* ============================================================================ */
/*  TRANSICIONES DE PÁGINA */
/* ============================================================================ */

/* Transición para estudiantes */
.slide-student-enter-active,
.slide-student-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-student-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.slide-student-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
}

/* Transición para docentes */
.slide-teacher-enter-active,
.slide-teacher-leave-active {
  transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.slide-teacher-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.slide-teacher-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* Transición por defecto */
.slide-default-enter-active,
.slide-default-leave-active {
  transition: all 0.3s ease;
}

.slide-default-enter-from,
.slide-default-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Transición fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ============================================================================ */
/*  CONTENEDORES Y LAYOUTS */
/* ============================================================================ */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.container-sm {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.container-lg {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* ============================================================================ */
/* BOTONES GLOBALES */
/* ============================================================================ */

.btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  text-align: center;
  min-height: 44px;
  position: relative;
  overflow: hidden;
}

.btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover:before {
  left: 100%;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn:active {
  transform: translateY(0);
}

/* Variantes de botones */
.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.btn-secondary {
  background: linear-gradient(45deg, #f093fb, #f5576c);
}

.btn-success {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
}

.btn-danger {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
}

.btn-outline {
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* ============================================================================ */
/* 📝 FORMULARIOS GLOBALES */
/* ============================================================================ */

.input-group {
  margin: 20px 0;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 600;
  font-size: 14px;
}

.input-group input,
.input-group select,
.input-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 1);
}

.input-group textarea {
  resize: vertical;
  min-height: 100px;
}

/* ============================================================================ */
/* COMPONENTES DE STATS */
/* ============================================================================ */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.stat-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
}

/* ============================================================================ */
/* ESTADOS DE MENSAJE */
/* ============================================================================ */

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #667eea;
  font-size: 18px;
}

.error {
  background: rgba(255, 235, 238, 0.9);
  color: #c62828;
  padding: 16px 20px;
  border-radius: 12px;
  margin: 16px 0;
  border-left: 4px solid #c62828;
  backdrop-filter: blur(10px);
}

.success {
  background: rgba(232, 245, 232, 0.9);
  color: #2e7d32;
  padding: 16px 20px;
  border-radius: 12px;
  margin: 16px 0;
  border-left: 4px solid #2e7d32;
  backdrop-filter: blur(10px);
}

.warning {
  background: rgba(255, 243, 224, 0.9);
  color: #ef6c00;
  padding: 16px 20px;
  border-radius: 12px;
  margin: 16px 0;
  border-left: 4px solid #ef6c00;
  backdrop-filter: blur(10px);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ============================================================================ */
/* BANNER OFFLINE */
/* ============================================================================ */

.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ff6b6b;
  color: white;
  padding: 10px;
  text-align: center;
  font-weight: 600;
  z-index: 10000;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

/* ============================================================================ */
/* RESPONSIVE */
/* ============================================================================ */

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
  
  .card {
    padding: 20px;
    margin: 15px 0;
  }
  
  .btn {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 10px;
  }
  
  .card {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* ============================================================================ */
/*  UTILIDADES */
/* ============================================================================ */

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 8px; }
.mt-2 { margin-top: 16px; }
.mt-3 { margin-top: 24px; }
.mt-4 { margin-top: 32px; }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 8px; }
.mb-2 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 32px; }

.hidden { display: none; }
.block { display: block; }
.flex { display: flex; }
.inline-flex { display: inline-flex; }

.gap-1 { gap: 8px; }
.gap-2 { gap: 16px; }
.gap-3 { gap: 24px; }

.rounded { border-radius: 8px; }
.rounded-lg { border-radius: 12px; }
.rounded-xl { border-radius: 16px; }
.rounded-full { border-radius: 50%; }
</style>