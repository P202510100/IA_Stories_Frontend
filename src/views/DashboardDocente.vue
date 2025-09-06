<template>
  <div class="dashboard-docente-container">
    <div class="container">
      
      <!-- Header de bienvenida -->
      <div class="welcome-header">
        <h1>👨‍🏫 Bienvenido, {{ user.nombre }}</h1>
        <p>Panel de control para gestión de estudiantes</p>
      </div>
      
      <!-- Estadísticas generales -->
      <div class="stats-grid" v-if="estadisticas">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{ estadisticas.total_estudiantes || 0 }}</h3>
            <p>Estudiantes Activos</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <h3>{{ estadisticas.total_historias || 0 }}</h3>
            <p>Historias Creadas</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <h3>{{ estadisticas.total_actividades || 0 }}</h3>
            <p>Actividades Completadas</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <h3>{{ estadisticas.promedio_puntos || 0 }}</h3>
            <p>Promedio de Puntos</p>
          </div>
        </div>
      </div>
      
      <!-- Secciones principales -->
      <div class="dashboard-sections">
        
        <!-- Lista de estudiantes -->
        <div class="section">
          <div class="section-header">
            <h2>👨‍🎓 Mis Estudiantes</h2>
            <div class="section-actions">
              <button @click="recargarEstudiantes" class="btn-refresh" :disabled="loading">
                🔄 Actualizar
              </button>
            </div>
          </div>
          
          <div v-if="estudiantes.length > 0" class="estudiantes-grid">
            <div
              v-for="estudiante in estudiantes"
              :key="estudiante.id"
              @click="verDetalleEstudiante(estudiante.id)"
              class="estudiante-card"
            >
              <div class="estudiante-avatar">
                {{ getInitials(estudiante.nombre) }}
              </div>
              
              <div class="estudiante-info">
                <h3>{{ estudiante.nombre }}</h3>
                <p class="estudiante-email">{{ estudiante.email }}</p>
                <div class="estudiante-stats">
                  <span class="stat-mini">
                    📚 {{ estudiante.total_historias || 0 }} historias
                  </span>
                  <span class="stat-mini">
                    ⭐ {{ estudiante.puntos_totales || 0 }} puntos
                  </span>
                </div>
                
                <div class="estudiante-nivel">
                  <span class="nivel-badge" :class="getNivelClase(estudiante.nivel_actual)">
                    {{ estudiante.nivel_actual || 'Principiante' }}
                  </span>
                </div>
              </div>
              
              <div class="estudiante-actions">
                <span class="btn-ver">Ver Detalle →</span>
              </div>
            </div>
          </div>
          
          <div v-else-if="!loading" class="empty-students">
            <div class="empty-icon">👨‍🎓</div>
            <h3>No hay estudiantes asignados</h3>
            <p>Los estudiantes aparecerán aquí cuando se registren y se asignen a tu clase</p>
          </div>
        </div>
        
        <!-- Ranking de estudiantes -->
        <div class="section">
          <div class="section-header">
            <h2>🏆 Ranking de Estudiantes</h2>
            <select v-model="tipoRanking" class="ranking-filter">
              <option value="puntos">Por Puntos</option>
              <option value="historias">Por Historias</option>
              <option value="actividades">Por Actividades</option>
            </select>
          </div>
          
          <div v-if="rankingEstudiantes.length > 0" class="ranking-list">
            <div
              v-for="(estudiante, index) in rankingEstudiantes"
              :key="estudiante.id"
              class="ranking-item"
              :class="getRankingClass(index)"
            >
              <div class="ranking-position">
                <span class="position-number">{{ index + 1 }}</span>
                <span class="position-medal">{{ getRankingMedal(index) }}</span>
              </div>
              
              <div class="ranking-info">
                <h4>{{ estudiante.nombre }}</h4>
                <p class="ranking-value">
                  {{ getRankingValue(estudiante) }}
                </p>
              </div>
              
              <div class="ranking-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: getRankingProgress(estudiante, index) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actividad reciente -->
        <div class="section">
          <div class="section-header">
            <h2>📈 Actividad Reciente</h2>
            <span class="periodo-actual">Últimos 7 días</span>
          </div>
          
          <div v-if="actividadReciente.length > 0" class="actividad-list">
            <div
              v-for="actividad in actividadReciente"
              :key="actividad.id"
              class="actividad-item"
            >
              <div class="actividad-icon">
                {{ getActividadIcon(actividad.tipo) }}
              </div>
              
              <div class="actividad-info">
                <h4>{{ actividad.estudiante_nombre }}</h4>
                <p>{{ actividad.descripcion }}</p>
                <span class="actividad-tiempo">{{ formatTimeAgo(actividad.fecha) }}</span>
              </div>
              
              <div class="actividad-resultado">
                <span class="puntos-ganados">+{{ actividad.puntos || 0 }} pts</span>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-activity">
            <p>📊 No hay actividad reciente para mostrar</p>
          </div>
        </div>
      </div>
      
      <!-- Loading -->
      <div v-if="loading" class="loading">
        🔄 Cargando información del dashboard...
      </div>
      
      <!-- Error -->
      <div v-if="error" class="error">
        {{ error }}
      </div>
      
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import apiService from '../services/api'

