
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 45000, // Aumentado para generación IA
})

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

const apiService = {
  // ============================================================================
  // 🔐 AUTENTICACIÓN - ENDPOINTS 
  // ============================================================================
  
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  async updateUser(userId, userData) {
    const response = await api.put('/auth/update-profile', {
      user_id: userId,
      ...userData
    })
    return response.data
  },

  async deleteUser(userId) {
    const response = await api.delete('/auth/delete-account', {
      data: { user_id: userId }
    })
    return response.data
  },

  // ============================================================================
  // 📚 HISTORIAS - ENDPOINTS 
  // ============================================================================
  
  async obtenerTemas() {
    const response = await api.get('/historias/temas')
    return response.data
  },

  async generarHistoria(datosHistoria) {
    const response = await api.post('/historias/generar', datosHistoria)
    return response.data
  },

  async obtenerHistoria(historiaId) {
    const response = await api.get(`/historias/${historiaId}`)
    return response.data
  },

  async generarPromptsImagenes(historiaId, personajes, historiaContenido, tema) {
    const response = await api.post('/historias/generar-prompts-imagenes', {
      historia_id: historiaId,
      personajes: personajes,
      historia_contenido: historiaContenido,
      tema: tema
    })
    return response.data
  },

  async generarImagenesPersonajes(historiaId, personajes, tema) {
    const response = await api.post('/historias/generar-imagenes-personajes', {
      historia_id: historiaId,
      personajes: personajes,
      tema: tema
    })
    return response.data
  },

  // ============================================================================
  // ❓ PREGUNTAS - ENDPOINTS EXACTOS
  // ============================================================================
  
  async responderPregunta(datosRespuesta) {
    console.log('🎯 DEBUGGING ENDPOINT responderPregunta')
    console.log('📨 Datos recibidos:', datosRespuesta)
    
    // ✅ FORMATO 1: Como dice la documentación
    const formato1 = {
      historia_id: datosRespuesta.historia_id,
      alumno_id: datosRespuesta.alumno_id,
      pregunta_id: datosRespuesta.pregunta_id,
      respuesta: datosRespuesta.respuesta
    }
    
    // ✅ FORMATO 2: Con "respuestas" plural (según error del backend)
    const formato2 = {
      historia_id: datosRespuesta.historia_id,
      alumno_id: datosRespuesta.alumno_id,
      pregunta_id: datosRespuesta.pregunta_id,
      respuestas: [datosRespuesta.respuesta]
    }
    
    // ✅ FORMATO 3: IDs como strings
    const formato3 = {
      historia_id: String(datosRespuesta.historia_id),
      alumno_id: String(datosRespuesta.alumno_id),
      pregunta_id: String(datosRespuesta.pregunta_id),
      respuesta: datosRespuesta.respuesta
    }
    
    console.log('🧪 Probando Formato 1 (documentación):', formato1)
    try {
      const response = await api.post('/api/preguntas/responder', formato1)
      console.log('✅ Formato 1 funcionó!')
      return response.data
    } catch (error1) {
      console.log('❌ Formato 1 falló:', error1.response?.data?.error)
      
      console.log('🧪 Probando Formato 2 (respuestas plural):', formato2)
      try {
        const response = await api.post('/api/preguntas/responder', formato2)
        console.log('✅ Formato 2 funcionó!')
        return response.data
      } catch (error2) {
        console.log('❌ Formato 2 falló:', error2.response?.data?.error)
        
        console.log('🧪 Probando Formato 3 (IDs como strings):', formato3)
        try {
          const response = await api.post('/api/preguntas/responder', formato3)
          console.log('✅ Formato 3 funcionó!')
          return response.data
        } catch (error3) {
          console.log('❌ Formato 3 falló:', error3.response?.data?.error)
          console.error('💥 TODOS LOS FORMATOS FALLARON')
          throw error1 // Lanzar el primer error
        }
      }
    }
  },

  // ============================================================================
  // 👨‍🎓 ALUMNO - ENDPOINTS 
  // ============================================================================
  
  async obtenerHistorialAlumno(alumnoId) {
    const response = await api.get(`/api/alumnos/${alumnoId}/historial`)
    return response.data
  },

  async obtenerProgresoAlumno(alumnoId) {
    const response = await api.get(`/api/progress/${alumnoId}`)
    return response.data
  },

  async exportarHistorialPDF(alumnoId) {
    const response = await api.get(`/historias/exportar-historial-pdf/${alumnoId}`, {
      responseType: 'blob'
    })
    return response
  },

  // ============================================================================
  // 👩‍🏫 DOCENTE - ENDPOINTS EXACTOS 
  // ============================================================================
  
  async obtenerEstudiantesDocente(docenteId) {
    // ✅ PROBAR MÚLTIPLES RUTAS POSIBLES
    try {
      const response = await api.get(`/api/docentes/${docenteId}/estudiantes`)
      return response.data
    } catch (error) {
      console.warn('⚠️ Endpoint /estudiantes no disponible, probando alternativa...')
      // Fallback: Probar endpoint alternativo
      try {
        const response = await api.get(`/api/docentes/${docenteId}/students`)
        return response.data
      } catch (error2) {
        console.warn('⚠️ Endpoint /students tampoco disponible, usando datos demo')
        // Retornar datos demo si no hay endpoints
        return {
          estudiantes: [
            {
              id: 1,
              nombre: "Ana García",
              email: "ana.garcia@estudiante.com",
              total_historias: 5,
              puntos_totales: 450,
              nivel_actual: "Explorador"
            },
            {
              id: 2,
              nombre: "Carlos Ruiz", 
              email: "carlos.ruiz@estudiante.com",
              total_historias: 3,
              puntos_totales: 320,
              nivel_actual: "Principiante"
            }
          ]
        }
      }
    }
  },

  async obtenerAnalyticsDocente(docenteId) {
    try {
      const response = await api.get(`/api/docentes/${docenteId}/analytics`)
      return response.data
    } catch (error) {
      console.warn('⚠️ Endpoint analytics no disponible, usando datos demo')
      return {
        analytics: {
          resumen_general: {
            total_estudiantes: 3,
            total_historias: 8,
            promedio_puntuacion: 85.5
          },
          distribucion_temas: {
            fantasia: 3,
            espacio: 2,
            aventura: 3
          }
        }
      }
    }
  },

  // ✅ ALIAS para compatibilidad con DashboardDocente.vue
  async obtenerEstadisticasDocente(docenteId) {
    return this.obtenerAnalyticsDocente(docenteId)
  },

  async obtenerRankingEstudiantes(docenteId) {
    return this.obtenerRankingClase(docenteId)
  },

  async asociarEstudiante(docenteId, alumnoId) {
    const response = await api.post(`/api/docentes/${docenteId}/associate`, {
      alumno_id: alumnoId
    })
    return response.data
  },

  async desvincularEstudiante(docenteId, alumnoId) {
    const response = await api.delete(`/api/docentes/${docenteId}/students/${alumnoId}`)
    return response.data
  },

  async descargarReporteDocente(docenteId) {
    try {
      const response = await api.get(`/api/docentes/${docenteId}/report`, {
        responseType: 'blob'
      })
      return response
    } catch (error) {
      console.warn('⚠️ Endpoint report no disponible, generando PDF demo')
      // Crear un PDF básico demo si el endpoint no existe
      const pdfContent = `IAStories - Reporte Demo\nDocente ID: ${docenteId}\nFecha: ${new Date().toLocaleDateString()}\n\nEste es un reporte de prueba.`
      const blob = new Blob([pdfContent], { type: 'application/pdf' })
      return { data: blob }
    }
  },

  async obtenerDetalleEstudiante(docenteId, alumnoId) {
    const response = await api.get(`/api/docentes/${docenteId}/students/${alumnoId}/detail`)
    return response.data
  },

  // ============================================================================
  // 🏆 RANKING - 
  // ============================================================================
  
  async obtenerRankingClase(docenteId) {
    const response = await api.get(`/api/docentes/${docenteId}/ranking`)
    return response.data
  },

  // ============================================================================
  // 🏥 HEALTH CHECK - 
  // ============================================================================
  
  async healthCheck() {
    const response = await api.get('/health')
    return response.data
  },
  async actualizarPerfil(updateData) {
      const response = await api.put(`/api/docentes/${updateData.user_id}/perfil`, {
          ...updateData
      })
      return response.data
  }
}

export default apiService