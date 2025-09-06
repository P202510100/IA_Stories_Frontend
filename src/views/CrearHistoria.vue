<!-- views/CrearHistoria.vue - COMPLETO CON SISTEMA DE PREGUNTAS INTEGRADO -->
<template>
  <div class="crear-historia">
    <div class="container">
      <div class="header">
        <h1>🎨 Crear Nueva Historia</h1>
        <p>¡Deja que la IA cree una aventura especial para ti!</p>
      </div>

      <!-- Formulario de creación -->
      <div v-if="!historiaGenerada && !generando && !mostrarPreguntas" class="historia-form">
        <form @submit.prevent="crearHistoria" class="form">
          
          <!-- Selección de tema -->
          <div class="form-group">
            <label for="tema">🎯 Elige tu tema favorito:</label>
            <div class="temas-grid">
              <div
                v-for="tema in temas"
                :key="tema.id"
                @click="seleccionarTema(tema.id)"
                :class="['tema-card', { active: formData.tema === tema.id }]"
              >
                <div class="tema-icon">{{ tema.icono }}</div>
                <h3>{{ tema.nombre }}</h3>
                <p>{{ tema.descripcion }}</p>
              </div>
            </div>
            <div v-if="!formData.tema" class="error-message">
              Por favor selecciona un tema
            </div>
          </div>

          <!-- Nombre del protagonista -->
          <div class="form-group">
            <label for="nombre_protagonista">🦸‍♂️ Nombre del protagonista:</label>
            <input
              type="text"
              id="nombre_protagonista"
              v-model="formData.nombre_protagonista"
              placeholder="¿Cómo se llama tu héroe?"
              maxlength="50"
            />
          </div>

          <!-- Edad del protagonista -->
          <div class="form-group">
            <label for="edad_protagonista">🎂 Edad del protagonista:</label>
            <select id="edad_protagonista" v-model="formData.edad_protagonista">
              <option value="">Selecciona una edad</option>
              <option v-for="edad in edadesDisponibles" :key="edad" :value="edad">
                {{ edad }} años
              </option>
            </select>
          </div>

          <!-- Elementos especiales -->
          <div class="form-group">
            <label for="elementos_especiales">✨ Elementos especiales (opcional):</label>
            <textarea
              id="elementos_especiales"
              v-model="formData.elementos_especiales"
              placeholder="¿Hay algo especial que quieras en tu historia? (animales mágicos, poderes, objetos especiales...)"
              rows="3"
              maxlength="200"
            ></textarea>
          </div>

          <!-- Botón de crear -->
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="!formData.tema">
              🚀 Crear Mi Historia
            </button>
          </div>
        </form>
      </div>

      <!-- Loading de generación -->
      <div v-if="generando" class="loading-historia">
        <div class="loading-animation">
          <div class="loading-circle"></div>
          <div class="loading-circle"></div>
          <div class="loading-circle"></div>
        </div>
        <h3>🤖 La IA está creando tu historia...</h3>
        <p>Esto puede tomar unos segundos</p>
      </div>

      <!-- Historia generada -->
      <div v-if="historiaGenerada && !mostrarPreguntas && !juegoCompletado" class="historia-resultado">
        <div class="historia-header">
          <h2>📖 {{ historiaGenerada.titulo }}</h2>
          <div class="historia-info">
            <span class="tema-badge">{{ getTemaLabel(historiaGenerada.tema) }}</span>
            <span class="palabras-count">{{ historiaGenerada.palabras || 0 }} palabras</span>
          </div>
        </div>

        <div class="historia-contenido">
          <div class="historia-texto">
            <p v-for="(parrafo, index) in getParrafos(historiaGenerada.contenido)" :key="index">
              {{ parrafo }}
            </p>
          </div>
        </div>

        <div class="historia-personajes" v-if="historiaGenerada.personajes">
          <h3>👥 Personajes:</h3>
          <div class="personajes-list">
            <span v-for="personaje in historiaGenerada.personajes" :key="personaje" class="personaje-tag">
              {{ personaje }}
            </span>
          </div>
        </div>

        <div class="historia-actions">
          <button @click="irAPreguntas" class="btn btn-primary">
            🎯 Responder Preguntas
          </button>
          <button @click="crearOtraHistoria" class="btn btn-secondary">
            📝 Crear Otra Historia
          </button>
        </div>
      </div>

      <!-- Sistema de Preguntas -->
      <div v-if="mostrarPreguntas && !juegoCompletado" class="preguntas-container">
        <div class="preguntas-header">
          <h2>🎯 ¡Hora de las Preguntas!</h2>
          <div class="progreso-bar">
            <div class="progreso-fill" :style="{ width: progresoPorcentaje + '%' }"></div>
            <span class="progreso-text">{{ preguntaActual + 1 }} / {{ totalPreguntas }}</span>
          </div>
        </div>

        <div v-if="preguntaEnCurso" class="pregunta-card">
          <div class="pregunta-tipo">
            <span class="tipo-badge" :class="preguntaEnCurso.tipo">
              {{ getTipoPreguntaLabel(preguntaEnCurso.tipo) }}
            </span>
          </div>
          
          <h3 class="pregunta-texto">{{ preguntaEnCurso.pregunta }}</h3>
          
          <div class="opciones-grid">
            <button
              v-for="(opcion, index) in preguntaEnCurso.opciones"
              :key="index"
              @click="responderPregunta(index)"
              class="opcion-btn"
              :class="{ 
                'correcta': respuestasUsuario[preguntaActual] && index === preguntaEnCurso.respuesta_correcta,
                'incorrecta': respuestasUsuario[preguntaActual] && index === respuestasUsuario[preguntaActual].opcion_elegida && !respuestasUsuario[preguntaActual].es_correcta
              }"
              :disabled="respuestasUsuario[preguntaActual]"
            >
              <span class="opcion-letra">{{ String.fromCharCode(65 + index) }})</span>
              <span class="opcion-texto">{{ opcion }}</span>
            </button>
          </div>

          <!-- Resultado de la respuesta -->
          <div v-if="respuestasUsuario[preguntaActual]" class="resultado-respuesta">
            <div class="resultado-icon">
              {{ respuestasUsuario[preguntaActual].es_correcta ? '✅' : '❌' }}
            </div>
            <div class="resultado-texto">
              <h4>{{ respuestasUsuario[preguntaActual].es_correcta ? '¡Correcto!' : '¡Inténtalo de nuevo!' }}</h4>
              <p v-if="preguntaEnCurso.explicacion" class="explicacion">
                {{ preguntaEnCurso.explicacion }}
              </p>
              <div class="puntos-ganados">
                +{{ respuestasUsuario[preguntaActual].puntos_ganados || 0 }} puntos
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Juego Completado -->
      <div v-if="juegoCompletado" class="juego-completado">
        <div class="celebracion">
          <div class="celebracion-icon">🎉</div>
          <h2>¡Felicidades!</h2>
          <p>Has completado todas las preguntas</p>
        </div>

        <div class="resultados-finales">
          <div class="puntos-totales">
            <span class="puntos-numero">{{ puntosTotales }}</span>
            <span class="puntos-label">puntos ganados</span>
          </div>
          
          <div class="estadisticas">
            <div class="stat">
              <span class="stat-numero">{{ respuestasUsuario.filter(r => r.es_correcta).length }}</span>
              <span class="stat-label">correctas</span>
            </div>
            <div class="stat">
              <span class="stat-numero">{{ totalPreguntas }}</span>
              <span class="stat-label">preguntas</span>
            </div>
            <div class="stat">
              <span class="stat-numero">{{ Math.round((respuestasUsuario.filter(r => r.es_correcta).length / totalPreguntas) * 100) }}%</span>
              <span class="stat-label">precisión</span>
            </div>
          </div>
        </div>

        <div class="acciones-finales">
          <button @click="crearOtraHistoria" class="btn btn-primary">
            📝 Crear Otra Historia
          </button>
          <button @click="verMisHistorias" class="btn btn-secondary">
            📚 Ver Mis Historias
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>¡Oops! Algo salió mal</h3>
        <p>{{ error }}</p>
        <button @click="clearError" class="btn btn-secondary">
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
  name: 'CrearHistoria',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const historiasStore = useHistoriasStore()
    
    // Estado del componente - Formulario
    const formData = ref({
      tema: '',
      nombre_protagonista: '',
      edad_protagonista: '',
      elementos_especiales: ''
    })
    const generando = ref(false)
    const error = ref(null)

    // Estado del componente - Sistema de Preguntas
    const mostrarPreguntas = ref(false)
    const preguntaActual = ref(0)
    const respuestasUsuario = ref([])
    const puntosTotales = ref(0)
    const juegoCompletado = ref(false)

    // Computed properties - Formulario
    const profile = computed(() => authStore.profile)
    const temas = computed(() => historiasStore.temas)
    const historiaGenerada = computed(() => historiasStore.historiaActual)
    
    const edadesDisponibles = computed(() => {
      const edades = []
      for (let i = 5; i <= 15; i++) {
        edades.push(i)
      }
      return edades
    })

    // Computed properties - Sistema de Preguntas
    const preguntas = computed(() => historiasStore.preguntas)
    const preguntaEnCurso = computed(() => preguntas.value[preguntaActual.value])
    const totalPreguntas = computed(() => preguntas.value.length)
    const progresoPorcentaje = computed(() => 
      totalPreguntas.value > 0 ? (preguntaActual.value / totalPreguntas.value) * 100 : 0
    )

    // ============================================================================
    // 🚀 LIFECYCLE
    // ============================================================================
    
    onMounted(async () => {
      console.log('🎨 Iniciando CrearHistoria...')
      
      // Verificar autenticación
      if (!authStore.isAuthenticated || !authStore.isAlumno) {
        console.error('❌ Acceso no autorizado')
        router.push('/login')
        return
      }

      // Cargar temas desde el backend
      await cargarTemas()

      // Pre-llenar datos del perfil si están disponibles
      if (profile.value) {
        if (profile.value.edad) {
          formData.value.edad_protagonista = profile.value.edad.toString()
        }
      }
    })

    // ============================================================================
    // 🎯 MÉTODOS PRINCIPALES - FORMULARIO
    // ============================================================================
    
    async function cargarTemas() {
      try {
        await historiasStore.cargarTemas()
        console.log(`✅ ${temas.value.length} temas cargados`)
      } catch (err) {
        console.error('❌ Error cargando temas:', err)
        error.value = 'No pudimos cargar los temas disponibles. Por favor intenta de nuevo.'
      }
    }

    function seleccionarTema(temaId) {
      formData.value.tema = temaId
      console.log('🎯 Tema seleccionado:', temaId)
    }

    async function crearHistoria() {
      // Validaciones
      if (!formData.value.tema) {
        error.value = 'Por favor selecciona un tema para tu historia'
        return
      }

      // ✅ OBTENER USUARIO ACTUAL
      let usuarioActual = authStore.user || authStore.profile

      // Si no tenemos usuario, intentar cargar desde localStorage
      if (!usuarioActual?.id) {
        try {
          const userData = localStorage.getItem('user')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            if (parsedUser && parsedUser.id) {
              usuarioActual = parsedUser
            }
          }
        } catch (e) {
          console.error('Error cargando desde localStorage:', e)
        }
      }

      // ✅ VERIFICACIÓN FINAL DEL USUARIO
      if (!usuarioActual?.id) {
        error.value = 'No se pudo cargar la información del usuario. Por favor, inicia sesión nuevamente.'
        return
      }

      // ✅ OBTENER ALUMNO_ID CORRECTO
      let alumnoId = usuarioActual.alumno_id || authStore.profile?.id || usuarioActual.id

      if (!alumnoId) {
        error.value = 'No se pudo obtener el ID del alumno. Verifica tu perfil.'
        return
      }

      generando.value = true
      error.value = null

      try {
        console.log('🚀 Generando historia...')

        // ✅ DATOS EN FORMATO EXACTO QUE ESPERA EL BACKEND
        const datosHistoria = {
          tema: formData.value.tema,
          personaje_principal: formData.value.nombre_protagonista || 'Héroe',
          edad_protagonista: parseInt(formData.value.edad_protagonista) || 8,
          alumno_id: alumnoId
        }

        // Generar historia usando el store
        const historia = await historiasStore.generarHistoria(datosHistoria)
        
        console.log('✅ Historia generada exitosamente:', historia.titulo)

      } catch (err) {
        console.error('❌ Error creando historia:', err)
        
        // ✅ MENSAJES DE ERROR ESPECÍFICOS
        if (err.response?.status === 400) {
          const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Datos inválidos'
          error.value = `Error en los datos enviados: ${errorMsg}`
        } else if (err.response?.status === 404) {
          error.value = 'El servicio de generación de historias no está disponible'
        } else if (err.response?.status === 500) {
          error.value = 'Error interno del servidor. Intenta de nuevo en unos momentos.'
        } else {
          error.value = err.message || 'No pudimos crear tu historia. Por favor intenta de nuevo.'
        }
      } finally {
        generando.value = false
      }
    }

    // ============================================================================
    // 🎯 MÉTODOS PRINCIPALES - SISTEMA DE PREGUNTAS
    // ============================================================================

    function irAPreguntas() {
      console.log('🎯 Iniciando preguntas...')
      console.log('📋 Preguntas disponibles:', preguntas.value)
      
      if (preguntas.value && preguntas.value.length > 0) {
        mostrarPreguntas.value = true
        preguntaActual.value = 0
        respuestasUsuario.value = []
        puntosTotales.value = 0
        juegoCompletado.value = false
        console.log('✅ Sistema de preguntas iniciado')
      } else {
        console.error('❌ No hay preguntas disponibles')
        error.value = 'No se pudieron cargar las preguntas'
      }
    }

    async function responderPregunta(opcionSeleccionada) {
      try {
        console.log('📝 DEBUGGING RESPUESTA COMPLETO')
        console.log('='.repeat(50))
        console.log('🎯 Pregunta en curso:', preguntaEnCurso.value)
        console.log('📊 Historia generada:', historiaGenerada.value)
        console.log('👤 Profile ID:', authStore.profile?.id)
        console.log('🔢 Opción seleccionada:', opcionSeleccionada)
        
        // ✅ VERIFICAR QUE TENEMOS TODOS LOS DATOS
        if (!preguntaEnCurso.value?.id) {
          throw new Error('No se encontró ID de la pregunta')
        }
        
        if (!historiaGenerada.value?.id) {
          throw new Error('No se encontró ID de la historia')
        }
        
        if (!authStore.profile?.id) {
          throw new Error('No se encontró ID del alumno')
        }
        
        const datosRespuesta = {
          historia_id: historiaGenerada.value.id,
          alumno_id: authStore.profile.id,
          pregunta_id: preguntaEnCurso.value.id,
          respuesta: opcionSeleccionada
        }
        
        console.log('📝 Datos finales para enviar:', datosRespuesta)
        console.log('🔍 Tipos de datos:')
        console.log('  - historia_id:', typeof datosRespuesta.historia_id, datosRespuesta.historia_id)
        console.log('  - alumno_id:', typeof datosRespuesta.alumno_id, datosRespuesta.alumno_id)  
        console.log('  - pregunta_id:', typeof datosRespuesta.pregunta_id, datosRespuesta.pregunta_id)
        console.log('  - respuesta:', typeof datosRespuesta.respuesta, datosRespuesta.respuesta)
        console.log('='.repeat(50))
        
        // Llamar al backend para enviar respuesta
        const resultado = await historiasStore.responderPregunta(datosRespuesta)
        
        // Guardar respuesta del usuario
        respuestasUsuario.value.push({
          pregunta_id: preguntaEnCurso.value.id,
          opcion_elegida: opcionSeleccionada,
          es_correcta: resultado.es_correcta,
          puntos_ganados: resultado.puntos_ganados || (resultado.es_correcta ? 20 : 0),
          explicacion: resultado.explicacion
        })
        
        if (resultado.es_correcta) {
          puntosTotales.value += (resultado.puntos_ganados || 20)
        }
        
        console.log('✅ Respuesta procesada:', resultado)
        
        // Avanzar a siguiente pregunta o completar
        setTimeout(() => {
          if (preguntaActual.value < totalPreguntas.value - 1) {
            preguntaActual.value++
          } else {
            completarJuego()
          }
        }, 2000) // Mostrar resultado por 2 segundos
        
      } catch (err) {
        console.error('❌ Error respondiendo pregunta:', err)
        error.value = 'Error enviando la respuesta: ' + err.message
      }
    }

    function completarJuego() {
      juegoCompletado.value = true
      console.log('🎉 Juego completado! Puntos totales:', puntosTotales.value)
    }

    // ============================================================================
    // 🧭 NAVEGACIÓN Y ACCIONES
    // ============================================================================

    function crearOtraHistoria() {
      // Limpiar estado completo
      historiasStore.clearHistoriaActual()
      mostrarPreguntas.value = false
      juegoCompletado.value = false
      preguntaActual.value = 0
      respuestasUsuario.value = []
      puntosTotales.value = 0
      
      formData.value = {
        tema: '',
        nombre_protagonista: '',
        edad_protagonista: formData.value.edad_protagonista, // Mantener edad
        elementos_especiales: ''
      }
      error.value = null
    }

    function verMisHistorias() {
      router.push('/mis-historias')
    }

    function clearError() {
      error.value = null
      historiasStore.clearError()
    }

    // ============================================================================
    // 🔧 MÉTODOS AUXILIARES
    // ============================================================================
    
    function getTemaLabel(temaId) {
      const tema = temas.value.find(t => t.id === temaId)
      return tema ? tema.nombre : temaId
    }

    function getParrafos(contenido) {
      if (!contenido) return []
      return contenido.split('\n').filter(p => p.trim())
    }

    function getTipoPreguntaLabel(tipo) {
      const labels = {
        'inferencial': '🤔 Inferencial',
        'juicio_critico': '⚖️ Juicio Crítico', 
        'creativa': '💡 Creativa'
      }
      return labels[tipo] || tipo
    }

    return {
      // Estados - Formulario
      formData,
      generando,
      error,
      
      // Estados - Preguntas
      mostrarPreguntas,
      preguntaActual,
      respuestasUsuario,
      puntosTotales,
      juegoCompletado,
      
      // Computed - Formulario
      profile,
      temas,
      historiaGenerada,
      edadesDisponibles,
      
      // Computed - Preguntas
      preguntas,
      preguntaEnCurso,
      totalPreguntas,
      progresoPorcentaje,
      
      // Métodos - Formulario
      seleccionarTema,
      crearHistoria,
      clearError,
      getTemaLabel,
      getParrafos,
      
      // Métodos - Preguntas
      irAPreguntas,
      responderPregunta,
      completarJuego,
      getTipoPreguntaLabel,
      
      // Métodos - Navegación
      crearOtraHistoria,
      verMisHistorias
    }
  }
}
</script>

