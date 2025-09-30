
<template>
  <div class="dashboard-alumno">
    <div class="container">
      
      <!-- Header con bienvenida -->
      <div class="welcome-header">
        <div class="welcome-content">
          <h1>¡Hola, {{ profile?.fullname || 'Explorador' }}! 👋</h1>
          <p>¿Listo para tu próxima aventura?</p>
        </div>
        <div class="level-badge" v-if="estadisticas">
          <span class="level-icon">🌟</span>
          <div class="level-info">
            <div class="level-name">{{ estadisticas.nivel_actual?.nombre || 'Principiante' }}</div>
            <div class="points">{{ estadisticas.puntos_totales || 0 }} puntos</div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando tu panel...</p>
      </div>

      <!-- Main content -->
      <div v-else-if="!error" class="dashboard-content">
        
        <!-- Estadísticas principales -->
        <div class="stats-section">
          <h2>📊 Tus Estadísticas</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div class="stat-info">
                <div class="stat-number">{{ estadisticas?.total_historias || 0 }}</div>
                <div class="stat-label">Historias Leídas</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-info">
                <div class="stat-number">{{ estadisticas?.puntos_totales || 0 }}</div>
                <div class="stat-label">Puntos Totales</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-info">
                <div class="stat-number">{{ estadisticas?.total_actividades || 0 }}</div>
                <div class="stat-label">Actividades</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-info">
                <div class="stat-number">{{ Math.round(estadisticas?.promedio_respuestas || 0) }}%</div>
                <div class="stat-label">Precisión</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones rápidas -->
        <div class="actions-section">
          <h2>🚀 Acciones Rápidas</h2>
          <div class="actions-grid">
            <div @click="irACrearHistoria" class="action-card primary">
              <div class="action-icon">✨</div>
              <h3>Crear Nueva Historia</h3>
              <p>Deja que la IA cree una aventura especial para ti</p>
            </div>
            
            <div @click="irAMisHistorias" class="action-card">
              <div class="action-icon">📖</div>
              <h3>Mis Historias</h3>
              <p>Ve todas las historias que has creado</p>
            </div>
            
            <div @click="irARanking" class="action-card">
              <div class="action-icon">🏆</div>
              <h3>Ranking de Clase</h3>
              <p>Ve cómo te comparas con tus compañeros</p>
            </div>
            
            <div @click="irAPerfil" class="action-card">
              <div class="action-icon">⚙️</div>
              <h3>Mi Perfil</h3>
              <p>Actualiza tus intereses y configuración</p>
            </div>
          </div>
        </div>

        <!-- Historias recientes -->
        <div v-if="historiasRecientes.length > 0" class="recent-section">
          <h2>📖 Tus Historias Recientes</h2>
          <div class="recent-grid">
            <div
              v-for="historia in historiasRecientes"
              :key="historia.id"
              @click="verHistoria(historia.id)"
              class="historia-card"
            >
              <div class="historia-header">
                <div class="historia-icon">{{ getEmojiTema(historia.tema) }}</div>
                <div class="historia-date">{{ formatDate(historia.created_at) }}</div>
              </div>
              <div class="historia-content">
                <h3>{{ historia.titulo }}</h3>
                <p class="historia-tema">{{ getTemaLabel(historia.tema) }}</p>
                <div class="historia-stats" v-if="historia.puntos_obtenidos">
                  <span class="puntos">⭐ {{ historia.puntos_obtenidos }} puntos</span>
                </div>
              </div>
              <div class="historia-action">
                <span class="btn-small">Leer →</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="empty-state">
          <div class="empty-icon">🌟</div>
          <h3>¡Comienza tu aventura!</h3>
          <p>Aún no has creado ninguna historia. ¡Es hora de comenzar!</p>
          <button @click="irACrearHistoria" class="btn btn-primary">
            ✨ Crear Mi Primera Historia
          </button>
        </div>

      </div>

      <!-- Error state -->
      <div v-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>¡Oops! Algo salió mal</h3>
        <p>{{ error }}</p>
        <button @click="recargarDatos" class="btn btn-secondary">
          🔄 Intentar de nuevo
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useHistoriasStore } from '../stores/historias'