export default {
  name: 'DashboardDocente',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const estadisticas = ref(null)
    const estudiantes = ref([])
    const rankingEstudiantes = ref([])
    const actividadReciente = ref([])
    const loading = ref(true)
    const error = ref(null)
    const tipoRanking = ref('puntos')
    
    const user = computed(() => authStore.user)
    const profile = computed(() => authStore.profile)
    
    const cargarDatos = async () => {
      try {
        loading.value = true
        error.value = null
        
        if (!profile.value?.id) {
          throw new Error('No se encontró el perfil del docente')
        }
        
        // Cargar estadísticas generales
        try {
          const statsResponse = await apiService.obtenerEstadisticasDocente(profile.value.id)
          estadisticas.value = statsResponse
        } catch (err) {
          console.error('Error cargando estadísticas:', err)
          // Usar valores por defecto
          estadisticas.value = {
            total_estudiantes: 0,
            total_historias: 0,
            total_actividades: 0,
            promedio_puntos: 0
          }
        }
        
        // Cargar estudiantes
        try {
          const estudiantesResponse = await apiService.obtenerEstudiantesDocente(profile.value.id)
          estudiantes.value = estudiantesResponse.estudiantes || []
          
          // Actualizar estadísticas con datos reales
          estadisticas.value.total_estudiantes = estudiantes.value.length
        } catch (err) {
          console.error('Error cargando estudiantes:', err)
          // Usar datos de demo
          estudiantes.value = generarEstudiantesDemo()
          estadisticas.value.total_estudiantes = estudiantes.value.length
        }
        
        // Cargar ranking
        try {
          const rankingResponse = await apiService.obtenerRankingEstudiantes(profile.value.id)
          rankingEstudiantes.value = rankingResponse.ranking || estudiantes.value.slice(0, 5)
        } catch {
          rankingEstudiantes.value = [...estudiantes.value].sort((a, b) => (b.puntos_totales || 0) - (a.puntos_totales || 0))
        }
        
        // Generar actividad reciente (demo)
        actividadReciente.value = generarActividadDemo()
        
      } catch (err) {
        console.error('Error cargando datos del dashboard:', err)
        error.value = 'Error al cargar los datos del dashboard'
      } finally {
        loading.value = false
      }
    }
    
    const generarEstudiantesDemo = () => {
      return [
        {
          id: 1,
          nombre: "Ana García",
          email: "ana.garcia@estudiante.com",
          total_historias: 5,
          puntos_totales: 450,
          nivel_actual: "Explorador",
          ultima_actividad: new Date().toISOString()
        },
        {
          id: 2,
          nombre: "Carlos Ruiz",
          email: "carlos.ruiz@estudiante.com",
          total_historias: 3,
          puntos_totales: 320,
          nivel_actual: "Principiante",
          ultima_actividad: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          nombre: "María López",
          email: "maria.lopez@estudiante.com",
          total_historias: 7,
          puntos_totales: 680,
          nivel_actual: "Aventurero",
          ultima_actividad: new Date(Date.now() - 172800000).toISOString()
        }
      ]
    }
    
    const generarActividadDemo = () => {
      return [
        {
          id: 1,
          estudiante_nombre: "Ana García",
          tipo: "historia_completada",
          descripcion: "Completó la historia 'Aventura Espacial'",
          puntos: 85,
          fecha: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          estudiante_nombre: "Carlos Ruiz",
          tipo: "actividad_completada",
          descripcion: "Respondió correctamente 4/5 preguntas",
          puntos: 80,
          fecha: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 3,
          estudiante_nombre: "María López",
          tipo: "historia_creada",
          descripcion: "Creó una nueva historia de fantasía",
          puntos: 50,
          fecha: new Date(Date.now() - 14400000).toISOString()
        }
      ]
    }
    
    const recargarEstudiantes = () => {
      cargarDatos()
    }
    
    const verDetalleEstudiante = (estudianteId) => {
      router.push(`/estudiante/${estudianteId}`)
    }
    
    const getInitials = (nombre) => {
      return nombre.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    
    const getNivelClase = (nivel) => {
      const clases = {
        'Principiante': 'nivel-principiante',
        'Explorador': 'nivel-explorador',
        'Aventurero': 'nivel-aventurero',
        'Maestro': 'nivel-maestro'
      }
      return clases[nivel] || 'nivel-principiante'
    }
    
    const getRankingClass = (index) => {
      if (index === 0) return 'ranking-first'
      if (index === 1) return 'ranking-second'
      if (index === 2) return 'ranking-third'
      return ''
    }
    
    const getRankingMedal = (index) => {
      const medals = ['🥇', '🥈', '🥉', '🏅', '🎖️']
      return medals[index] || '⭐'
    }
    
    const getRankingValue = (estudiante) => {
      switch (tipoRanking.value) {
        case 'puntos':
          return `${estudiante.puntos_totales || 0} puntos`
        case 'historias':
          return `${estudiante.total_historias || 0} historias`
        case 'actividades':
          return `${estudiante.total_actividades || 0} actividades`
        default:
          return `${estudiante.puntos_totales || 0} puntos`
      }
    }
    
    const getRankingProgress = (estudiante, index) => {
      if (index === 0) return 100
      const maxValue = rankingEstudiantes.value[0]?.puntos_totales || 1
      const currentValue = estudiante.puntos_totales || 0
      return Math.max(10, (currentValue / maxValue) * 100)
    }
    
    const getActividadIcon = (tipo) => {
      const iconos = {
        'historia_completada': '📖',
        'actividad_completada': '🎯',
        'historia_creada': '✨',
        'pregunta_respondida': '❓'
      }
      return iconos[tipo] || '📝'
    }
    
    const formatTimeAgo = (fechaStr) => {
      const fecha = new Date(fechaStr)
      const ahora = new Date()
      const diffMs = ahora - fecha
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffDays > 0) {
        return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
      } else if (diffHours > 0) {
        return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
      } else {
        return 'hace unos minutos'
      }
    }
    
    onMounted(() => {
      cargarDatos()
    })
    
    return {
      user,
      profile,
      estadisticas,
      estudiantes,
      rankingEstudiantes,
      actividadReciente,
      loading,
      error,
      tipoRanking,
      recargarEstudiantes,
      verDetalleEstudiante,
      getInitials,
      getNivelClase,
      getRankingClass,
      getRankingMedal,
      getRankingValue,
      getRankingProgress,
      getActividadIcon,
      formatTimeAgo
    }
  }
}
</script>

