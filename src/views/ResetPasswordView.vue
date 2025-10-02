<!-- src/views/ResetPasswordView.vue -->
<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <!-- ============================================ -->
      <!-- HEADER -->
      <!-- ============================================ -->
      <div class="reset-header">
        <div class="lock-icon">🔓</div>
        <h1>Nueva Contraseña</h1>
        <p>Crea una contraseña segura para tu cuenta</p>
      </div>

      <!-- ============================================ -->
      <!-- VALIDANDO TOKEN -->
      <!-- ============================================ -->
      <div v-if="validatingToken" class="validating">
        <div class="spinner"></div>
        <p>⏳ Verificando tu enlace...</p>
      </div>

      <!-- ============================================ -->
      <!-- TOKEN INVÁLIDO -->
      <!-- ============================================ -->
      <div v-else-if="tokenInvalido" class="error-section">
        <div class="error-icon">❌</div>
        <h2>Enlace no válido</h2>
        <p>Este enlace de recuperación ha expirado o no es válido.</p>
        
        <div class="error-actions">
          <router-link to="/forgot-password" class="btn btn-primary">
            🔄 Solicitar nuevo enlace
          </router-link>
          <router-link to="/login" class="btn btn-secondary">
            🔑 Ir al login
          </router-link>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- FORMULARIO PARA NUEVA CONTRASEÑA -->
      <!-- ============================================ -->
      <div v-else-if="!passwordCambiada" class="reset-form">
        <form @submit.prevent="handleResetPassword">
          <!-- Nueva contraseña -->
          <div class="input-group">
            <label for="password">🔐 Nueva Contraseña</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="formData.password"
                :type="mostrarPassword ? 'text' : 'password'"
                placeholder="Mínimo 6 caracteres"
                required
                minlength="6"
                @input="validarPassword"
              />
              <button 
                type="button" 
                class="toggle-password"
                @click="mostrarPassword = !mostrarPassword"
              >
                {{ mostrarPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            
            <!-- Indicador de fortaleza -->
            <div class="password-strength">
              <div class="strength-bar" :class="passwordStrength.class">
                <div class="strength-fill" :style="{ width: passwordStrength.width }"></div>
              </div>
              <small :class="passwordStrength.class">
                {{ passwordStrength.text }}
              </small>
            </div>
          </div>

          <!-- Confirmar contraseña -->
          <div class="input-group">
            <label for="confirmPassword">🔐 Confirma tu Contraseña</label>
            <div class="password-input-wrapper">
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="mostrarConfirm ? 'text' : 'password'"
                placeholder="Escribe la contraseña de nuevo"
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
            
            <!-- Validación de coincidencia -->
            <small 
              v-if="formData.confirmPassword" 
              :class="passwordsMatch ? 'text-success' : 'text-danger'"
            >
              {{ passwordsMatch ? '✅ Las contraseñas coinciden' : '❌ Las contraseñas no coinciden' }}
            </small>
          </div>

          <!-- Requisitos de contraseña -->
          <div class="password-requirements">
            <h4>📋 Tu contraseña debe tener:</h4>
            <ul>
              <li :class="{ valid: formData.password.length >= 6 }">
                {{ formData.password.length >= 6 ? '✅' : '⚪' }} Al menos 6 caracteres
              </li>
              <li :class="{ valid: tieneNumero }">
                {{ tieneNumero ? '✅' : '⚪' }} Al menos un número
              </li>
              <li :class="{ valid: tieneMayuscula }">
                {{ tieneMayuscula ? '✅' : '⚪' }} Al menos una mayúscula
              </li>
            </ul>
          </div>

          <!-- Error -->
          <div v-if="error" class="error-message">
            ❌ {{ error }}
          </div>

          <!-- Botón submit -->
          <button 
            type="submit" 
            class="btn-reset"
            :disabled="loading || !formularioValido"
          >
            <span v-if="loading">⏳ Cambiando contraseña...</span>
            <span v-else>🔓 Cambiar Contraseña</span>
          </button>
        </form>
      </div>

      <!-- ============================================ -->
      <!-- ÉXITO -->
      <!-- ============================================ -->
      <div v-else class="success-section">
        <div class="success-animation">
          <div class="checkmark">✓</div>
        </div>
        <h2>¡Contraseña Cambiada!</h2>
        <p>Tu contraseña ha sido actualizada exitosamente.</p>
        
        <div class="success-actions">
          <router-link to="/login" class="btn btn-primary">
            🚀 Ir al Login
          </router-link>
        </div>

        <!-- Contador de redirección -->
        <p class="redirect-text">
          Serás redirigido en {{ countdown }} segundos...
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

export default {
  name: 'ResetPasswordView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const toastStore = useToastStore()

    // ============================================
    // ESTADOS
    // ============================================
    const token = ref('')
    const validatingToken = ref(true)
    const tokenInvalido = ref(false)
    const loading = ref(false)
    const error = ref('')
    const passwordCambiada = ref(false)
    const countdown = ref(5)
    
    const mostrarPassword = ref(false)
    const mostrarConfirm = ref(false)

    const formData = ref({
      password: '',
      confirmPassword: ''
    })

    // ============================================
    // COMPUTED - VALIDACIONES
    // ============================================
    const tieneNumero = computed(() => /\d/.test(formData.value.password))
    const tieneMayuscula = computed(() => /[A-Z]/.test(formData.value.password))
    const passwordsMatch = computed(() => 
      formData.value.password === formData.value.confirmPassword && 
      formData.value.confirmPassword !== ''
    )

    const formularioValido = computed(() => 
      formData.value.password.length >= 6 &&
      passwordsMatch.value &&
      tieneNumero.value &&
      tieneMayuscula.value
    )

    const passwordStrength = computed(() => {
      const pwd = formData.value.password
      if (!pwd) return { class: '', width: '0%', text: '' }

      let strength = 0
      if (pwd.length >= 6) strength++
      if (pwd.length >= 8) strength++
      if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
      if (/\d/.test(pwd)) strength++
      if (/[^a-zA-Z0-9]/.test(pwd)) strength++

      if (strength <= 2) {
        return { 
          class: 'weak', 
          width: '33%', 
          text: '🔴 Débil' 
        }
      } else if (strength <= 3) {
        return { 
          class: 'medium', 
          width: '66%', 
          text: '🟡 Media' 
        }
      } else {
        return { 
          class: 'strong', 
          width: '100%', 
          text: '🟢 Fuerte' 
        }
      }
    })

    // ============================================
    // MÉTODOS
    // ============================================
    const validarPassword = () => {
      if (formData.value.password.length < 6) {
        error.value = 'La contraseña debe tener al menos 6 caracteres'
      } else if (!tieneNumero.value) {
        error.value = 'Debe incluir al menos un número'
      } else if (!tieneMayuscula.value) {
        error.value = 'Debe incluir al menos una mayúscula'
      } else {
        error.value = ''
      }
    }

    const validarToken = async () => {
      try {
        validatingToken.value = true
        
        // Obtener token de la URL
        token.value = route.query.token
        
        if (!token.value) {
          console.error('❌ No se encontró token en la URL')
          tokenInvalido.value = true
          toastStore.error('No se encontró el token de recuperación en la URL')
          return
        }

        console.log('🔍 Validando token con el backend:', token.value)

        await authStore.validateResetToken(token.value)
        
        console.log('✅ Token válido')
        tokenInvalido.value = false
        
      } catch (err) {
        console.error('❌ Token inválido:', err)
        tokenInvalido.value = true
        toastStore.error('El enlace de recuperación no es válido o ha expirado')
      } finally {
        validatingToken.value = false
      }
    }

    const handleResetPassword = async () => {
      // Validaciones finales
      if (!formularioValido.value) {
        error.value = 'Por favor completa todos los requisitos'
        return
      }

      loading.value = true
      error.value = ''

      try {
        console.log('🔐 Cambiando contraseña con token:', token.value)
        
        await authStore.resetPassword(token.value, formData.value.password)
        
        console.log('✅ Contraseña cambiada exitosamente')
        
        passwordCambiada.value = true
        toastStore.success('¡Tu contraseña ha sido cambiada exitosamente!')
        
        // Iniciar countdown para redirección
        startCountdown()
        
      } catch (err) {
        console.error('❌ Error cambiando contraseña:', err)
        error.value = err.response?.data?.error || 'Error al cambiar la contraseña'
        toastStore.error(error.value)
      } finally {
        loading.value = false
      }
    }

    const startCountdown = () => {
      const interval = setInterval(() => {
        countdown.value--
        
        if (countdown.value <= 0) {
          clearInterval(interval)
          router.push('/login')
        }
      }, 1000)
    }

    // ============================================
    // LIFECYCLE
    // ============================================
    onMounted(() => {
      console.log('🔓 Iniciando vista de reset password')
      validarToken()
    })

    return {
      formData,
      loading,
      error,
      validatingToken,
      tokenInvalido,
      passwordCambiada,
      countdown,
      mostrarPassword,
      mostrarConfirm,
      tieneNumero,
      tieneMayuscula,
      passwordsMatch,
      formularioValido,
      passwordStrength,
      validarPassword,
      handleResetPassword
    }
  }
}
</script>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.reset-password-card {
  background: white;
  border-radius: 25px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
  padding: 50px;
  width: 100%;
  max-width: 550px;
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

/* ============================================ */
/* HEADER */
/* ============================================ */
.reset-header {
  text-align: center;
  margin-bottom: 35px;
}

.lock-icon {
  font-size: 4rem;
  margin-bottom: 15px;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.reset-header h1 {
  color: #667eea;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.reset-header p {
  color: #666;
  font-size: 1.1rem;
}

/* ============================================ */
/* VALIDANDO TOKEN */
/* ============================================ */
.validating {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ============================================ */
/* FORMULARIO */
/* ============================================ */
.reset-form {
  margin-top: 30px;
}

.input-group {
  margin-bottom: 25px;
}

.input-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
  font-size: 1.1rem;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-group input {
  width: 100%;
  padding: 14px 45px 14px 15px;
  border: 2px solid #e1e8ed;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 5px;
  transition: transform 0.2s;
}

.toggle-password:hover {
  transform: scale(1.1);
}

/* ============================================ */
/* FORTALEZA DE CONTRASEÑA */
/* ============================================ */
.password-strength {
  margin-top: 10px;
}

.strength-bar {
  height: 8px;
  background: #e1e8ed;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 5px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 10px;
}

.password-strength small {
  font-weight: bold;
  font-size: 0.9rem;
}

.weak .strength-fill {
  background: linear-gradient(90deg, #ff6b6b, #ff8787);
}

.medium .strength-fill {
  background: linear-gradient(90deg, #feca57, #ff9ff3);
}

.strong .strength-fill {
  background: linear-gradient(90deg, #48dbfb, #0abde3);
}

.text-success {
  color: #28a745;
  font-weight: bold;
  display: block;
  margin-top: 5px;
}

.text-danger {
  color: #dc3545;
  font-weight: bold;
  display: block;
  margin-top: 5px;
}

/* ============================================ */
/* REQUISITOS */
/* ============================================ */
.password-requirements {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.password-requirements h4 {
  color: #667eea;
  margin-bottom: 12px;
  font-size: 1rem;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  padding: 6px 0;
  color: #666;
  transition: all 0.3s ease;
}

.password-requirements li.valid {
  color: #28a745;
  font-weight: bold;
}

/* ============================================ */
/* BOTONES */
/* ============================================ */
.btn-reset {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-reset:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.btn-reset:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn {
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #e1e8ed;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d7dd;
}

/* ============================================ */
/* MENSAJES DE ERROR */
/* ============================================ */
.error-message {
  background: #fee;
  color: #c33;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid #fcc;
  font-weight: bold;
}

.error-section {
  text-align: center;
  padding: 30px 20px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.error-section h2 {
  color: #dc3545;
  margin-bottom: 15px;
}

.error-section p {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

/* ============================================ */
/* SECCIÓN DE ÉXITO */
/* ============================================ */
.success-section {
  text-align: center;
  padding: 30px 20px;
}

.success-animation {
  margin-bottom: 25px;
}

.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  font-size: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: scaleIn 0.5s ease-out;
  box-shadow: 0 10px 30px rgba(17, 153, 142, 0.3);
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-section h2 {
  color: #11998e;
  margin-bottom: 15px;
  font-size: 2rem;
}

.success-section p {
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.success-actions {
  margin-bottom: 20px;
}

.redirect-text {
  color: #999;
  font-size: 0.95rem;
  font-style: italic;
}

/* ============================================ */
/* RESPONSIVE */
/* ============================================ */
@media (max-width: 768px) {
  .reset-password-card {
    padding: 35px 25px;
  }
  
  .reset-header h1 {
    font-size: 2rem;
  }
  
  .lock-icon {
    font-size: 3rem;
  }
}

@media (max-width: 480px) {
  .reset-password-container {
    padding: 10px;
  }
  
  .reset-password-card {
    padding: 25px 20px;
  }
  
  .reset-header h1 {
    font-size: 1.8rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>