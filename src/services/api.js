// src/services/api.js
import axios from 'axios'
import { useLoaderStore } from '../stores/loaderStore'
import { parseApiError } from '../utils/errorHandler.js'

// -----------------------------------------------------------------------------
// ⚙️ CONFIGURACIÓN BASE
// -----------------------------------------------------------------------------
const api = axios.create({
  baseURL: 'https://iastoriesservice-173351401705.southamerica-west1.run.app/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 100000, // Aumentado para generación IA
})

// -----------------------------------------------------------------------------
// 🧩 INTERCEPTORES GLOBALES
// -----------------------------------------------------------------------------
api.interceptors.request.use(
    config => {
        const loader = useLoaderStore()

        // Mostrar loader si no está desactivado manualmente
        if (!config.meta?.noLoader) {
            loader.show({
                message: config.meta?.message || 'Cargando...',
                submessage: config.meta?.submessage || '',
                type: config.meta?.type || 'dots'
            })
        }
        return config
    },
    error => {
        // Error antes de enviar la solicitud
        const loader = useLoaderStore()
        loader.hide()
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    response => {
        // Ocultar loader al recibir respuesta exitosa
        const loader = useLoaderStore()
        if (!response.config.meta?.noLoader) loader.hide()

        // Retornar directamente el payload
        return response.data
    },
    error => {
        const loader = useLoaderStore()
        if (!error.config?.meta?.noLoader) loader.hide()

        // Generar mensaje amigable
        const friendlyMessage = parseApiError(error)
        console.error('❌ API Error:', friendlyMessage)

        // Propagar error con mensaje personalizado
        return Promise.reject({ ...error, friendlyMessage })
    }
)

// -----------------------------------------------------------------------------
// 🌐 SERVICIO DE API PRINCIPAL
// -----------------------------------------------------------------------------
const apiService = {
    // -------------------- 🔐 AUTENTICACIÓN --------------------
    login(credentials) {
        const params = new URLSearchParams()
        params.append('username', credentials.email)
        params.append('password', credentials.password)
        params.append('grant_type', 'password')

        return api.post('/auth/login', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            meta: { message: 'Verificando tus credenciales...', type: 'ai' }
        })
    },

    register(userData) {
        return api.post('/auth/register', userData, {
            meta: { message: 'Creando tu cuenta...', type: 'heart' }
        })
    },

    updateUser(userId, userData) {
        return api.put(`/users/${userId}`, userData, {
            meta: { message: 'Actualizando perfil...', type: 'dots' }
        })
    },

    deleteUser(userId) {
        const token =
            localStorage.getItem('token') || localStorage.getItem('access_token')
        if (!token) throw new Error('No se encontró token de autenticación')

        return api.delete('/auth/delete-account', {
            headers: { Authorization: `Bearer ${token}` },
            meta: { message: 'Eliminando cuenta...', type: 'pulse' }
        })
    },

    verifyEmail(payload) {
        return api.post('/auth/verify-email', payload, {
            meta: { message: 'Verificando tu correo electrónico...' }
        })
    },

    resetPassword(payload) {
        return api.post('/auth/reset-password', payload, {
            meta: { message: 'Restableciendo contraseña...' }
        })
    },

    changePassword(payload) {
        return api.post('/auth/change-password', payload, {
            meta: { message: 'Actualizando contraseña...' }
        })
    },

    // -------------------- 👨‍🎓 ESTUDIANTES --------------------
    getStudentByStudentId(studentId) {
        return api.get(`/students/${studentId}`, {
            meta: { message: 'Cargando datos del estudiante...' }
        })
    },

    actualizarInteresesAlumno(studentId, interesesArray) {
        return api.put(`/students/${studentId}/interests`, interesesArray, {
            meta: { message: 'Actualizando intereses...' }
        })
    },

    // -------------------- 📚 HISTORIAS / RECORDS --------------------
    cargarHistoriasPorAlumno(studentId) {
        return api.get(`/records/student/${studentId}`, {
            meta: { message: 'Cargando tus historias...', type: 'book' }
        })
    },

    cargarHistoriaPorId(storyId) {
        return api.get(`/records/${storyId}`, {
            meta: { message: 'Cargando historia...', type: 'book' }
        })
    },

    generarHistoria(datosHistoria) {
        return api.post('/stories/generate', datosHistoria, {
            meta: { message: 'Generando historia con IA...', type: 'ai' }
        })
    },

    guardarRespuesta(recordId, payload) {
        return api.post(`/records/${recordId}/answers`, payload, {
            meta: { message: 'Guardando respuesta...' }
        })
    },

    reiniciarExamen(recordId) {
        return api.post(`/records/${recordId}/restart`, {}, {
            meta: { message: 'Reiniciando intento...' }
        })
    },

    actualizarRecord(recordId, payload) {
        return api.patch(`/records/${recordId}`, payload, {
            meta: { message: 'Actualizando progreso...' }
        })
    },

    finalizarRecord(payload) {
        return api.post(`/records/`, payload, {
            meta: { message: 'Finalizando evaluación...' }
        })
    },

    obtenerRanking() {
        return api.get(`/records/ranking/class`, {
            meta: { message: 'Cargando ranking de clase...' }
        })
    },

    guardarProgreso(recordId, respuestas) {
        return api.post(`/records/${recordId}/save-progress`, respuestas, {
            meta: { noLoader: true }
        })
    },

    // -------------------- 👨‍🏫 DOCENTE / MATRÍCULA --------------------
    obtenerEstudiantesDocente(teacherId) {
        return api.get(`/enrollments/teacher/${teacherId}/students`, {
            meta: { message: 'Cargando estudiantes...', type: 'dots' }
        })
    },

    unenrollStudent(teacherId, studentId) {
        return api.delete(`/enrollments/${teacherId}/${studentId}`, {
            meta: { message: 'Desmatriculando estudiante...' }
        })
    },

    enrollStudentWithTeacher(teacherId, studentId) {
        return api.post(
            `/enrollments/`,
            { teacher_id: teacherId, student_id: studentId },
            {
                meta: { message: 'Matriculando estudiante...', type: 'heart' }
            }
        )
    }
}

export default apiService