export default {
  name: 'DashboardAlumno',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const historiasStore = useHistoriasStore()
    
    // Estado del componente
    const loading = ref(true)
    const error = ref(null)
    const estadisticas = ref(null)

    // Computed properties
    const profile = computed(() => authStore.profile)
    const user = computed(() => authStore.user)
    const historiasRecientes = computed(() => {
      return historiasStore.historiasRecientes?.slice(0, 6) || []
    })

    // ============================================================================
    // 🚀 LIFECYCLE
    // ============================================================================
    
    onMounted(async () => {
      console.log('🏠 Iniciando Dashboard Alumno...')
      console.log('profile in dashbaordlaumno: ', profile._value.name)
      // Verificar autenticación
      if (!authStore.isAuthenticated || !authStore.isAlumno) {
        console.error('❌ Acceso no autorizado')
        router.push('/login')
        return
      }

      await cargarDatosDashboard()
    })

    // ============================================================================
    // 🔄 CARGA DE DATOS
    // ============================================================================
    
    async function cargarDatosDashboard() {
  loading.value = true
  error.value = null

  try {
    // ✅ OBTENER USUARIO DE FORMA MÁS ROBUSTA
    let usuarioActual = profile.value || user.value || authStore.user

    // Si no tenemos usuario, intentar cargar desde localStorage
    if (!usuarioActual?.id) {
      console.log('🔄 Usuario no encontrado en store, cargando desde localStorage...')
      
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          if (parsedUser && parsedUser.id && parsedUser.tipo === 'alumno') {
            usuarioActual = parsedUser
            // ✅ Actualizar el store con los datos encontrados
            authStore.user = parsedUser
            console.log('✅ Usuario cargado desde localStorage:', parsedUser.nombre)
          }
        }
      } catch (e) {
        console.error('Error cargando desde localStorage:', e)
      }
    }

    
    if (!usuarioActual?.id) {
      throw new Error('No se pudo cargar la información del usuario. Por favor, inicia sesión nuevamente.')
    }

    console.log('📊 Cargando datos del dashboard para usuario:', usuarioActual.nombre)

    // ✅ CARGAR DATOS (con datos simulados por ahora para evitar más errores)
    try {
      // Intentar cargar estadísticas reales si tienes el endpoint
      // const stats = await apiService.obtenerEstadisticasAlumno(usuarioActual.id)
      
      // Por ahora, usar datos básicos para que funcione
      estadisticas.value = {
        historias_completadas: 0,
        puntos_totales: 0,
        respuestas_correctas: 0,
        nivel_actual: 'Principiante',
        ultimo_acceso: new Date().toISOString()
      }
      
      console.log('✅ Estadísticas cargadas (datos básicos)')
    } catch (statsError) {
      console.warn('⚠️ Error cargando estadísticas:', statsError)
      // Continuar con datos por defecto
      estadisticas.value = {
        historias_completadas: 0,
        puntos_totales: 0,
        respuestas_correctas: 0,
        nivel_actual: 'Principiante'
      }
    }

    
// ✅ CARGAR HISTORIAS RECIENTES
try {
  if (typeof historiasStore.cargarHistoriasRecientes === 'function') {
    await historiasStore.cargarHistoriasRecientes(usuarioActual.id)
    console.log('✅ Historias recientes cargadas')
  } else {
    // Inicializar historias recientes como array vacío
    historiasStore.historiasRecientes = []
    console.log('📝 Función cargarHistoriasRecientes no implementada, usando array vacío')
  }
} catch (historiasError) {
  console.warn('⚠️ Error cargando historias:', historiasError)
  // No es crítico, continuar
  historiasStore.historiasRecientes = []
}

    console.log('✅ Dashboard cargado exitosamente')
    
  } catch (err) {
    console.error('❌ Error cargando dashboard:', err)
    error.value = err.message || 'Error cargando la información del dashboard'
    
    // Si es un error de autenticación, ofrecer relogin
    if (err.message.includes('inicia sesión')) {
      setTimeout(() => {
        if (confirm('¿Quieres ir al login para iniciar sesión nuevamente?')) {
          authStore.logout()
          router.push('/login')
        }
      }, 2000)
    }
  } finally {
    loading.value = false
  }
}

    async function cargarEstadisticas() {
      try {
        console.log('📊 Cargando estadísticas del alumno...')
        estadisticas.value = await historiasStore.cargarEstadisticasAlumno(profile.value.id)
      } catch (err) {
        console.error('❌ Error cargando estadísticas:', err)
        // No lanzar error, usar datos por defecto
        estadisticas.value = {
          total_historias: 0,
          puntos_totales: 0,
          total_actividades: 0,
          promedio_respuestas: 0,
          nivel_actual: { nombre: 'Principiante' }
        }
      }
    }

    async function cargarHistoriasRecientes() {
      try {
        console.log('📚 Cargando historias recientes...')
        await historiasStore.cargarHistoriasAlumno(profile.value.id)
      } catch (err) {
        console.error('❌ Error cargando historias:', err)
        // No lanzar error, continuar sin historias
      }
    }

    async function recargarDatos() {
      await cargarDatosDashboard()
    }

    // ============================================================================
    // 🧭 NAVEGACIÓN
    // ============================================================================
    
    function irACrearHistoria() {
      router.push('/crear-historia')
    }

    function irAMisHistorias() {
      router.push('/mis-historias')
    }

    function irARanking() {
      router.push('/ranking')
    }

    function irAPerfil() {
      router.push('/perfil')
    }

    function verHistoria(historiaId) {
      router.push(`/historia/${historiaId}`)
    }

    // ============================================================================
    // 🔧 MÉTODOS AUXILIARES
    // ============================================================================
    
    function getEmojiTema(tema) {
      const emojis = {
        'aventura': '🗺️',
        'fantasia': '🧙‍♂️',
        'espacio': '🚀',
        'naturaleza': '🌿',
        'misterio': '🔍',
        'ciencia': '🔬',
        'deportes': '⚽',
        'amistad': '👫'
      }
      return emojis[tema] || '📚'
    }

    function getTemaLabel(tema) {
      const labels = {
        'aventura': 'Aventura',
        'fantasia': 'Fantasía',
        'espacio': 'Espacio',
        'naturaleza': 'Naturaleza',
        'misterio': 'Misterio',
        'ciencia': 'Ciencia',
        'deportes': 'Deportes',
        'amistad': 'Amistad'
      }
      return labels[tema] || tema
    }

    function formatDate(dateString) {
      if (!dateString) return ''
      
      try {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = now - date
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) return 'Hoy'
        if (diffDays === 1) return 'Ayer'
        if (diffDays < 7) return `Hace ${diffDays} días`
        
        return date.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short' 
        })
      } catch (e) {
        return ''
      }
    }

    return {
      // Estado
      loading,
      error,
      estadisticas,
      
      // Computed
      profile,
      user,
      historiasRecientes,
      
      // Métodos
      recargarDatos,
      irACrearHistoria,
      irAMisHistorias,
      irARanking,
      irAPerfil,
      verHistoria,
      getEmojiTema,
      getTemaLabel,
      formatDate
    }
  }
}
</script>

