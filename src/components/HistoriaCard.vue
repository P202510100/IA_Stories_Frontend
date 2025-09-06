<!-- components/HistoriaCard.vue - INTEGRADO 100% CON EL BACKEND -->
<template>
  <div 
    class="historia-card"
    :class="{ 
      'clickable': clickable, 
      'compact': compact,
      'completada': historia.completada,
      'pendiente': !historia.completada
    }"
    @click="handleClick"
  >
    <!-- Header de la carta -->
    <div class="historia-header">
      <div class="historia-tema">
        {{ getEmojiTema(historia.tema) }}
      </div>
      <div class="historia-meta-header">
        <div v-if="mostrarFecha" class="historia-fecha">
          {{ formatDate(historia.created_at) }}
        </div>
        <div v-if="mostrarEstado" class="historia-estado">
          <span v-if="historia.completada" class="estado completada">
            <span class="estado-icon">✅</span>
            <span class="estado-texto">Completada</span>
          </span>
          <span v-else class="estado pendiente">
            <span class="estado-icon">⏳</span>
            <span class="estado-texto">Pendiente</span>
          </span>
        </div>
      </div>
    </div>
    
    <!-- Contenido principal -->
    <div class="historia-content">
      <h3 class="historia-titulo">{{ historia.titulo }}</h3>
      
      <!-- Preview del contenido -->
      <p class="historia-preview" v-if="mostrarPreview && historia.contenido">
        {{ getPreview(historia.contenido) }}
      </p>
      
      <!-- Metadata -->
      <div class="historia-meta" v-if="mostrarMeta">
        <span class="meta-tag tema">
          <span class="meta-icon">🎯</span>
          {{ formatTema(historia.tema) }}
        </span>
        <span class="meta-tag palabras" v-if="mostrarPalabras && historia.contenido">
          <span class="meta-icon">📝</span>
          ~{{ contarPalabras(historia.contenido) }} palabras
        </span>
        <span class="meta-tag personajes" v-if="historia.personajes && mostrarPersonajes">
          <span class="meta-icon">👥</span>
          {{ getPersonajesCount(historia.personajes) }} personajes
        </span>
        <span class="meta-tag puntos" v-if="historia.puntos_obtenidos && mostrarPuntos">
          <span class="meta-icon">⭐</span>
          {{ historia.puntos_obtenidos }} puntos
        </span>
      </div>
      
      <!-- Progreso si existe -->
      <div class="historia-progreso" v-if="mostrarProgreso && tieneProgreso">
        <div class="progreso-header">
          <span class="progreso-label">📊 Progreso de la actividad</span>
          <span class="progreso-stats">
            {{ preguntasCompletadas }}/{{ totalPreguntas }} preguntas
          </span>
        </div>
        <div class="progreso-bar">
          <div 
            class="progreso-fill" 
            :style="{ width: porcentajeProgreso + '%' }"
            :class="getProgresoClass(porcentajeProgreso)"
          ></div>
        </div>
        <div class="progreso-detalles">
          <span class="progreso-texto">{{ getTextoProgreso(porcentajeProgreso) }}</span>
          <span v-if="historia.puntos_obtenidos" class="progreso-puntos">
            {{ historia.puntos_obtenidos }} pts obtenidos
          </span>
        </div>
      </div>

      <!-- Estadísticas detalladas -->
      <div v-if="mostrarEstadisticas && historia.estadisticas" class="historia-estadisticas">
        <h4 class="estadisticas-titulo">📈 Estadísticas</h4>
        <div class="estadisticas-grid">
          <div class="stat-item">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-value">{{ historia.estadisticas.precision || 0 }}%</div>
              <div class="stat-label">Precisión</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-value">{{ formatTiempo(historia.estadisticas.tiempo_promedio || 0) }}</div>
              <div class="stat-label">Tiempo promedio</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🔄</div>
            <div class="stat-content">
              <div class="stat-value">{{ historia.estadisticas.intentos_promedio || 1 }}</div>
              <div class="stat-label">Intentos promedio</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones personalizables -->
    <div class="historia-actions" v-if="mostrarAcciones">
      <slot name="acciones" :historia="historia">
        <!-- Acciones por defecto -->
        <template v-if="!historia.completada">
          <button @click.stop="continuarHistoria" class="btn-accion primaria">
            <span class="btn-icon">▶️</span>
            <span class="btn-texto">{{ getTextoAccionPrincipal() }}</span>
          </button>
          <button v-if="allowDelete" @click.stop="eliminarHistoria" class="btn-accion danger">
            <span class="btn-icon">🗑️</span>
            <span class="btn-texto">Eliminar</span>
          </button>
        </template>
        <template v-else>
          <button @click.stop="verResultados" class="btn-accion secundaria">
            <span class="btn-icon">📊</span>
            <span class="btn-texto">Ver Resultados</span>
          </button>
          <button @click.stop="releerHistoria" class="btn-accion primaria">
            <span class="btn-icon">📖</span>
            <span class="btn-texto">Releer</span>
          </button>
        </template>
      </slot>
    </div>

    <!-- Overlay hover para historias clickeables -->
    <div v-if="clickable" class="historia-overlay">
      <div class="overlay-content">
        <span class="overlay-text">{{ getTextoOverlay() }}</span>
        <span class="overlay-icon">{{ getIconoOverlay() }}</span>
      </div>
    </div>

    <!-- Badge de novedad si es reciente -->
    <div v-if="esReciente" class="badge-nuevo">
      <span class="badge-icon">✨</span>
      <span class="badge-texto">Nuevo</span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'HistoriaCard',
  props: {
    historia: {
      type: Object,
      required: true
    },
    clickable: {
      type: Boolean,
      default: true
    },
    compact: {
      type: Boolean,
      default: false
    },
    mostrarFecha: {
      type: Boolean,
      default: true
    },
    mostrarEstado: {
      type: Boolean,
      default: true
    },
    mostrarPreview: {
      type: Boolean,
      default: true
    },
    mostrarMeta: {
      type: Boolean,
      default: true
    },
    mostrarPalabras: {
      type: Boolean,
      default: true
    },
    mostrarPersonajes: {
      type: Boolean,
      default: true
    },
    mostrarPuntos: {
      type: Boolean,
      default: true
    },
    mostrarProgreso: {
      type: Boolean,
      default: true
    },
    mostrarEstadisticas: {
      type: Boolean,
      default: false
    },
    mostrarAcciones: {
      type: Boolean,
      default: true
    },
    allowDelete: {
      type: Boolean,
      default: false
    },
    previewLength: {
      type: Number,
      default: 120
    }
  },
  emits: ['click', 'continuar', 'ver-resultados', 'releer', 'eliminar'],
  setup(props, { emit }) {
    const router = useRouter()
    const authStore = useAuthStore()
    
    // ============================================================================
    // 🔄 COMPUTED PROPERTIES
    // ============================================================================
    
    const tieneProgreso = computed(() => {
      return props.historia.preguntas_completadas !== undefined || 
             props.historia.total_preguntas !== undefined ||
             props.historia.puntos_obtenidos
    })
    
    const preguntasCompletadas = computed(() => {
      return props.historia.preguntas_completadas || 0
    })
    
    const totalPreguntas = computed(() => {
      return props.historia.total_preguntas || 6
    })
    
    const porcentajeProgreso = computed(() => {
      if (totalPreguntas.value === 0) return 0
      return Math.round((preguntasCompletadas.value / totalPreguntas.value) * 100)
    })
    
    const esReciente = computed(() => {
      if (!props.historia.created_at) return false
      const fechaCreacion = new Date(props.historia.created_at)
      const ahora = new Date()
      const diferenciaDias = (ahora - fechaCreacion) / (1000 * 60 * 60 * 24)
      return diferenciaDias <= 3 // Considera reciente si fue creada en los últimos 3 días
    })
    
    // ============================================================================
    // 🎯 MÉTODOS PRINCIPALES
    // ============================================================================
    
    const handleClick = () => {
      if (!props.clickable) return
      
      console.log('🖱️ Historia clickeada:', props.historia.titulo)
      emit('click', props.historia)
      
      // Navegación automática según el estado
      if (props.historia.completada) {
        verResultados()
      } else {
        continuarHistoria()
      }
    }
    
    const continuarHistoria = () => {
      console.log('▶️ Continuando historia:', props.historia.id)
      emit('continuar', props.historia)
      router.push(`/historia/${props.historia.id}`)
    }
    
    const verResultados = () => {
      console.log('📊 Viendo resultados de:', props.historia.id)
      emit('ver-resultados', props.historia)
      router.push(`/historia/${props.historia.id}?modo=resultados`)
    }
    
    const releerHistoria = () => {
      console.log('📖 Releyendo historia:', props.historia.id)
      emit('releer', props.historia)
      router.push(`/historia/${props.historia.id}?modo=lectura`)
    }
    
    const eliminarHistoria = () => {
      console.log('🗑️ Eliminando historia:', props.historia.id)
      emit('eliminar', props.historia)
    }
    
    // ============================================================================
    // 🎨 MÉTODOS DE FORMATO Y PRESENTACIÓN
    // ============================================================================
    
    const getEmojiTema = (tema) => {
      const emojis = {
        'espacio': '🚀',
        'vaqueros': '🤠',
        'fantasia': '🧙‍♂️',
        'piratas': '🏴‍☠️',
        'aventura': '⛵',
        'ciencia_ficcion': '👽',
        'misterio': '🔍',
        'animales': '🦁',
        'deportes': '⚽',
        'cocina': '👨‍🍳',
        'musica': '🎵',
        'arte': '🎨'
      }
      return emojis[tema] || '📚'
    }
    
    const formatTema = (tema) => {
      const temas = {
        'espacio': 'Espacio',
        'vaqueros': 'Vaqueros',
        'fantasia': 'Fantasía',
        'piratas': 'Piratas',
        'aventura': 'Aventura',
        'ciencia_ficcion': 'Ciencia Ficción',
        'misterio': 'Misterio',
        'animales': 'Animales',
        'deportes': 'Deportes',
        'cocina': 'Cocina',
        'musica': 'Música',
        'arte': 'Arte'
      }
      return temas[tema] || tema.charAt(0).toUpperCase() + tema.slice(1)
    }
    
    const formatDate = (fecha) => {
      if (!fecha) return ''
      
      const fechaObj = new Date(fecha)
      const ahora = new Date()
      const diferenciaDias = Math.floor((ahora - fechaObj) / (1000 * 60 * 60 * 24))
      
      if (diferenciaDias === 0) {
        return 'Hoy'
      } else if (diferenciaDias === 1) {
        return 'Ayer'
      } else if (diferenciaDias < 7) {
        return `Hace ${diferenciaDias} días`
      } else {
        return fechaObj.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short',
          year: fechaObj.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined
        })
      }
    }
    
    const getPreview = (contenido) => {
      if (!contenido) return 'Sin contenido disponible...'
      
      // Limpiar el contenido de caracteres especiales
      const textoLimpio = contenido.replace(/[#*_`]/g, '').trim()
      
      if (textoLimpio.length <= props.previewLength) {
        return textoLimpio
      }
      
      const cortado = textoLimpio.substring(0, props.previewLength)
      const ultimoEspacio = cortado.lastIndexOf(' ')
      
      if (ultimoEspacio > props.previewLength * 0.8) {
        return cortado.substring(0, ultimoEspacio) + '...'
      }
      
      return cortado + '...'
    }
    
    const contarPalabras = (contenido) => {
      if (!contenido) return 0
      return contenido.trim().split(/\s+/).filter(word => word.length > 0).length
    }
    
    const getPersonajesCount = (personajes) => {
      if (!personajes) return 0
      if (Array.isArray(personajes)) return personajes.length
      if (typeof personajes === 'string') {
        return personajes.split(',').filter(p => p.trim().length > 0).length
      }
      return 0
    }
    
    const formatTiempo = (segundos) => {
      if (segundos < 60) return `${segundos}s`
      if (segundos < 3600) return `${Math.floor(segundos / 60)}m`
      return `${Math.floor(segundos / 3600)}h ${Math.floor((segundos % 3600) / 60)}m`
    }
    
    const getProgresoClass = (porcentaje) => {
      if (porcentaje >= 100) return 'completo'
      if (porcentaje >= 70) return 'alto'
      if (porcentaje >= 40) return 'medio'
      return 'bajo'
    }
    
    const getTextoProgreso = (porcentaje) => {
      if (porcentaje >= 100) return '¡Actividad completada!'
      if (porcentaje >= 70) return 'Casi terminado'
      if (porcentaje >= 40) return 'Buen progreso'
      if (porcentaje > 0) return 'Comenzado'
      return 'Sin comenzar'
    }
    
    const getTextoAccionPrincipal = () => {
      if (preguntasCompletadas.value === 0) return 'Comenzar'
      if (porcentajeProgreso.value >= 100) return 'Revisar'
      return 'Continuar'
    }
    
    const getTextoOverlay = () => {
      if (props.historia.completada) return 'Ver resultados'
      if (preguntasCompletadas.value > 0) return 'Continuar actividad'
      return 'Comenzar actividad'
    }
    
    const getIconoOverlay = () => {
      if (props.historia.completada) return '📊'
      if (preguntasCompletadas.value > 0) return '▶️'
      return '🎯'
    }
    
    return {
      // Computed
      tieneProgreso,
      preguntasCompletadas,
      totalPreguntas,
      porcentajeProgreso,
      esReciente,
      
      // Métodos principales
      handleClick,
      continuarHistoria,
      verResultados,
      releerHistoria,
      eliminarHistoria,
      
      // Métodos de formato
      getEmojiTema,
      formatTema,
      formatDate,
      getPreview,
      contarPalabras,
      getPersonajesCount,
      formatTiempo,
      getProgresoClass,
      getTextoProgreso,
      getTextoAccionPrincipal,
      getTextoOverlay,
      getIconoOverlay
    }
  }
}
</script>

