<!-- components/AdvancedFilters.vue - FILTROS AVANZADOS -->
<template>
  <div class="advanced-filters">
    <!-- Toggle de visibilidad -->
    <div class="filters-toggle" @click="toggleFilters">
      <div class="toggle-header">
        <span class="toggle-icon">
          {{ mostrarFiltros ? '🔽' : '▶️' }}
        </span>
        <span class="toggle-text">Filtros Avanzados</span>
        <span v-if="filtrosActivos > 0" class="active-filters-count">
          {{ filtrosActivos }}
        </span>
      </div>
      <button 
        v-if="filtrosActivos > 0" 
        @click.stop="limpiarFiltros"
        class="clear-filters-btn"
        title="Limpiar todos los filtros"
      >
        ✕ Limpiar
      </button>
    </div>

    <!-- Panel de filtros expandible -->
    <transition name="filters-slide">
      <div v-if="mostrarFiltros" class="filters-panel">
        <!-- Búsqueda por texto -->
        <div class="filter-group">
          <label class="filter-label">🔍 Búsqueda</label>
          <div class="search-container">
            <input
              v-model="filtros.busqueda"
              type="text"
              placeholder="Buscar en título, contenido, personajes..."
              class="search-input"
              @input="aplicarFiltros"
            />
            <button 
              v-if="filtros.busqueda"
              @click="filtros.busqueda = ''; aplicarFiltros()"
              class="clear-search-btn"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Filtros principales en grid -->
        <div class="filters-grid">
          <!-- Filtro por tema -->
          <div class="filter-group">
            <label class="filter-label">🎯 Tema</label>
            <select 
              v-model="filtros.tema" 
              @change="aplicarFiltros"
              class="filter-select"
            >
              <option value="">Todos los temas</option>
              <option 
                v-for="tema in temasDisponibles" 
                :key="tema.value"
                :value="tema.value"
              >
                {{ tema.emoji }} {{ tema.label }}
              </option>
            </select>
          </div>

          <!-- Filtro por estado -->
          <div class="filter-group">
            <label class="filter-label">📊 Estado</label>
            <select 
              v-model="filtros.estado" 
              @change="aplicarFiltros"
              class="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="completada">✅ Completadas</option>
              <option value="pendiente">⏳ Pendientes</option>
              <option value="en_progreso">🔄 En progreso</option>
            </select>
          </div>

          <!-- Filtro por fecha -->
          <div class="filter-group">
            <label class="filter-label">📅 Periodo</label>
            <select 
              v-model="filtros.periodo" 
              @change="aplicarFiltros"
              class="filter-select"
            >
              <option value="">Todo el tiempo</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
              <option value="trimestre">Este trimestre</option>
              <option value="custom">Rango personalizado</option>
            </select>
          </div>

          <!-- Filtro por puntuación -->
          <div class="filter-group">
            <label class="filter-label">⭐ Puntuación</label>
            <select 
              v-model="filtros.puntuacion" 
              @change="aplicarFiltros"
              class="filter-select"
            >
              <option value="">Cualquier puntuación</option>
              <option value="excelente">🏆 Excelente (90-100%)</option>
              <option value="buena">🥈 Buena (70-89%)</option>
              <option value="regular">🥉 Regular (50-69%)</option>
              <option value="baja">📉 Baja (&lt;50%)</option>
            </select>
          </div>
        </div>

        <!-- Rango de fechas personalizado -->
        <div v-if="filtros.periodo === 'custom'" class="custom-date-range">
          <div class="date-inputs">
            <div class="date-input-group">
              <label>Desde:</label>
              <input
                v-model="filtros.fechaInicio"
                type="date"
                @change="aplicarFiltros"
                class="date-input"
              />
            </div>
            <div class="date-input-group">
              <label>Hasta:</label>
              <input
                v-model="filtros.fechaFin"
                type="date"
                @change="aplicarFiltros"
                class="date-input"
              />
            </div>
          </div>
        </div>

        <!-- Filtros específicos para docentes -->
        <div v-if="esDocente" class="teacher-filters">
          <h4 class="filter-section-title">👨‍🏫 Filtros de Docente</h4>
          
          <div class="filters-grid">
            <!-- Filtro por estudiante -->
            <div class="filter-group">
              <label class="filter-label">👤 Estudiante</label>
              <select 
                v-model="filtros.estudiante" 
                @change="aplicarFiltros"
                class="filter-select"
              >
                <option value="">Todos los estudiantes</option>
                <option 
                  v-for="estudiante in estudiantesDisponibles" 
                  :key="estudiante.id"
                  :value="estudiante.id"
                >
                  {{ estudiante.nombre }}
                </option>
              </select>
            </div>

            <!-- Filtro por dificultad promedio -->
            <div class="filter-group">
              <label class="filter-label">📈 Rendimiento</label>
              <select 
                v-model="filtros.rendimiento" 
                @change="aplicarFiltros"
                class="filter-select"
              >
                <option value="">Cualquier rendimiento</option>
                <option value="alto">🔥Alto rendimiento</option>
                <option value="medio">📊 Rendimiento medio</option>
                <option value="bajo">📉 Necesita apoyo</option>
              </select>
            </div>

            <!-- Filtro por número de intentos -->
            <div class="filter-group">
              <label class="filter-label">🔄 Intentos</label>
              <select 
                v-model="filtros.intentos" 
                @change="aplicarFiltros"
                class="filter-select"
              >
                <option value="">Cualquier cantidad</option>
                <option value="primer_intento">✨ Primer intento</option>
                <option value="pocos_intentos">👍 2-3 intentos</option>
                <option value="muchos_intentos">🔁 Más de 3 intentos</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Filtros avanzados adicionales -->
        <div class="advanced-section">
          <h4 class="filter-section-title">⚡ Opciones Avanzadas</h4>
          
          <div class="checkbox-filters">
            <label class="checkbox-label">
              <input
                v-model="filtros.soloConImagenes"
                type="checkbox"
                @change="aplicarFiltros"
              />
              <span class="checkbox-custom"></span>
              Solo historias con imágenes generadas
            </label>

            <label class="checkbox-label">
              <input
                v-model="filtros.soloFavoritas"
                type="checkbox"
                @change="aplicarFiltros"
              />
              <span class="checkbox-custom"></span>
              Solo historias favoritas
            </label>

            <label class="checkbox-label">
              <input
                v-model="filtros.soloRecientes"
                type="checkbox"
                @change="aplicarFiltros"
              />
              <span class="checkbox-custom"></span>
              🆕 Solo creadas en los últimos 7 días
            </label>
          </div>

          <!-- Ordenamiento -->
          <div class="sort-section">
            <label class="filter-label">📊 Ordenar por</label>
            <div class="sort-controls">
              <select 
                v-model="filtros.ordenPor" 
                @change="aplicarFiltros"
                class="filter-select"
              >
                <option value="fecha">📅 Fecha de creación</option>
                <option value="titulo">📝 Título</option>
                <option value="puntuacion">⭐ Puntuación</option>
                <option value="progreso">📊 Progreso</option>
                <option value="tiempo">⏱️ Tiempo empleado</option>
              </select>
              <button
                @click="toggleOrdenDireccion"
                class="sort-direction-btn"
                :title="filtros.ordenDireccion === 'desc' ? 'Cambiar a ascendente' : 'Cambiar a descendente'"
              >
                {{ filtros.ordenDireccion === 'desc' ? '↓' : '↑' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Acciones del panel -->
        <div class="filters-actions">
          <button @click="limpiarFiltros" class="btn-action btn-clear">
            🗑️ Limpiar Filtros
          </button>
          <button @click="guardarPreset" class="btn-action btn-save">
            💾 Guardar Preset
          </button>
          <button @click="aplicarFiltros" class="btn-action btn-apply">
            ✅ Aplicar Filtros
          </button>
        </div>

        <!-- Presets guardados -->
        <div v-if="presetsGuardados.length > 0" class="presets-section">
          <h4 class="filter-section-title">💾 Presets Guardados</h4>
          <div class="presets-grid">
            <div 
              v-for="preset in presetsGuardados"
              :key="preset.id"
              class="preset-item"
              @click="cargarPreset(preset)"
            >
              <span class="preset-name">{{ preset.nombre }}</span>
              <button 
                @click.stop="eliminarPreset(preset.id)"
                class="preset-delete"
                title="Eliminar preset"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Resumen de filtros activos -->
    <div v-if="filtrosActivos > 0 && !mostrarFiltros" class="active-filters-summary">
      <div class="summary-tags">
        <span v-if="filtros.busqueda" class="filter-tag">
          🔍 "{{ filtros.busqueda.substring(0, 20) }}{{ filtros.busqueda.length > 20 ? '...' : '' }}"
        </span>
        <span v-if="filtros.tema" class="filter-tag">
          🎯 {{ getTemaLabel(filtros.tema) }}
        </span>
        <span v-if="filtros.estado" class="filter-tag">
          📊 {{ getEstadoLabel(filtros.estado) }}
        </span>
        <span v-if="filtros.periodo" class="filter-tag">
          📅 {{ getPeriodoLabel(filtros.periodo) }}
        </span>
        <span v-if="filtrosActivos > 4" class="filter-tag more-filters">
          +{{ filtrosActivos - 4 }} más
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'AdvancedFilters',
  props: {
    // Datos para filtrar
    items: {
      type: Array,
      default: () => []
    },
    
    // Configuración
    esDocente: {
      type: Boolean,
      default: false
    },
    
    // Opciones disponibles
    temasDisponibles: {
      type: Array,
      default: () => [
        { value: 'espacio', label: 'Espacio', emoji: '🚀' },
        { value: 'vaqueros', label: 'Vaqueros', emoji: '🤠' },
        { value: 'fantasia', label: 'Fantasía', emoji: '🧙‍♂️' },
        { value: 'aventura', label: 'Aventura', emoji: '⚡' },
        { value: 'ciencia', label: 'Ciencia', emoji: '🔬' },
        { value: 'naturaleza', label: 'Naturaleza', emoji: '🌿' },
        { value: 'deportes', label: 'Deportes', emoji: '⚽' },
        { value: 'musica', label: 'Música', emoji: '🎵' },
        { value: 'arte', label: 'Arte', emoji: '🎨' },
        { value: 'historia', label: 'Historia', emoji: '📚' },
        { value: 'misterio', label: 'Misterio', emoji: '🕵️' },
        { value: 'animales', label: 'Animales', emoji: '🐾' }
      ]
    },
    
    estudiantesDisponibles: {
      type: Array,
      default: () => []
    },
    
    // Estado inicial de filtros
    filtrosIniciales: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['filtros-aplicados', 'filtros-limpiados'],
  setup(props, { emit }) {
    // ============================================================================
    // 🔄 ESTADO REACTIVO
    // ============================================================================
    
    const mostrarFiltros = ref(false)
    const presetsGuardados = ref([])
    
    const filtros = ref({
      // Filtros básicos
      busqueda: '',
      tema: '',
      estado: '',
      periodo: '',
      puntuacion: '',
      
      // Fechas personalizadas
      fechaInicio: '',
      fechaFin: '',
      
      // Filtros de docente
      estudiante: '',
      rendimiento: '',
      intentos: '',
      
      // Opciones avanzadas
      soloConImagenes: false,
      soloFavoritas: false,
      soloRecientes: false,
      
      // Ordenamiento
      ordenPor: 'fecha',
      ordenDireccion: 'desc',
      
      // Aplicar filtros iniciales
      ...props.filtrosIniciales
    })
    
    // ============================================================================
    // 🔄 COMPUTED PROPERTIES
    // ============================================================================
    
    const filtrosActivos = computed(() => {
      let count = 0
      
      if (filtros.value.busqueda) count++
      if (filtros.value.tema) count++
      if (filtros.value.estado) count++
      if (filtros.value.periodo) count++
      if (filtros.value.puntuacion) count++
      if (filtros.value.estudiante) count++
      if (filtros.value.rendimiento) count++
      if (filtros.value.intentos) count++
      if (filtros.value.soloConImagenes) count++
      if (filtros.value.soloFavoritas) count++
      if (filtros.value.soloRecientes) count++
      
      return count
    })
    
    const itemsFiltrados = computed(() => {
      let items = [...props.items]
      
      // Filtro por búsqueda de texto
      if (filtros.value.busqueda) {
        const busqueda = filtros.value.busqueda.toLowerCase()
        items = items.filter(item => 
          item.titulo?.toLowerCase().includes(busqueda) ||
          item.contenido?.toLowerCase().includes(busqueda) ||
          item.personajes?.toLowerCase().includes(busqueda)
        )
      }
      
      // Filtro por tema
      if (filtros.value.tema) {
        items = items.filter(item => item.tema === filtros.value.tema)
      }
      
      // Filtro por estado
      if (filtros.value.estado) {
        items = items.filter(item => {
          if (filtros.value.estado === 'completada') return item.completada === true
          if (filtros.value.estado === 'pendiente') return item.completada === false && (!item.preguntas_completadas || item.preguntas_completadas === 0)
          if (filtros.value.estado === 'en_progreso') return item.completada === false && item.preguntas_completadas > 0
          return true
        })
      }
      
      // Filtro por periodo
      if (filtros.value.periodo) {
        const ahora = new Date()
        items = items.filter(item => {
          const fechaItem = new Date(item.created_at)
          
          switch (filtros.value.periodo) {
            case 'hoy':
              return fechaItem.toDateString() === ahora.toDateString()
            case 'semana':
              const inicioSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)
              return fechaItem >= inicioSemana
            case 'mes':
              const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
              return fechaItem >= inicioMes
            case 'trimestre':
              const inicioTrimestre = new Date(ahora.getFullYear(), Math.floor(ahora.getMonth() / 3) * 3, 1)
              return fechaItem >= inicioTrimestre
            case 'custom':
              if (filtros.value.fechaInicio) {
                const fechaInicio = new Date(filtros.value.fechaInicio)
                if (fechaItem < fechaInicio) return false
              }
              if (filtros.value.fechaFin) {
                const fechaFin = new Date(filtros.value.fechaFin)
                fechaFin.setHours(23, 59, 59, 999)
                if (fechaItem > fechaFin) return false
              }
              return true
            default:
              return true
          }
        })
      }
      
      // Filtro por puntuación
      if (filtros.value.puntuacion) {
        items = items.filter(item => {
          const porcentaje = calcularPorcentajePuntuacion(item)
          
          switch (filtros.value.puntuacion) {
            case 'excelente': return porcentaje >= 90
            case 'buena': return porcentaje >= 70 && porcentaje < 90
            case 'regular': return porcentaje >= 50 && porcentaje < 70
            case 'baja': return porcentaje < 50
            default: return true
          }
        })
      }
      
      // Filtros de docente
      if (props.esDocente) {
        if (filtros.value.estudiante) {
          items = items.filter(item => item.alumno_id === parseInt(filtros.value.estudiante))
        }
        
        if (filtros.value.rendimiento) {
          items = items.filter(item => {
            const porcentaje = calcularPorcentajePuntuacion(item)
            switch (filtros.value.rendimiento) {
              case 'alto': return porcentaje >= 80
              case 'medio': return porcentaje >= 60 && porcentaje < 80
              case 'bajo': return porcentaje < 60
              default: return true
            }
          })
        }
        
        if (filtros.value.intentos) {
          items = items.filter(item => {
            const intentos = item.intentos_preguntas || 1
            switch (filtros.value.intentos) {
              case 'primer_intento': return intentos === 1
              case 'pocos_intentos': return intentos >= 2 && intentos <= 3
              case 'muchos_intentos': return intentos > 3
              default: return true
            }
          })
        }
      }
      
      // Filtros avanzados
      if (filtros.value.soloConImagenes) {
        items = items.filter(item => item.personajes_imagenes && item.personajes_imagenes.length > 0)
      }
      
      if (filtros.value.soloFavoritas) {
        items = items.filter(item => item.favorita === true)
      }
      
      if (filtros.value.soloRecientes) {
        const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        items = items.filter(item => new Date(item.created_at) >= hace7Dias)
      }
      
      // Ordenamiento
      items.sort((a, b) => {
        let valorA, valorB
        
        switch (filtros.value.ordenPor) {
          case 'titulo':
            valorA = a.titulo?.toLowerCase() || ''
            valorB = b.titulo?.toLowerCase() || ''
            break
          case 'puntuacion':
            valorA = calcularPorcentajePuntuacion(a)
            valorB = calcularPorcentajePuntuacion(b)
            break
          case 'progreso':
            valorA = calcularProgreso(a)
            valorB = calcularProgreso(b)
            break
          case 'tiempo':
            valorA = a.tiempo_empleado || 0
            valorB = b.tiempo_empleado || 0
            break
          default: // fecha
            valorA = new Date(a.created_at)
            valorB = new Date(b.created_at)
        }
        
        if (filtros.value.ordenDireccion === 'desc') {
          return valorB > valorA ? 1 : valorB < valorA ? -1 : 0
        } else {
          return valorA > valorB ? 1 : valorA < valorB ? -1 : 0
        }
      })
      
      return items
    })
    
    // ============================================================================
    // 🎯 MÉTODOS PRINCIPALES
    // ============================================================================
    
    const toggleFilters = () => {
      mostrarFiltros.value = !mostrarFiltros.value
    }
    
    const aplicarFiltros = () => {
      emit('filtros-aplicados', {
        filtros: { ...filtros.value },
        items: itemsFiltrados.value,
        total: props.items.length,
        filtrados: itemsFiltrados.value.length
      })
    }
    
    const limpiarFiltros = () => {
      // Mantener solo el ordenamiento
      const ordenPor = filtros.value.ordenPor
      const ordenDireccion = filtros.value.ordenDireccion
      
      filtros.value = {
        busqueda: '',
        tema: '',
        estado: '',
        periodo: '',
        puntuacion: '',
        fechaInicio: '',
        fechaFin: '',
        estudiante: '',
        rendimiento: '',
        intentos: '',
        soloConImagenes: false,
        soloFavoritas: false,
        soloRecientes: false,
        ordenPor,
        ordenDireccion
      }
      
      emit('filtros-limpiados')
      aplicarFiltros()
    }
    
    const toggleOrdenDireccion = () => {
      filtros.value.ordenDireccion = filtros.value.ordenDireccion === 'desc' ? 'asc' : 'desc'
      aplicarFiltros()
    }
    
    // ============================================================================
    // 🛠️ MÉTODOS AUXILIARES
    // ============================================================================
    
    const calcularPorcentajePuntuacion = (item) => {
      if (!item.total_preguntas || item.total_preguntas === 0) return 0
      const completadas = item.preguntas_completadas || 0
      const correctas = item.respuestas_correctas || 0
      
      if (completadas === 0) return 0
      return Math.round((correctas / item.total_preguntas) * 100)
    }
    
    const calcularProgreso = (item) => {
      if (!item.total_preguntas || item.total_preguntas === 0) return 0
      const completadas = item.preguntas_completadas || 0
      return Math.round((completadas / item.total_preguntas) * 100)
    }
    
    const getTemaLabel = (valor) => {
      const tema = props.temasDisponibles.find(t => t.value === valor)
      return tema ? `${tema.emoji} ${tema.label}` : valor
    }
    
    const getEstadoLabel = (valor) => {
      const estados = {
        'completada': '✅ Completadas',
        'pendiente': '⏳ Pendientes',
        'en_progreso': '🔄 En progreso'
      }
      return estados[valor] || valor
    }
    
    const getPeriodoLabel = (valor) => {
      const periodos = {
        'hoy': 'Hoy',
        'semana': 'Esta semana',
        'mes': 'Este mes',
        'trimestre': 'Este trimestre',
        'custom': 'Personalizado'
      }
      return periodos[valor] || valor
    }
    
    // ============================================================================
    // 💾 GESTIÓN DE PRESETS
    // ============================================================================
    
    const guardarPreset = () => {
      const nombre = prompt('Nombre para el preset:')
      if (!nombre) return
      
      const preset = {
        id: Date.now(),
        nombre,
        filtros: { ...filtros.value }
      }
      
      presetsGuardados.value.push(preset)
      guardarPresetsEnStorage()
    }
    
    const cargarPreset = (preset) => {
      filtros.value = { ...preset.filtros }
      aplicarFiltros()
    }
    
    const eliminarPreset = (id) => {
      presetsGuardados.value = presetsGuardados.value.filter(p => p.id !== id)
      guardarPresetsEnStorage()
    }
    
    const guardarPresetsEnStorage = () => {
      try {
        localStorage.setItem('iastories_filter_presets', JSON.stringify(presetsGuardados.value))
      } catch (e) {
        console.warn('No se pudieron guardar los presets')
      }
    }
    
    const cargarPresetsDeStorage = () => {
      try {
        const presets = localStorage.getItem('iastories_filter_presets')
        if (presets) {
          presetsGuardados.value = JSON.parse(presets)
        }
      } catch (e) {
        console.warn('No se pudieron cargar los presets')
      }
    }
    
    // ============================================================================
    // 🚀 LIFECYCLE
    // ============================================================================
    
    onMounted(() => {
      cargarPresetsDeStorage()
      
      // Aplicar filtros iniciales si existen
      if (Object.keys(props.filtrosIniciales).length > 0) {
        aplicarFiltros()
      }
    })
    
    // Aplicar filtros automáticamente cuando cambien los items
    watch(() => props.items, () => {
      aplicarFiltros()
    }, { deep: true })
    
    return {
      // Estados
      mostrarFiltros,
      filtros,
      presetsGuardados,
      
      // Computed
      filtrosActivos,
      itemsFiltrados,
      
      // Métodos principales
      toggleFilters,
      aplicarFiltros,
      limpiarFiltros,
      toggleOrdenDireccion,
      
      // Métodos auxiliares
      getTemaLabel,
      getEstadoLabel,
      getPeriodoLabel,
      
      // Presets
      guardarPreset,
      cargarPreset,
      eliminarPreset
    }
  }
}
</script>

<style scoped>
.advanced-filters {
  background: white;
  border-radius: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Toggle Header */
.filters-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-bottom: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.filters-toggle:hover {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
}

.toggle-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-icon {
  font-size: 1.2em;
  transition: transform 0.3s ease;
}

.toggle-text {
  font-weight: 600;
  color: #495057;
}

.active-filters-count {
  background: #667eea;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

.clear-filters-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filters-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

/* Panel de Filtros */
.filters-panel {
  padding: 25px;
  background: white;
}

.filters-slide-enter-active,
.filters-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.filters-slide-enter-from,
.filters-slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.filters-slide-enter-to,
.filters-slide-leave-from {
  max-height: 1000px;
  opacity: 1;
}

/* Filtros Grid */
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 5px;
}

.filter-select,
.search-input,
.date-input {
  padding: 10px 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9em;
  transition: border-color 0.3s ease;
  background: white;
}

.filter-select:focus,
.search-input:focus,
.date-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Búsqueda */
.search-container {
  position: relative;
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #adb5bd;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.clear-search-btn:hover {
  background: #f8f9fa;
  color: #6c757d;
}

/* Rango de fechas personalizado */
.custom-date-range {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.date-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-input-group label {
  font-size: 0.85em;
  font-weight: 500;
  color: #6c757d;
}

/* Secciones */
.filter-section-title {
  color: #495057;
  font-size: 1.1em;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.teacher-filters,
.advanced-section {
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
  margin-top: 20px;
}

/* Checkboxes */
.checkbox-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.9em;
  color: #495057;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.checkbox-label:hover {
  background: #f8f9fa;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #dee2e6;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* Ordenamiento */
.sort-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.sort-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.sort-direction-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.3s ease;
  min-width: 40px;
}

.sort-direction-btn:hover {
  background: #495057;
  transform: translateY(-1px);
}

/* Acciones */
.filters-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  margin-top: 20px;
}

.btn-action {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-clear {
  background: #6c757d;
  color: white;
}

.btn-save {
  background: #28a745;
  color: white;
}

.btn-apply {
  background: #667eea;
  color: white;
}

.btn-action:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* Presets */
.presets-section {
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
  margin-top: 20px;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.preset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preset-item:hover {
  background: #e9ecef;
  border-color: #667eea;
}

.preset-name {
  font-size: 0.85em;
  font-weight: 500;
  color: #495057;
}

.preset-delete {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.8em;
}

.preset-delete:hover {
  background: #dc3545;
  color: white;
}

/* Resumen de filtros activos */
.active-filters-summary {
  padding: 15px 20px;
  background: linear-gradient(135deg, #f1f3f4, #e8eaed);
  border-top: 1px solid #dee2e6;
}

.summary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  background: #667eea;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
}

.filter-tag.more-filters {
  background: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .date-inputs {
    grid-template-columns: 1fr;
  }
  
  .filters-actions {
    flex-direction: column;
  }
  
  .sort-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .presets-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-tags {
    flex-direction: column;
  }
}
</style>