<style scoped>
.dashboard-alumno {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  color: white;
  flex-wrap: wrap;
  gap: 20px;
}

.welcome-content h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.welcome-content p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.level-badge {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.2);
  padding: 15px 20px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.level-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.level-info {
  text-align: left;
}

.level-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.points {
  font-size: 0.9rem;
  opacity: 0.9;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.stats-section,
.actions-section,
.recent-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.stats-section h2,
.actions-section h2,
.recent-section h2 {
  font-size: 1.5rem;
  margin-bottom: 25px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  border: 1px solid #e0e0e0;
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 15px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  padding: 25px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #e0e0e0;
  background: white;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.action-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.action-card.primary:hover {
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.action-card h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.action-card p {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.historia-card {
  border: 1px solid #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.historia-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: #667eea;
}

.historia-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.historia-icon {
  font-size: 1.5rem;
}

.historia-date {
  font-size: 0.8rem;
  color: #666;
}

.historia-content {
  padding: 20px;
}

.historia-content h3 {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #333;
}

.historia-tema {
  font-size: 0.9rem;
  color: #667eea;
  margin-bottom: 10px;
}

.historia-stats {
  margin-bottom: 10px;
}

.puntos {
  font-size: 0.9rem;
  color: #28a745;
  font-weight: bold;
}

.historia-action {
  padding: 0 20px 20px;
}

.btn-small {
  display: inline-block;
  padding: 8px 15px;
  background: #667eea;
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  text-decoration: none;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #333;
}

.empty-state p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 30px;
}

.btn {
  padding: 15px 30px;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 10px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.error-container {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.error-container h3 {
  color: #e74c3c;
  margin-bottom: 15px;
}

.error-container p {
  color: #666;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .welcome-header {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .recent-grid {
    grid-template-columns: 1fr;
  }
}
</style>