<!-- views/NotFound.vue - PÁGINA 404 AMIGABLE PARA NIÑOS -->
<template>
  <div class="not-found-page">
    <div class="container">
      <!-- Ilustración animada -->
      <div class="illustration-container">
        <div class="main-illustration">
          <!-- Cohete perdido en el espacio -->
          <div class="space-scene">
            <div class="stars">
              <div v-for="i in 20" :key="i" class="star" :style="getRandomStarStyle()"></div>
            </div>
            <div class="planets">
              <div class="planet planet-1">🪐</div>
              <div class="planet planet-2">🌙</div>
              <div class="planet planet-3">⭐</div>
            </div>
            <div class="rocket">
              <div class="rocket-body">🚀</div>
              <div class="rocket-trail">
                <div class="trail-particle" v-for="i in 5" :key="i"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Personaje amigable -->
        <div class="character">
          <div class="character-emoji">🤖</div>
          <div class="speech-bubble">
            <p>{{ currentMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="content">
        <div class="error-code">
          <span class="code-number">4</span>
          <span class="code-zero">
            <div class="portal">
              <div class="portal-ring" v-for="i in 3" :key="i"></div>
            </div>
          </span>
          <span class="code-number">4</span>
        </div>

        <h1 class="title">¡Ups! Página no encontrada</h1>
        <p class="description">
          Parece que esta página se fue de aventura a otro lugar. 
          ¡Pero no te preocupes! Podemos ayudarte a encontrar lo que buscas.
        </p>

        <!-- Sugerencias según el tipo de usuario -->
        <div class="suggestions">
          <h3 class="suggestions-title">¿Qué puedes hacer?</h3>
          
          <div class="suggestions-grid">
            <!-- Para alumnos -->
            <div v-if="!esDocente" class="suggestion-card" @click="irADashboard">
              <div class="suggestion-icon">🏠</div>
              <h4>Ir al inicio</h4>
              <p>Vuelve a tu dashboard principal</p>
            </div>

            <div v-if="!esDocente" class="suggestion-card" @click="irACrearHistoria">
              <div class="suggestion-icon">✨</div>
              <h4>Crear historia</h4>
              <p>Escribe una nueva aventura</p>
            </div>

            <div v-if="!esDocente" class="suggestion-card" @click="irAMisHistorias">
              <div class="suggestion-icon">📚</div>
              <h4>Mis historias</h4>
              <p>Ve todas tus historias guardadas</p>
            </div>

            <!-- Para docentes -->
            <div v-if="esDocente" class="suggestion-card" @click="irADashboardDocente">
              <div class="suggestion-icon">🏠</div>
              <h4>Dashboard</h4>
              <p>Panel de control docente</p>
            </div>

            <div v-if="esDocente" class="suggestion-card" @click="irAGestionEstudiantes">
              <div class="suggestion-icon">👥</div>
              <h4>Estudiantes</h4>
              <p>Gestionar mis estudiantes</p>
            </div>

            <div v-if="esDocente" class="suggestion-card" @click="irAReportes">
              <div class="suggestion-icon">📊</div>
              <h4>Reportes</h4>
              <p>Ver estadísticas y progreso</p>
            </div>

            <!-- Comunes -->
            <div class="suggestion-card" @click="irARanking">
              <div class="suggestion-icon">🏆</div>
              <h4>Ranking</h4>
              <p>Ver los mejores puntajes</p>
            </div>

            <div class="suggestion-card" @click="irAPerfil">
              <div class="suggestion-icon">👤</div>
              <h4>Mi perfil</h4>
              <p>Configurar cuenta</p>
            </div>
          </div>
        </div>

        <!-- Buscador -->
        <div class="search-section">
          <h3 class="search-title">¿Buscabas algo específico?</h3>
          <div class="search-container">
            <div class="search-input-wrapper">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar historias, temas, personajes..."
                class="search-input"
                @keyup.enter="realizarBusqueda"
              />
              <button @click="realizarBusqueda" class="search-btn" :disabled="!searchQuery.trim()">
                🔍 Buscar
              </button>
            </div>
          </div>
        </div>

        <!-- Enlaces útiles -->
        <div class="useful-links">
          <h3 class="links-title">Enlaces útiles</h3>
          <div class="links-list">
            <router-link 
              v-for="link in linksUtiles" 
              :key="link.to"
              :to="link.to" 
              class="useful-link"
            >
              <span class="link-icon">{{ link.icon }}</span>
              <span class="link-text">{{ link.text }}</span>
            </router-link>
          </div>
        </div>

        <!-- Botones de acción principal -->
        <div class="action-buttons">
          <button @click="irAtras" class="btn btn-secondary">
            ← Volver atrás
          </button>
          <button @click="irAInicio" class="btn btn-primary">
            🏠 Ir al inicio
          </button>
          <button @click="recargarPagina" class="btn btn-outline">
            🔄 Recargar página
          </button>
        </div>

        <!-- Información técnica (para desarrolladores) -->
        <details v-if="mostrarInfoTecnica" class="technical-info">
          <summary>ℹ️ Información técnica</summary>
          <div class="tech-details">
            <p><strong>URL solicitada:</strong> {{ $route.fullPath }}</p>
            <p><strong>Timestamp:</strong> {{ new Date().toLocaleString() }}</p>
            <p><strong>User Agent:</strong> {{ navigator.userAgent.substring(0, 100) }}...</p>
            <p><strong>Referrer:</strong> {{ document.referrer || 'Directo' }}</p>
          </div>
        </details>
      </div>

      <!-- Footer con ayuda -->
      <div class="help-footer">
        <p>¿Necesitas ayuda? Puedes:</p>
        <div class="help-options">
          <button @click="reportarError" class="help-btn">
            🐛 Reportar problema
          </button>
          <button @click="contactarSoporte" class="help-btn">
            💬 Contactar soporte
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'NotFound',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    // ============================================================================
    // 🔄 ESTADO REACTIVO
    // ============================================================================
    
    const searchQuery = ref('')
    const currentMessageIndex = ref(0)
    const messageTimer = ref(null)
    const mostrarInfoTecnica = ref(false)
    
    const mensajesAmigables = [
      "¡Hola! Parece que esta página se perdió en el espacio 🌌",
      "No te preocupes, ¡juntos encontraremos lo que buscas! 🔍",
      "¿Sabías que hay muchas aventuras esperándote? ✨",
      "¡Esta página debe estar jugando al escondite! 🙈",
      "Mientras buscamos, ¿qué tal si creamos una nueva historia? 📖"
    ]
    
    // ============================================================================
    // 🔄 COMPUTED PROPERTIES
    // ============================================================================
    
    const esDocente = computed(() => authStore.isDocente)
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    
    const currentMessage = computed(() => {
      return mensajesAmigables[currentMessageIndex.value]
    })
    
    const linksUtiles = computed(() => {
      const baseLinks = [
        { to: '/ayuda', icon: '❓', text: 'Centro de ayuda' },
        { to: '/tutoriales', icon: '🎓', text: 'Tutoriales' },
        { to: '/novedades', icon: '🆕', text: 'Novedades' },
      ]
      
      if (isAuthenticated.value) {
        if (esDocente.value) {
          return [
            { to: '/dashboard-docente', icon: '🏠', text: 'Dashboard Docente' },
            { to: '/gestion-estudiantes', icon: '👥', text: 'Gestión Estudiantes' },
            ...baseLinks
          ]
        } else {
          return [
            { to: '/dashboard-alumno', icon: '🏠', text: 'Dashboard Alumno' },
            { to: '/crear-historia', icon: '✨', text: 'Crear Historia' },
            { to: '/mis-historias', icon: '📚', text: 'Mis Historias' },
            ...baseLinks
          ]
        }
      }
      
      return [
        { to: '/login', icon: '🔐', text: 'Iniciar Sesión' },
        { to: '/register', icon: '📝', text: 'Registrarse' },
        ...baseLinks
      ]
    })
    
    // ============================================================================
    // 🎯 MÉTODOS DE NAVEGACIÓN
    // ============================================================================
    
    const irAtras = () => {
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        irAInicio()
      }
    }
    
    const irAInicio = () => {
      if (!isAuthenticated.value) {
        router.push('/login')
      } else if (esDocente.value) {
        router.push('/dashboard-docente')
      } else {
        router.push('/dashboard-alumno')
      }
    }
    
    const irADashboard = () => {
      router.push('/dashboard-alumno')
    }
    
    const irADashboardDocente = () => {
      router.push('/dashboard-docente')
    }
    
    const irACrearHistoria = () => {
      router.push('/crear-historia')
    }
    
    const irAMisHistorias = () => {
      router.push('/mis-historias')
    }
    
    const irAGestionEstudiantes = () => {
      router.push('/gestion-estudiantes')
    }
    
    const irAReportes = () => {
      router.push('/dashboard-docente?tab=reportes')
    }
    
    const irARanking = () => {
      router.push('/ranking')
    }
    
    const irAPerfil = () => {
      router.push('/perfil')
    }
    
    const recargarPagina = () => {
      window.location.reload()
    }
    
    // ============================================================================
    // 🔍 BÚSQUEDA
    // ============================================================================
    
    const realizarBusqueda = () => {
      if (!searchQuery.value.trim()) return
      
      router.push({
        path: '/mis-historias',
        query: { busqueda: searchQuery.value.trim() }
      })
    }
    
    // ============================================================================
    // 🛠️ MÉTODOS AUXILIARES
    // ============================================================================
    
    const getRandomStarStyle = () => {
      return {
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
        animationDelay: Math.random() * 3 + 's',
        animationDuration: (Math.random() * 2 + 1) + 's'
      }
    }
    
    const reportarError = () => {
      // Aquí implementarías el reporte de errores
      alert('Función de reporte de errores - Por implementar')
    }
    
    const contactarSoporte = () => {
      // Aquí implementarías el contacto con soporte
      alert('Función de contacto con soporte - Por implementar')
    }
    
    const rotarMensajes = () => {
      messageTimer.value = setInterval(() => {
        currentMessageIndex.value = (currentMessageIndex.value + 1) % mensajesAmigables.length
      }, 4000)
    }
    
    // ============================================================================
    // 🚀 LIFECYCLE
    // ============================================================================
    
    onMounted(() => {
      // Rotar mensajes automáticamente
      rotarMensajes()
      
      // Mostrar info técnica en desarrollo
      mostrarInfoTecnica.value = process.env.NODE_ENV === 'development'
      
      // Log del error 404 para análisis
      console.log('404 - Página no encontrada:', router.currentRoute.value.fullPath)
    })
    
    onUnmounted(() => {
      if (messageTimer.value) {
        clearInterval(messageTimer.value)
      }
    })
    
    return {
      // Estados
      searchQuery,
      currentMessage,
      mostrarInfoTecnica,
      
      // Computed
      esDocente,
      isAuthenticated,
      linksUtiles,
      
      // Métodos de navegación
      irAtras,
      irAInicio,
      irADashboard,
      irADashboardDocente,
      irACrearHistoria,
      irAMisHistorias,
      irAGestionEstudiantes,
      irAReportes,
      irARanking,
      irAPerfil,
      recargarPagina,
      
      // Búsqueda
      realizarBusqueda,
      
      // Auxiliares
      getRandomStarStyle,
      reportarError,
      contactarSoporte
    }
  }
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  align-items: center;
  width: 100%;
}

