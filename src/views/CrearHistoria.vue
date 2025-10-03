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
            <!-- Input SOLO aparece cuando se selecciona la opción "Libre" -->
            <div v-if="temaSeleccionadoEsLibre" class="tema-libre-input">
              <input
                  type="text"
                  v-model="formData.tema_libre"
                  placeholder="✍️ Escribe tu propio tema"
                  class="tema-input"
              />
              <div v-if="mostrarErrorTemaLibre" class="error-message">
                Por favor escribe el tema libre que deseas usar
              </div>
            </div>

            <div v-else class="note-small">
              (Si deseas un tema personalizado selecciona "Libre")
            </div>

            <div v-if="!temaFinalPresent" class="error-message" v-show="mostrarErrorGenerico">
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
            <label>✨ Elementos especiales:</label>
            <div class="elementos-input">
              <input
                  type="text"
                  v-model="formData.elementos"
                  placeholder="Escribe y presiona Enter"
                  @keyup.enter.prevent="agregarElemento"
                  class="chips-input"
              />
              <small class="note-small">(Puedes escribir varios separados por coma)</small>
            </div>
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
import {ref, onMounted, computed, watch, nextTick} from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useHistoriasStore } from '../stores/historias'
import apiService from "@/services/api.js";

export default {
  name: 'CrearHistoria',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const historiasStore = useHistoriasStore()
    
    // Estado del componente - Formulario
    const formData = ref({
      tema: '',
      tema_libre: '',
      nombre_protagonista: '',
      edad_protagonista: '',
      elementos: ''
    })

    const generando = ref(false)
    const error = ref(null)



    // Computed properties - Formulario
    const profile = computed(() => authStore.profile)

    // ===============================
    // Estado Historia y Preguntas
    // ===============================
    const historiaGenerada = ref(null)
    const mostrarPreguntas = ref(false)
    const preguntaActual = ref(0)
    const respuestasUsuario = ref([])
    const puntosTotales = ref(0)
    const juegoCompletado = ref(false)

    const mostrarErrorGenerico = ref(false)
    const mostrarErrorTemaLibre = ref(false)

    // ===============================
    // Temas Predeterminados
    // ===============================
    const temas = ref([
      { id: "aventura", nombre: "Aventura", descripcion: "Explora mundos desconocidos", icono: "🗺️" },
      { id: "fantasia", nombre: "Fantasía", descripcion: "Magia y criaturas míticas", icono: "🪄" },
      { id: "ciencia", nombre: "Ciencia", descripcion: "Explora la ciencia y el futuro", icono: "🔬" },
      { id: "libre", nombre: "Libre", descripcion: "Escribe tu propio tema", icono: "✍️" }
    ])

    const edadesDisponibles = computed(() => Array.from({ length: 11 }, (_, i) => i + 5))

    // ===============================
    // Métodos del Formulario
    // ===============================

    const temaSeleccionadoEsLibre = computed(() => formData.value.tema === 'libre')

    const temaFinalPresent = computed(() => {
      if (temaSeleccionadoEsLibre.value) {
        return formData.value.tema_libre && formData.value.tema_libre.trim().length > 0
      }
      return formData.value.tema && formData.value.tema.trim().length > 0
    })


    // Seleccionar tema (recibe el objeto tema)
    function seleccionarTema(tema) {
      formData.value.tema = tema
      // reset tema_libre cuando cambia selección
      if (tema !== 'libre') {
        formData.value.tema_libre = ''
      }
      mostrarErrorGenerico.value = false
      mostrarErrorTemaLibre.value = false
    }

    // Normalizar preguntas que lleguen en distintos formatos
    function mapQuestions(rawQuestions) {
      if (!Array.isArray(rawQuestions)) return []
      return rawQuestions.map((q, idx) => {
        // varios formatos soportados
        if (q.texto && q.alternativas) {
          return {
            id: idx,
            pregunta: q.texto,
            opciones: q.alternativas,
            respuesta_correcta: q.respuesta_correcta ?? q.correct ?? 0,
            explicacion: q.explicacion ?? q.explanation ?? '',
            tipo: q.tipo ?? 'inferencial'
          }
        } else if (q.question && q.options) {
          return {
            id: idx,
            pregunta: q.question,
            opciones: q.options,
            respuesta_correcta: q.answer ?? q.correct ?? 0,
            explicacion: q.explanation ?? '',
            tipo: q.type ?? 'inferencial'
          }
        } else if (q.question && q.alternatives) {
          return {
            id: idx,
            pregunta: q.question,
            opciones: q.alternatives,
            respuesta_correcta: q.correct_index ?? 0,
            explicacion: q.explanation ?? '',
            tipo: 'inferencial'
          }
        } else {
          // fallback: intentar convertir propiedades intuitivas
          return {
            id: idx,
            pregunta: q.pregunta || q.question || q.text || 'Pregunta',
            opciones: q.opciones || q.options || q.alternativas || [],
            respuesta_correcta: q.respuesta_correcta ?? q.answer ?? 0,
            explicacion: q.explicacion || q.explanation || '',
            tipo: q.tipo || 'inferencial'
          }
        }
      })
    }

    async function crearHistoria() {
      mostrarErrorGenerico.value = false
      mostrarErrorTemaLibre.value = false
      error.value = null

      if (!formData.value.tema) {
        mostrarErrorGenerico.value = true
        error.value = 'Por favor selecciona un tema'
        return
      }
      if (temaSeleccionadoEsLibre.value && (!formData.value.tema_libre || !formData.value.tema_libre.trim())) {
        mostrarErrorTemaLibre.value = true
        error.value = 'Por favor escribe el tema libre'
        return
      }

      // usuario
      const usuarioActual = authStore.user || authStore.profile
      if (!usuarioActual?.id) {
        error.value = 'No se pudo identificar al usuario. Inicia sesión.'
        return
      }
      const alumnoId = usuarioActual.alumno_id || usuarioActual.id

      console.log('this is user actul', usuarioActual)

      generando.value = true

      // preparar payload con varios nombres por compatibilidad
      const temaFinal = temaSeleccionadoEsLibre.value ? formData.value.tema_libre.trim() : formData.value.tema

      const payload = {
        user_id: alumnoId,
        topic: temaFinal,
        elementos: formData.value.elementos,
        nombre: formData.value.nombre_protagonista,
        edad: formData.value.edad_protagonista,
        grado: usuarioActual.student_profile.current_grade
      }
      console.log('this is payload: ', payload)
      /*
      try {
        // Ajusta la ruta según tu apiService; aquí usamos '/stories/generate'
        const resp = await apiService.post('/stories/generate', payload)
        const data = resp.data

        // Normalizar la respuesta para que el template siga usando "titulo", "contenido", "personajes"
        const normalized = {
          id: data.id,
          titulo: data.title ?? data.titulo ?? data.name ?? 'Historia',
          contenido: data.content ?? data.contenido ?? '',
          tema: data.topic ?? data.tema ?? temaFinal,
          question_answer: data.question_answer ?? data.questions ?? data.questionAnswer ?? '[]',
          story_metadata: data.story_metadata ?? data.storyMetadata ?? '{}',
          personajes: Array.isArray(data.characters) ? data.characters
              : (typeof data.characters === 'string' ? tryParseJSON(data.characters) : (data.personajes ?? [])),
        }

        // parse preguntas y colocarlas en normalized.questions (array mapeado)
        let rawQuestions = []
        try {
          const maybe = normalized.question_answer
          rawQuestions = typeof maybe === 'string' ? tryParseJSON(maybe) : (Array.isArray(maybe) ? maybe : [])
        } catch (e) { rawQuestions = [] }

        normalized.questions = mapQuestions(rawQuestions)

        // guardar en estado
        historiaGenerada.value = {
          ...normalized,
          palabras: normalized.contenido ? normalized.contenido.split(/\s+/).length : 0
        }

      } catch (err) {
        console.error('Error generando historia:', err)
        error.value = err.response?.data?.detail || err.response?.data?.message || 'Error al generar la historia'
      } finally {
        generando.value = false
      }*/
    }

    function tryParseJSON(str) {
      try {
        return JSON.parse(str)
      } catch {
        return []
      }
    }

    // ===============================
    // Preguntas
    // ===============================
    const preguntas = computed(() => historiaGenerada.value?.questions ?? [])
    const preguntaEnCurso = computed(() => preguntas.value[preguntaActual.value])
    const totalPreguntas = computed(() => preguntas.value.length)
    const progresoPorcentaje = computed(() =>
        totalPreguntas.value > 0 ? (preguntaActual.value / totalPreguntas.value) * 100 : 0
    )

    function irAPreguntas() {
      if (preguntas.value.length === 0) {
        error.value = 'No hay preguntas disponibles'
        return
      }
      mostrarPreguntas.value = true
      preguntaActual.value = 0
      respuestasUsuario.value = []
      puntosTotales.value = 0
      juegoCompletado.value = false
    }

    function responderPregunta(opcionSeleccionada) {
      if (!preguntaEnCurso.value) return
      const esCorrecta = opcionSeleccionada === preguntaEnCurso.value.respuesta_correcta
      const puntosGanados = esCorrecta ? 20 : 0

      respuestasUsuario.value.push({
        pregunta_id: preguntaEnCurso.value.id,
        opcion_elegida: opcionSeleccionada,
        es_correcta: esCorrecta,
        puntos_ganados: puntosGanados,
        explicacion: preguntaEnCurso.value.explicacion || ''
      })

      if (esCorrecta) puntosTotales.value += puntosGanados

      setTimeout(() => {
        if (preguntaActual.value < totalPreguntas.value - 1) {
          preguntaActual.value++
        } else {
          completarJuego()
        }
      }, 1200)
    }

    async function completarJuego() {
      juegoCompletado.value = true
      // Guardar progreso -> tu endpoint POST /records?user_id=...
      try {
        const usuarioActual = authStore.user || authStore.profile
        const datosProgreso = {
          story_id: historiaGenerada.value.id,
          correct_answers: respuestasUsuario.value.filter(r => r.es_correcta).length,
          total_questions: totalPreguntas.value,
          points: puntosTotales.value
        }
        await apiService.post(`/records?user_id=${usuarioActual.id}`, datosProgreso)
      } catch (err) {
        console.error('Error guardando progreso', err)
      }
    }

    // utilidad UI
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

    function crearOtraHistoria() {
      historiaGenerada.value = null
      mostrarPreguntas.value = false
      juegoCompletado.value = false
      preguntaActual.value = 0
      respuestasUsuario.value = []
      puntosTotales.value = 0
      formData.value = { tema: '', tema_libre: '', nombre_protagonista: '', edad_protagonista: '', elementos: ''}
      error.value = null
    }

    function verMisHistorias() {
      router.push('/mis-historias')
    }

    function clearError() {
      error.value = null
    }

    // Si el usuario no está autenticado, redirigir
    onMounted(() => {
      if (!authStore.isAuthenticated || !authStore.isAlumno) {
        router.push('/login')
      }
    })

    // ============================================================================
    // 🔧 MÉTODOS AUXILIARES
    // ============================================================================
    
    function getTemaLabel(temaId) {
      const tema = temas.value.find(t => t.id === temaId)
      return tema ? tema.nombre : temaId
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
      verMisHistorias,

      mostrarErrorGenerico,
      temaFinalPresent,
      mostrarErrorTemaLibre,
      temaSeleccionadoEsLibre
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