<!-- components/QuestionCard.vue - INTEGRADO 100% CON EL BACKEND -->
<template>
  <div class="question-card" :class="[getTipoClass(pregunta.tipo), getDificultadClass(pregunta.dificultad)]">
    <!-- Header de la pregunta -->
    <div class="question-header">
      <div class="question-meta">
        <span class="question-number">Pregunta {{ numeroPregunta }}</span>
        <span v-if="totalPreguntas" class="question-total">de {{ totalPreguntas }}</span>
        <span class="question-type" :class="getTipoClass(pregunta.tipo)">
          {{ getTipoTexto(pregunta.tipo) }}
        </span>
        <span v-if="pregunta.dificultad" class="question-difficulty" :class="getDificultadClass(pregunta.dificultad)">
          {{ getDificultadTexto(pregunta.dificultad) }}
        </span>
      </div>
      
      <!-- Temporizador -->
      <div v-if="tiempoLimite && !modoRevision" class="timer-container">
        <div class="timer-bar">
          <div class="timer-progress" :style="{ width: porcentajeTiempo + '%' }"></div>
        </div>
        <span class="timer-text">{{ formatTiempo(tiempoRestante) }}</span>
      </div>
    </div>

    <!-- Pregunta principal -->
    <div class="question-content">
      <h3 class="question-text">{{ pregunta.pregunta }}</h3>
      
      <!-- Contexto adicional si existe -->
      <div v-if="pregunta.contexto" class="question-context">
        <p>{{ pregunta.contexto }}</p>
      </div>
    </div>

    <!-- Opciones de respuesta -->
    <div class="options-container" v-if="pregunta.opciones && pregunta.opciones.length > 0">
      <div
        v-for="(opcion, index) in pregunta.opciones"
        :key="index"
        @click="seleccionarOpcion(index)"
        class="option"
        :class="getOpcionClass(index)"
      >
        <div class="option-marker">
          {{ String.fromCharCode(65 + index) }}
        </div>
        <div class="option-text">
          {{ opcion }}
        </div>
        <div v-if="mostrarResultados && index === pregunta.respuesta_correcta" class="option-icon correct">
          ✅
        </div>
        <div v-else-if="mostrarResultados && esRespuestaIncorrecta(index)" class="option-icon incorrect">
          ❌
        </div>
      </div>
    </div>

    <!-- Área para respuesta de texto libre (preguntas creativas) -->
    <div v-else-if="pregunta.tipo === 'creativa' || pregunta.tipo === 'abierta'" class="text-response-container">
      <textarea
        v-model="respuestaTexto"
        :disabled="pregunta.respondida || modoRevision"
        placeholder="Escribe tu respuesta aquí... ¡Sé creativo!"
        class="text-response"
        :class="{ 'disabled': pregunta.respondida || modoRevision }"
      ></textarea>
      <div class="character-count">
        {{ respuestaTexto.length }}/{{ maxCaracteres }} caracteres
      </div>
    </div>

    <!-- Área de feedback y reintento -->
    <div v-if="modoReintento && !pregunta.esCorrecta" class="retry-section">
      <div class="retry-message">
        <h4>🔄 ¡Intentemos de nuevo!</h4>
        <p>{{ getMensajeReintento() }}</p>
        <div v-if="pregunta.pista" class="hint-box">
          <strong>💡 Pista:</strong> {{ pregunta.pista }}
        </div>
      </div>
    </div>

    <!-- Resultados y explicación -->
    <div v-if="mostrarResultados" class="results-section">
      <!-- Estado de la respuesta -->
      <div class="response-status" :class="{ 'correct': pregunta.es_correcta, 'incorrect': !pregunta.es_correcta }">
        <div class="status-icon">
          {{ pregunta.es_correcta ? '🎉' : '💭' }}
        </div>
        <div class="status-text">
          <h4 v-if="pregunta.es_correcta">¡Correcto!</h4>
          <h4 v-else>Inténtalo de nuevo</h4>
          <p v-if="pregunta.es_correcta">Has ganado {{ pregunta.puntos_obtenidos || 0 }} puntos</p>
          <p v-else-if="!modoRevision">Puedes intentar {{ maxIntentos - pregunta.intentos }} veces más</p>
        </div>
      </div>
      
      <!-- Explicación -->
      <div v-if="pregunta.explicacion" class="explanation">
        <h4>📖 Explicación:</h4>
        <p>{{ pregunta.explicacion }}</p>
      </div>
      
      <!-- Respuesta correcta para preguntas de opción múltiple -->
      <div v-if="!pregunta.es_correcta && pregunta.opciones && pregunta.respuesta_correcta !== undefined" class="correct-answer">
        <p><strong>Respuesta correcta:</strong> {{ String.fromCharCode(65 + pregunta.respuesta_correcta) }}. {{ pregunta.opciones[pregunta.respuesta_correcta] }}</p>
      </div>
      
      <!-- Feedback personalizado -->
      <div v-if="pregunta.feedback" class="feedback">
        <h4>💬 Feedback:</h4>
        <p>{{ pregunta.feedback }}</p>
      </div>
    </div>

    <!-- Estadísticas detalladas -->
    <div v-if="mostrarEstadisticas && estadisticasPregunta" class="question-stats">
      <h4>📊 Estadísticas:</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <span class="stat-label">Intentos</span>
            <span class="stat-value">{{ pregunta.intentos || 1 }}/{{ maxIntentos }}</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <span class="stat-label">Tiempo</span>
            <span class="stat-value">{{ formatTiempo(pregunta.tiempo_respuesta || 0) }}</span>
          </div>
        </div>
        <div v-if="estadisticasPregunta.promedio_clase" class="stat-item">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <span class="stat-label">Promedio</span>
            <span class="stat-value">{{ estadisticasPregunta.promedio_clase }}%</span>
          </div>
        </div>
        <div v-if="pregunta.puntos_obtenidos" class="stat-item">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <span class="stat-label">Puntos</span>
            <span class="stat-value">{{ pregunta.puntos_obtenidos }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones principales -->
    <div class="question-actions" v-if="!modoRevision">
      <!-- Confirmar respuesta de opción múltiple -->
      <button 
        v-if="!pregunta.respondida && pregunta.respuesta_seleccionada !== null && pregunta.opciones"
        @click="confirmarRespuesta"
        class="btn btn-primary"
        :disabled="cargandoRespuesta"
      >
        <span v-if="cargandoRespuesta">⏳ Enviando...</span>
        <span v-else>✅ Confirmar Respuesta</span>
      </button>
      
      <!-- Enviar respuesta de texto -->
      <button 
        v-else-if="!pregunta.respondida && respuestaTexto.trim() && !pregunta.opciones"
        @click="enviarRespuestaTexto"
        class="btn btn-primary"
        :disabled="cargandoRespuesta || respuestaTexto.length < 10"
      >
        <span v-if="cargandoRespuesta">⏳ Enviando...</span>
        <span v-else>📝 Enviar Respuesta</span>
      </button>
      
      <!-- Repetir pregunta -->
      <button 
        v-if="!pregunta.es_correcta && pregunta.respondida && puedeReintentar"
        @click="iniciarReintento"
        class="btn btn-secondary"
        :disabled="cargandoReintento"
      >
        <span v-if="cargandoReintento">🔄 Preparando...</span>
        <span v-else>🔄 Intentar de Nuevo</span>
      </button>
      
      <!-- Saltar pregunta -->
      <button 
        v-if="!pregunta.es_correcta && (!pregunta.respondida || !puedeReintentar) && permitirSaltar"
        @click="saltarPregunta"
        class="btn btn-outline"
      >
        ⏭️ Saltar Pregunta
      </button>
      
      <!-- Siguiente pregunta -->
      <button 
        v-if="pregunta.respondida && siguientePregunta"
        @click="$emit('siguiente-pregunta')"
        class="btn btn-success"
      >
        ➡️ Siguiente Pregunta
      </button>
      
      <!-- Finalizar actividad -->
      <button 
        v-if="pregunta.respondida && finalizarActividad"
        @click="$emit('finalizar-actividad')"
        class="btn btn-success"
      >
        🏆 Ver Resultados
      </button>
    </div>

    <!-- Acciones de ayuda -->
    <div v-if="mostrarAyuda && !pregunta.respondida && !modoRevision" class="help-actions">
      <button @click="solicitarPista" class="btn-help" :disabled="pistaUsada || cargandoPista">
        <span v-if="cargandoPista">💡 Obteniendo pista...</span>
        <span v-else-if="pistaUsada">💡 Pista usada</span>
        <span v-else>💡 Solicitar Pista</span>
      </button>
      
      <button @click="mostrarEstadisticas = !mostrarEstadisticas" class="btn-help">
        📊 {{ mostrarEstadisticas ? 'Ocultar' : 'Ver' }} Estadísticas
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import apiService from '../services/api'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'QuestionCard',
  props: {
    pregunta: {
      type: Object,
      required: true
    },
    historiaId: {
      type: Number,
      required: true
    },
    numeroPregunta: {
      type: Number,
      required: true
    },
    totalPreguntas: {
      type: Number,
      default: 6
    },
    modoRevision: {
      type: Boolean,
      default: false
    },
    siguientePregunta: {
      type: Boolean,
      default: false
    },
    finalizarActividad: {
      type: Boolean,
      default: false
    },
    tiempoLimite: {
      type: Number,
      default: null // en segundos
    },
    maxIntentos: {
      type: Number,
      default: 3
    },
    permitirSaltar: {
      type: Boolean,
      default: true
    },
    mostrarAyuda: {
      type: Boolean,
      default: true
    },
    estadisticasPregunta: {
      type: Object,
      default: null
    },
    maxCaracteres: {
      type: Number,
      default: 500
    }
  },
  emits: [
    'respuesta-enviada',
    'respuesta-confirmada', 
    'siguiente-pregunta', 
    'finalizar-actividad', 
    'tiempo-agotado',
    'pregunta-saltada',
    'pista-solicitada',
    'reintento-iniciado'
  ],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    
    // ============================================================================
    // 📊 ESTADOS REACTIVOS
    // ============================================================================
    
    const cargandoRespuesta = ref(false)
    const cargandoReintento = ref(false)
    const cargandoPista = ref(false)
    const tiempoRestante = ref(props.tiempoLimite || 0)
    const tiempoInicio = ref(null)
    const timerInterval = ref(null)
    const modoReintento = ref(false)
    const pistaUsada = ref(false)
    const mostrarEstadisticas = ref(false)
    const respuestaTexto = ref('')
    
    // ============================================================================
    // 🔄 COMPUTED PROPERTIES
    // ============================================================================
    
    const mostrarResultados = computed(() => {
      return props.pregunta.respondida || props.modoRevision
    })
    
    const porcentajeTiempo = computed(() => {
      if (!props.tiempoLimite) return 100
      return Math.max(0, (tiempoRestante.value / props.tiempoLimite) * 100)
    })
    
    const puedeReintentar = computed(() => {
      const intentos = props.pregunta.intentos || 1
      return intentos < props.maxIntentos && 
             !props.pregunta.es_correcta && 
             props.pregunta.respondida
    })
    
    // ============================================================================
    // 🎯 MÉTODOS PRINCIPALES
    // ============================================================================
    
    const seleccionarOpcion = (index) => {
      if (props.pregunta.respondida || props.modoRevision) return
      
      // Actualizar la respuesta seleccionada
      props.pregunta.respuesta_seleccionada = index
      console.log(`📝 Opción seleccionada: ${String.fromCharCode(65 + index)}`)
    }
    
    const confirmarRespuesta = async () => {
      if (props.pregunta.respuesta_seleccionada === null) return
      
      cargandoRespuesta.value = true
      
      try {
        console.log('📤 Enviando respuesta al backend...')
        
        // Calcular tiempo de respuesta
        const tiempoRespuesta = tiempoInicio.value ? 
          Math.round((Date.now() - tiempoInicio.value) / 1000) : 0
        
        // Preparar datos para el backend
        const datosRespuesta = {
          alumno_id: authStore.user.id,
          historia_id: props.historiaId,
          pregunta_numero: props.numeroPregunta,
          respuesta_seleccionada: props.pregunta.respuesta_seleccionada,
          tipo_pregunta: props.pregunta.tipo,
          tiempo_respuesta: tiempoRespuesta
        }
        
        // Enviar al backend usando el endpoint correcto
        const response = await apiService.responderPregunta(datosRespuesta)
        
        // Actualizar datos de la pregunta con la respuesta del backend
        Object.assign(props.pregunta, {
          respondida: true,
          es_correcta: response.es_correcta,
          puntos_obtenidos: response.puntos_obtenidos,
          explicacion: response.explicacion,
          feedback: response.feedback,
          tiempo_respuesta: tiempoRespuesta,
          intentos: (props.pregunta.intentos || 0) + 1
        })
        
        // Detener timer si existe
        if (timerInterval.value) {
          clearInterval(timerInterval.value)
        }
        
        console.log(`✅ Respuesta procesada: ${response.es_correcta ? 'Correcta' : 'Incorrecta'}`)
        
        // Emitir evento
        emit('respuesta-confirmada', {
          pregunta: props.pregunta,
          respuesta: response
        })
        
    } catch (error) {
        console.error('❌ Error enviando respuesta:', error)
        // Mostrar error al usuario sin modificar el estado de la pregunta
      } finally {
        cargandoRespuesta.value = false
      }
    }
    
    const enviarRespuestaTexto = async () => {
      if (!respuestaTexto.value.trim()) return
      
      cargandoRespuesta.value = true
      
      try {
        console.log('📤 Enviando respuesta de texto al backend...')
        
        const tiempoRespuesta = tiempoInicio.value ? 
          Math.round((Date.now() - tiempoInicio.value) / 1000) : 0
        
        const datosRespuesta = {
          alumno_id: authStore.user.id,
          historia_id: props.historiaId,
          pregunta_numero: props.numeroPregunta,
          respuesta_texto: respuestaTexto.value.trim(),
          tipo_pregunta: props.pregunta.tipo,
          tiempo_respuesta: tiempoRespuesta
        }
        
        // Usar endpoint específico para respuestas de texto
        const response = await apiService.responderPreguntaTexto(datosRespuesta)
        
        // Actualizar pregunta
        Object.assign(props.pregunta, {
          respondida: true,
          respuesta_estudiante: respuestaTexto.value.trim(),
          puntos_obtenidos: response.puntos_obtenidos,
          feedback: response.feedback,
          tiempo_respuesta: tiempoRespuesta,
          intentos: (props.pregunta.intentos || 0) + 1
        })
        
        if (timerInterval.value) {
          clearInterval(timerInterval.value)
        }
        
        console.log(`✅ Respuesta de texto procesada, puntos: ${response.puntos_obtenidos}`)
        
        emit('respuesta-enviada', {
          pregunta: props.pregunta,
          respuesta: response
        })
        
      } catch (error) {
        console.error('❌ Error enviando respuesta de texto:', error)
      } finally {
        cargandoRespuesta.value = false
      }
    }
    
    const iniciarReintento = async () => {
      if (!puedeReintentar.value) return
      
      cargandoReintento.value = true
      
      try {
        console.log('🔄 Iniciando reintento...')
        
        // Llamar al backend para repetir pregunta
        const response = await apiService.repetirPregunta({
          historia_id: props.historiaId,
          pregunta_numero: props.numeroPregunta,
          alumno_id: authStore.user.id
        })
        
        // Resetear estado de la pregunta
        Object.assign(props.pregunta, {
          respondida: false,
          respuesta_seleccionada: null,
          es_correcta: false,
          puntos_obtenidos: 0,
          pista: response.pista || props.pregunta.pista
        })
        
        // Resetear respuesta de texto
        respuestaTexto.value = ''
        
        // Activar modo reintento
        modoReintento.value = true
        
        // Reiniciar timer si es necesario
        if (props.tiempoLimite) {
          iniciarTimer()
        }
        
        console.log('✅ Reintento iniciado')
        
        emit('reintento-iniciado', props.pregunta)
        
        // Desactivar modo reintento después de un tiempo
        setTimeout(() => {
          modoReintento.value = false
        }, 3000)
        
      } catch (error) {
        console.error('❌ Error iniciando reintento:', error)
      } finally {
        cargandoReintento.value = false
      }
    }
    
    const saltarPregunta = () => {
      console.log('⏭️ Saltando pregunta...')
      
      // Marcar como saltada
      props.pregunta.saltada = true
      props.pregunta.respondida = true
      
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
      }
      
      emit('pregunta-saltada', props.pregunta)
    }
    
    const solicitarPista = async () => {
      if (pistaUsada.value) return
      
      cargandoPista.value = true
      
      try {
        console.log('💡 Solicitando pista...')
        
        // En este caso, usar la pista que viene con la pregunta del backend
        // o hacer una llamada específica si el backend lo soporta
        if (props.pregunta.pista) {
          pistaUsada.value = true
          console.log('✅ Pista mostrada')
          emit('pista-solicitada', props.pregunta.pista)
        }
        
      } catch (error) {
        console.error('❌ Error solicitando pista:', error)
      } finally {
        cargandoPista.value = false
      }
    }
    
    // ============================================================================
    // ⏰ MANEJO DE TIMER
    // ============================================================================
    
    const iniciarTimer = () => {
      if (!props.tiempoLimite || props.modoRevision) return
      
      tiempoInicio.value = Date.now()
      tiempoRestante.value = props.tiempoLimite
      
      timerInterval.value = setInterval(() => {
        tiempoRestante.value--
        
        if (tiempoRestante.value <= 0) {
          clearInterval(timerInterval.value)
          emit('tiempo-agotado', props.pregunta)
        }
      }, 1000)
    }
    
    // ============================================================================
    // 🎨 MÉTODOS DE ESTILO Y FORMATO
    // ============================================================================
    
    const getOpcionClass = (index) => {
      const clases = ['option-item']
      
      if (props.pregunta.respuesta_seleccionada === index && !props.pregunta.respondida) {
        clases.push('selected')
      }
      
      if (mostrarResultados.value) {
        if (index === props.pregunta.respuesta_correcta) {
          clases.push('correct')
        } else if (esRespuestaIncorrecta(index)) {
          clases.push('incorrect')
        }
      }
      
      if (props.pregunta.respondida || props.modoRevision) {
        clases.push('disabled')
      }
      
      return clases
    }
    
    const esRespuestaIncorrecta = (index) => {
      return props.pregunta.respuesta_seleccionada === index && 
             !props.pregunta.es_correcta &&
             props.pregunta.respondida
    }
    
    const getTipoClass = (tipo) => {
      const clases = {
        'inferencial': 'tipo-inferencial',
        'juicio_critico': 'tipo-critico', 
        'creativa': 'tipo-creativo',
        'multiple': 'tipo-multiple'
      }
      return clases[tipo] || 'tipo-default'
    }
    
    const getTipoTexto = (tipo) => {
      const textos = {
        'inferencial': '🧠 Inferencial',
        'juicio_critico': '🔍 Juicio Crítico',
        'creativa': '🎨 Creativa',
        'multiple': '🔘 Opción Múltiple'
      }
      return textos[tipo] || 'Pregunta'
    }
    
    const getDificultadClass = (dificultad) => {
      const clases = {
        'facil': 'dif-facil',
        'medio': 'dif-medio', 
        'dificil': 'dif-dificil'
      }
      return clases[dificultad] || 'dif-medio'
    }
    
    const getDificultadTexto = (dificultad) => {
      const textos = {
        'facil': '🟢 Fácil',
        'medio': '🟡 Medio',
        'dificil': '🔴 Difícil'
      }
      return textos[dificultad] || '🟡 Medio'
    }
    
    const formatTiempo = (segundos) => {
      if (segundos < 60) {
        return `${segundos}s`
      } else {
        const min = Math.floor(segundos / 60)
        const sec = segundos % 60
        return `${min}m ${sec}s`
      }
    }
    
    const getMensajeReintento = () => {
      const mensajes = [
        "¡No te rindas! Revisa las opciones nuevamente.",
        "Piensa en el contexto de la historia antes de responder.",
        "Considera todas las pistas disponibles."
      ]
      
      const intentos = props.pregunta.intentos || 1
      const indice = (intentos - 1) % mensajes.length
      return mensajes[indice]
    }
    
    // ============================================================================
    // 🎯 LIFECYCLE HOOKS
    // ============================================================================
    
    onMounted(() => {
      console.log(`🎯 Pregunta ${props.numeroPregunta} montada:`, props.pregunta.tipo)
      
      // Iniciar timer si está configurado
      if (props.tiempoLimite && !props.pregunta.respondida && !props.modoRevision) {
        iniciarTimer()
      }
      
      // Establecer respuesta de texto si existe
      if (props.pregunta.respuesta_estudiante) {
        respuestaTexto.value = props.pregunta.respuesta_estudiante
      }
    })
    
    onUnmounted(() => {
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
      }
    })
    
    // ============================================================================
    // 👀 WATCHERS
    // ============================================================================
    
    watch(() => props.pregunta.respondida, (nuevoValor) => {
      if (nuevoValor && timerInterval.value) {
        clearInterval(timerInterval.value)
      }
    })
    
    return {
      // Estados
      cargandoRespuesta,
      cargandoReintento, 
      cargandoPista,
      tiempoRestante,
      modoReintento,
      pistaUsada,
      mostrarEstadisticas,
      respuestaTexto,
      
      // Computed
      mostrarResultados,
      porcentajeTiempo,
      puedeReintentar,
      
      // Métodos
      seleccionarOpcion,
      confirmarRespuesta,
      enviarRespuestaTexto,
      iniciarReintento,
      saltarPregunta,
      solicitarPista,
      getOpcionClass,
      esRespuestaIncorrecta,
      getTipoClass,
      getTipoTexto,
      getDificultadClass,
      getDificultadTexto,
      formatTiempo,
      getMensajeReintento
    }
  }
}
</script>

