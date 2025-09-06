// stores/historias.js - CORREGIDO 100% PARA BACKEND VERIFICADO
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '../services/api.js'

export const useHistoriasStore = defineStore('historias', () => {
  const historias = ref([])
  const historiaActual = ref(null)
  const temas = ref([])
  const preguntas = ref([])
  const estadisticas = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const totalHistorias = computed(() => historias.value.length)
  const historiasCompletadas = computed(() => 
    historias.value.filter(h => h.completada).length
  )

  // ============================================================================
  // 📚 TEMAS - SOLO DATOS REALES DEL BACKEND VERIFICADO
  // ============================================================================
  
  async function cargarTemas() {
    loading.value = true
    error.value = null

    try {
      console.log('🎯 Cargando temas del backend...')
      
      // ✅ ENDPOINT VERIFICADO: GET /historias/temas
      const response = await apiService.obtenerTemas()
      
      // ✅ ESTRUCTURA EXACTA del backend: { temas: [...] }
      temas.value = response.temas || []
      
      console.log(`✅ ${temas.value.length} temas cargados`)
      return temas.value
      
    } catch (err) {
      console.error('❌ Error cargando temas:', err)
      error.value = 'Error cargando temas disponibles'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // ✨ GENERACIÓN DE HISTORIAS - ENDPOINTS VERIFICADOS DEL BACKEND
  // ============================================================================
  
  async function generarHistoria(datosHistoria) {
  loading.value = true
  error.value = null

  try {
    console.log('✨ Generando historia...', datosHistoria)
    
    // ✅ LLAMADA AL BACKEND CON DATOS CORREGIDOS
    const response = await apiService.generarHistoria(datosHistoria)
    
    console.log('🎯 Respuesta del backend:', response)
    
    // ✅ ESTRUCTURA EXACTA según tu documentación del backend:
    // { id, message, titulo, contenido, tema, personaje_principal, metadata, preguntas }
    historiaActual.value = {
      id: response.id,
      titulo: response.titulo || `Historia de ${datosHistoria.tema}`,
      contenido: response.contenido,
      tema: response.tema || datosHistoria.tema,
      personaje_principal: response.personaje_principal || datosHistoria.personaje_principal,
      alumno_id: datosHistoria.alumno_id,
      fecha_creacion: new Date().toISOString(),
      completada: false,
      // Metadata del backend
      palabras: response.metadata?.palabras || 0,
      edad_protagonista: response.metadata?.edad_protagonista || datosHistoria.edad_protagonista
    }
    
    // ✅ GUARDAR PREGUNTAS que vienen del backend
    if (response.preguntas && Array.isArray(response.preguntas)) {
      preguntas.value = response.preguntas.map(pregunta => ({
        ...pregunta,
        historia_id: response.id,
        respondida: false
      }))
      console.log(`✅ ${preguntas.value.length} preguntas cargadas`)
    }
    
    // Agregar a la lista local
    historias.value.unshift(historiaActual.value)
    
    console.log(`✅ Historia generada: "${response.titulo}" (${response.metadata?.palabras || 0} palabras)`)
    return historiaActual.value
    
  } catch (err) {
    console.error('❌ Error generando historia:', err)
    
    // ✅ MANEJO ESPECÍFICO DE ERRORES DEL BACKEND
    if (err.response?.status === 400) {
      const backendError = err.response?.data?.error || err.response?.data?.message
      error.value = `Error en los datos: ${backendError}`
      console.error('🔍 Error 400 del backend:', err.response?.data)
    } else if (err.response?.status === 500) {
      error.value = 'Error del servidor de IA. Intenta de nuevo en unos momentos.'
    } else {
      error.value = 'Error generando la historia. Verifica tu conexión e intenta de nuevo.'
    }
    
    throw err
  } finally {
    loading.value = false
  }
}

  async function generarPromptPersonalizado(alumnoId, tema) {
    try {
      console.log('🎨 Generando prompt personalizado...')
      
      // ✅ ENDPOINT VERIFICADO: POST /historias/generar-prompt-personalizado
      const response = await apiService.generarPromptPersonalizado({
        alumno_id: alumnoId,
        tema: tema
      })
      
      // ✅ ESTRUCTURA EXACTA del backend: { prompt_personalizado, alumno_id, mensaje }
      console.log('✅ Prompt personalizado:', response.mensaje)
      return response.prompt_personalizado
      
    } catch (err) {
      console.error('❌ Error generando prompt:', err)
      throw err
    }
  }

  // ============================================================================
  // 📖 HISTORIAS ALUMNO - ENDPOINTS VERIFICADOS DEL BACKEND
  // ============================================================================
  
  async function cargarHistoriasAlumno(alumnoId) {
    loading.value = true
    error.value = null

    try {
      console.log(`📚 Cargando historias del alumno ${alumnoId}...`)
      
      // ✅ ENDPOINT VERIFICADO: GET /api/historias/alumno/{alumno_id}
      const response = await apiService.obtenerHistoriasAlumno(alumnoId)
      
      // ✅ Manejar estructura del backend (puede variar)
      if (response.historias) {
        historias.value = response.historias
      } else if (Array.isArray(response)) {
        historias.value = response
      } else {
        historias.value = []
      }
      
      console.log(`✅ ${historias.value.length} historias cargadas`)
      return historias.value
      
    } catch (err) {
      console.error('❌ Error cargando historias:', err)
      error.value = 'Error cargando el historial de historias'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function obtenerHistoria(historiaId) {
    try {
      console.log(`📖 Obteniendo historia ${historiaId}...`)
      
      const response = await apiService.obtenerHistoria(historiaId)
      
      historiaActual.value = response
      return response
      
    } catch (err) {
      console.error('❌ Error obteniendo historia:', err)
      throw err
    }
  }

  // ============================================================================
  // ❓ PREGUNTAS - ENDPOINTS VERIFICADOS DEL BACKEND
  // ============================================================================
  
  async function cargarPreguntasHistoria(historiaId) {
    loading.value = true
    error.value = null

    try {
      console.log(`❓ Cargando preguntas para historia ${historiaId}...`)
      
      // ✅ ENDPOINT VERIFICADO: GET /api/story-questions/{historia_id}
      const response = await apiService.obtenerPreguntasHistoria(historiaId)
      
      preguntas.value = response.preguntas || response || []
      
      console.log(`✅ ${preguntas.value.length} preguntas cargadas`)
      return preguntas.value
      
    } catch (err) {
      console.error('❌ Error cargando preguntas:', err)
      error.value = 'Error cargando las preguntas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function responderPregunta(datosRespuesta) {
    try {
      console.log('✍️ Enviando respuesta...', datosRespuesta)
      
      // ✅ ENDPOINT VERIFICADO: POST /api/preguntas/responder
      const response = await apiService.responderPregunta(datosRespuesta)
      
      // ✅ ESTRUCTURA EXACTA del backend: { es_correcta, mensaje, pregunta_id }
      console.log('✅ Respuesta procesada:', response.mensaje)
      return response
      
    } catch (err) {
      console.error('❌ Error enviando respuesta:', err)
      throw err
    }
  }

  async function repetirPregunta(alumnoId, preguntaId) {
    try {
      console.log('🔄 Solicitando repetir pregunta...')
      
      // ✅ ENDPOINT VERIFICADO: POST /historias/repetir-pregunta
      const response = await apiService.repetirPregunta({
        alumno_id: alumnoId,
        pregunta_id: preguntaId
      })
      
      // ✅ ESTRUCTURA EXACTA del backend: { mensaje, intento, mensaje_motivacion, alumno_id }
      console.log('✅ Pregunta disponible para repetir:', response.mensaje_motivacion)
      return response
      
    } catch (err) {
      console.error('❌ Error repitiendo pregunta:', err)
      throw err
    }
  }

  // ============================================================================
  // 📊 ESTADÍSTICAS - ENDPOINTS VERIFICADOS DEL BACKEND
  // ============================================================================
  
  async function cargarEstadisticasAlumno(alumnoId) {
    loading.value = true
    error.value = null

    try {
      console.log(`📊 Cargando estadísticas del alumno ${alumnoId}...`)
      
      // ✅ ENDPOINT VERIFICADO: GET /api/students/{alumno_id}/detailed-results
      const response = await apiService.obtenerEstadisticasAlumno(alumnoId)
      
      // ✅ ESTRUCTURA EXACTA del backend: { alumno_id, analisis_por_tipo, desglose_por_pregunta }
      estadisticas.value = {
        alumno_id: response.alumno_id,
        analisis_por_tipo: response.analisis_por_tipo || {},
        desglose_por_pregunta: response.desglose_por_pregunta || [],
        // Calculados para compatibilidad
        total_historias: historias.value.length,
        puntos_totales: calcularPuntosTotales(response.analisis_por_tipo),
        nivel_actual: calcularNivel(response.analisis_por_tipo)
      }
      
      console.log('✅ Estadísticas cargadas')
      return estadisticas.value
      
    } catch (err) {
      console.error('❌ Error cargando estadísticas:', err)
      error.value = 'Error cargando estadísticas'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // 🎉 FELICITACIÓN - ENDPOINT VERIFICADO DEL BACKEND
  // ============================================================================
  
  async function obtenerFelicitacion(alumnoId) {
    try {
      console.log('🎉 Obteniendo mensaje de felicitación...')
      
      // ✅ ENDPOINT VERIFICADO: GET /api/congratulations/{alumno_id}
      const response = await apiService.obtenerFelicitacion(alumnoId)
      
      // ✅ ESTRUCTURA EXACTA del backend: { alumno_id, celebracion, compartir }
      console.log('✅ Felicitación obtenida:', response.celebracion)
      return response
      
    } catch (err) {
      console.error('❌ Error obteniendo felicitación:', err)
      throw err
    }
  }

  // ============================================================================
  // 📄 PDF - ENDPOINT VERIFICADO DEL BACKEND
  // ============================================================================
  
  async function exportarHistorialPDF(alumnoId) {
    try {
      console.log('📄 Exportando historial a PDF...')
      
      // ✅ ENDPOINT VERIFICADO: GET /historias/exportar-historial-pdf/{alumno_id}
      const response = await apiService.exportarHistorialPDF(alumnoId)
      
      console.log('✅ PDF exportado exitosamente')
      return response
      
    } catch (err) {
      console.error('❌ Error exportando PDF:', err)
      throw err
    }
  }

  // ============================================================================
  // 🛠️ UTILIDADES
  // ============================================================================
  
  function calcularPuntosTotales(analisisPorTipo) {
    if (!analisisPorTipo) return 0
    
    let total = 0
    Object.values(analisisPorTipo).forEach(tipo => {
      if (tipo.correctas) {
        total += tipo.correctas * 10 // 10 puntos por respuesta correcta
      }
    })
    return total
  }

  function calcularNivel(analisisPorTipo) {
    const puntos = calcularPuntosTotales(analisisPorTipo)
    
    if (puntos >= 1000) return { nombre: 'Maestro Narrador', numero: 5 }
    if (puntos >= 500) return { nombre: 'Explorador Avanzado', numero: 4 }
    if (puntos >= 250) return { nombre: 'Aventurero', numero: 3 }
    if (puntos >= 100) return { nombre: 'Principiante', numero: 2 }
    return { nombre: 'Nuevo Explorador', numero: 1 }
  }

  function limpiarEstado() {
    historias.value = []
    historiaActual.value = null
    preguntas.value = []
    estadisticas.value = null
    error.value = null
  }

  // ✅ FUNCIÓN AGREGADA: clearHistoriaActual
  function clearHistoriaActual() {
    console.log('🧹 Limpiando historia actual para crear una nueva...')
    historiaActual.value = null
    preguntas.value = []
    error.value = null
    console.log('✅ Estado limpiado, listo para nueva historia')
  }

  return {
    // Estado
    historias,
    historiaActual,
    temas,
    preguntas,
    estadisticas,
    loading,
    error,
    
    // Computed
    totalHistorias,
    historiasCompletadas,
    
    // Acciones - Temas
    cargarTemas,
    
    // Acciones - Historias
    generarHistoria,
    generarPromptPersonalizado,
    cargarHistoriasAlumno,
    obtenerHistoria,
    
    // Acciones - Preguntas
    cargarPreguntasHistoria,
    responderPregunta,
    repetirPregunta,
    
    // Acciones - Estadísticas
    cargarEstadisticasAlumno,
    
    // Acciones - Extras
    obtenerFelicitacion,
    exportarHistorialPDF,
    
    // Utilidades
    limpiarEstado,
    clearHistoriaActual  // ✅ FUNCIÓN AGREGADA AQUÍ
  }
})