<style scoped>
.dashboard-docente-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.welcome-header {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  margin-bottom: 30px;
}

.welcome-header h1 {
  color: white;
  font-size: 2.5em;
  margin-bottom: 10px;
}

.welcome-header p {
  color: rgba(255,255,255,0.8);
  font-size: 1.2em;
}

.dashboard-sections {
  display: grid;
  gap: 30px;
}

.section {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.section-header h2 {
  color: #667eea;
  font-size: 1.5em;
}

.btn-refresh {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s ease;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
}

.btn-refresh:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.estudiantes-grid {
  display: grid;
  gap: 20px;
}

.estudiante-card {
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.estudiante-card:hover {
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.estudiante-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  font-weight: bold;
}

.estudiante-info {
  flex: 1;
}

.estudiante-info h3 {
  color: #333;
  margin-bottom: 5px;
  font-size: 1.2em;
}

.estudiante-email {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.estudiante-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.stat-mini {
  background: #f1f3f4;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8em;
  color: #666;
}

.nivel-badge {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: 500;
}

.nivel-principiante {
  background: #e3f2fd;
  color: #1976d2;
}

.nivel-explorador {
  background: #f3e5f5;
  color: #7b1fa2;
}

.nivel-aventurero {
  background: #e8f5e8;
  color: #388e3c;
}

.nivel-maestro {
  background: #fff3e0;
  color: #f57c00;
}

.btn-ver {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9em;
}

.empty-students {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.empty-students h3 {
  color: #667eea;
  margin-bottom: 10px;
}

.empty-students p {
  color: #666;
}

.ranking-filter {
  padding: 8px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 20px;
  font-size: 0.9em;
  cursor: pointer;
}

.ranking-list {
  display: grid;
  gap: 15px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.ranking-first {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #8b6400;
}

.ranking-second {
  background: linear-gradient(45deg, #c0c0c0, #e8e8e8);
  color: #666;
}

.ranking-third {
  background: linear-gradient(45deg, #cd7f32, #d4a574);
  color: #6b4226;
}

.ranking-position {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.position-number {
  font-size: 1.2em;
  font-weight: bold;
}

.position-medal {
  font-size: 1.5em;
}

.ranking-info {
  flex: 1;
}

.ranking-info h4 {
  margin-bottom: 5px;
  font-size: 1.1em;
}

.ranking-value {
  color: #666;
  font-size: 0.9em;
}

.ranking-progress {
  width: 100px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(0,0,0,0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.periodo-actual {
  background: #f1f3f4;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8em;
  color: #666;
}

.actividad-list {
  display: grid;
  gap: 15px;
}

.actividad-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
}

.actividad-icon {
  font-size: 1.5em;
  width: 40px;
  text-align: center;
}

.actividad-info {
  flex: 1;
}

.actividad-info h4 {
  color: #333;
  margin-bottom: 5px;
  font-size: 1em;
}

.actividad-info p {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.actividad-tiempo {
  color: #888;
  font-size: 0.8em;
}

.puntos-ganados {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
}

.empty-activity {
  text-align: center;
  padding: 20px;
  color: #666;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .estudiante-card {
    flex-direction: column;
    text-align: center;
  }
  
  .estudiante-stats {
    justify-content: center;
  }
  
  .ranking-item {
    flex-wrap: wrap;
  }
  
  .actividad-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>