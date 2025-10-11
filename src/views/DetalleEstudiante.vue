
<template>
  <div class="detalle-estudiante-container">
    <div class="container">
      
      <!-- Loading principal -->
      <div v-if="loading && !estudiante" class="loading-principal">
        <div class="loading-spinner"></div>
        <p>🔍 Cargando información del estudiante...</p>
      </div>

      <!-- Header con información del estudiante -->
      <div v-else-if="estudiante" class="estudiante-header">
        <button @click="volverDashboard" class="btn-back">
          ← Volver al Dashboard
        </button>
        
        <div class="estudiante-principal">
          <div class="estudiante-avatar-grande">
            {{ getInitials(estudiante.nombre) }}
          </div>
          
          <div class="estudiante-datos">
            <h1>{{ estudiante.nombre }}</h1>
            <p class="estudiante-email">{{ estudiante.email }}</p>
            <div class="estudiante-meta">
              <div class="meta-item">
                <span class="meta-label">👨‍🎓 Edad:</span>
                <span class="meta-value">{{ estudiante.edad || 'No especificada' }} años</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">📅 Registro:</span>
                <span class="meta-value">{{ formatDate(estudiante.created_at) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">🎯 Nivel:</span>
                <span class="nivel-badge" :class="getNivelClase(nivelActual)">
                  {{ nivelActual.nombre }}
                </span>
              </div>
            </div>
            <div class="ultima-actividad">
              <span class="actividad-icon">⏰</span>
              <span>Última actividad: {{ formatDate(estudiante.ultima_actividad) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Estadísticas principales -->
      <div v-if="estadisticas" class="estadisticas-section">
        <h2>📊 Resumen de Rendimiento</h2>
        <div class="stats-principales">
          <div class="stat-card primary">
            <div class="stat-icon">📚</div>
            <div class="stat-content">
              <div class="stat-number">{{ estadisticas.total_historias || 0 }}</div>
              <div class="stat-label">Historias Creadas</div>
              <div class="stat-detail">{{ estadisticas.historias_completadas || 0 }} completadas</div>
            </div>
          </div>
          
          <div class="stat-card success">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-number">{{ estadisticas.puntos_totales || 0 }}</div>
              <div class="stat-label">Puntos Acumulados</div>
              <div class="stat-detail">{{ Math.round(estadisticas.promedio_puntos || 0) }} promedio</div>
            </div>
          </div>
          
          <div class="stat-card info">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-number">{{ Math.round(estadisticas.precision_promedio || 0) }}%</div>
              <div class="stat-label">Precisión</div>
              <div class="stat-detail">{{ estadisticas.total_preguntas || 0 }} preguntas respondidas</div>
            </div>
          </div>
          
          <div class="stat-card warning">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-number">{{ formatTiempoPromedio(estadisticas.tiempo_promedio || 0) }}</div>
              <div class="stat-label">Tiempo Promedio</div>
              <div class="stat-detail">Por pregunta</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progreso por temas -->
      <div v-if="progresoTemas.length > 0" class="progreso-temas-section">
        <h2>🎨 Progreso por Temas</h2>
        <div class="temas-grid">
          <div
            v-for="tema in progresoTemas"
            :key="tema.nombre"
            class="tema-progress-card"
          >
            <div class="tema-header">
              <div class="tema-emoji">{{ getEmojiTema(tema.nombre) }}</div>
              <div class="tema-info">
                <h3>{{ formatTema(tema.nombre) }}</h3>
                <p class="tema-estadisticas">
                  {{ tema.total_historias }} {{ tema.total_historias === 1 ? 'historia' : 'historias' }}
                </p>
              </div>
            </div>
            
            <div class="tema-metricas">
              <div class="metrica">
                <span class="metrica-label">Puntos:</span>
                <span class="metrica-value">{{ tema.puntos_totales || 0 }}</span>
              </div>
              <div class="metrica">
                <span class="metrica-label">Precisión:</span>
                <span class="metrica-value">{{ Math.round(tema.precision_promedio || 0) }}%</span>
              </div>
            </div>
            
            <!-- Barra de progreso -->
            <div class="tema-progreso">
              <div class="progreso-bar">
                <div 
                  class="progreso-fill"
                  :style="{ width: tema.porcentaje_completado + '%' }"
                  :class="getProgresoClass(tema.porcentaje_completado)"
                ></div>
              </div>
              <span class="progreso-texto">{{ tema.porcentaje_completado }}% completado</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Análisis de fortalezas y debilidades -->
      <div v-if="analisisRendimiento" class="analisis-section">
        <h2>🎭 Análisis de Rendimiento</h2>
        <div class="analisis-grid">
          <div class="analisis-card fortalezas">
            <h3>💪 Fortalezas</h3>
            <ul class="fortalezas-lista">
              <li v-for="fortaleza in analisisRendimiento.fortalezas" :key="fortaleza">
                <span class="fortaleza-icon">✨</span>
                {{ fortaleza }}
              </li>
            </ul>
          </div>
          
          <div class="analisis-card oportunidades">
            <h3>🎯 Áreas de Mejora</h3>
            <ul class="oportunidades-lista">
              <li v-for="oportunidad in analisisRendimiento.oportunidades" :key="oportunidad">
                <span class="oportunidad-icon">📈</span>
                {{ oportunidad }}
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Recomendaciones específicas -->
        <div v-if="analisisRendimiento.recomendaciones" class="recomendaciones">
          <h3>💡 Recomendaciones Educativas</h3>
          <div class="recomendaciones-lista">
            <div
              v-for="(recomendacion, index) in analisisRendimiento.recomendaciones"
              :key="index"
              class="recomendacion-item"
            >
              <div class="recomendacion-icon">{{ getIconoRecomendacion(recomendacion.tipo) }}</div>
              <div class="recomendacion-content">
                <h4>{{ recomendacion.titulo }}</h4>
                <p>{{ recomendacion.descripcion }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial de historias -->
      <div class="historial-section">
        <div class="historial-header">
          <h2>📖 Historial de Historias</h2>
          <div class="historial-controles">
            <select v-model="filtroTema" class="filtro-select">
              <option value="">🎯 Todos los temas</option>
              <option v-for="tema in temasDisponibles" :key="tema" :value="tema">
                {{ getEmojiTema(tema) }} {{ formatTema(tema) }}
              </option>
            </select>
            
            <select v-model="ordenHistorias" class="filtro-select">
              <option value="reciente">📅 Más recientes</option>
              <option value="antiguo">📅 Más antiguos</option>
              <option value="puntos">⭐ Por puntos</option>
              <option value="titulo">🔤 Por título</option>
            </select>
          </div>
        </div>
        
        <div v-if="historiasFiltradas.length > 0" class="historias-lista">
          <div
            v-for="historia in historiasFiltradas"
            :key="historia.id"
            class="historia-item"
            @click="verDetalleHistoria(historia.id)"
          >
            <div class="historia-icon">
              {{ getEmojiTema(historia.tema) }}
            </div>
            
            <div class="historia-content">
              <h3 class="historia-titulo">{{ historia.titulo }}</h3>
              <p class="historia-meta">
                <span class="meta-tema">{{ formatTema(historia.tema) }}</span>
                <span class="meta-fecha">{{ formatDate(historia.created_at) }}</span>
              </p>
              
              <!-- Estadísticas de la historia -->
              <div class="historia-stats">
                <div class="stat-mini">
                  <span class="stat-icon">⭐</span>
                  <span class="stat-text">{{ historia.puntos_obtenidos || 0 }} puntos</span>
                </div>
                <div class="stat-mini">
                  <span class="stat-icon">🎯</span>
                  <span class="stat-text">
                    {{ historia.preguntas_correctas || 0 }}/{{ historia.total_preguntas || 6 }} correctas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="!loadingHistorias" class="empty-historial">
          <div class="empty-icon">📚</div>
          <h3>No hay historias para mostrar</h3>
          <p v-if="filtroTema">
            No se encontraron historias del tema "{{ formatTema(filtroTema) }}"
          </p>
          <p v-else>
            El estudiante aún no ha creado historias
          </p>
        </div>
        
        <div v-if="loadingHistorias" class="loading-historias">
          <div class="loading-spinner-small"></div>
          <span>Cargando historias...</span>
        </div>
      </div>

      <!-- Acciones del docente -->
      <div class="acciones-docente">
        <h2>👨‍🏫 Acciones del Docente</h2>
        <div class="acciones-grid">
          <button 
            @click="exportarReportePDF" 
            class="accion-btn primary"
            :disabled="generandoReporte"
          >
            <span class="btn-icon">📄</span>
            <span v-if="generandoReporte">Generando reporte...</span>
            <span v-else>Exportar Reporte PDF</span>
          </button>
          
          <button @click="enviarMensajeMotivacion" class="accion-btn secondary">
            <span class="btn-icon">💌</span>
            <span>Enviar Mensaje de Motivación</span>
          </button>
          
          <button @click="compararConClase" class="accion-btn info">
            <span class="btn-icon">📊</span>
            <span>Comparar con la Clase</span>
          </button>
          
          <button @click="asignarTareaPersonalizada" class="accion-btn warning">
            <span class="btn-icon">📝</span>
            <span>Asignar Tarea Específica</span>
          </button>
        </div>
      </div>

      <!-- Error state -->
      <div v-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Error al cargar la información</h3>
        <p>{{ error }}</p>
        <button @click="recargarDatos" class="btn btn-secondary">
          🔄 Intentar de nuevo
        </button>
      </div>
      
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../components/ToastNotification.vue'
import apiService from '../services/api'
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default {
  name: 'DetalleEstudiante',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    
    // ============================================================================
    // 📊 ESTADOS REACTIVOS
    // ============================================================================
    
    const estadisticas = ref(null)
    const progresoTemas = ref([])
    const historias = ref([])
    const analisisRendimiento = ref(null)
    const loading = ref(true)
    const loadingHistorias = ref(false)
    const error = ref(null)
    const generandoReporte = ref(false)



    // Filtros y ordenamiento
    const filtroTema = ref('')
    const ordenHistorias = ref('reciente')
    
    // ============================================================================
    // 🔄 COMPUTED PROPERTIES
    // ============================================================================
    
    const profile = computed(() => authStore.profile)
    const estudiante = computed(() => parseInt(route.params.id))
    const studentProfile = ref({})
    
    const nivelActual = computed(() => {
      if (!estadisticas.value?.puntos_totales) {
        return { nombre: 'Explorador', icono: '🌱', color: '#4caf50' }
      }
      return calcularNivel(estadisticas.value.puntos_totales)
    })
    
    const temasDisponibles = computed(() => {
      const temas = new Set(historias.value.map(h => h.tema))
      return Array.from(temas).sort()
    })
    
    const historiasFiltradas = computed(() => {
      let resultado = [...historias.value]
      
      // Filtrar por tema
      if (filtroTema.value) {
        resultado = resultado.filter(h => h.tema === filtroTema.value)
      }
      
      // Ordenar
      switch (ordenHistorias.value) {
        case 'reciente':
          resultado.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          break
        case 'antiguo':
          resultado.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          break
        case 'puntos':
          resultado.sort((a, b) => (b.puntos_obtenidos || 0) - (a.puntos_obtenidos || 0))
          break
        case 'titulo':
          resultado.sort((a, b) => a.titulo.localeCompare(b.titulo))
          break
      }
      
      return resultado
    })
    
    // ============================================================================
    // 🔄 MÉTODOS PRINCIPALES
    // ============================================================================
    
    const cargarDatosEstudiante = async () => {
      try {
        loading.value = true
        error.value = null
        
        if (!profile.value?.id) {
          throw new Error('No se encontró el perfil del docente')
        }


        const res = await apiService.getStudentByStudentId(estudiante.value)

        console.log("this is responsefrom studentbystudent: ", res)

        studentProfile.value = res

        // Cargar información detallada del estudiante desde el backend
        const response = await apiService.cargarHistoriasPorAlumno(estudiante.value)

        const { historias: h, estadisticas: e, progresoTemas: pt } = procesarRecords(response || [])
        historias.value = h
        estadisticas.value = e
        progresoTemas.value = pt

        // Si backend aún manda análisis adicional, lo usamos
        analisisRendimiento.value = response.analisis || null
        
        console.log('✅ Datos del estudiante cargados correctamente')
        
      } catch (err) {
        console.error('❌ Error cargando datos del estudiante:', err)
        error.value = err.response?.data?.error || 'Error al cargar la información del estudiante'
      } finally {
        loading.value = false
      }
    }

    function procesarRecords(records) {
      if (!Array.isArray(records)) return { historias: [], estadisticas: {}, progresoTemas: [] }

      // 1️⃣ Mapear a historias simplificadas
      const historias = records.map(r => ({
        id: r.id,
        historia_id: r.story?.id,
        titulo: r.story?.title || "Sin título",
        tema: r.story?.topic || "desconocido",
        created_at: r.story?.created_at || r.created_at,
        puntos_obtenidos: r.points || 0,
        preguntas_correctas: r.correct_answers || 0,
        total_preguntas: r.total_questions || (r.story?.question_answer?.length || 0),
        status: r.status
      }))

      // 2️⃣ Calcular estadísticas globales
      const totalHistorias = historias.length
      const historiasCompletadas = historias.filter(h => h.status === "COMPLETED").length
      const puntosTotales = historias.reduce((acc, h) => acc + (h.puntos_obtenidos || 0), 0)
      const promedioPuntos = totalHistorias > 0 ? puntosTotales / totalHistorias : 0
      const totalPreguntas = historias.reduce((acc, h) => acc + (h.total_preguntas || 0), 0)
      const correctasTotales = historias.reduce((acc, h) => acc + (h.preguntas_correctas || 0), 0)
      const precisionPromedio = totalPreguntas > 0 ? (correctasTotales / totalPreguntas) * 100 : 0

      const estadisticas = {
        total_historias: totalHistorias,
        historias_completadas: historiasCompletadas,
        puntos_totales: puntosTotales,
        promedio_puntos: promedioPuntos,
        precision_promedio: precisionPromedio,
        total_preguntas: totalPreguntas
      }

      // 3️⃣ Agrupar por temas
      const progresoPorTema = Object.values(
          historias.reduce((acc, h) => {
            if (!acc[h.tema]) {
              acc[h.tema] = {
                nombre: h.tema,
                total_historias: 0,
                puntos_totales: 0,
                precision_promedio: 0,
                preguntas_correctas: 0,
                total_preguntas: 0
              }
            }
            acc[h.tema].total_historias++
            acc[h.tema].puntos_totales += h.puntos_obtenidos || 0
            acc[h.tema].preguntas_correctas += h.preguntas_correctas || 0
            acc[h.tema].total_preguntas += h.total_preguntas || 0
            return acc
          }, {})
      ).map(tema => ({
        ...tema,
        precision_promedio: tema.total_preguntas > 0
            ? (tema.preguntas_correctas / tema.total_preguntas) * 100
            : 0,
        porcentaje_completado: tema.total_preguntas > 0
            ? Math.round((tema.preguntas_correctas / tema.total_preguntas) * 100)
            : 0
      }))

      return { historias, estadisticas, progresoTemas: progresoPorTema }
    }

    const recargarDatos = () => {
      cargarDatosEstudiante()
    }
    
    const volverDashboard = () => {
      router.push('/dashboard-docente')
    }
    
    const verDetalleHistoria = (historiaId) => {
      console.log("click verdetalle historia")
      router.push(`/historia/${historiaId}?modo=revision`)
    }
    
    // ============================================================================
    // 🎯 ACCIONES DEL DOCENTE
    // ============================================================================
    
    const exportarReportePDF = async () => {
      try {
        generandoReporte.value = true
        console.log("📄 Generando reporte PDF...")
        console.log("this is response", studentProfile.value.user.fullname)

        const doc = new jsPDF()

        // Logo (ejemplo: un PNG en /assets/logo.png)
        //const logo = new Image()
        //logo.src = "/src/assets/iastories.png" // asegúrate que esté en tu carpeta public/assets
        //doc.addImage(logo, "PNG", 10, 10, 30, 30)

        // Título
        doc.setFontSize(18)
        doc.text("Reporte de Rendimiento", 105, 20, { align: "center" })

        doc.setFontSize(12)
        doc.text(`Estudiante: ${studentProfile.value?.user.fullname}`, 14, 50)
        doc.text(`Email: ${studentProfile.value?.user.email}`, 14, 58)
        doc.text(`Edad: ${studentProfile.value?.edad || "No especificada"}`, 14, 66)
        doc.text(`Nivel Actual: ${studentProfile.value.current_level}`, 14, 74)
        doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES")}`, 14, 82)

        // 📊 Resumen de estadísticas
        doc.setFontSize(14)
        doc.text("Resumen de Rendimiento", 14, 100)

        autoTable(doc, {
          startY: 105,
          head: [["Historias", "Completadas", "Puntos", "Promedio", "Precisión"]],
          body: [[
            estadisticas.value.total_historias || 0,
            estadisticas.value.historias_completadas || 0,
            estadisticas.value.puntos_totales || 0,
            Math.round(estadisticas.value.promedio_puntos || 0),
            `${Math.round(estadisticas.value.precision_promedio || 0)}%`
          ]],
          theme: "grid"
        })

        // 📖 Tabla de historias
        doc.setFontSize(14)
        doc.text("Detalle de Historias", 14, doc.lastAutoTable.finalY + 20)

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 25,
          head: [["Título", "Tema", "Fecha", "Puntos", "Correctas", "Total", "Estado"]],
          body: historias.value.map(h => [
            h.titulo,
            h.tema,
            new Date(h.created_at).toLocaleDateString("es-ES"),
            h.puntos_obtenidos,
            h.preguntas_correctas,
            h.total_preguntas,
            h.status
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [41, 128, 185] }, // azul corporativo
          theme: "striped"
        })

        // Guardar
        doc.save(`reporte_${studentProfile.value.user.fullname}_${new Date().toISOString().split("T")[0]}.pdf`)

        toastStore.success("Reporte PDF generado exitosamente")
      } catch (error) {
        console.error("❌ Error generando PDF:", error)
        toastStore.error("Error al generar el PDF")
      } finally {
        generandoReporte.value = false
      }
    }
    
    const enviarMensajeMotivacion = () => {
      // TODO: Implementar modal para enviar mensaje personalizado
      toastStore.info('Función de mensajería próximamente disponible')
    }
    
    const compararConClase = () => {
      router.push(`/dashboard-docente?tab=comparacion&estudiante=${estudiante.value}`)
    }
    
    const asignarTareaPersonalizada = () => {
      // TODO: Implementar modal para asignar tareas específicas
      toastStore.info('Función de asignación de tareas próximamente disponible')
    }
    
    // ============================================================================
    // 🎨 MÉTODOS DE FORMATO Y UTILIDADES
    // ============================================================================
    
    const getInitials = (nombre) => {
      if (!nombre) return '?'
      const words = nombre.split(' ')
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase()
      }
      return nombre[0].toUpperCase()
    }
    
    const formatDate = (fecha) => {
      if (!fecha) return 'No disponible'
      
      const fechaObj = new Date(fecha)
      const ahora = new Date()
      const diferenciaDias = Math.floor((ahora - fechaObj) / (1000 * 60 * 60 * 24))
      
      if (diferenciaDias === 0) return 'Hoy'
      if (diferenciaDias === 1) return 'Ayer'
      if (diferenciaDias < 7) return `Hace ${diferenciaDias} días`
      
      return fechaObj.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: fechaObj.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined
      })
    }
    
    const formatTiempo = (segundos) => {
      if (segundos < 60) return `${segundos}s`
      if (segundos < 3600) return `${Math.floor(segundos / 60)}m`
      return `${Math.floor(segundos / 3600)}h ${Math.floor((segundos % 3600) / 60)}m`
    }
    
    const formatTiempoPromedio = (segundos) => {
      if (segundos < 60) return `${Math.round(segundos)}s`
      return `${Math.round(segundos / 60)}m`
    }
    
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
    
    const calcularNivel = (puntos) => {
      const niveles = [
        { min: 0, max: 99, nombre: 'Explorador', icono: '🌱', color: '#4caf50' },
        { min: 100, max: 299, nombre: 'Aventurero', icono: '⭐', color: '#2196f3' },
        { min: 300, max: 599, nombre: 'Narrador', icono: '📚', color: '#ff9800' },
        { min: 600, max: 999, nombre: 'Maestro Cuentista', icono: '👑', color: '#9c27b0' },
        { min: 1000, max: Infinity, nombre: 'Leyenda Literaria', icono: '🏆', color: '#f44336' }
      ]
      
      return niveles.find(nivel => puntos >= nivel.min && puntos <= nivel.max) || niveles[0]
    }
    
    const getNivelClase = (nivel) => {
      const clases = {
        'Explorador': 'nivel-explorador',
        'Aventurero': 'nivel-aventurero',
        'Narrador': 'nivel-narrador',
        'Maestro Cuentista': 'nivel-maestro',
        'Leyenda Literaria': 'nivel-leyenda'
      }
      return clases[nivel?.nombre] || 'nivel-explorador'
    }
    
    const getProgresoClass = (porcentaje) => {
      if (porcentaje >= 80) return 'progreso-alto'
      if (porcentaje >= 50) return 'progreso-medio'
      return 'progreso-bajo'
    }
    
    const getIconoRecomendacion = (tipo) => {
      const iconos = {
        'fortaleza': '💪',
        'mejora': '📈',
        'estrategia': '🎯',
        'motivacion': '✨'
      }
      return iconos[tipo] || '💡'
    }
    
    // ============================================================================
    // 🎯 LIFECYCLE HOOKS
    // ============================================================================
    
    onMounted(() => {
      console.log('🏠 Iniciando DetalleEstudiante para ID:', estudiante.value)

      // Verificar autenticación
      if (!authStore.isAuthenticated || !authStore.isDocente) {
        console.error('❌ Acceso no autorizado')
        router.push('/login')
        return
      }

      cargarDatosEstudiante()
    })
    
    // ============================================================================
    // 👀 WATCHERS
    // ============================================================================
    
    watch(() => route.params.id, (newId) => {
      if (newId && newId !== estudiante.value) {
        cargarDatosEstudiante()
      }
    })
    
    return {
      // Estados
      estudiante,
      estadisticas,
      progresoTemas,
      historias,
      analisisRendimiento,
      loading,
      loadingHistorias,
      error,
      generandoReporte,
      filtroTema,
      ordenHistorias,
      
      // Computed
      nivelActual,
      temasDisponibles,
      historiasFiltradas,
      
      // Métodos principales
      recargarDatos,
      volverDashboard,
      verDetalleHistoria,
      
      // Acciones del docente
      exportarReportePDF,
      enviarMensajeMotivacion,
      compararConClase,
      asignarTareaPersonalizada,
      
      // Utilidades
      getInitials,
      formatDate,
      formatTiempo,
      formatTiempoPromedio,
      getEmojiTema,
      formatTema,
      getNivelClase,
      getProgresoClass,
      getIconoRecomendacion
    }
  }
}
</script>