/* ============================================================================ */
/* 🎨 ILUSTRACIÓN */
/* ============================================================================ */

.illustration-container {
  position: relative;
  height: 500px;
}

.main-illustration {
  position: relative;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 20px;
  overflow: hidden;
}

.space-scene {
  position: relative;
  width: 100%;
  height: 100%;
}

.stars {
  position: absolute;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: twinkle 2s infinite ease-in-out;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.planets {
  position: absolute;
  width: 100%;
  height: 100%;
}

.planet {
  position: absolute;
  font-size: 3em;
  animation: float 6s infinite ease-in-out;
}

.planet-1 {
  top: 20%;
  left: 70%;
  animation-delay: 0s;
}

.planet-2 {
  top: 60%;
  left: 10%;
  animation-delay: 2s;
}

.planet-3 {
  top: 40%;
  left: 80%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.rocket {
  position: absolute;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%);
  animation: rocket-drift 8s infinite ease-in-out;
}

.rocket-body {
  font-size: 4em;
  animation: rocket-shake 0.5s infinite ease-in-out;
}

.rocket-trail {
  position: absolute;
  top: 50%;
  left: -20px;
  transform: translateY(-50%);
}

.trail-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ff6b6b;
  border-radius: 50%;
  animation: trail-move 1s infinite ease-out;
}

