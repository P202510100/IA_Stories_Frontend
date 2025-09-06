
<template>
  <div class="ver-historia">
    <div class="container">
      
      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando tu historia...</p>
      </div>

      <!-- Main content -->
      <div v-else-if="historia && !error" class="historia-content">
        
        <!-- Header de la historia -->
        <div class="historia-header">
          <button @click="volverAtras" class="btn-back">
            ← Volver
          </button>
          <div class="historia-info">
            <h1>📖 {{ historia.titulo }}</h1>
            <div class="historia-meta">
              <span class="tema-badge">{{ getTemaLabel(historia.tema) }}</span>
              <span class="palabras-count">{{ historia.palabras || 0 }} palabras</span>
              <span class="fecha">{{ formatDate(historia.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Contenido de la historia -->
        <div class="historia-texto">
          <div class="texto-container">
            <p v-for="(parrafo, index) in getParrafos(historia.contenido)" :key="index" class="parrafo">
              {{ parrafo }}
            </p>
          </div>
        </div>

        <!-- Personajes si existen -->
        <div v-if="personajes.length > 0" class="personajes-section">
          <h3>👥 Personajes de la Historia:</h3>
          <div class="personajes-grid">
            <div v-for="personaje in personajes" :key="personaje" class="personaje-card">
              <div class="personaje-avatar">🎭</div>
              <span class="personaje-nombre">{{ personaje }}</span>
            </div>
          </div>
        </div>

        <!-- Sección de preguntas -->
        <div v-if="preguntas.length > 0" class="preguntas-section">
          <div class="preguntas-header">
            <h2>🎯 Preguntas sobre la Historia</h2>
            <div class="progreso-preguntas">
              {{ preguntasRespondidas }}/{{ preguntas.length }} completadas
            </div>
          </div>

          <div class="preguntas-container">
            <div
              v-for="(pregunta, index) in preguntas"
              :key="pregunta.id"
              class="pregunta-card"
              :class="{ 
                respondida: pregunta.respondida,
                correcta: pregunta.respondida && pregunta.correcta,
                incorrecta: pregunta.respondida && !pregunta.correcta
              }"
            >
              <div class="pregunta-header">
                <span class="pregunta-tipo">{{ getTipoPreguntaLabel(pregunta.tipo) }}</span>
                <span class="pregunta-numero">{{ index + 1 }}/{{ preguntas.length }}</span>
              </div>
              
              <h3 class="pregunta-texto">{{ pregunta.pregunta }}</h3>
              
              <!-- Opciones múltiples -->
              <div v-if="pregunta.tipo_respuesta === 'opcion_multiple'" class="opciones-container">
                <div
                  v-for="(opcion, opcionIndex) in pregunta.opciones"
                  :key="opcionIndex"
                  @click="responderPregunta(pregunta, opcionIndex)"
                  :class="[
                    'opcion',
                    { 
                      selected: pregunta.respuesta_alumno === opcionIndex,
                      disabled: pregunta.respondida
                    }
                  ]"
                >
                  <span class="opcion-letra">{{ String.fromCharCode(65 + opcionIndex) }})</span>
                  <span class="opcion-texto">{{ opcion }}</span>
                </div>
              </div>
              
              <!-- Respuesta de texto -->
              <div v-else-if="pregunta.tipo_respuesta === 'texto'" class="respuesta-texto-container">
                <textarea
                  v-model="pregunta.respuesta_texto"
                  @blur="responderPreguntaTexto(pregunta)"
                  :disabled="pregunta.respondida"
                  placeholder="Escribe tu respuesta aquí..."
                  class="respuesta-textarea"
                  rows="4"
                ></textarea>
                <button
                  v-if="!pregunta.respondida && pregunta.respuesta_texto"
                  @click="responderPreguntaTexto(pregunta)"
                  class="btn-enviar-respuesta"
                >
                  Enviar Respuesta
                </button>
              </div>

              <!-- Resultado de la pregunta -->
              <div v-if="pregunta.respondida" class="resultado-pregunta">
                <div v-if="pregunta.correcta" class="resultado correcto">
                  ✅ ¡Correcto! +{{ pregunta.puntos_obtenidos }} puntos
                </div>
                <div v-else class="resultado incorrecto">
                  ❌ Respuesta incorrecta
                  <button 
                    v-if="pregunta.puede_repetir"
                    @click="repetirPregunta(pregunta)"
                    class="btn-repetir"
                  >
                    🔄 Intentar de nuevo
                  </button>
                </div>
                <div v-if="pregunta.explicacion" class="explicacion">
                  💡 {{ pregunta.explicacion }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje de finalización -->
        <div v-if="todasPreguntasRespondidas" class="finalizacion-section">
          <div class="felicitacion-card">
            <div class="felicitacion-icon">🎉</div>
            <h3>¡Felicitaciones!</h3>
            <p>Has completado todas las preguntas de esta historia.</p>
            <div class="puntos-totales">
              ⭐ Puntos obtenidos: {{ puntosObtenidos }}
            </div>
            <div class="felicitacion-actions">
              <button @click="verOtraHistoria" class="btn btn-primary">
                📚 Ver Otra Historia
              </button>
              <button @click="crearNuevaHistoria" class="btn btn-secondary">
                ✨ Crear Nueva Historia
              </button>
            </div>
          </div>
        </div>

        <!-- Loading de preguntas -->
        <div v-else-if="loadingPreguntas" class="loading-preguntas">
          <div class="loading-spinner small"></div>
          <p>Cargando preguntas...</p>
        </div>

      </div>

      <!-- Error state -->
      <div v-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>¡Oops! Algo salió mal</h3>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button @click="recargarHistoria" class="btn btn-primary">
            🔄 Intentar de nuevo
          </button>
          <button @click="volverAtras" class="btn btn-secondary">
            ← Volver atrás
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useHistoriasStore } from '../stores/historias'

