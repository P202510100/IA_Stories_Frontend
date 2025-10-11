<template>
  <div class="dashboard-docente-container">
    <div class="container">

      <!-- Header de bienvenida -->
      <div class="welcome-header">
        <h1>👨‍🏫 Bienvenido, {{ user.fullname }}</h1>
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
          
          <!--  ESTADO VACÍO MEJORADO (cuando no hay estudiantes asociados) -->
          <div v-if="!loading && estudiantes.length === 0" class="empty-state">
            <div class="empty-icon">👥</div>
            <h3>No hay estudiantes asociados</h3>
            <p>Para comenzar, necesitas asociar estudiantes a tu cuenta desde la sección de Gestión de Estudiantes.</p>
            <router-link to="/gestion-estudiantes" class="btn-primary-empty">
              📝 Gestionar Estudiantes
            </router-link>
            <div class="help-text">
              <p><strong>¿Cómo asociar estudiantes?</strong></p>
              <p>1. Ve a Gestión de Estudiantes</p>
              <p>2. Busca estudiantes registrados en la plataforma</p>
              <p>3. Haz clic en "Asociar" junto al estudiante deseado</p>
            </div>
          </div>
          
          <!-- Lista de estudiantes reales (solo cuando hay datos) -->
          <div v-else-if="estudiantes.length > 0" class="estudiantes-grid">
            <div
              v-for="estudiante in estudiantes"
              :key="estudiante.id || estudiante.user_id || estudiante.alumno_id"
              @click="verDetalleEstudiante(estudiante.id || estudiante.user_id || estudiante.alumno_id)"
              class="estudiante-card"
            >
              <div class="estudiante-avatar">
                {{ getInitials(estudiante.fullname) }}
              </div>

              <div class="estudiante-info">
                <h3>{{ estudiante.fullname }}</h3>
                <p class="estudiante-email">{{ estudiante.email }}</p>
                <div class="estudiante-stats">
                  <span class="stat-mini">
                    ⭐ {{ estudiante.total_points || 0 }} puntos
                  </span>
                </div>

                <div class="estudiante-nivel">
                  <span class="nivel-badge" :class="getNivelClase(estudiante.current_level)">
                    {{ estudiante.current_level || 'Principiante' }}
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
              :key="estudiante.id || estudiante.user_id || estudiante.alumno_id"
              class="ranking-item"
              :class="getRankingClass(index)"
            >
              <div class="ranking-position">
                <span class="position-number">{{ index + 1 }}</span>
                <span class="position-medal">{{ getRankingMedal(index) }}</span>
              </div>

              <div class="ranking-info">
                <h4>{{ estudiante.fullname }}</h4>
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
          
          <div v-else class="empty-ranking">
            <p>🏆 No hay estudiantes con puntuación para mostrar en el ranking</p>
            <p v-if="estudiantes.length === 0" class="empty-subtitle">
              Primero asocia estudiantes a tu cuenta
            </p>
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
            <p v-if="estudiantes.length === 0" class="empty-subtitle">
              La actividad aparecerá cuando tengas estudiantes asociados
            </p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        🔄 Cargando información del dashboard...
      </div>

      <!-- Error -->
      <div v-if="error" class="error">
        ⚠️ {{ error }}
        <button @click="recargarEstudiantes" class="btn-retry">
          🔄 Reintentar
        </button>
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

        const docenteId = profile.value.id
        const resp = await apiService.obtenerEstudiantesDocente(docenteId)
        console.log("📚 Respuesta del endpoint:", resp)

        // Puede venir como array plano o como {estudiantes: [...]}
        let raw = Array.isArray(resp) ? resp : (resp?.estudiantes ?? [])

        // Quedarnos SOLO con matriculados (robusto si viene boolean, número o string)
        const esMatriculado = (v) =>
            v === true || v === 1 || v === '1' || (typeof v === 'string' && v.toLowerCase() === 'true')

        raw = raw.filter(e => esMatriculado(e.matriculado))

        // 2) Normalizar estudiantes
        estudiantes.value = raw.map(normalizarEstudiante)

        console.log('✅ Estudiantes matriculados:', estudiantes.value.length)
        console.log('this is stunde.value: ',estudiantes.value)
        // 3) Estadísticas generales
        estadisticas.value = calcularEstadisticas(estudiantes.value)

        // 4) Ranking (top 3)
        rankingEstudiantes.value = calcularRanking(estudiantes.value, tipoRanking.value)

        // 5) Actividad reciente (3 últimas historias creadas)
        actividadReciente.value = construirActividadReciente(estudiantes.value)

      } catch (err) {
        console.error('❌ Error cargando datos del dashboard:', err)
        error.value = `Error al cargar los datos: ${err.message}`
        estudiantes.value = []
        estadisticas.value = { total_estudiantes: 0, total_historias: 0, total_actividades: 0, promedio_puntos: 0 }
        rankingEstudiantes.value = []
        actividadReciente.value = []
      } finally {
        loading.value = false
      }
    }

    function normalizarEstudiante(s) {
      const historiasArray = Array.isArray(s.historias) ? s.historias : []
      const historiasNorm = historiasArray.map(h => ({
        id: h.id || h.story_id,
        title: h.title || h.story?.title || 'Sin título',
        created_at: h.created_at || h.story?.created_at || h.fecha_creacion,
        points: h.points ?? h.puntos ?? 0
      }))

      return {
        id: s.id || s.user_id || s.alumno_id,
        fullname: s.fullname || [s.nombre, s.apellido].filter(Boolean).join(' ') || 'Sin nombre',
        email: s.email || '-',
        current_level: s.current_level || s.nivel || 'Principiante',

        // Métricas:
        total_points: s.total_points ?? s.puntos_totales ?? 0,
        total_historias: s.total_historias ?? s.story_count ?? historiasNorm.length,
        total_actividades: s.total_actividades ?? s.actividades_completadas ?? s.activities_count ?? 0,

        // Historias:
        historias: historiasNorm,

        // 🔖 Flag que viene del backend:
        matriculado: s.matriculado === true || s.matriculado === 1 || s.matriculado === '1' ||
            (typeof s.matriculado === 'string' && s.matriculado.toLowerCase() === 'true')
      }
    }

    function calcularEstadisticas(lista) {
      const total_estudiantes = lista.length
      const total_historias = lista.reduce((acc, e) => acc + (e.total_historias || 0), 0)
      const total_actividades = lista.reduce((acc, e) => acc + (e.total_actividades || 0), 0)
      const suma_puntos = lista.reduce((acc, e) => acc + (e.total_points || 0), 0)
      const promedio_puntos = total_estudiantes > 0 ? Math.round(suma_puntos / total_estudiantes) : 0

      return {
        total_estudiantes,
        total_historias,
        total_actividades,
        promedio_puntos
      }
    }

    function calcularRanking(lista, tipo) {
      const getMetric = (e) => {
        switch (tipo) {
          case 'historias':   return e.total_historias || 0
          case 'actividades': return e.total_actividades || 0
          case 'puntos':
          default:            return e.total_points || 0
        }
      }

      return lista
          .slice()
          .sort((a, b) => getMetric(b) - getMetric(a))
          .slice(0, 3)
    }

    function construirActividadReciente(lista) {
      // Sin usar flatMap: aplanamos con reduce/forEach
      const items = []
      lista.forEach(est => {
        (est.historias || []).forEach(hist => {
          items.push({
            id: `${est.id}-${hist.id}`,
            estudiante_nombre: est.fullname,
            tipo: 'historia_creada',
            descripcion: `Creó la historia "${hist.title}"`,
            puntos: hist.points || 0,
            fecha: hist.created_at
          })
        })
      })

      return items
          .filter(i => i.fecha) // solo con fecha válida
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 3)
    }

    const recargarEstudiantes = () => {
      cargarDatos()
    }

    const verDetalleEstudiante = (estudianteId) => {
      console.log(`👤 Navegando a detalle de estudiante ${estudianteId}`)
      router.push(`/estudiante/${estudianteId}`)
    }

    const getInitials = (nombre) => {
      if (!nombre) return '??'
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
        case 'historias':   return `${estudiante.total_historias || 0} historias`
        case 'actividades': return `${estudiante.total_actividades || 0} actividades`
        case 'puntos':
        default:            return `${estudiante.total_points || 0} puntos`
      }
    }

    const getRankingProgress = (estudiante, index) => {
      const metric = (e) => {
        switch (tipoRanking.value) {
          case 'historias':   return e.total_historias || 0
          case 'actividades': return e.total_actividades || 0
          case 'puntos':
          default:            return e.total_points || 0
        }
      }

      if (index === 0) return 100
      const maxValue = rankingEstudiantes.value.length ? metric(rankingEstudiantes.value[0]) : 1
      const currentValue = metric(estudiante)
      if (maxValue <= 0) return 10
      return Math.max(10, Math.round((currentValue / maxValue) * 100))
    }

    const getActividadIcon = (tipo) => {
      const iconos = {
        'historia_completada': '📖',
        'actividad_completada': '🎯',
        'historia_creada': '✨',
        'pregunta_respondida': '❓',
        'actividad_reciente': '📈'
      }
      return iconos[tipo] || '📝'
    }

    const formatTimeAgo = (fechaStr) => {
      if (!fechaStr) return ''
      
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
        return 'hace unos momentos'
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 2.5em;
}

.stat-info h3 {
  font-size: 2em;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}

.stat-info p {
  color: #666;
  margin: 5px 0 0 0;
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

/* ✅ ESTADO VACÍO MEJORADO */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-state h3 {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.empty-state p {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.6;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.btn-primary-empty {
  display: inline-block;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 15px 30px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1em;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary-empty:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  color: white;
  text-decoration: none;
}

.help-text {
  margin-top: 30px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 15px;
  text-align: left;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
  border-left: 4px solid #667eea;
}

.help-text strong {
  color: #667eea;
  font-size: 1.1em;
  display: block;
  margin-bottom: 10px;
}

.help-text p {
  margin-bottom: 8px;
  font-size: 0.95em;
  color: #555;
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

.empty-ranking, .empty-activity {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-subtitle {
  color: #999;
  font-size: 0.9em;
  margin-top: 5px;
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

.loading {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
  color: white;
}

.error {
  background: #ffebee;
  color: #c62828;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
  text-align: center;
  border-left: 4px solid #c62828;
}

.btn-retry {
  background: #c62828;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 0.9em;
}

.btn-retry:hover {
  background: #b71c1c;
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

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>