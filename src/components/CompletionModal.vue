<!-- components/CompletionModal.vue - INTEGRADO 100% CON EL BACKEND -->
<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="cerrarModalSiPermitido">
      <div class="completion-modal" @click.stop :class="getModalClass()">
        
        <!-- Animación de celebración -->
        <div v-if="mostrarAnimaciones" class="celebration-animation">
          <div 
            v-for="i in cantidadConfetti" 
            :key="`confetti-${i}`" 
            class="confetti" 
            :style="getConfettiStyle(i)"
          ></div>
          <div 
            v-for="i in cantidadEstrellas" 
            :key="`star-${i}`" 
            class="stars" 
            :style="getStarStyle(i)"
          >{{ getEstrellaTipo(i) }}</div>
        </div>
        
        <!-- Header del modal -->
        <div class="modal-header">
          <div class="achievement-badge" :class="getBadgeClass()">
            <div class="badge-icon">{{ getAchievementIcon() }}</div>
            <div v-if="nivelSubio" class="level-up-indicator">
              <span class="level-up-text">¡LEVEL UP!</span>
            </div>
          </div>
          <h2 class="completion-title">{{ getTitulo() }}</h2>
          <p class="completion-subtitle">{{ getSubtitulo() }}</p>
          <div v-if="mensajePersonalizado" class="custom-message">
            {{ mensajePersonalizado }}
          </div>
        </div>
        
        <!-- Estadísticas principales -->
        <div class="stats-showcase">
          <div class="main-stat">
            <div class="stat-circle" :class="getScoreClass()">
              <span class="stat-number">{{ resultados.puntos_obtenidos || 0 }}</span>
              <span class="stat-label">Puntos</span>
            </div>
          </div>
          
          <div class="secondary-stats">
            <div class="mini-stat">
              <div class="mini-stat-icon">✅</div>
              <div class="mini-stat-content">
                <span class="mini-stat-number">{{ resultados.respuestas_correctas || 0 }}</span>
                <span class="mini-stat-label">Correctas</span>
              </div>
            </div>
            
            <div class="mini-stat">
              <div class="mini-stat-icon">📊</div>
              <div class="mini-stat-content">
                <span class="mini-stat-number">{{ porcentajePrecision }}%</span>
                <span class="mini-stat-label">Precisión</span>
              </div>
            </div>
            
            <div class="mini-stat">
              <div class="mini-stat-icon">⏱️</div>
              <div class="mini-stat-content">
                <span class="mini-stat-number">{{ formatTiempo(resultados.tiempo_total || 0) }}</span>
                <span class="mini-stat-label">Tiempo</span>
              </div>
            </div>
            
            <div v-if="resultados.racha_actual" class="mini-stat">
              <div class="mini-stat-icon">🔥</div>
              <div class="mini-stat-content">
                <span class="mini-stat-number">{{ resultados.racha_actual }}</span>
                <span class="mini-stat-label">Racha</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Análisis detallado por tipo de pregunta -->
        <div v-if="resultados.analisis_por_tipo" class="analysis-section">
          <h3>🎯 Análisis por Tipo de Pregunta</h3>
          <div class="analysis-grid">
            <div
              v-for="(analisis, tipo) in resultados.analisis_por_tipo"
              :key="tipo"
              class="analysis-item"
              :class="getAnalysisClass(analisis.porcentaje)"
            >
              <div class="analysis-header">
                <span class="analysis-icon">{{ getTipoIcon(tipo) }}</span>
                <span class="analysis-title">{{ getTipoNombre(tipo) }}</span>
              </div>
              <div class="analysis-stats">
                <div class="analysis-score">{{ analisis.porcentaje || 0 }}%</div>
                <div class="analysis-detail">
                  {{ analisis.respuestas_correctas || 0 }}/{{ analisis.total_preguntas || 0 }}
                </div>
              </div>
              <div v-if="analisis.recomendacion" class="analysis-recommendation">
                💡 {{ analisis.recomendacion }}
              </div>
            </div>
          </div>
        </div>

        <!-- Logros desbloqueados -->
        <div v-if="logrosDesbloqueados.length > 0" class="achievements-section">
          <h3>🏆 ¡Logros Desbloqueados!</h3>
          <div class="achievements-grid">
            <div 
              v-for="logro in logrosDesbloqueados" 
              :key="logro.id"
              class="achievement-item"
              :class="logro.rareza"
            >
              <div class="achievement-icon">{{ logro.icono }}</div>
              <div class="achievement-info">
                <h4>{{ logro.titulo }}</h4>
                <p>{{ logro.descripcion }}</p>
                <div class="achievement-points">+{{ logro.puntos_bonus }} puntos bonus</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progreso del nivel -->
        <div v-if="progresoNivel" class="level-progress-section">
          <h3>📈 Progreso del Nivel</h3>
          <div class="level-info">
            <div class="level-current">
              <span class="level-icon">{{ nivelActual.icono }}</span>
              <div class="level-details">
                <span class="level-name">{{ nivelActual.nombre }}</span>
                <span class="level-description">{{ nivelActual.descripcion }}</span>
              </div>
            </div>
            
            <div class="level-progress-bar">
              <div class="progress-track">
                <div 
                  class="progress-fill" 
                  :style="{ width: progresoNivel.porcentaje + '%' }"
                ></div>
              </div>
              <div class="progress-text">
                {{ progresoNivel.puntos_actuales }}/{{ progresoNivel.puntos_siguiente_nivel }} puntos
              </div>
            </div>
            
            <div v-if="proximoNivel" class="level-next">
              <span class="next-level-icon">{{ proximoNivel.icono }}</span>
              <div class="next-level-details">
                <span class="next-level-name">Próximo: {{ proximoNivel.nombre }}</span>
                <span class="next-level-requirement">
                  {{ progresoNivel.puntos_faltantes }} puntos para subir
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Comparación y mejoras -->
        <div v-if="datosComparacion" class="comparison-section">
          <h3>📊 Tu Progreso</h3>
          <div class="comparison-grid">
            <div class="comparison-item">
              <div class="comparison-icon">📈</div>
              <div class="comparison-content">
                <span class="comparison-label">Mejor puntuación anterior</span>
                <span class="comparison-value">{{ datosComparacion.mejor_anterior || 0 }} pts</span>
              </div>
            </div>
            
            <div v-if="datosComparacion.mejora > 0" class="comparison-item improvement">
              <div class="comparison-icon">🚀</div>
              <div class="comparison-content">
                <span class="comparison-label">Mejora</span>
                <span class="comparison-value">+{{ datosComparacion.mejora }} pts</span>
              </div>
            </div>
            
            <div class="comparison-item">
              <div class="comparison-icon">👥</div>
              <div class="comparison-content">
                <span class="comparison-label">Promedio de la clase</span>
                <span class="comparison-value">{{ datosComparacion.promedio_clase || 0 }} pts</span>
              </div>
            </div>
            
            <div class="comparison-item">
              <div class="comparison-icon">🏆</div>
              <div class="comparison-content">
                <span class="comparison-label">Posición en ranking</span>
                <span class="comparison-value">#{{ datosComparacion.posicion_ranking || '--' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Consejos personalizados -->
        <div v-if="consejosPersonalizados.length > 0" class="tips-section">
          <h3>💡 Consejos para Mejorar</h3>
          <div class="tips-carousel">
            <div 
              v-for="(consejo, index) in consejosPersonalizados" 
              :key="index"
              class="tip-item"
              :class="{ 'active': indiceTipActivo === index }"
            >
              <div class="tip-icon">{{ getTipIcon(consejo.tipo) }}</div>
              <div class="tip-content">
                <h4>{{ consejo.titulo }}</h4>
                <p>{{ consejo.descripcion }}</p>
              </div>
            </div>
          </div>
          <div v-if="consejosPersonalizados.length > 1" class="tips-navigation">
            <button
              v-for="(_, index) in consejosPersonalizados"
              :key="index"
              @click="indiceTipActivo = index"
              class="tip-nav-btn"
              :class="{ 'active': indiceTipActivo === index }"
            ></button>
          </div>
        </div>

        <!-- Próximos objetivos -->
        <div v-if="proximosObjetivos.length > 0" class="goals-section">
          <h3>🎯 Próximos Objetivos</h3>
          <div class="goals-list">
            <div 
              v-for="(objetivo, index) in proximosObjetivos" 
              :key="index"
              class="goal-item"
            >
              <div class="goal-icon">{{ getGoalIcon(objetivo.tipo) }}</div>
              <div class="goal-content">
                <span class="goal-text">{{ objetivo.descripcion }}</span>
                <span class="goal-reward">{{ objetivo.recompensa }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones del modal -->
        <div class="modal-actions">
          <button 
            v-if="permitirCompartir" 
            @click="compartirResultado" 
            class="btn-action btn-share"
            :disabled="compartiendoResultado"
          >
            <span class="btn-icon">📱</span>
            <span v-if="compartiendoResultado">Compartiendo...</span>
            <span v-else>Compartir</span>
          </button>
          
          <button @click="verMisHistorias" class="btn-action btn-secondary">
            <span class="btn-icon">📚</span>
            <span>Mis Historias</span>
          </button>
          
          <button @click="crearNuevaHistoria" class="btn-action btn-primary">
            <span class="btn-icon">✨</span>
            <span>Crear Otra Historia</span>
          </button>
        </div>
        
        <!-- Botón de cerrar -->
        <button @click="cerrarModal" class="modal-close" :aria-label="'Cerrar modal'">
          ✕
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from './ToastNotification.vue'

export default {
  name: 'CompletionModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    resultados: {
      type: Object,
      required: true,
      default: () => ({
        puntos_obtenidos: 0,
        respuestas_correctas: 0,
        total_preguntas: 6,
        tiempo_total: 0,
        analisis_por_tipo: null,
        logros: null,
        nivel_info: null,
        comparacion: null
      })
    },
    historia: {
      type: Object,
      default: () => ({})
    },
    configuraciones: {
      type: Object,
      default: () => ({
        mostrarAnimaciones: true,
        sonidosHabilitados: true,
        permitirCompartir: true,
        cerrarAutomatico: false
      })
    }
  },
  emits: [
    'cerrar', 
    'continuar-leyendo', 
    'ver-historias', 
    'compartir-resultado',
    'nueva-historia'
  ],
  setup(props, { emit }) {
    const router = useRouter()
    const toastStore = useToastStore()
    
    // ============================================================================
    // 📊 ESTADOS REACTIVOS
    // ============================================================================
    
    const logrosDesbloqueados = ref([])
    const progresoNivel = ref(null)
    const nivelActual = ref(null)
    const proximoNivel = ref(null)
    const nivelSubio = ref(false)
    const datosComparacion = ref(null)
    const consejosPersonalizados = ref([])
    const proximosObjetivos = ref([])
    const mensajePersonalizado = ref('')
    const indiceTipActivo = ref(0)
    const compartiendoResultado = ref(false)
    const timerCerrarAutomatico = ref(null)
    
    // ============================================================================
    // 🔄 COMPUTED PROPERTIES
    // ============================================================================
    
    const porcentajePrecision = computed(() => {
      const total = props.resultados.total_preguntas || 6
      const correctas = props.resultados.respuestas_correctas || 0
      return Math.round((correctas / total) * 100)
    })
    
    const mostrarAnimaciones = computed(() => {
      return props.configuraciones.mostrarAnimaciones && porcentajePrecision.value >= 50
    })
    
    const cantidadConfetti = computed(() => {
      const porcentaje = porcentajePrecision.value
      if (porcentaje >= 90) return 30
      if (porcentaje >= 70) return 20
      if (porcentaje >= 50) return 10
      return 0
    })
    
    const cantidadEstrellas = computed(() => {
      const porcentaje = porcentajePrecision.value
      if (porcentaje >= 90) return 12
      if (porcentaje >= 70) return 8
      if (porcentaje >= 50) return 5
      return 0
    })
    
    const permitirCompartir = computed(() => {
      return props.configuraciones.permitirCompartir && porcentajePrecision.value >= 60
    })
    
    // ============================================================================
    // 🎨 MÉTODOS DE ESTILO Y PRESENTACIÓN
    // ============================================================================
    
    const getModalClass = () => {
      const porcentaje = porcentajePrecision.value
      const clases = ['completion-modal-active']
      
      if (porcentaje >= 90) clases.push('excellent')
      else if (porcentaje >= 70) clases.push('good') 
      else if (porcentaje >= 50) clases.push('okay')
      else clases.push('needs-improvement')
      
      if (nivelSubio.value) clases.push('level-up')
      
      return clases
    }
    
    const getBadgeClass = () => {
      const porcentaje = porcentajePrecision.value
      if (porcentaje >= 90) return 'badge-excellent'
      if (porcentaje >= 70) return 'badge-good'
      if (porcentaje >= 50) return 'badge-okay'
      return 'badge-needs-improvement'
    }
    
    const getScoreClass = () => {
      const porcentaje = porcentajePrecision.value
      if (porcentaje >= 90) return 'score-excellent'
      if (porcentaje >= 70) return 'score-good'
      if (porcentaje >= 50) return 'score-okay'
      return 'score-needs-improvement'
    }
    
    const getAchievementIcon = () => {
      const porcentaje = porcentajePrecision.value
      if (porcentaje >= 90) return '🏆'
      if (porcentaje >= 70) return '🥇'
      if (porcentaje >= 50) return '🥈'
      return '🥉'
    }
    
    const getTitulo = () => {
      const porcentaje = porcentajePrecision.value
      
      if (nivelSubio.value) return '¡FELICITACIONES!'
      
      if (porcentaje >= 90) return '¡EXCELENTE TRABAJO!'
      if (porcentaje >= 70) return '¡MUY BIEN HECHO!'
      if (porcentaje >= 50) return '¡BUEN ESFUERZO!'
      return '¡SIGUE PRACTICANDO!'
    }
    
    const getSubtitulo = () => {
      const porcentaje = porcentajePrecision.value
      const correctas = props.resultados.respuestas_correctas || 0
      const total = props.resultados.total_preguntas || 6
      
      if (correctas === total) {
        return '¡Respuestas perfectas! Eres increíble 🌟'
      }
      
      if (porcentaje >= 90) return '¡Tu precisión es impresionante!'
      if (porcentaje >= 70) return '¡Estás haciendo un gran progreso!'
      if (porcentaje >= 50) return '¡Cada intento te hace mejor!'
      return '¡La práctica te llevará al éxito!'
    }
    
    const getConfettiStyle = (index) => {
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
      const randomColor = colors[index % colors.length]
      const randomX = Math.random() * 100
      const randomDelay = Math.random() * 3
      const randomRotation = Math.random() * 360
      
      return {
        '--color': randomColor,
        '--x': randomX + '%',
        '--delay': randomDelay + 's',
        '--rotation': randomRotation + 'deg'
      }
    }
    
    const getStarStyle = (index) => {
      const randomX = Math.random() * 90 + 5 // 5% a 95%
      const randomY = Math.random() * 80 + 10 // 10% a 90%
      const randomDelay = (index * 0.3) + 's'
      
      return {
        '--x': randomX + '%',
        '--y': randomY + '%',
        '--delay': randomDelay
      }
    }
    
    const getEstrellaTipo = (index) => {
      const tipos = ['⭐', '✨', '🌟', '💫']
      return tipos[index % tipos.length]
    }
    
    // ============================================================================
    // 📊 MÉTODOS DE ANÁLISIS
    // ============================================================================
    
    const getTipoIcon = (tipo) => {
      const iconos = {
        'inferenciales': '🧠',
        'juicio_critico': '🔍', 
        'creativas': '🎨'
      }
      return iconos[tipo] || '❓'
    }
    
    const getTipoNombre = (tipo) => {
      const nombres = {
        'inferenciales': 'Inferenciales',
        'juicio_critico': 'Juicio Crítico',
        'creativas': 'Creativas'
      }
      return nombres[tipo] || tipo
    }
    
    const getAnalysisClass = (porcentaje) => {
      if (porcentaje >= 80) return 'analysis-excellent'
      if (porcentaje >= 60) return 'analysis-good'
      if (porcentaje >= 40) return 'analysis-okay'
      return 'analysis-needs-work'
    }
    
    const getTipIcon = (tipo) => {
      const iconos = {
        'lectura': '📖',
        'estrategia': '🎯',
        'motivacion': '💪',
        'practica': '📝'
      }
      return iconos[tipo] || '💡'
    }
    
    const getGoalIcon = (tipo) => {
      const iconos = {
        'precision': '🎯',
        'velocidad': '⚡',
        'constancia': '📅',
        'exploracion': '🗺️'
      }
      return iconos[tipo] || '🏁'
    }
    
    // ============================================================================
    // ⏰ MÉTODOS DE FORMATO
    // ============================================================================
    
    const formatTiempo = (segundos) => {
      if (segundos < 60) return `${segundos}s`
      if (segundos < 3600) {
        const min = Math.floor(segundos / 60)
        const sec = segundos % 60
        return sec > 0 ? `${min}m ${sec}s` : `${min}m`
      }
      
      const hours = Math.floor(segundos / 3600)
      const min = Math.floor((segundos % 3600) / 60)
      return `${hours}h ${min}m`
    }
    
    // ============================================================================
    // 🎯 MÉTODOS DE ACCIÓN
    // ============================================================================
    
    const cerrarModal = () => {
      console.log('🚪 Cerrando modal de completion')
      
      if (timerCerrarAutomatico.value) {
        clearTimeout(timerCerrarAutomatico.value)
      }
      
      emit('cerrar')
    }
    
    const cerrarModalSiPermitido = (event) => {
      // Solo cerrar si se hace clic en el overlay, no en el modal
      if (event.target.classList.contains('modal-overlay')) {
        cerrarModal()
      }
    }
    
    const crearNuevaHistoria = () => {
      console.log('✨ Creando nueva historia desde modal')
      emit('nueva-historia')
      cerrarModal()
      router.push('/crear-historia')
    }
    
    const verMisHistorias = () => {
      console.log('📚 Navegando a mis historias desde modal')
      emit('ver-historias')
      cerrarModal()
      router.push('/mis-historias')
    }
    
    const compartirResultado = async () => {
      try {
        compartiendoResultado.value = true
        console.log('📱 Compartiendo resultado...')
        
        const textoCompartir = `¡Acabo de completar una historia en IaStories! 
📊 Obtuve ${props.resultados.puntos_obtenidos} puntos con ${porcentajePrecision.value}% de precisión
🎯 ${props.resultados.respuestas_correctas}/${props.resultados.total_preguntas} respuestas correctas
${nivelSubio.value ? '🆙 ¡Y subí de nivel!' : ''}

#IaStories #Educacion #Gamificacion`
        
        if (navigator.share) {
          await navigator.share({
            title: '¡Mi resultado en IaStories!',
            text: textoCompartir,
            url: window.location.origin
          })
          
          toastStore.success('Resultado compartido exitosamente')
        } else {
          // Fallback: copiar al portapapeles
          await navigator.clipboard.writeText(textoCompartir)
          toastStore.success('Texto copiado al portapapeles')
        }
        
        emit('compartir-resultado', {
          texto: textoCompartir,
          resultados: props.resultados
        })
        
      } catch (error) {
        console.error('❌ Error compartiendo resultado:', error)
        if (error.name !== 'AbortError') {
          toastStore.error('Error al compartir el resultado')
        }
      } finally {
        compartiendoResultado.value = false
      }
    }
    
    // ============================================================================
    // 🔄 PROCESAMIENTO DE DATOS DEL BACKEND
    // ============================================================================
    
    const procesarDatosBackend = () => {
      console.log('📊 Procesando datos del backend para modal de completion')
      
      // Procesar logros
      if (props.resultados.logros) {
        logrosDesbloqueados.value = props.resultados.logros
      }
      
      // Procesar información de nivel
      if (props.resultados.nivel_info) {
        nivelActual.value = props.resultados.nivel_info.actual
        proximoNivel.value = props.resultados.nivel_info.proximo
        progresoNivel.value = props.resultados.nivel_info.progreso
        nivelSubio.value = props.resultados.nivel_info.subio_nivel || false
      }
      
      // Procesar datos de comparación
      if (props.resultados.comparacion) {
        datosComparacion.value = props.resultados.comparacion
      }
      
      // Procesar consejos personalizados
      if (props.resultados.consejos) {
        consejosPersonalizados.value = props.resultados.consejos
      }
      
      // Procesar próximos objetivos
      if (props.resultados.objetivos) {
        proximosObjetivos.value = props.resultados.objetivos
      }
      
      // Procesar mensaje personalizado
      if (props.resultados.mensaje_personalizado) {
        mensajePersonalizado.value = props.resultados.mensaje_personalizado
      }
    }
    
    // ============================================================================
    // 🎵 EFECTOS DE SONIDO
    // ============================================================================
    
    const reproducirSonidoCelebracion = () => {
      if (!props.configuraciones.sonidosHabilitados) return
      
      try {
        const porcentaje = porcentajePrecision.value
        let sonido = 'completion_basic'
        
        if (porcentaje >= 90) sonido = 'completion_excellent'
        else if (porcentaje >= 70) sonido = 'completion_good'
        else if (porcentaje >= 50) sonido = 'completion_okay'
        
        // En un entorno real, aquí cargarías y reproducirías el archivo de audio
        console.log(`🎵 Reproduciendo sonido: ${sonido}`)
        
      } catch (error) {
        console.warn('⚠️ No se pudo reproducir el sonido de celebración:', error)
      }
    }
    
    // ============================================================================
    // ⏰ TIMER PARA CERRAR AUTOMÁTICAMENTE
    // ============================================================================
    
    const configurarCierreAutomatico = () => {
      if (props.configuraciones.cerrarAutomatico && porcentajePrecision.value >= 90) {
        timerCerrarAutomatico.value = setTimeout(() => {
          cerrarModal()
        }, 8000) // 8 segundos para disfrutar la celebración
      }
    }
    
    // ============================================================================
    // 🎯 LIFECYCLE HOOKS
    // ============================================================================
    
    onMounted(() => {
      if (props.visible) {
        procesarDatosBackend()
        reproducirSonidoCelebracion()
        configurarCierreAutomatico()
      }
    })
    
    onUnmounted(() => {
      if (timerCerrarAutomatico.value) {
        clearTimeout(timerCerrarAutomatico.value)
      }
    })
    
    // ============================================================================
    // 👀 WATCHERS
    // ============================================================================
    
    watch(() => props.visible, (newVisible) => {
      if (newVisible) {
        procesarDatosBackend()
        reproducirSonidoCelebracion()
        configurarCierreAutomatico()
        
        // Rotar consejos automáticamente
        if (consejosPersonalizados.value.length > 1) {
          const interval = setInterval(() => {
            indiceTipActivo.value = (indiceTipActivo.value + 1) % consejosPersonalizados.value.length
          }, 4000)
          
          // Limpiar interval cuando se cierre el modal
          watch(() => props.visible, (visible) => {
            if (!visible) {
              clearInterval(interval)
            }
          })
        }
      } else {
        if (timerCerrarAutomatico.value) {
          clearTimeout(timerCerrarAutomatico.value)
        }
      }
    })
    
    return {
      // Estados
      logrosDesbloqueados,
      progresoNivel,
      nivelActual,
      proximoNivel,
      nivelSubio,
      datosComparacion,
      consejosPersonalizados,
      proximosObjetivos,
      mensajePersonalizado,
      indiceTipActivo,
      compartiendoResultado,
      
      // Computed
      porcentajePrecision,
      mostrarAnimaciones,
      cantidadConfetti,
      cantidadEstrellas,
      permitirCompartir,
      
      // Métodos de estilo
      getModalClass,
      getBadgeClass,
      getScoreClass,
      getAchievementIcon,
      getTitulo,
      getSubtitulo,
      getConfettiStyle,
      getStarStyle,
      getEstrellaTipo,
      
      // Métodos de análisis
      getTipoIcon,
      getTipoNombre,
      getAnalysisClass,
      getTipIcon,
      getGoalIcon,
      
      // Métodos de acción
      cerrarModal,
      cerrarModalSiPermitido,
      crearNuevaHistoria,
      verMisHistorias,
      compartirResultado,
      
      // Utilidades
      formatTiempo
    }
  }
}
</script>