.trail-particle:nth-child(2) {
  animation-delay: 0.2s;
  background: #ffa726;
}

.trail-particle:nth-child(3) {
  animation-delay: 0.4s;
  background: #ffee58;
}

@keyframes rocket-drift {
  0%, 100% { transform: translate(-50%, -50%) rotate(-5deg); }
  25% { transform: translate(-60%, -60%) rotate(5deg); }
  50% { transform: translate(-40%, -40%) rotate(-5deg); }
  75% { transform: translate(-55%, -55%) rotate(5deg); }
}

@keyframes rocket-shake {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(2px); }
}

@keyframes trail-move {
  0% { opacity: 1; transform: translateX(0) scale(1); }
  100% { opacity: 0; transform: translateX(-50px) scale(0.5); }
}

.character {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: end;
  gap: 15px;
}

.character-emoji {
  font-size: 3em;
  animation: character-wave 3s infinite ease-in-out;
}

@keyframes character-wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  75% { transform: rotate(-5deg); }
}

.speech-bubble {
  background: white;
  padding: 15px;
  border-radius: 15px;
  border-bottom-left-radius: 5px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  position: relative;
  max-width: 200px;
  animation: bubble-bounce 2s infinite ease-in-out;
}

.speech-bubble::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 15px solid white;
}

@keyframes bubble-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.speech-bubble p {
  margin: 0;
  font-size: 0.9em;
  color: #495057;
  font-weight: 500;
  line-height: 1.3;
}

/* ============================================================================ */
/* 📄 CONTENIDO */
/* ============================================================================ */