export default {
  name: 'VerHistoria',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const historiasStore = useHistoriasStore()
    
    // Estado del componente
    const historia = ref(null)
    const preguntas = ref([])
    const loading = ref(true)
    const loadingPreguntas = ref(false)
    const error = ref(null)

    // Computed properties
    const profile = computed(() => authStore.profile)
    
    const personajes = computed(() => {
      if (!historia.value?.personajes) return []
      try {
        if (typeof historia.value.personajes === 'string') {
          return JSON.parse(historia.value.personajes)
        }
        return Array.isArray(historia.value.personajes) ? historia.value.personajes : []
      } catch {
        return []
      }
    })

    const preguntasRespondidas = computed(() => 
      preguntas.value.filter(p => p.respondida).length
    )

    const todasPreguntasRespondidas = computed(() => 
      preguntas.value.length > 0 && preguntas.value.every(p => p.respondida)
    )

    const puntosObtenidos = computed(() => 
      preguntas.value.reduce((total, p) => total + (p.puntos_obtenidos || 0), 0)
    )

    // ============================================================================
    // 🚀 LIFECYCLE
    // ============================================================================
    
    onMounted(async () => {
      console.log('📖 Iniciando VerHistoria...')
      
      // Verificar autenticación
      if (!authStore.isAuthenticated) {
        console.error('❌ Usuario no autenticado')
        router.push('/login')
        return
      }

      await cargarHistoriaCompleta()
    })

    // ============================================================================
    // 📚 CARGA DE DATOS - SOLO BACKEND REAL
    // ============================================================================
    
    async function cargarHistoriaCompleta() {
      loading.value = true
      error.value = null

      try {
        const historiaId = route.params.id
        if (!historiaId) {
          throw new Error('ID de historia no encontrado')
        }

        console.log(`📖 Cargando historia ${historiaId}...`)

        // Cargar la historia
        historia.value = await historiasStore.obtenerHistoria(historiaId)
        
        // Cargar las preguntas
        await cargarPreguntas(historiaId)

        console.log('✅ Historia y preguntas cargadas')

      } catch (err) {
        console.error('❌ Error cargando historia:', err)
        error.value = err.message || 'Error cargando la historia'
      } finally {
        loading.value = false
      }
    }

    async function cargarPreguntas(historiaId) {
      loadingPreguntas.value = true

      try {
        console.log(`❓ Cargando preguntas para historia ${historiaId}...`)
        
        const preguntasData = await historiasStore.cargarPreguntasHistoria(historiaId)
        preguntas.value = preguntasData.map(p => ({
          ...p,
          respondida: false,
          respuesta_alumno: null,
          respuesta_texto: '',
          correcta: null,
          puntos_obtenidos: 0,
          puede_repetir: false
        }))

        console.log(`✅ ${preguntas.value.length} preguntas cargadas`)

      } catch (err) {
        console.error('❌ Error cargando preguntas:', err)
        // No lanzar error, continuar sin preguntas
      } finally {
        loadingPreguntas.value = false
      }
    }

    async function recargarHistoria() {
      await cargarHistoriaCompleta()
    }

    // ============================================================================
    // 🎯 GESTIÓN DE PREGUNTAS - SOLO BACKEND REAL
    // ============================================================================
    
    async function responderPregunta(pregunta, respuestaIndex) {
      if (pregunta.respondida) return

      try {
        console.log(`✍️ Respondiendo pregunta ${pregunta.id} con opción ${respuestaIndex}`)

        const datosRespuesta = {
          pregunta_id: pregunta.id,
          historia_id: historia.value.id,
          alumno_id: (profile.value?.id || authStore.user?.id || JSON.parse(localStorage.getItem('user') || '{}').id),
          respuesta_seleccionada: respuestaIndex,
          tipo_pregunta: pregunta.tipo
        }

        const resultado = await historiasStore.responderPregunta(datosRespuesta)

        // Actualizar pregunta local
        pregunta.respondida = true
        pregunta.respuesta_alumno = respuestaIndex
        pregunta.correcta = resultado.correcta
        pregunta.puntos_obtenidos = resultado.puntos_obtenidos || 0
        pregunta.puede_repetir = !resultado.correcta && resultado.puede_repetir
        pregunta.explicacion = resultado.explicacion

        console.log(`✅ Pregunta respondida: ${resultado.correcta ? 'CORRECTA' : 'INCORRECTA'}`)

      } catch (err) {
        console.error('❌ Error respondiendo pregunta:', err)
        error.value = 'Error enviando la respuesta'
      }
    }

    async function responderPreguntaTexto(pregunta) {
      if (pregunta.respondida || !pregunta.respuesta_texto.trim()) return

      try {
        console.log(`✍️ Respondiendo pregunta de texto ${pregunta.id}`)

        const datosRespuesta = {
          pregunta_id: pregunta.id,
          historia_id: historia.value.id,
          alumno_id: (profile.value?.id || authStore.user?.id || JSON.parse(localStorage.getItem('user') || '{}').id),
          respuesta_texto: pregunta.respuesta_texto.trim(),
          tipo_pregunta: pregunta.tipo
        }

        const resultado = await historiasStore.responderPregunta(datosRespuesta)

        // Actualizar pregunta local
        pregunta.respondida = true
        pregunta.correcta = resultado.correcta
        pregunta.puntos_obtenidos = resultado.puntos_obtenidos || 0
        pregunta.puede_repetir = false // Las preguntas de texto generalmente no se repiten

        console.log('✅ Pregunta de texto respondida')

      } catch (err) {
        console.error('❌ Error respondiendo pregunta de texto:', err)
        error.value = 'Error enviando la respuesta'
      }
    }

    async function repetirPregunta(pregunta) {
      try {
        console.log(`🔄 Repitiendo pregunta ${pregunta.id}`)

        await historiasStore.repetirPregunta({
          pregunta_id: pregunta.id,
          alumno_id: (profile.value?.id || authStore.user?.id || JSON.parse(localStorage.getItem('user') || '{}').id)
        })

        // Resetear pregunta para nuevo intento
        pregunta.respondida = false
        pregunta.respuesta_alumno = null
        pregunta.correcta = null
        pregunta.puntos_obtenidos = 0
        pregunta.puede_repetir = false

        console.log('✅ Pregunta disponible para repetir')

      } catch (err) {
        console.error('❌ Error repitiendo pregunta:', err)
        error.value = 'Error preparando la pregunta para repetir'
      }
    }

    // ============================================================================
    // 🧭 NAVEGACIÓN
    // ============================================================================
    
    function volverAtras() {
      router.go(-1)
    }

    function verOtraHistoria() {
      router.push('/mis-historias')
    }

    function crearNuevaHistoria() {
      router.push('/crear-historia')
    }

    // ============================================================================
    // 🔧 MÉTODOS AUXILIARES
    // ============================================================================
    
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

    function getTipoPreguntaLabel(tipo) {
      const labels = {
        'inferencial': '🤔 Inferencial',
        'juicio_critico': '⚖️ Juicio Crítico',
        'creativa': '💡 Creativa'
      }
      return labels[tipo] || tipo
    }

    function getParrafos(contenido) {
      if (!contenido) return []
      return contenido.split('\n').filter(p => p.trim())
    }

    function formatDate(dateString) {
      if (!dateString) return ''
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'long',
          year: 'numeric'
        })
      } catch (e) {
        return ''
      }
    }

    return {
      // Estado
      historia,
      preguntas,
      loading,
      loadingPreguntas,
      error,
      
      // Computed
      profile,
      personajes,
      preguntasRespondidas,
      todasPreguntasRespondidas,
      puntosObtenidos,
      
      // Métodos
      recargarHistoria,
      responderPregunta,
      responderPreguntaTexto,
      repetirPregunta,
      volverAtras,
      verOtraHistoria,
      crearNuevaHistoria,
      getTemaLabel,
      getTipoPreguntaLabel,
      getParrafos,
      formatDate
    }
  }
}
</script>

