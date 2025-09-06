<!-- views/ForgotPasswordView.vue - INTEGRADO 100% CON EL BACKEND -->
<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <div class="forgot-password-header">
        <h1>🔑 Recuperar Contraseña</h1>
        <p>Te enviaremos instrucciones para restablecer tu contraseña</p>
      </div>
      
      <!-- Formulario para solicitar recuperación -->
      <div v-if="!emailEnviado" class="forgot-password-form">
        <form @submit.prevent="handleForgotPassword">
          <div class="input-group">
            <label for="email">📧 Email de tu cuenta</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="tu-email@ejemplo.com"
              required
            />
            <small class="help-text">
              Ingresa el email que usaste para registrarte
            </small>
          </div>
          
          <div v-if="error" class="error">
            {{ error }}
          </div>
          
          <button type="submit" class="btn-enviar" :disabled="loading || !formData.email">
            <span v-if="loading">⏳ Enviando...</span>
            <span v-else>📤 Enviar Instrucciones</span>
          </button>
        </form>

        <div class="back-to-login">
          <p>¿Recordaste tu contraseña?</p>
          <router-link to="/login" class="btn-login">
            🔑 Iniciar Sesión
          </router-link>
        </div>
      </div>

      <!-- Confirmación de envío -->
      <div v-else class="success-message">
        <div class="success-icon">✅</div>
        <h2>¡Email enviado!</h2>
        <p>
          Hemos enviado las instrucciones para restablecer tu contraseña a:
        </p>
        <div class="email-sent">{{ formData.email }}</div>
        
        <div class="instructions">
          <h3>📋 Próximos pasos:</h3>
          <ol>
            <li>Revisa tu bandeja de entrada</li>
            <li>Busca el email de IAStories</li>
            <li>Haz clic en el enlace de recuperación</li>
            <li>Crea tu nueva contraseña</li>
          </ol>
        </div>

        <div class="additional-help">
          <div class="help-box">
            <h4>🔍 ¿No encuentras el email?</h4>
            <ul>
              <li>Revisa tu carpeta de spam o correo no deseado</li>
              <li>Verifica que escribiste bien tu email</li>
              <li>El email puede tardar unos minutos en llegar</li>
            </ul>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="enviarNuevamente" class="btn-reenviar" :disabled="loadingReenvio">
            <span v-if="loadingReenvio">⏳ Reenviando...</span>
            <span v-else>🔄 Reenviar Email</span>
          </button>
          
          <router-link to="/login" class="btn-login">
            🔑 Volver al Login
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'ForgotPasswordView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const formData = ref({
      email: ''
    })
    
    const loading = ref(false)
    const loadingReenvio = ref(false)
    const error = ref(null)
    const emailEnviado = ref(false)

    // ============================================================================
    // 🚀 LIFECYCLE
    // ============================================================================
    
    onMounted(() => {
      console.log('🔑 Iniciando página de recuperación de contraseña...')
      
      // Limpiar errores previos
      error.value = null
      
      // Si ya está autenticado, redirigir
      if (authStore.isAuthenticated) {
        console.log('✅ Usuario ya autenticado, redirigiendo...')
        
        if (authStore.userType === 'alumno') {
          router.push('/dashboard-alumno')
        } else if (authStore.userType === 'docente') {
          router.push('/dashboard-docente')
        }
      }
    })

    // ============================================================================
    // 🔑 RECUPERACIÓN DE CONTRASEÑA - SOLO BACKEND REAL
    // ============================================================================
    
    const handleForgotPassword = async () => {
      // Validación básica
      if (!formData.value.email || !formData.value.email.includes('@')) {
        error.value = 'Por favor ingresa un email válido'
        return
      }

      loading.value = true
      error.value = null

      try {
        console.log('🔑 Solicitando recuperación de contraseña...')
        
        // Llamada real al backend - SIN FALLBACKS
        await authStore.forgotPassword(formData.value.email)
        
        console.log('✅ Solicitud de recuperación enviada')
        
        // Mostrar confirmación
        emailEnviado.value = true
        
      } catch (err) {
        console.error('❌ Error en recuperación:', err)
        
        // Manejar diferentes tipos de error
        if (err.response?.status === 404) {
          error.value = 'No encontramos una cuenta con ese email'
        } else if (err.response?.status === 429) {
          error.value = 'Has solicitado demasiadas recuperaciones. Intenta más tarde'
        } else {
          error.value = err.response?.data?.error || 'Error enviando el email de recuperación'
        }
      } finally {
        loading.value = false
      }
    }

    const enviarNuevamente = async () => {
      loadingReenvio.value = true

      try {
        console.log('🔄 Reenviando email de recuperación...')
        
        await authStore.forgotPassword(formData.value.email)
        
        console.log('✅ Email reenviado')
        
      } catch (err) {
        console.error('❌ Error reenviando email:', err)
        error.value = 'Error reenviando el email'
      } finally {
        loadingReenvio.value = false
      }
    }

    return {
      formData,
      loading,
      loadingReenvio,
      error,
      emailEnviado,
      handleForgotPassword,
      enviarNuevamente
    }
  }
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.forgot-password-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 30px;
}

.forgot-password-header h1 {
  color: #667eea;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.forgot-password-header p {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.5;
}

.forgot-password-form {
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 25px;
}

.input-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
  font-size: 1rem;
}

.input-group input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.help-text {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-top: 5px;
  font-style: italic;
}

.error {
  background: #fee;
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #fcc;
  font-size: 0.9rem;
}

.btn-enviar {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-enviar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-enviar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.back-to-login {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.back-to-login p {
  color: #666;
  margin-bottom: 15px;
}

.btn-login {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: bold;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

.success-message {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #28a745;
}

.success-message h2 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 15px;
}

.success-message p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 20px;
  line-height: 1.5;
}

.email-sent {
  background: #e7f3ff;
  color: #0c5460;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: bold;
  margin-bottom: 30px;
  border: 1px solid #b8e7ff;
}

.instructions {
  text-align: left;
  background: #f8f9fa;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 30px;
  border: 1px solid #e9ecef;
}

.instructions h3 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.instructions ol {
  color: #333;
  line-height: 1.6;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
}

.additional-help {
  margin-bottom: 30px;
}

.help-box {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 10px;
  padding: 20px;
  text-align: left;
}

.help-box h4 {
  color: #856404;
  margin-bottom: 12px;
  font-size: 1rem;
}

.help-box ul {
  color: #856404;
  line-height: 1.5;
  padding-left: 20px;
}

.help-box li {
  margin-bottom: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-reenviar {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #8b4513;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reenviar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(252, 182, 159, 0.4);
}

.btn-reenviar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .forgot-password-card {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .forgot-password-header h1 {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .forgot-password-container {
    padding: 10px;
  }
  
  .forgot-password-card {
    padding: 25px 15px;
  }
  
  .forgot-password-header h1 {
    font-size: 1.8rem;
  }
}
</style>