<style scoped>
/* ============================================================================ */
/* 🎨 ESTILOS PRINCIPALES */
/* ============================================================================ */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.completion-modal {
  background: white;
  border-radius: 24px;
  padding: 40px;
  max-width: 700px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: modalSlideIn 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  border: 3px solid transparent;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-30px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.completion-modal.excellent {
  background: linear-gradient(135deg, #fff9c4, #ffffff);
  border-color: #ffd700;
  box-shadow: 0 25px 80px rgba(255, 215, 0, 0.3);
}

.completion-modal.good {
  background: linear-gradient(135deg, #e8f5e8, #ffffff);
  border-color: #28a745;
  box-shadow: 0 25px 80px rgba(40, 167, 69, 0.3);
}

.completion-modal.okay {
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
  border-color: #2196f3;
  box-shadow: 0 25px 80px rgba(33, 150, 243, 0.3);
}

.completion-modal.needs-improvement {
  background: linear-gradient(135deg, #fff3e0, #ffffff);
  border-color: #ff9800;
  box-shadow: 0 25px 80px rgba(255, 152, 0, 0.3);
}

.completion-modal.level-up {
  animation: modalSlideIn 0.5s ease-out, levelUpPulse 2s ease-in-out;
}

@keyframes levelUpPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* ============================================================================ */
/* 🎉 ANIMACIONES DE CELEBRACIÓN */
/* ============================================================================ */

.celebration-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: 24px;
  z-index: 1;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color);
  top: -10px;
  left: var(--x);
  animation: confetti-fall 4s ease-out var(--delay) infinite;
  transform: rotate(var(--rotation));
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.stars {
  position: absolute;
  font-size: 1.8em;
  top: var(--y);
  left: var(--x);
  animation: star-twinkle 3s ease-in-out var(--delay) infinite;
  z-index: 2;
}

@keyframes star-twinkle {
  0%, 100% { 
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  25%, 75% { 
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
  50% { 
    transform: scale(1.2) rotate(360deg);
    opacity: 1;
  }
}

/* ============================================================================ */
/* 📋 HEADER DEL MODAL */
/* ============================================================================ */

.modal-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 3;
}

.achievement-badge {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  position: relative;
  border: 4px solid;
  transition: all 0.3s ease;
}

.badge-excellent {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  border-color: #ffc107;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.badge-good {
  background: linear-gradient(45deg, #28a745, #34ce57);
  border-color: #1e7e34;
  box-shadow: 0 0 30px rgba(40, 167, 69, 0.5);
}

.badge-okay {
  background: linear-gradient(45deg, #2196f3, #42a5f5);
  border-color: #1976d2;
  box-shadow: 0 0 30px rgba(33, 150, 243, 0.5);
}

.badge-needs-improvement {
  background: linear-gradient(45deg, #ff9800, #ffb74d);
  border-color: #f57c00;
  box-shadow: 0 0 30px rgba(255, 152, 0, 0.5);
}

.badge-icon {
  font-size: 2.5em;
  animation: badgeBounce 2s ease-in-out infinite;
}

@keyframes badgeBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.level-up-indicator {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.7em;
  font-weight: 700;
  animation: levelUpPulse 1.5s ease-in-out infinite;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.completion-title {
  color: #333;
  font-size: 2.2em;
  font-weight: 800;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  animation: titleSlideIn 0.6s ease-out 0.2s both;
}

@keyframes titleSlideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.completion-subtitle {
  color: #666;
  font-size: 1.1em;
  margin-bottom: 15px;
  animation: titleSlideIn 0.6s ease-out 0.4s both;
}

.custom-message {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 12px 20px;
  border-radius: 20px;
  font-style: italic;
  margin-top: 15px;
  animation: titleSlideIn 0.6s ease-out 0.6s both;
}

/* ============================================================================ */
/* 📊 ESTADÍSTICAS PRINCIPALES */
/* ============================================================================ */

.stats-showcase {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.main-stat {
  display: flex;
  justify-content: center;
}

.stat-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 6px solid;
  background: white;
  position: relative;
  animation: statCircleGrow 0.8s ease-out 0.3s both;
}

@keyframes statCircleGrow {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.score-excellent {
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.score-good {
  border-color: #28a745;
  box-shadow: 0 0 20px rgba(40, 167, 69, 0.3);
}

.score-okay {
  border-color: #2196f3;
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.3);
}

.score-needs-improvement {
  border-color: #ff9800;
  box-shadow: 0 0 20px rgba(255, 152, 0, 0.3);
}

.stat-number {
  font-size: 2.2em;
  font-weight: 900;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 0.9em;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.secondary-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: miniStatSlideIn 0.5s ease-out calc(var(--index, 0) * 0.1s + 0.5s) both;
}

@keyframes miniStatSlideIn {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.mini-stat:nth-child(1) { --index: 1; }
.mini-stat:nth-child(2) { --index: 2; }
.mini-stat:nth-child(3) { --index: 3; }
.mini-stat:nth-child(4) { --index: 4; }

.mini-stat-icon {
  font-size: 1.3em;
  width: 24px;
  text-align: center;
}

.mini-stat-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.mini-stat-number {
  font-size: 1.1em;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.mini-stat-label {
  font-size: 0.8em;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* ============================================================================ */
/* 📈 SECCIONES DE CONTENIDO */
/* ============================================================================ */

.analysis-section,
.achievements-section,
.level-progress-section,
.comparison-section,
.tips-section,
.goals-section {
  margin-bottom: 25px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.analysis-section h3,
.achievements-section h3,
.level-progress-section h3,
.comparison-section h3,
.tips-section h3,
.goals-section h3 {
  color: #333;
  font-size: 1.3em;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
}

/* Análisis por tipo */
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.analysis-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 2px solid;
  transition: all 0.3s ease;
}

.analysis-excellent { border-color: #28a745; }
.analysis-good { border-color: #2196f3; }
.analysis-okay { border-color: #ff9800; }
.analysis-needs-work { border-color: #f44336; }

.analysis-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.analysis-icon {
  font-size: 1.5em;
}

.analysis-title {
  font-weight: 600;
  color: #333;
}

.analysis-score {
  font-size: 1.8em;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.analysis-detail {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 8px;
}

.analysis-recommendation {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 8px;
  font-size: 0.8em;
  color: #555;
}

/* Comparación */
.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.comparison-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.comparison-item.improvement {
  background: linear-gradient(135deg, #e8f5e8, #ffffff);
  border-color: #28a745;
}

.comparison-icon {
  font-size: 1.3em;
  width: 24px;
  text-align: center;
}

.comparison-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.comparison-label {
  font-size: 0.8em;
  color: #666;
  margin-bottom: 2px;
}

.comparison-value {
  font-weight: 700;
  color: #333;
}

/* Consejos */
.tips-carousel {
  position: relative;
  min-height: 100px;
}

.tip-item {
  display: none;
  background: white;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.tip-item.active {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: tipFadeIn 0.5s ease-in-out;
}

@keyframes tipFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tip-icon {
  font-size: 1.5em;
  flex-shrink: 0;
}

.tip-content h4 {
  color: #333;
  margin-bottom: 6px;
  font-weight: 600;
}

.tip-content p {
  color: #666;
  font-size: 0.9em;
  line-height: 1.4;
  margin: 0;
}

.tips-navigation {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
}

.tip-nav-btn {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tip-nav-btn.active {
  background: #667eea;
  transform: scale(1.2);
}

/* Objetivos */
.goals-list {
  display: grid;
  gap: 10px;
}

.goal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 12px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.goal-icon {
  font-size: 1.3em;
  width: 24px;
  text-align: center;
}

.goal-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.goal-text {
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.goal-reward {
  font-size: 0.8em;
  color: #667eea;
  font-weight: 600;
}

/* ============================================================================ */
/* 🎯 ACCIONES DEL MODAL */
/* ============================================================================ */

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 30px;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 25px;
  font-size: 0.95em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  text-align: center;
  min-height: 48px;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 2px solid #e1e5e9;
}

.btn-share {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  color: white;
}

.btn-action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-icon {
  font-size: 1.1em;
}

/* ============================================================================ */
/* ❌ BOTÓN CERRAR */
/* ============================================================================ */

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2em;
  color: #666;
  transition: all 0.3s ease;
  z-index: 10;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #333;
  transform: scale(1.1);
}

/* ============================================================================ */
/* 📱 RESPONSIVE */
/* ============================================================================ */

@media (max-width: 768px) {
  .completion-modal {
    padding: 30px 20px;
    margin: 15px;
    max-width: none;
    width: calc(100% - 30px);
  }
  
  .stats-showcase {
    flex-direction: column;
    gap: 20px;
  }
  
  .secondary-stats {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .analysis-grid,
  .comparison-grid {
    grid-template-columns: 1fr;
  }
  
  .completion-title {
    font-size: 1.8em;
  }
  
  .stat-circle {
    width: 100px;
    height: 100px;
  }
  
  .stat-number {
    font-size: 1.8em;
  }
}

@media (max-width: 480px) {
  .completion-modal {
    padding: 20px 16px;
    margin: 10px;
    width: calc(100% - 20px);
  }
  
  .achievement-badge {
    width: 80px;
    height: 80px;
  }
  
  .badge-icon {
    font-size: 2em;
  }
  
  .completion-title {
    font-size: 1.6em;
  }
  
  .completion-subtitle {
    font-size: 1em;
  }
  
  .stat-circle {
    width: 90px;
    height: 90px;
  }
  
  .stat-number {
    font-size: 1.6em;
  }
  
  .mini-stat {
    padding: 8px 12px;
  }
  
  .btn-action {
    padding: 12px 20px;
    font-size: 0.9em;
  }
}

/* ============================================================================ */
/* 🌙 MODO OSCURO */
/* ============================================================================ */

@media (prefers-color-scheme: dark) {
  .completion-modal {
    background: linear-gradient(135deg, #2c3e50, #34495e);
    color: #ecf0f1;
  }
  
  .completion-title {
    color: #ecf0f1;
  }
  
  .completion-subtitle {
    color: #bdc3c7;
  }
  
  .stat-circle {
    background: #34495e;
    color: #ecf0f1;
  }
  
  .mini-stat {
    background: rgba(52, 73, 94, 0.8);
    color: #ecf0f1;
  }
  
  .analysis-section,
  .achievements-section,
  .level-progress-section,
  .comparison-section,
  .tips-section,
  .goals-section {
    background: rgba(52, 73, 94, 0.6);
  }
}
</style>