<style scoped>
.ver-historia {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.loading-container,
.error-container {
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

.loading-spinner.small {
  width: 30px;
  height: 30px;
  border-width: 3px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.historia-content {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.historia-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  position: relative;
}

.btn-back {
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: rgba(255,255,255,0.3);
}

.historia-info h1 {
  font-size: 2rem;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.historia-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.tema-badge,
.palabras-count,
.fecha {
  background: rgba(255,255,255,0.2);
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
}

.historia-texto {
  padding: 40px;
}

.texto-container {
  max-width: 100%;
  line-height: 1.8;
}

.parrafo {
  font-size: 1.1rem;
  margin-bottom: 20px;
  color: #333;
  text-align: justify;
}

.personajes-section {
  padding: 30px 40px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.personajes-section h3 {
  color: #333;
  margin-bottom: 20px;
}

.personajes-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.personaje-card {
  display: flex;
  align-items: center;
  background: white;
  padding: 10px 15px;
  border-radius: 15px;
  border: 1px solid #e0e0e0;
}

.personaje-avatar {
  font-size: 1.2rem;
  margin-right: 10px;
}

.personaje-nombre {
  font-weight: bold;
  color: #667eea;
}

.preguntas-section {
  padding: 40px;
  border-top: 1px solid #e9ecef;
}

.preguntas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 10px;
}

.preguntas-header h2 {
  color: #333;
  font-size: 1.5rem;
}

.progreso-preguntas {
  background: #667eea;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.preguntas-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.pregunta-card {
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  padding: 25px;
  transition: all 0.3s ease;
}

.pregunta-card.respondida {
  background: #f8f9fa;
}

.pregunta-card.correcta {
  border-color: #28a745;
  background: #f0fff4;
}

.pregunta-card.incorrecta {
  border-color: #dc3545;
  background: #fff5f5;
}

.pregunta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.pregunta-tipo {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
}

.pregunta-numero {
  color: #666;
  font-size: 0.9rem;
}

.pregunta-texto {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.5;
}

.opciones-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.opcion {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.opcion:hover:not(.disabled) {
  border-color: #667eea;
  background: #f8f9fa;
}

.opcion.selected {
  border-color: #667eea;
  background: #e7f3ff;
}

.opcion.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.opcion-letra {
  font-weight: bold;
  margin-right: 12px;
  color: #667eea;
  min-width: 25px;
}

.opcion-texto {
  flex: 1;
  color: #333;
}

.respuesta-texto-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.respuesta-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.respuesta-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.respuesta-textarea:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.btn-enviar-respuesta {
  align-self: flex-start;
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-enviar-respuesta:hover {
  background: #5a6fd8;
}

.resultado-pregunta {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.resultado {
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-weight: bold;
}

.resultado.correcto {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.resultado.incorrecto {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-repetir {
  background: #667eea;
  color: white;
  border: none;
  padding: 5px 15px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.9rem;
}

.explicacion {
  background: #e7f3ff;
  color: #0c5460;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #b8e7ff;
  font-style: italic;
}

.finalizacion-section {
  padding: 40px;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

.felicitacion-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 40px;
  border-radius: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.felicitacion-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.felicitacion-card h3 {
  font-size: 1.8rem;
  margin-bottom: 15px;
}

.felicitacion-card p {
  font-size: 1.1rem;
  margin-bottom: 20px;
  opacity: 0.9;
}

.puntos-totales {
  background: rgba(255,255,255,0.2);
  padding: 15px;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 30px;
}

.felicitacion-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 25px;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: white;
  color: #4facfe;
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.loading-preguntas {
  text-align: center;
  padding: 40px;
  color: #666;
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

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .historia-header,
  .historia-texto,
  .personajes-section,
  .preguntas-section {
    padding: 20px;
  }
  
  .historia-info h1 {
    font-size: 1.5rem;
  }
  
  .historia-meta {
    justify-content: center;
  }
  
  .preguntas-header {
    flex-direction: column;
    text-align: center;
  }
  
  .felicitacion-actions {
    flex-direction: column;
  }
}
</style>