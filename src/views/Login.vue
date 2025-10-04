
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>🚀 IAStories</h1>
        <p>Inicia sesión para continuar tu aventura</p>
      </div>

      <!-- Mostrar errores del backend -->
      <div v-if="authStore.error" class="error-message">
         {{ authStore.error }}
      </div>

      <!-- Formulario de login -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">📧 Email:</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="tu@email.com"
            required
            :disabled="authStore.loading"
          />
        </div>

        <div class="form-group">
          <label for="password">🔒 Contraseña:</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="Tu contraseña"
            required
            :disabled="authStore.loading"
          />
        </div>

        <button 
          type="submit" 
          class="login-btn"
          :disabled="authStore.loading || !isFormValid"
        >
          <span v-if="authStore.loading">⏳ Iniciando sesión...</span>
          <span v-else>🚀 Iniciar Sesión</span>
        </button>
      </form>

      <!-- Enlaces adicionales -->
      <div class="login-footer">
        <router-link to="/forgot-password" class="forgot-link">
          🔄 ¿Olvidaste tu contraseña?
        </router-link>
        
        <div class="register-link">
          ¿No tienes cuenta? 
          <router-link to="/register">📝 Regístrate aquí</router-link>
        </div>
      </div>

      <!-- Estado de conexión del backend -->
      <div class="connection-status">
        <div v-if="backendStatus === 'connected'" class="status-ok">
          ✅ Conectado al servidor
        </div>
        <div v-else-if="backendStatus === 'checking'" class="status-checking">
          🔄 Verificando conexión...
        </div>
        <div v-else class="status-error">
          ❌ Sin conexión al servidor
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    // Estados reactivos
    const formData = ref({
      email: '',
      password: ''
    })
    
    const backendStatus = ref('checking')

    // Computed properties
    const isFormValid = computed(() => {
      return formData.value.email && 
             formData.value.password && 
             formData.value.email.includes('@')
    })

    
    const handleLogin = async () => {
      try {
        console.log('🔐 Iniciando proceso de login...')
        
        // Limpiar errores previos
        authStore.clearError()
        
        
        const response = await authStore.login({
          email: formData.value.email,
          password: formData.value.password
        })
        
        console.log('✅ Login exitoso:', response)
        
        // ✅ REDIRIGIR según el tipo de usuario del backend
        redirectToDashboard()
        
      } catch (error) {
        console.error('❌ Error en login:', error)
        // El error ya está manejado en el store
      }
    }

    const redirectToDashboard = () => {

      console.log('this is authstore: ', authStore.user.fullname)

      const userType = authStore.user?.tipo
      
      if (userType === 'student') {
        console.log('🎓 Redirigiendo a dashboard de alumno')
        router.push('/dashboard-alumno')
      } else if (userType === 'teacher') {
        console.log('👨‍🏫 Redirigiendo a dashboard de docente')
        router.push('/dashboard-docente')
      } else {
        console.error('❌ Tipo de usuario no reconocido:', userType)
        authStore.clearError()
      }
    }

   
    const checkBackendConnection = async () => {
      try {
        backendStatus.value = 'checking'
        
      
        const isConnected = await authStore.checkConnection()
        
        if (isConnected) {
          backendStatus.value = 'connected'
          console.log('✅ Backend conectado y funcional')
        } else {
          backendStatus.value = 'error'
          console.warn('⚠️ Backend no responde')
        }
        
      } catch (error) {
        backendStatus.value = 'error'
        console.error('❌ Error verificando backend:', error)
      }
    }

    
    const checkExistingSession = () => {
      if (authStore.restoreSession()) {
        console.log('✅ Sesión restaurada, redirigiendo...')
        redirectToDashboard()
      }
    }

    // Lifecycle hooks
    onMounted(() => {
       console.log('🔄 Componente Login montado')
  checkBackendConnection()

  //  VERIFICAR PARÁMETROS DE URL ANTES DE VERIFICAR SESIÓN
  const urlParams = new URLSearchParams(window.location.search)
  const forceLogin = urlParams.get('force') === 'true'
  
  console.log('🔍 Login: URL actual:', window.location.href)
  console.log('🔍 Login: force parámetro:', forceLogin)
  
  if (forceLogin) {
    console.log('🔒 Login: force=true detectado, limpiando sesión y mostrando formulario')
    
    // Limpiar cualquier sesión existente
    authStore.logout()
    
    // Limpiar parámetros de URL para evitar loops infinitos
    const newUrl = window.location.pathname
    window.history.replaceState({}, document.title, newUrl)
    console.log('🧹 Login: URL limpiada a:', newUrl)
    
  } else {
    console.log('🔍 Login: No hay force=true, verificando sesión existente...')
    checkExistingSession()
  }
    })

    return {
      // Data
      formData,
      backendStatus,
      
      // Stores
      authStore,
      
      // Computed
      isFormValid,
      
      // Methods
      handleLogin
    }
  }
}
</script>

<style scoped>

.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-header h1 {
  color: #667eea;
  font-size: 2.5em;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
  margin-bottom: 30px;
}

.error-message {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  border-left: 4px solid #f44336;
}

.login-form {
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  margin-top: 30px;
  text-align: center;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  display: block;
  margin-bottom: 15px;
}

.forgot-link:hover {
  text-decoration: underline;
}

.register-link {
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

.connection-status {
  margin-top: 20px;
  font-size: 12px;
}

.status-ok {
  color: #4caf50;
}

.status-checking {
  color: #ff9800;
}

.status-error {
  color: #f44336;
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .login-header h1 {
    font-size: 2em;
  }
}
</style>