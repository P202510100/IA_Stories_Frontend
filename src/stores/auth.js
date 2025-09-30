// stores/auth.js - CORREGIDO PARA USAR LA KEY CORRECTA
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '../services/api.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const userType = computed(() => user.value?.tipo || null)
  const isAlumno = computed(() => userType.value === 'student')
  const isDocente = computed(() => userType.value === 'teacher')
  
  // ✅ PROFILE que tus componentes esperan
  const profile = computed(() => {
    if (!user.value) return null
    
    // Para docentes, usar docente_id como id
    if (user.value.tipo === 'teacher') {
      return {
        id: user.value.teacher_profile.id,
        user_id: user.value.teacher_profile.user_id,
        fullname: user.value.fullname,
        email: user.value.email,
        current_school: user.value.teacher_profile.current_school,
        alma_mater: user.value.teacher_profile.alma_mater,
        major: user.value.teacher_profile.major,
      }
    }
    
    // Para alumnos, usar alumno_id como id  
    if (user.value.tipo === 'student') {
      return {
        id: user.value.student_profile.id,
        user_id: user.value.student_profile.user_id,
        fullname: user.value.fullname,
        email: user.value.email,
        birth_date: user.value.student_profile.birth_date,
        current_grade: user.value.student_profile.current_grade,
        interests: user.value.student_profile.interests,
        total_points: user.value.student_profile.points,
        current_level: user.value.student_profile.current_level,
      }
    }
    return null
  })

  // ✅ FUNCIÓN INIT CORREGIDA - USA LA KEY CORRECTA
  function initAuth() {
    console.log('🔄 Inicializando autenticación...')
    console.log('this is user type: ', userType)
    try {
      const userData = localStorage.getItem('user') // ← KEY CORRECTA que usa tu frontend
      if (userData) {
        const parsedUser = JSON.parse(userData)
        
        // ✅ VALIDAR estructura del usuario
        if (parsedUser && parsedUser.tipo && parsedUser.id) {
          user.value = parsedUser;
          console.log(user.value.tipo);
          console.log("this is profile: ", profile);
          console.log('✅ Usuario restaurado:', parsedUser.fullname, `(${parsedUser.tipo})`)
          console.log('📊 IDs importantes:', {
            user_id: parsedUser.id,
            alumno_id: parsedUser.alumno_id,
            docente_id: parsedUser.docente_id
          })
        } else {
          console.warn('⚠️ Datos de usuario inválidos, limpiando localStorage')
          localStorage.removeItem('user')
        }
      }
    } catch (error) {
      console.error('❌ Error restaurando sesión:', error)
      localStorage.removeItem('user')
      user.value = null
    }
  }

  // ✅ LOGIN CORREGIDO - USA KEY CORRECTA
  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      console.log('🔐 Intentando login para:', credentials.email)
      
      const response = await apiService.login(credentials)
      
      if (!response.user || !response.user.tipo) {
        throw new Error('Respuesta del servidor inválida')
      }

      user.value = response.user
      console.log('this is user value: ', user.value)
      // ✅ USAR KEY CORRECTA 'user' (no 'iastories_user')
      localStorage.setItem('user', JSON.stringify(response.user))
      
      console.log('✅ Login exitoso:', response.user.nombre, `(${response.user.tipo})`)
      console.log('📊 IDs guardados:', {
        user_id: response.id,
        alumno_id: response.alumno_id,
        docente_id: response.docente_id
      })
      
      return response
      
    } catch (err) {
      console.error('❌ Error en login:', err)
      error.value = err.response?.data?.error || err.message || 'Error de conexión'
      user.value = null
      localStorage.removeItem('user')
      throw err
    } finally {
      loading.value = false
    }
  }

  // ✅ REGISTER CORREGIDO - USA KEY CORRECTA
  async function register(userData) {
    loading.value = true
    error.value = null

    try {
      console.log('📝 Registrando usuario:', userData.email, `(${userData.tipo})`)
      
      const response = await apiService.register(userData);
      console.log('this is response user: ', response)
      if (!response.id || !response.tipo) {
        throw new Error('Respuesta del servidor inválida')
      }



      user.value = response
      
      // ✅ USAR KEY CORRECTA 'user'
      localStorage.setItem('user', JSON.stringify(response))
      
      console.log('✅ Registro exitoso:', response.name, `(${response.tipo})`)

      
      return response
      
    } catch (err) {
      console.error('❌ Error en registro:', err)
      error.value = err.response?.data?.error || err.message || 'Error de conexión'
      user.value = null
      localStorage.removeItem('user')
      throw err
    } finally {
      loading.value = false
    }
  }

  // ✅ LOGOUT CORREGIDO - USA KEY CORRECTA
  function logout() {
    console.log('👋 Cerrando sesión...')
    user.value = null
    localStorage.removeItem('user')
    error.value = null
  }

  // ✅ FORGOT PASSWORD
  async function forgotPassword(email) {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 Solicitando recuperación de contraseña para:', email)
      const response = await apiService.forgotPassword(email)
      console.log('✅ Email de recuperación enviado')
      return response
    } catch (err) {
      console.error('❌ Error en recuperación:', err)
      error.value = err.response?.data?.error || 'Error enviando email'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ✅ UPDATE PROFILE
  async function updateProfile(userData) {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 Actualizando perfil del usuario:', user.value.id)
      
      const response = await apiService.updateUser(user.value.id, userData)
      
      user.value = { 
        ...user.value, 
        ...userData,
        id: response.user_id || user.value.id
      }
      
      // ✅ USAR KEY CORRECTA 'user'
      localStorage.setItem('user', JSON.stringify(user.value))
      console.log('✅ Perfil actualizado exitosamente')
      return response
      
    } catch (err) {
      console.error('❌ Error actualizando perfil:', err)
      error.value = err.response?.data?.error || 'Error actualizando perfil'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ✅ DELETE ACCOUNT
  async function deleteAccount() {
    loading.value = true
    error.value = null

    try {
      console.log('🗑️ Eliminando cuenta del usuario:', user.value.id)
      
      const response = await apiService.deleteUser(user.value.id)
      
      // Limpiar todo después de eliminar
      user.value = null
      localStorage.removeItem('user')
      
      console.log('✅ Cuenta eliminada exitosamente')
      return response
      
    } catch (err) {
      console.error('❌ Error eliminando cuenta:', err)
      error.value = err.response?.data?.error || 'Error eliminando cuenta'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ✅ MÉTODOS QUE TU LOGIN.VUE ESPERA
  async function checkConnection() {
    try {
      const response = await apiService.healthCheck()
      console.log('✅ Backend conectado:', response.status || 'OK')
      return true
    } catch (error) {
      console.error('❌ Sin conexión al backend:', error.message)
      return false
    }
  }

  function restoreSession() {
    console.log('🔄 Restaurando sesión...')
    
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        
        if (parsedUser && parsedUser.tipo && parsedUser.id) {
          user.value = parsedUser
          console.log('✅ Sesión restaurada:', parsedUser.nombre, `(${parsedUser.tipo})`)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('❌ Error restaurando sesión:', error)
      localStorage.removeItem('user')
      return false
    }
  }

  // ✅ MÉTODOS QUE TU LOGIN.VUE ESPERA
  async function checkConnection() {
    try {
      const response = await apiService.healthCheck()
      console.log('✅ Backend conectado:', response.status || 'OK')
      return true
    } catch (error) {
      console.error('❌ Sin conexión al backend:', error.message)
      return false
    }
  }

  function restoreSession() {
    console.log('🔄 Restaurando sesión...')
    
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        
        if (parsedUser && parsedUser.tipo && parsedUser.id) {
          user.value = parsedUser
          console.log('✅ Sesión restaurada:', parsedUser.nombre, `(${parsedUser.tipo})`)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('❌ Error restaurando sesión:', error)
      localStorage.removeItem('user')
      return false
    }
  }

  return {
    // Estado
    user,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    userType,
    isAlumno,
    isDocente,
    profile, // ← Agregado profile que tus componentes esperan
    
    // Métodos principales
    login,
    register,
    logout,
    forgotPassword,
    updateProfile,
    deleteAccount,
    
    // Métodos de sesión (que tu Login.vue espera)
    initAuth,
    restoreSession,
    checkConnection
  }
})