<style scoped>
/* ============================================================================ */
/* 🎨 ESTILOS PRINCIPALES */
/* ============================================================================ */

.question-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  margin: 20px 0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.question-card:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.question-card.tipo-inferencial:before {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
}

.question-card.tipo-critico:before {
  background: linear-gradient(45deg, #fa709a, #fee140);
}

.question-card.tipo-creativo:before {
  background: linear-gradient(45deg, #a8edea, #fed6e3);
}

/* ============================================================================ */
/* 📋 HEADER DE PREGUNTA */
/* ============================================================================ */

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.question-number {
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
}

.question-total {
  font-size: 14px;
  color: #666;
}

.question-type {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tipo-inferencial {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  color: white;
}

.tipo-critico {
  background: linear-gradient(45deg, #fa709a, #fee140);
  color: white;
}

.tipo-creativo {
  background: linear-gradient(45deg, #a8edea, #fed6e3);
  color: #333;
}

.tipo-multiple {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.question-difficulty {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.dif-facil {
  background: #e8f5e8;
  color: #2e7d32;
}

.dif-medio {
  background: #fff3c4;
  color: #f57c00;
}

.dif-dificil {
  background: #ffebee;
  color: #c62828;
}

/* ============================================================================ */
/* ⏰ TIMER */
/* ============================================================================ */

.timer-container {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 100px;
}

.timer-bar {
  width: 60px;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.timer-progress {
  height: 100%;
  background: linear-gradient(45deg, #4caf50, #8bc34a);
  transition: width 1s linear;
}

.timer-progress[style*="width: 0"] {
  background: linear-gradient(45deg, #f44336, #ff5722);
}

.timer-text {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  min-width: 30px;
}

/* ============================================================================ */
/* 📝 CONTENIDO DE PREGUNTA */
/* ============================================================================ */

.question-content {
  margin-bottom: 25px;
}

.question-text {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin-bottom: 15px;
}

.question-context {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid #667eea;
  font-style: italic;
  color: #555;
}

/* ============================================================================ */
/* 🔘 OPCIONES DE RESPUESTA */
/* ============================================================================ */

.options-container {
  margin-bottom: 25px;
}

.option {
  display: flex;
  align-items: center;
  padding: 15px;
  margin: 10px 0;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.option:hover:not(.disabled) {
  border-color: #667eea;
  background: #f8f9ff;
  transform: translateX(5px);
}

.option.selected {
  border-color: #667eea;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  transform: translateX(5px);
}

.option.correct {
  border-color: #4caf50;
  background: #e8f5e8;
  color: #2e7d32;
}

.option.incorrect {
  border-color: #f44336;
  background: #ffebee;
  color: #c62828;
}

.option.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.option-marker {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e1e5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
  transition: all 0.3s ease;
}

.option.selected .option-marker {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.option.correct .option-marker {
  background: #4caf50;
  color: white;
}

.option.incorrect .option-marker {
  background: #f44336;
  color: white;
}

.option-text {
  flex: 1;
  font-size: 16px;
  line-height: 1.4;
}

.option-icon {
  font-size: 20px;
  margin-left: 10px;
}

/* ============================================================================ */
/* 📝 RESPUESTA DE TEXTO */
/* ============================================================================ */

.text-response-container {
  margin-bottom: 25px;
}

.text-response {
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;
}

.text-response:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.text-response.disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.character-count {
  text-align: right;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

/* ============================================================================ */
/* 🔄 SECCIÓN DE REINTENTO */
/* ============================================================================ */

.retry-section {
  background: linear-gradient(45deg, #fff3c4, #ffeaa7);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 4px solid #f39c12;
}

.retry-message h4 {
  color: #d68910;
  margin-bottom: 10px;
}

.hint-box {
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 8px;
  margin-top: 10px;
  font-size: 14px;
}

/* ============================================================================ */
/* 📊 SECCIÓN DE RESULTADOS */
/* ============================================================================ */

.results-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.response-status {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.response-status.correct {
  color: #2e7d32;
}

.response-status.incorrect {
  color: #c62828;
}

.status-icon {
  font-size: 30px;
}

.status-text h4 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.status-text p {
  margin: 0;
  font-size: 14px;
}

.explanation,
.correct-answer,
.feedback {
  margin: 15px 0;
  padding: 15px;
  border-radius: 8px;
  background: white;
}

.explanation h4,
.feedback h4 {
  margin: 0 0 10px 0;
  color: #667eea;
}

/* ============================================================================ */
/* 📊 ESTADÍSTICAS */
/* ============================================================================ */

.question-stats {
  background: white;
  padding: 15px;
  border-radius: 12px;
  margin: 15px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-icon {
  font-size: 18px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* ============================================================================ */
/* 🎯 ACCIONES */
/* ============================================================================ */

.question-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 20px 0;
}

.help-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 15px;
}

.btn-help {
  background: #f8f9fa;
  color: #667eea;
  border: 1px solid #e1e5e9;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-help:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-help:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================================================ */
/* 📱 RESPONSIVE */
/* ============================================================================ */

@media (max-width: 768px) {
  .question-card {
    padding: 20px;
    margin: 15px 0;
  }
  
  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .question-text {
    font-size: 18px;
  }
  
  .option {
    padding: 12px;
  }
  
  .option-text {
    font-size: 14px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
  }
  
  .question-actions {
    flex-direction: column;
  }
}
</style>