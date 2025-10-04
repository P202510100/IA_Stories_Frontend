import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 100000, // Aumentado para generación IA
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
  //  AUTENTICACIÓN - ENDPOINTS 
  // ============================================================================
  
  async login(credentials) {
    const params = new URLSearchParams()
    params.append('username', credentials.email)
    params.append('password', credentials.password)
    params.append('grant_type', 'password')

    const response = await api.post('/auth/login', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    return response.data
  },
  async getStudentByStudentId(studentId) {
      const response = await api.get(`/students/${studentId}`)

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

 async resetPassword(token, newPassword) {
    try {
      console.log('📡 API: Restableciendo contraseña...')
      
      const response = await api.post('/auth/reset-password', {
        token: token,
        new_password: newPassword
      })
      
      console.log('✅ API: Contraseña restablecida')
      return response.data
      
    } catch (error) {
      console.error('❌ API: Error restableciendo contraseña:', error.response?.data || error.message)
      throw error
    }
  },

  async validateResetToken(token) {
    try {
      console.log('📡 API: Validando token de reset...')
      
      const response = await api.post('/auth/validate-reset-token', {
        token: token
      })
      
      console.log('✅ API: Token válido')
      return response.data
      
    } catch (error) {
      console.error('❌ API: Token inválido:', error.response?.data || error.message)
      throw error
    }
  },

  async updateUser(userId, userData) {
      console.log(userId, userData)
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
  //  HISTORIAS - ENDPOINTS 
  // ============================================================================
  
  async obtenerTemas() {
    const response = await api.get('/historias/temas')
    return response.data
  },

  async cargarHistoriasPorAlumno(studentId) {
      const response = await api.get(`/records/student/${studentId}`)

      return response.data;
  },

  async cargarHistoriaPorId(storyId) {
      const response = await api.get(`/records/${storyId}`)
      return response.data;
  },

  async generarHistoria(datosHistoria) {
    const response = await api.post('/stories/generate', datosHistoria)
    return response.data
  },

  // ============================================================================
  //  DOCENTE - ENDPOINTS EXACTOS 
  // ============================================================================
  
  async obtenerEstudiantesDocente(teacherId) {
      const response = await api.get(`/enrollments/teacher/${teacherId}/students`)
      return response.data
  },

  async guardarRespuesta(recordId, payload) {
      const response = await api.post(`/records/${recordId}/answers`, payload)

      return response.data
  },

  async actualizarRecord(recordId, payload) {
      const response = await api.patch(`/records/${recordId}`, payload)

      return response.data
  },

  async finalizarRecord(recordId, payload) {
      const response = await api.post(`/records/`, payload)

      return response.data
  },

  async obtenerRankingEstudiantes(docenteId) {
    return this.obtenerRankingClase(docenteId)
  },

  async obtenerTodosLosEstudiantes() {
  try {
    const response = await api.get('/api/alumnos/todos')
    return response.data
  } catch (error) {
    try {
      const response = await api.get('/api/alumnos')
      return response.data
    } catch (error2) {
      console.error('❌ No se pudo obtener estudiantes:', error2)
      throw new Error('No se pudo cargar la lista de estudiantes')
    }
  }
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
    async obtenerProgreso(alumnoId) {
        const response = await api.get(`api/progress/${alumnoId}`);
        return response.data;
    },

  async obtenerDetalleEstudiante(docenteId, alumnoId) {
    const response = await api.get(`/api/docentes/${docenteId}/students/${alumnoId}/detail`)
    return response.data
  },

  // ============================================================================
  //  RANKING - 
  // ============================================================================
  
  async obtenerRankingClase(docenteId) {
    const response = await api.get(`/api/docentes/${docenteId}/ranking`)
    return response.data
  },

  // ============================================================================
  //  HEALTH CHECK - 
  // ============================================================================
  
  async healthCheck() {
      return await axios.get({
        baseURL: 'http://localhost:8000/',
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 100000, // Aumentado para generación IA
    })
  },
  async actualizarPerfil(updateData) {
      const response = await api.put(`/api/docentes/${updateData.user_id}/perfil`, {
          ...updateData
      })
      return response.data
  },
  async guardarProgreso(recordId, respuestas) {
     return api.post(`/records/${recordId}/save-progress`, respuestas)
  },
  async enrollStudentWithTeacher(teacherId, studentId) {
      return api.post(`/enrollments/`,{
          teacher_id: teacherId,
          student_id: studentId
      })
  }
}


export default apiService