.content {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  max-height: 80vh;
  overflow-y: auto;
}

.error-code {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  font-size: 6em;
  font-weight: 900;
  color: #667eea;
}

.code-number {
  animation: number-pulse 2s infinite ease-in-out;
}

.code-zero {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.portal {
  position: relative;
  width: 80px;
  height: 80px;
}

.portal-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 3px solid #667eea;
  border-radius: 50%;
  animation: portal-spin 3s infinite linear;
}

.portal-ring:nth-child(1) {
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  animation-delay: 0s;
}

.portal-ring:nth-child(2) {
  width: 40px;
  height: 40px;
  margin: -20px 0 0 -20px;
  animation-delay: 0.5s;
  opacity: 0.7;
}

.portal-ring:nth-child(3) {
  width: 60px;
  height: 60px;
  margin: -30px 0 0 -30px;
  animation-delay: 1s;
  opacity: 0.4;
}

@keyframes number-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes portal-spin {
  to { transform: rotate(360deg); }
}

.title {
  font-size: 2.5em;
  color: #2d3748;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 700;
}

.description {
  font-size: 1.2em;
  color: #4a5568;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 40px;
}

/* ============================================================================ */
/* 💡 SUGERENCIAS */
/* ============================================================================ */

.suggestions {
  margin-bottom: 40px;
}

.suggestions-title {
  font-size: 1.5em;
  color: #2d3748;
  margin-bottom: 20px;
  text-align: center;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.suggestion-card {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 2px solid #e9ecef;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-card:hover {
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
}

.suggestion-icon {
  font-size: 2.5em;
  margin-bottom: 10px;
}

.suggestion-card h4 {
  color: #2d3748;
  margin-bottom: 8px;
  font-size: 1.1em;
}

.suggestion-card p {
  color: #6c757d;
  font-size: 0.9em;
  margin: 0;
  line-height: 1.4;
}

/* ============================================================================ */
/* 🔍 BÚSQUEDA */
/* ============================================================================ */

.search-section {
  margin-bottom: 40px;
  text-align: center;
}

.search-title {
  font-size: 1.3em;
  color: #2d3748;
  margin-bottom: 15px;
}

.search-input-wrapper {
  display: flex;
  gap: 10px;
  max-width: 400px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1em;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.search-btn:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================================================ */
/* 🔗 ENLACES ÚTILES */
/* ============================================================================ */

.useful-links {
  margin-bottom: 40px;
}

.links-title {
  font-size: 1.3em;
  color: #2d3748;
  margin-bottom: 15px;
  text-align: center;
}

.links-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.useful-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  text-decoration: none;
  color: #495057;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.3s ease;
}

.useful-link:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
}

/* ============================================================================ */
/* 🎯 BOTONES DE ACCIÓN */
/* ============================================================================ */

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* ============================================================================ */
/* ℹ️ INFORMACIÓN TÉCNICA */
/* ============================================================================ */

.technical-info {
  margin-top: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.technical-info summary {
  cursor: pointer;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
}

.tech-details {
  font-family: 'Courier New', monospace;
  font-size: 0.8em;
  color: #6c757d;
}

.tech-details p {
  margin: 5px 0;
  word-break: break-all;
}

/* ============================================================================ */
/* 🆘 FOOTER DE AYUDA */
/* ============================================================================ */

.help-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  color: #6c757d;
}

.help-options {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 10px;
}

.help-btn {
  background: transparent;
  border: 1px solid #dee2e6;
  color: #6c757d;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85em;
  transition: all 0.3s ease;
}

.help-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

/* ============================================================================ */
/* 📱 RESPONSIVE */
/* ============================================================================ */

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .illustration-container {
    height: 300px;
    order: 2;
  }
  
  .content {
    padding: 30px 20px;
    order: 1;
  }
  
  .error-code {
    font-size: 4em;
    gap: 10px;
  }
  
  .title {
    font-size: 2em;
  }
  
  .description {
    font-size: 1.1em;
  }
  
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
  
  .search-input-wrapper {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 250px;
    justify-content: center;
  }
  
  .help-options {
    flex-direction: column;
  }
  
  .character {
    position: relative;
    bottom: auto;
    left: auto;
    justify-content: center;
    margin-top: 20px;
  }
  
  .rocket-body {
    font-size: 3em;
  }
  
  .planet {
    font-size: 2em;
  }
}

@media (max-width: 480px) {
  .not-found-page {
    padding: 10px;
  }
  
  .content {
    padding: 20px 15px;
  }
  
  .error-code {
    font-size: 3em;
  }
  
  .title {
    font-size: 1.5em;
  }
  
  .description {
    font-size: 1em;
  }
  
  .speech-bubble {
    max-width: 150px;
  }
  
  .speech-bubble p {
    font-size: 0.8em;
  }
}
</style>