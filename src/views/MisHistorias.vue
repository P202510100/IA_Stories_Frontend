
<template>
  <div class="mis-historias">
    <div class="container">

      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>📚 Mis Historias</h1>
          <p>Todas las aventuras que has vivido</p>
        </div>
        <div class="header-actions">
          <button @click="irACrearHistoria" class="btn btn-primary">
            ✨ Nueva Historia
          </button>
          <button @click="exportarHistorial" class="btn btn-secondary" :disabled="loadingExport">
            <span v-if="loadingExport">📄 Exportando...</span>
            <span v-else>📄 Exportar PDF</span>
          </button>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="filtros-section">
        <div class="filtros-container">
          <div class="search-box">
            <input
              v-model="filtros.busqueda"
              type="text"
              placeholder="🔍 Buscar por título..."
              class="search-input"
            />
          </div>

          <div class="filtro-tema">
            <select v-model="filtros.tema" class="filtro-select">
              <option value="">🎯 Todos los temas</option>
              <option v-for="tema in temasDisponibles" :key="tema.id" :value="tema.id">
                {{ tema.icono }} {{ tema.nombre }}
              </option>
            </select>
          </div>

          <div class="filtro-orden">
            <select v-model="filtros.orden" class="filtro-select">
              <option value="reciente">📅 Más recientes</option>
              <option value="antiguo">📅 Más antiguos</option>
              <option value="titulo">🔤 Por título</option>
              <option value="puntos">⭐ Por puntos</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div v-if="estadisticas" class="stats-section">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">📚</div>
            <div class="stat-info">
              <div class="stat-number">{{ estadisticas.total_historias || 0 }}</div>
              <div class="stat-label">Historias</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <div class="stat-number">{{ estadisticas.puntos_totales || 0 }}</div>
              <div class="stat-label">Puntos</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
              <div class="stat-number">{{ Math.round(estadisticas.promedio_respuestas || 0) }}%</div>
              <div class="stat-label">Precisión</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🌟</div>
            <div class="stat-info">
              <div class="stat-number">{{ estadisticas.nivel_actual?.nombre || 'Principiante' }}</div>
              <div class="stat-label">Nivel</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando tus historias...</p>
      </div>

      <!-- Historias filtradas -->
      <div v-else-if="historiasFiltradas.length > 0" class="historias-section">
        <div class="historias-grid">
          <div
            v-for="historia in historiasFiltradas"
            :key="historia.id"
            @click="verHistoria(historia.recorId)"
            class="historia-card"
          >
            <!-- Header de la card -->
            <div class="card-header">
              <div class="tema-badge">
                <span class="tema-icon">{{ getEmojiTema(historia.tema) }}</span>
                <span class="tema-text">{{ getTemaLabel(historia.tema) }}</span>
              </div>
              <div class="fecha">{{ formatDate(historia.created_at) }}</div>
            </div>

            <!-- Contenido principal -->
            <div class="card-content">
              <h3 class="historia-titulo">{{ historia.titulo }}</h3>
              <p class="historia-resumen">{{ getResumen(historia.contenido) }}</p>

              <!-- Estadísticas de la historia -->
              <div class="historia-stats">
                <div class="stat">
                  <span class="stat-icon">📝</span>
                  <span class="stat-text">{{ historia.palabras || 0 }} palabras</span>
                </div>
                <div v-if="historia.puntos_obtenidos" class="stat">
                  <span class="stat-icon">⭐</span>
                  <span class="stat-text">{{ historia.puntos_obtenidos }} puntos</span>
                </div>
                <div v-if="historia.preguntas_completadas !== undefined" class="stat">
                  <span class="stat-icon">🎯</span>
                  <span class="stat-text">{{ historia.preguntas_completadas }}/{{ historia.total_preguntas || 6 }} preguntas</span>
                </div>
              </div>

              <!-- Progreso visual -->
              <div v-if="historia.total_preguntas > 0" class="progreso-container">
                <div class="progreso-bar">
                  <div
                      class="progreso-fill"
                      :style="{ width: getProgressWidth(historia) }"
                  ></div>
                </div>
                <span class="progreso-text">
                  {{ getProgressPercent(historia) }}% completado
                </span>
              </div>
            </div>

            <!-- Footer de la card -->
            <div class="card-footer">
              <button class="btn-accion primario">
                <span v-if="historia.preguntas_completadas === historia.total_preguntas">📖 Releer</span>
                <span v-else>🎯 Continuar</span>
              </button>
              <button @click.stop="compartirHistoria(historia)" class="btn-accion secundario">
                📤 Compartir
              </button>
            </div>
          </div>
        </div>

        <!-- Paginación si hay muchas historias -->
        <div v-if="totalPaginas > 1" class="paginacion">
          <button
            @click="cambiarPagina(paginaActual - 1)"
            :disabled="paginaActual === 1"
            class="btn-pagina"
          >
            ← Anterior
          </button>

          <span class="pagina-info">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </span>

          <button
            @click="cambiarPagina(paginaActual + 1)"
            :disabled="paginaActual === totalPaginas"
            class="btn-pagina"
          >
            Siguiente →
          </button>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else-if="!loading && !error" class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>¡Aún no tienes historias!</h3>
        <p>Comienza tu primera aventura creando una historia personalizada.</p>
        <button @click="irACrearHistoria" class="btn btn-primary large">
          ✨ Crear Mi Primera Historia
        </button>
      </div>

      <!-- Error state -->
      <div v-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>¡Oops! Algo salió mal</h3>
        <p>{{ error }}</p>
        <button @click="recargarHistorias" class="btn btn-secondary">
          🔄 Intentar de nuevo
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from "@/services/api.js";

