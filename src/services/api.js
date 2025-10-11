import axios from 'axios'

const api = axios.create({
  baseURL: 'https://iastoriesservice-173351401705.southamerica-west1.run.app/api/v1',
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

  async unenrollStudent(teacherId, studentId) {
      const response = await api.delete(`/enrollments/${teacherId}/${studentId}`)

      return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async updateUser(userId, userData) {
      console.log(userId, userData)
    const response = await api.put(`/users/${userId}`, {
      ...userData
    })
    return response.data
  },

  async deleteUser(userId) {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token')
      if (!token) throw new Error('No se encontró token de autenticación')

      const response = await api.delete('/auth/delete-account', {
          headers: {
              Authorization: `Bearer ${token}`
          }
      })
      return response.data
  },

  // ============================================================================
  //  HISTORIAS - ENDPOINTS 
  // ============================================================================

  async verifyEmail(payload) {
      console.log(payload)
      const response = await api.post('/auth/verify-email', payload)
      return response.data
  },

  async resetPassword(payload) {
    const response = await api.post('/auth/reset-password', payload)
      return response.data
  },

  async changePassword(payload) {
    const response = await api.post('/auth/change-password', payload)
    return response.data
  },

  async actualizarInteresesAlumno(studentId, interesesArray) {
    const response = await api.put(`/students/${studentId}/interests`, interesesArray)
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

  async reiniciarExamen(recordId) {
      const response = await api.post(`/records/${recordId}/restart`)

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

  async obtenerRanking() {
    const response = await api.get(`/records/ranking/class`);
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