<style scoped>
/* ============================================================================ */
/* 🎨 ESTILOS PRINCIPALES */
/* ============================================================================ */

.historia-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.historia-card:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: all 0.3s ease;
}

.historia-card.completada:before {
  background: linear-gradient(45deg, #4caf50, #8bc34a);
}

.historia-card.pendiente:before {
  background: linear-gradient(45deg, #ff9800, #ffc107);
}

.historia-card.clickable {
  cursor: pointer;
}

.historia-card.clickable:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.historia-card.compact {
  padding: 20px;
}

/* ============================================================================ */
/* 📋 HEADER */
/* ============================================================================ */

.historia-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 15px;
}

.historia-tema {
  font-size: 2.5em;
  line-height: 1;
  flex-shrink: 0;
}

.historia-meta-header {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.historia-fecha {
  color: #666;
  font-size: 0.85em;
  font-weight: 500;
}

.historia-estado {
  flex-shrink: 0;
}

.estado {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.estado.completada {
  background: linear-gradient(45deg, #d4edda, #c3e6cb);
  color: #155724;
  border: 1px solid #c3e6cb;
}

.estado.pendiente {
  background: linear-gradient(45deg, #fff3cd, #ffeaa7);
  color: #856404;
  border: 1px solid #ffeaa7;
}

.estado-icon {
  font-size: 1em;
}

.estado-texto {
  font-size: 0.9em;
}

/* ============================================================================ */
/* 📄 CONTENIDO */
/* ============================================================================ */

.historia-content {
  margin-bottom: 20px;
}

.historia-titulo {
  color: #333;
  font-size: 1.4em;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.historia-preview {
  color: #555;
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 0.95em;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ============================================================================ */
/* 🏷️ METADATA */
/* ============================================================================ */

.historia-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
  transition: all 0.3s ease;
}

.meta-tag.tema {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.meta-tag.palabras {
  background: #f1f3f4;
  color: #5f6368;
  border: 1px solid #e8eaed;
}

.meta-tag.personajes {
  background: linear-gradient(45deg, #e8f5e8, #c8e6c9);
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.meta-tag.puntos {
  background: linear-gradient(45deg, #fff3c4, #ffeaa7);
  color: #f57c00;
  border: 1px solid #ffeaa7;
}

.meta-icon {
  font-size: 1em;
}

/* ============================================================================ */
/* 📊 PROGRESO */
/* ============================================================================ */

.historia-progreso {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
  border: 1px solid #e9ecef;
}

.progreso-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progreso-label {
  font-size: 0.9em;
  font-weight: 600;
  color: #495057;
}

.progreso-stats {
  font-size: 0.85em;
  color: #6c757d;
  font-weight: 500;
}

.progreso-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progreso-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.progreso-fill.bajo {
  background: linear-gradient(45deg, #ffc107, #ffeb3b);
}

.progreso-fill.medio {
  background: linear-gradient(45deg, #ff9800, #ffc107);
}

.progreso-fill.alto {
  background: linear-gradient(45deg, #2196f3, #03a9f4);
}

.progreso-fill.completo {
  background: linear-gradient(45deg, #4caf50, #8bc34a);
}

.progreso-detalles {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progreso-texto {
  font-size: 0.85em;
  color: #6c757d;
  font-weight: 500;
}

.progreso-puntos {
  font-size: 0.85em;
  color: #667eea;
  font-weight: 600;
}

/* ============================================================================ */
/* 📈 ESTADÍSTICAS */
/* ============================================================================ */

.historia-estadisticas {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
  border: 1px solid #e9ecef;
}

.estadisticas-titulo {
  color: #495057;
  font-size: 1em;
  margin-bottom: 12px;
  font-weight: 600;
}

.estadisticas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-icon {
  font-size: 1.2em;
  margin-bottom: 6px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1em;
  font-weight: 700;
  color: #495057;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.7em;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

/* ============================================================================ */
/* 🎯 ACCIONES */
/* ============================================================================ */

.historia-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-accion {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
  min-height: 40px;
}

.btn-accion.primaria {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-accion.secundaria {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  color: white;
}

.btn-accion.danger {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
}

.btn-accion:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 1em;
}

.btn-texto {
  font-size: 0.9em;
}

/* ============================================================================ */
/* 💫 OVERLAY Y EFECTOS */
/* ============================================================================ */

.historia-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(5px);
  border-radius: 20px;
}

.historia-card.clickable:hover .historia-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
  color: white;
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.historia-card.clickable:hover .overlay-content {
  transform: translateY(0);
}

.overlay-text {
  display: block;
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 8px;
}

.overlay-icon {
  font-size: 2em;
  display: block;
}

/* ============================================================================ */
/* 🎊 BADGE NUEVO */
/* ============================================================================ */

.badge-nuevo {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.7em;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.badge-icon {
  font-size: 1em;
}

.badge-texto {
  font-size: 0.9em;
}

/* ============================================================================ */
/* 📱 RESPONSIVE */
/* ============================================================================ */

@media (max-width: 768px) {
  .historia-card {
    padding: 20px;
    margin: 15px 0;
  }
  
  .historia-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .historia-meta-header {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
  
  .historia-tema {
    font-size: 2em;
  }
  
  .historia-titulo {
    font-size: 1.2em;
  }
  
  .historia-meta {
    gap: 6px;
  }
  
  .meta-tag {
    font-size: 0.75em;
    padding: 4px 8px;
  }
  
  .historia-actions {
    flex-direction: column;
  }
  
  .estadisticas-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  .badge-nuevo {
    top: 10px;
    right: 10px;
    font-size: 0.65em;
  }
}

@media (max-width: 480px) {
  .historia-card {
    padding: 16px;
  }
  
  .historia-card.compact {
    padding: 12px;
  }
  
  .progreso-header {
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
  }
  
  .progreso-detalles {
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
  }
}
</style>