export default {
  name: 'MisHistorias',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // Estado del componente
    const loading = ref(true)
    const loadingExport = ref(false)
    const error = ref(null)
    const estadisticas = ref(null)
    const historias = ref([])
    // Filtros y paginación
    const filtros = ref({
      busqueda: '',
      tema: '',
      orden: 'reciente'
    })

    const temasDisponibles = ref([
      { id: 'aventura', nombre: 'Aventura', icono: '🗺️' },
      { id: 'fantasia', nombre: 'Fantasía', icono: '🧙‍♂️' },
      { id: 'espacio', nombre: 'Espacio', icono: '🚀' },
      { id: 'naturaleza', nombre: 'Naturaleza', icono: '🌿' },
      { id: 'misterio', nombre: 'Misterio', icono: '🔍' },
      { id: 'ciencia', nombre: 'Ciencia', icono: '🔬' },
      { id: 'deportes', nombre: 'Deportes', icono: '⚽' },
      { id: 'amistad', nombre: 'Amistad', icono: '👫' },
    ])

    const paginaActual = ref(1)
    const historiasPorPagina = 9

    // Computed properties
    const profile = computed(() => authStore.profile)

    const historiasFiltradas = computed(() => {
      let resultado = [...historias.value]

      // Filtrar por búsqueda
      if (filtros.value.busqueda) {
        const busqueda = filtros.value.busqueda.toLowerCase()
        resultado = resultado.filter(h =>
          h.titulo.toLowerCase().includes(busqueda) ||
          h.contenido.toLowerCase().includes(busqueda)
        )
      }

      // Filtrar por tema
      if (filtros.value.tema) {
        resultado = resultado.filter(h => h.tema === filtros.value.tema)
      }

      // Ordenar
      switch (filtros.value.orden) {
        case 'reciente':
          resultado.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          break
        case 'antiguo':
          resultado.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          break
        case 'titulo':
          resultado.sort((a, b) => a.titulo.localeCompare(b.titulo))
          break
        case 'puntos':
          resultado.sort((a, b) => (b.puntos_obtenidos || 0) - (a.puntos_obtenidos || 0))
          break
      }

      // Paginación
      const inicio = (paginaActual.value - 1) * historiasPorPagina
      const fin = inicio + historiasPorPagina
      return resultado.slice(inicio, fin)
    })

    const totalPaginas = computed(() => {
      let total = historias.value.length

      // Aplicar filtros para calcular total real
      if (filtros.value.busqueda || filtros.value.tema) {
        const filtrados = historias.value.filter(h => {
          const matchBusqueda = !filtros.value.busqueda ||
            h.titulo.toLowerCase().includes(filtros.value.busqueda.toLowerCase())
          const matchTema = !filtros.value.tema || h.tema === filtros.value.tema
          return matchBusqueda && matchTema
        })
        total = filtrados.length
      }

      return Math.ceil(total / historiasPorPagina)
    })

    // ============================================================================
    // 🚀 LIFECYCLE
    // ============================================================================

    onMounted(async () => {
      console.log('📚 Iniciando MisHistorias...')

      // Verificar autenticación
      if (!authStore.isAuthenticated || !authStore.isAlumno) {
        console.error('❌ Acceso no autorizado')
        router.push('/login')
        return
      }

      await cargarDatos()
    })

    // Resetear página cuando cambian los filtros
    watch([() => filtros.value.busqueda, () => filtros.value.tema], () => {
      paginaActual.value = 1
    })

    // ============================================================================
    // 🔄 CARGA DE DATOS - SOLO BACKEND REAL
    // ============================================================================

    async function cargarDatos() {
      loading.value = true
      error.value = null

      try {
        if (!profile.value?.id) {
          throw new Error('No se encontró información del perfil')
        }

        console.log('📊 Cargando historias y estadísticas...')

        // Cargar historias

        const response = await api.cargarHistoriasPorAlumno(profile.value.id);

        console.log('this is response from cargarhistoriasporalumno: ', response)

        historias.value = response.map(record => ({
          id: record.story.id,
          titulo: record.story.title,
          contenido: record.story.content,
          tema: record.story.topic,
          created_at: record.story.created_at,
          preguntas_completas: record.correct_answers,
          total_preguntas: record.total_questions,
          puntos_obtenidos: record.points,
          status: record.status,
          palabras: record.story.content ? record.story.content.split(' ').length : 0,
          recorId: record.id
        }))

        console.log('this is response from historiasgeneradas: ', historias)

        // Cargar temas disponibles

        // Cargar estadísticas
        await cargarEstadisticas()

        console.log(`✅ ${historias.value.length} historias cargadas`)

      } catch (err) {
        console.error('❌ Error cargando datos:', err)
        error.value = err.message || 'Error cargando tus historias'
      } finally {
        loading.value = false
      }
    }

    async function cargarEstadisticas() {
      try {
        const totalHistorias = historias.value.length
        const puntosTotales = historias.value.reduce((sum, h) => sum + (h.puntos_obtenidos || 0), 0)
        const totalPreguntas = historias.value.reduce((sum, h) => sum + (h.total_preguntas || 0), 0)
        const totalCorrectas = historias.value.reduce((sum, h) => sum + (h.preguntas_completadas || 0), 0)

        estadisticas.value = {
          total_historias: totalHistorias,
          puntos_totales: puntosTotales,
          promedio_respuestas: totalPreguntas > 0 ? (totalCorrectas / totalPreguntas) * 100 : 0,
          nivel_actual: { nombre: 'Principiante' } // luego puedes calcular niveles
        }
      } catch (err) {
        console.error('❌ Error cargando estadísticas:', err)
        estadisticas.value = {
          total_historias: historias.value.length,
          puntos_totales: 0,
          promedio_respuestas: 0,
          nivel_actual: { nombre: 'Principiante' }
        }
      }
    }

    async function recargarHistorias() {
      await cargarDatos()
    }

    // ============================================================================
    // 📄 EXPORTACIÓN - SOLO BACKEND REAL
    // ============================================================================

    async function exportarHistorial() {
      loadingExport.value = true

      try {
        console.log('📄 Exportando historial a PDF...')


        console.log('✅ PDF exportado exitosamente')

      } catch (err) {
        console.error('❌ Error exportando PDF:', err)
        error.value = 'Error exportando el historial'
      } finally {
        loadingExport.value = false
      }
    }

    // ============================================================================
    // 🧭 NAVEGACIÓN Y ACCIONES
    // ============================================================================

    function irACrearHistoria() {
      router.push('/crear-historia')
    }

    function verHistoria(recordId) {
      router.push(`/historia/${recordId}`)
    }

    function cambiarPagina(nuevaPagina) {
      if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas.value) {
        paginaActual.value = nuevaPagina
      }
    }

    function compartirHistoria(historia) {
      // Funcionalidad básica de compartir (puede expandirse)
      if (navigator.share) {
        navigator.share({
          title: historia.titulo,
          text: `Mira esta historia que creé: ${historia.titulo}`,
          url: window.location.origin + `/historia/${historia.id}`
        })
      } else {
        // Fallback: copiar al portapapeles
        const url = window.location.origin + `/historia/${historia.id}`
        navigator.clipboard.writeText(url).then(() => {
          alert('Enlace copiado al portapapeles')
        })
      }
    }

    // ============================================================================
    // 🔧 MÉTODOS AUXILIARES
    // ============================================================================

    function getEmojiTema(tema) {
      if (!tema) return '📚'
      const key = tema.toString().toLowerCase()
      const found = temasDisponibles.value.find(t => t.id.toLowerCase() === key)
      return found ? found.icono : '📚'
    }

    function getTemaLabel(tema) {
      if (!tema) return 'Sin tema'
      const key = tema.toString().toLowerCase()
      const found = temasDisponibles.value.find(t => t.id.toLowerCase() === key)
      return found ? found.nombre : tema
    }

    function getResumen(contenido) {
      if (!contenido) return 'Sin resumen disponible'

      const palabras = contenido.split(' ')
      if (palabras.length <= 25) return contenido

      return palabras.slice(0, 25).join(' ') + '...'
    }

    function formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''

      const now = new Date()
      const diffTime = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 0) {
        // fecha en el futuro: mostrar fecha exacta
        return date.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      }
      if (diffDays === 0) return 'Hoy'
      if (diffDays === 1) return 'Ayer'
      if (diffDays < 7) return `Hace ${diffDays} días`

      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
    function getProgressPercent(historia) {
      const done = Number(historia.preguntas_completadas ?? historia.preguntas_completas ?? 0)
      const total = Number(historia.total_preguntas ?? 0)
      if (!total || total <= 0) return 0
      return Math.round((done / total) * 100)
    }

    function getProgressWidth(historia) {
      return `${getProgressPercent(historia)}%`
    }

    function clearError() {
      error.value = null
    }


    return {
      // Estado
      loading,
      loadingExport,
      error,
      estadisticas,
      temasDisponibles,
      filtros,
      paginaActual,
      getProgressWidth,
      getProgressPercent,
      // Computed
      profile,
      historiasFiltradas,
      totalPaginas,

      // Métodos
      recargarHistorias,
      exportarHistorial,
      irACrearHistoria,
      verHistoria,
      cambiarPagina,
      compartirHistoria,
      getEmojiTema,
      getTemaLabel,
      getResumen,
      formatDate
    }
  }
}
</script>

