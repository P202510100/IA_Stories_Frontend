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
  const isAlumno = computed(() => userType.value === 'alumno')
  const isDocente = computed(() => userType.value === 'docente')
  
  // ✅ PROFILE que tus componentes esperan
  const profile = computed(() => {
    if (!user.value) return null
    
    // Para docentes, usar docente_id como id
    if (user.value.tipo === 'docente') {
      return {
        id: user.value.docente_id,
        user_id: user.value.id,
        nombre: user.value.nombre,
        email: user.value.email,
        institucion: user.value.institucion
      }
    }
    
    // Para alumnos, usar alumno_id como id  
    if (user.value.tipo === 'alumno') {
      return {
        id: user.value.alumno_id,
        user_id: user.value.id,
        nombre: user.value.nombre,
        email: user.value.email,
        edad: user.value.edad,
        grado: user.value.grado,
        intereses: user.value.intereses
      }
    }
    
    return null
  })

  // ✅ FUNCIÓN INIT CORREGIDA - USA LA KEY CORRECTA
  function initAuth() {
    console.log('🔄 Inicializando autenticación...')
    
    try {
      const userData = localStorage.getItem('user') // ← KEY CORRECTA que usa tu frontend
      if (userData) {
        const parsedUser = JSON.parse(userData)
        
        // ✅ VALIDAR estructura del usuario
        if (parsedUser && parsedUser.tipo && parsedUser.id) {
          user.value = parsedUser
          console.log('✅ Usuario restaurado:', parsedUser.nombre, `(${parsedUser.tipo})`)
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
      
      // ✅ USAR KEY CORRECTA 'user' (no 'iastories_user')
      localStorage.setItem('user', JSON.stringify(response.user))
      
      console.log('✅ Login exitoso:', response.user.nombre, `(${response.user.tipo})`)
      console.log('📊 IDs guardados:', {
        user_id: response.user.id,
        alumno_id: response.user.alumno_id,
        docente_id: response.user.docente_id
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
      
      const response = await apiService.register(userData)
      
      if (!response.user || !response.user.tipo) {
        throw new Error('Respuesta del servidor inválida')
      }
      
      user.value = response.user
      
      // ✅ USAR KEY CORRECTA 'user'
      localStorage.setItem('user', JSON.stringify(response.user))
      
      console.log('✅ Registro exitoso:', response.user.nombre, `(${response.user.tipo})`)
      console.log('📊 IDs guardados:', {
        user_id: response.user.id,
        alumno_id: response.user.alumno_id,
        docente_id: response.user.docente_id
      })
      
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

  async function resetPassword(token, newPassword) {
    loading.value = true
    error.value = null

    try {
      console.log('🔐 Restableciendo contraseña con token...')
      
      const response = await apiService.resetPassword(token, newPassword)
      
      console.log('✅ Contraseña restablecida exitosamente')
      return response
      
    } catch (err) {
      console.error('❌ Error restableciendo contraseña:', err)
      error.value = err.response?.data?.error || 'Error al restablecer la contraseña'
      throw err
    } finally {
      loading.value = false
    }
  }


async function validateResetToken(token) {
    try {
      console.log('🔍 Validando token de reset...')
      const response = await apiService.validateResetToken(token)
      console.log('✅ Token válido')
      return response
    } catch (err) {
      console.error('❌ Token inválido:', err)
      throw err
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
    resetPassword,        
    validateResetToken,
    
    // Métodos de sesión (que tu Login.vue espera)
    initAuth,
    restoreSession,
    checkConnection
  }
})