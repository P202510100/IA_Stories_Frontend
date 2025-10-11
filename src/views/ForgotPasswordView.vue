<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <div class="forgot-password-header">
        <h1>🔑 Recuperar Contraseña</h1>
        <p>Te enviaremos instrucciones para restablecer tu contraseña</p>
      </div>
      
      <!-- Formulario para solicitar recuperación -->
      <!-- ======================= -->
      <!-- PASO 1: INGRESAR CORREO -->
      <!-- ======================= -->
      <div v-if="!correoVerificado && !passwordCambiada" class="forgot-password-form">
        <input
            v-model="formData.email"
            type="email"
            placeholder="📧 tu-email@ejemplo.com"
            required
        />
        <button
            class="btn btn-primary"
            :disabled="loading || !formData.email"
            @click="verificarCorreo"
        >
          {{ loading ? '⏳ Verificando...' : 'Continuar' }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="back-to-login">
          <p>¿Recordaste tu contraseña?</p>
          <router-link to="/login" class="btn-login">🔑 Iniciar Sesión</router-link>
        </div>
      </div>

      <!-- ======================= -->
      <!-- PASO 2: NUEVA CONTRASEÑA -->
      <!-- ======================= -->
      <div v-else-if="correoVerificado && !passwordCambiada" class="reset-section">
        <h2>🔐 Nueva Contraseña</h2>

        <div class="password-wrapper">
          <input
              v-model="formData.password"
              :type="mostrarPassword ? 'text' : 'password'"
              placeholder="Nueva contraseña"
              required
              minlength="6"
          />
          <button
              type="button"
              class="toggle-password"
              @click="mostrarPassword = !mostrarPassword"
          >
            {{ mostrarPassword ? '🙈' : '👁️' }}
          </button>
        </div>

        <div class="password-wrapper">
          <input
              v-model="formData.confirmPassword"
              :type="mostrarConfirm ? 'text' : 'password'"
              placeholder="Confirmar contraseña"
              required
              minlength="6"
          />
          <button
              type="button"
              class="toggle-password"
              @click="mostrarConfirm = !mostrarConfirm"
          >
            {{ mostrarConfirm ? '🙈' : '👁️' }}
          </button>
        </div>

        <small v-if="formData.confirmPassword" :class="passwordsMatch ? 'text-success' : 'text-danger'">
          {{ passwordsMatch ? '✅ Coinciden' : '❌ No coinciden' }}
        </small>

        <button
            class="btn btn-primary"
            :disabled="loading || !formularioValido"
            @click="cambiarPassword"
        >
          {{ loading ? '⏳ Cambiando...' : 'Cambiar Contraseña' }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>
      </div>

      <!-- ======================= -->
      <!-- PASO 3: ÉXITO -->
      <!-- ======================= -->
      <div v-else class="success-section">
        <div class="success-icon">✅</div>
        <h2>¡Contraseña Actualizada!</h2>
        <p>Tu nueva contraseña ha sido guardada correctamente.</p>
        <router-link to="/login" class="btn btn-primary">🔑 Ir al Login</router-link>
      </div>

    </div>
  </div>
</template>

<script>
import {ref, onMounted, computed} from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import apiService from '../services/api'

export default {
  name: 'ForgotPasswordView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const formData = ref({
      email: '',
      password: '',
      confirmPassword: ''
    })

    const loading = ref(false)
    const correoVerificado = ref(false)
    const passwordCambiada = ref(false)
    const error = ref('')
    const mostrarPassword = ref(false)
    const mostrarConfirm = ref(false)

    // Computed
    const passwordsMatch = computed(() => formData.value.password === formData.value.confirmPassword)
    const formularioValido = computed(() =>
        formData.value.password.length >= 6 && passwordsMatch.value
    )

    // Verificar si el correo existe
    async function verificarCorreo() {
      console.log('verificando1')
      try {
        console.log('verificando2')
        loading.value = true
        error.value = ''
        const res = await apiService.verifyEmail({ email: formData.value.email })
        console.log('verifica: ', res)
        if (res.exists) {
          correoVerificado.value = true
        }
      } catch (err) {
        error.value = err.response?.data?.detail || '❌ No existe una cuenta con ese correo.'
      } finally {
        loading.value = false
      }
    }

// Cambiar la contraseña
    async function cambiarPassword() {
      if (!formularioValido.value) {
        error.value = 'Por favor completa correctamente los campos.'
        return
      }

      try {
        loading.value = true
        error.value = ''
        await apiService.resetPassword({
          email: formData.value.email,
          new_password: formData.value.password
        })
        passwordCambiada.value = true
      } catch (err) {
        error.value = err.response?.data?.detail || '❌ Error al cambiar la contraseña.'
      } finally {
        loading.value = false
      }
    }


    return {
      formData,
      loading,
      error,
      verificarCorreo,
      cambiarPassword,
      mostrarPassword,
      mostrarConfirm,
      passwordsMatch,
      formularioValido,
      correoVerificado,
      passwordCambiada
    }
  }
}
</script>

<style scoped>

.password-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
}

.password-wrapper input {
  width: 100%;
  padding: 0.8rem 2.5rem 0.8rem 1rem; /* espacio extra a la derecha para el ícono */
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
  box-sizing: border-box;
}

.password-wrapper input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  transition: transform 0.2s, color 0.2s;
}

.toggle-password:hover {
  color: #333;
  transform: translateY(-50%) scale(1.1);
}
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f9fafb;
}
.forgot-password-card {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  width: 380px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}
input {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.btn {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.error {
  color: #dc3545;
  margin-top: 0.5rem;
}
.text-success {
  color: #28a745;
}
.text-danger {
  color: #dc3545;
}
.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
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