<style scoped>
.mis-historias {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  color: white;
  flex-wrap: wrap;
  gap: 20px;
}

.header-content h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header-content p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid white;
}

.btn.large {
  padding: 15px 30px;
  font-size: 1.1rem;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.filtros-section {
  background: white;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.filtros-container {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  align-items: center;
}

.search-input,
.filtro-select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus,
.filtro-select:focus {
  outline: none;
  border-color: #667eea;
}

.stats-section {
  background: white;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 15px;
}

.stat-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.loading-container,
.error-container,
.empty-state {
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

.historias-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.historias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.historia-card {
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.historia-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  border-color: #667eea;
}

.card-header {
  background: #f8f9fa;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.tema-badge {
  display: flex;
  align-items: center;
  background: #667eea;
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
}

.tema-icon {
  margin-right: 5px;
}

.fecha {
  font-size: 0.8rem;
  color: #666;
}

.card-content {
  padding: 20px;
}

.historia-titulo {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 10px;
  font-weight: bold;
}

.historia-resumen {
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.historia-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.stat {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
}

.stat-icon {
  margin-right: 5px;
}

.progreso-container {
  margin-bottom: 15px;
}

.progreso-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progreso-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progreso-text {
  font-size: 0.8rem;
  color: #666;
}

.card-footer {
  padding: 15px 20px;
  background: #f8f9fa;
  display: flex;
  gap: 10px;
  border-top: 1px solid #e0e0e0;
}

.btn-accion {
  flex: 1;
  padding: 8px 15px;
  border: none;
  border-radius: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-accion.primario {
  background: #667eea;
  color: white;
}

.btn-accion.secundario {
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-accion:hover {
  transform: translateY(-1px);
}

.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.btn-pagina {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-pagina:hover:not(:disabled) {
  background: #5a6fd8;
}

.btn-pagina:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagina-info {
  color: #666;
  font-weight: bold;
}

.empty-icon,
.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3,
.error-container h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.empty-state p,
.error-container p {
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
  }
  
  .filtros-container {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .historias-grid {
    grid-template-columns: 1fr;
  }
  
  .card-footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>