<style scoped>
/* ============================================================================ */
/* 🎨 ESTILOS PRINCIPALES */
/* ============================================================================ */

.detalle-estudiante-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ============================================================================ */
/* 🔄 LOADING STATES */
/* ============================================================================ */

.loading-principal {
  text-align: center;
  padding: 80px 20px;
  color: white;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #e1e5e9;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-historias {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

/* ============================================================================ */
/* 📋 HEADER DEL ESTUDIANTE */
/* ============================================================================ */

.estudiante-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-back {
  background: #f8f9fa;
  color: #495057;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: #e9ecef;
  transform: translateX(-2px);
}

.estudiante-principal {
  display: flex;
  align-items: center;
  gap: 25px;
}

.estudiante-avatar-grande {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8em;
  font-weight: bold;
  flex-shrink: 0;
}

.estudiante-datos h1 {
  color: #333;
  font-size: 2.2em;
  margin-bottom: 5px;
  font-weight: 700;
}

.estudiante-email {
  color: #666;
  font-size: 1.1em;
  margin-bottom: 15px;
}

.estudiante-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9em;
}

.meta-label {
  color: #666;
  font-weight: 500;
}

.meta-value {
  color: #333;
  font-weight: 600;
}

.nivel-badge {
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nivel-explorador {
  background: linear-gradient(45deg, #e8f5e8, #c8e6c9);
  color: #2e7d32;
}

.nivel-aventurero {
  background: linear-gradient(45deg, #e3f2fd, #bbdefb);
  color: #1565c0;
}

.nivel-narrador {
  background: linear-gradient(45deg, #fff3e0, #ffcc02);
  color: #f57c00;
}

.nivel-maestro {
  background: linear-gradient(45deg, #f3e5f5, #e1bee7);
  color: #7b1fa2;
}

.nivel-leyenda {
  background: linear-gradient(45deg, #ffebee, #ffcdd2);
  color: #c62828;
}

.ultima-actividad {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9em;
  margin-top: 10px;
}

.actividad-icon {
  font-size: 1.1em;
}

/* ============================================================================ */
/* 📊 ESTADÍSTICAS */
/* ============================================================================ */

.estadisticas-section,
.progreso-temas-section,
.analisis-section,
.historial-section,
.acciones-docente {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.estadisticas-section h2,
.progreso-temas-section h2,
.analisis-section h2,
.historial-section h2,
.acciones-docente h2 {
  color: #333;
  font-size: 1.8em;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}

.stats-principales {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
}

.stat-card.primary {
  border-left: 4px solid #667eea;
}

.stat-card.success {
  border-left: 4px solid #4caf50;
}

.stat-card.info {
  border-left: 4px solid #2196f3;
}

.stat-card.warning {
  border-left: 4px solid #ff9800;
}

.stat-icon {
  font-size: 2em;
  margin-bottom: 12px;
  display: block;
}

.stat-content {
  text-align: left;
}

.stat-number {
  font-size: 2.2em;
  font-weight: 700;
  color: #333;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9em;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.stat-detail {
  font-size: 0.8em;
  color: #999;
}

/* ============================================================================ */
/* 🎨 PROGRESO POR TEMAS */
/* ============================================================================ */

.temas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.tema-progress-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.tema-progress-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.tema-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.tema-emoji {
  font-size: 1.8em;
}

.tema-info h3 {
  color: #333;
  font-size: 1.1em;
  margin-bottom: 2px;
  font-weight: 600;
}

.tema-estadisticas {
  color: #666;
  font-size: 0.85em;
  margin: 0;
}

.tema-metricas {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.metrica {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metrica-label {
  font-size: 0.8em;
  color: #666;
  margin-bottom: 2px;
}

.metrica-value {
  font-size: 1.1em;
  font-weight: 600;
  color: #333;
}

.tema-progreso {
  margin-top: 12px;
}

.progreso-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progreso-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.progreso-alto {
  background: linear-gradient(45deg, #4caf50, #8bc34a);
}

.progreso-medio {
  background: linear-gradient(45deg, #ff9800, #ffc107);
}

.progreso-bajo {
  background: linear-gradient(45deg, #f44336, #ff5722);
}

.progreso-texto {
  font-size: 0.8em;
  color: #666;
  text-align: center;
  display: block;
}

/* ============================================================================ */
/* 🎭 ANÁLISIS DE RENDIMIENTO */
/* ============================================================================ */

.analisis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.analisis-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.analisis-card h3 {
  color: #333;
  font-size: 1.2em;
  margin-bottom: 16px;
  font-weight: 600;
}

.analisis-card.fortalezas {
  border-left: 4px solid #4caf50;
}

.analisis-card.oportunidades {
  border-left: 4px solid #ff9800;
}

.fortalezas-lista,
.oportunidades-lista {
  list-style: none;
  padding: 0;
  margin: 0;
}

.fortalezas-lista li,
.oportunidades-lista li {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 0.9em;
  color: #555;
}

.fortaleza-icon,
.oportunidad-icon {
  font-size: 1.1em;
}

.recomendaciones {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.recomendaciones h3 {
  color: #333;
  margin-bottom: 16px;
  font-weight: 600;
}

.recomendaciones-lista {
  display: grid;
  gap: 12px;
}

.recomendacion-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.recomendacion-icon {
  font-size: 1.5em;
  flex-shrink: 0;
}

.recomendacion-content h4 {
  color: #333;
  font-size: 0.95em;
  margin-bottom: 4px;
  font-weight: 600;
}

.recomendacion-content p {
  color: #666;
  font-size: 0.85em;
  line-height: 1.4;
  margin: 0;
}

/* ============================================================================ */
/* 📖 HISTORIAL DE HISTORIAS */
/* ============================================================================ */

.historial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  gap: 20px;
}

.historial-controles {
  display: flex;
  gap: 10px;
}

.filtro-select {
  padding: 8px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.9em;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filtro-select:focus {
  outline: none;
  border-color: #667eea;
}

.historias-lista {
  display: grid;
  gap: 16px;
}

.historia-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.historia-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.historia-icon {
  font-size: 2em;
  flex-shrink: 0;
}

.historia-content {
  flex: 1;
  min-width: 0;
}

.historia-titulo {
  color: #333;
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.3;
}

.historia-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 0.85em;
}

.meta-tema {
  color: #667eea;
  font-weight: 500;
}

.meta-fecha {
  color: #666;
}

.historia-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-mini {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8em;
  color: #666;
}

.stat-icon {
  font-size: 1em;
}

.historia-estado {
  flex-shrink: 0;
}

.estado-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.estado-badge.completada {
  background: linear-gradient(45deg, #e8f5e8, #c8e6c9);
  color: #2e7d32;
}

.estado-badge.pendiente {
  background: linear-gradient(45deg, #fff3c4, #ffeaa7);
  color: #f57c00;
}

.empty-historial {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.empty-historial h3 {
  color: #333;
  margin-bottom: 10px;
}

/* ============================================================================ */
/* 👨‍🏫 ACCIONES DEL DOCENTE */
/* ============================================================================ */

.acciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.accion-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 56px;
}

.accion-btn.primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.accion-btn.secondary {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  color: white;
}

.accion-btn.info {
  background: linear-gradient(45deg, #a8edea, #fed6e3);
  color: #333;
}

.accion-btn.warning {
  background: linear-gradient(45deg, #ffeaa7, #fab1a0);
  color: #333;
}

.accion-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.accion-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-icon {
  font-size: 1.1em;
}

/* ============================================================================ */
/* ⚠️ ERROR STATE */
/* ============================================================================ */

.error-container {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.error-container h3 {
  color: #333;
  margin-bottom: 10px;
}

.error-container p {
  color: #666;
  margin-bottom: 20px;
}

/* ============================================================================ */
/* 📱 RESPONSIVE */
/* ============================================================================ */

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .estudiante-principal {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .estudiante-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .historial-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .historial-controles {
    width: 100%;
    justify-content: space-between;
  }
  
  .historia-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .historia-stats {
    justify-content: center;
  }
  
  .acciones-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .estadisticas-section,
  .progreso-temas-section,
  .analisis-section,
  .historial-section,
  .acciones-docente {
    padding: 20px;
  }
  
  .stats-principales {
    grid-template-columns: 1fr;
  }
  
  .temas-grid {
    grid-template-columns: 1fr;
  }
  
  .analisis-grid {
    grid-template-columns: 1fr;
  }
}
</style>