<style scoped>
.crear-historia {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.historia-form {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.form-group {
  margin-bottom: 30px;
}

.form-group label {
  display: block;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.temas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 10px;
}

.tema-card {
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.tema-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}

.tema-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.tema-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.tema-card h3 {
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.tema-card p {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  text-align: center;
  margin-top: 30px;
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.loading-historia {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.loading-animation {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.loading-circle {
  width: 15px;
  height: 15px;
  background: #667eea;
  border-radius: 50%;
  margin: 0 5px;
  animation: bounce 0.6s infinite alternate;
}

.loading-circle:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-circle:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  to {
    transform: translateY(-20px);
  }
}

.loading-historia h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.loading-historia p {
  color: #666;
  font-size: 1rem;
}

.historia-resultado {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.historia-header {
  text-align: center;
  margin-bottom: 30px;
}

.historia-header h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 15px;
}

.historia-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.tema-badge,
.palabras-count {
  background: #667eea;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.historia-contenido {
  margin-bottom: 30px;
}

.historia-texto p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 15px;
  color: #333;
}

.historia-personajes {
  margin-bottom: 30px;
}

.historia-personajes h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #333;
}

.personajes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.personaje-tag {
  background: #f0f8ff;
  color: #667eea;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  border: 1px solid #667eea;
}

.historia-actions {
  text-align: center;
  margin-top: 30px;
}

/* Sistema de Preguntas */
.preguntas-container {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-top: 20px;
}

.preguntas-header {
  text-align: center;
  margin-bottom: 30px;
}

.preguntas-header h2 {
  color: #667eea;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.progreso-bar {
  position: relative;
  background: #e0e0e0;
  border-radius: 20px;
  height: 30px;
  overflow: hidden;
}

.progreso-fill {
  background: linear-gradient(45deg, #667eea, #764ba2);
  height: 100%;
  transition: width 0.5s ease;
}

.progreso-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.pregunta-card {
  max-width: 600px;
  margin: 0 auto;
}

.pregunta-tipo {
  text-align: center;
  margin-bottom: 20px;
}

.tipo-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
}

.tipo-badge.inferencial {
  background: #e3f2fd;
  color: #1976d2;
}

.tipo-badge.juicio_critico {
  background: #fff3e0;
  color: #f57c00;
}

.tipo-badge.creativa {
  background: #f3e5f5;
  color: #7b1fa2;
}

.pregunta-texto {
  font-size: 1.3rem;
  color: #333;
  text-align: center;
  margin-bottom: 30px;
  line-height: 1.4;
}

.opciones-grid {
  display: grid;
  gap: 15px;
  margin-bottom: 20px;
}

.opcion-btn {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.opcion-btn:hover:not(:disabled) {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}

.opcion-btn.correcta {
  border-color: #4caf50;
  background: #e8f5e8;
}

.opcion-btn.incorrecta {
  border-color: #f44336;
  background: #ffebee;
}

.opcion-btn:disabled {
  cursor: not-allowed;
}

.opcion-letra {
  background: #667eea;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;
}

.opcion-texto {
  flex: 1;
  font-size: 1rem;
}

.resultado-respuesta {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 15px;
  margin-top: 20px;
}

.resultado-icon {
  font-size: 2rem;
}

.resultado-texto h4 {
  margin-bottom: 10px;
  color: #333;
}

.explicacion {
  color: #666;
  margin-bottom: 10px;
  line-height: 1.4;
}

.puntos-ganados {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #744210;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  display: inline-block;
}

/* Juego Completado */
.juego-completado {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-top: 20px;
}

.celebracion {
  margin-bottom: 30px;
}

.celebracion-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 1s infinite alternate;
}

.celebracion h2 {
  color: #667eea;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.resultados-finales {
  margin-bottom: 30px;
}

.puntos-totales {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  display: inline-block;
}

.puntos-numero {
  font-size: 3rem;
  font-weight: bold;
  color: #744210;
  display: block;
}

.puntos-label {
  color: #744210;
  font-size: 1.2rem;
}

.estadisticas {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
}

.stat-numero {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.acciones-finales {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
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

.error-message {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .temas-grid {
    grid-template-columns: 1fr;
  }
  
  .historia-info {
    flex-direction: column;
    align-items: center;
  }
  
  .historia-actions {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .estadisticas {
    gap: 20px;
  }
  
  .acciones-finales {
    flex-direction: column;
  }
}
</style>