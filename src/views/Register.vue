
<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>✨ Únete a IAStories</h1>
        <p>Crea tu cuenta y comienza tu aventura</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Tipo de usuario -->
        <div class="input-group">
          <label>👤 ¿Quién eres?</label>
          <div class="user-type-selection">
            <div 
              @click="formData.tipo = 'alumno'"
              :class="['user-type-card', { active: formData.tipo === 'alumno' }]"
            >
              <div class="type-icon">👨‍🎓</div>
              <h3>Estudiante</h3>
              <p>Quiero crear y leer historias</p>
            </div>
            <div 
              @click="formData.tipo = 'docente'"
              :class="['user-type-card', { active: formData.tipo === 'docente' }]"
            >
              <div class="type-icon">👨‍🏫</div>
              <h3>Docente</h3>
              <p>Quiero gestionar estudiantes</p>
            </div>
          </div>
        </div>

        <!-- Información básica -->
        <div class="input-group">
          <label for="nombre">📝 Nombre completo</label>
          <input
            id="nombre"
            v-model="formData.nombre"
            type="text"
            placeholder="Tu nombre completo"
            required
          />
        </div>
        
        <div class="input-group">
          <label for="email">📧 Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="tu-email@ejemplo.com"
            required
          />
        </div>
        
        <div class="input-group">
          <label for="password">🔒 Contraseña</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            required
            minlength="6"
          />
        </div>

        <!-- Campos específicos para alumnos -->
        <div v-if="formData.tipo === 'alumno'" class="alumno-fields">
          <div class="input-group">
            <label for="edad">🎂 Edad</label>
            <select id="edad" v-model="formData.edad" required>
              <option value="">Selecciona tu edad</option>
              <option v-for="edad in edadesDisponibles" :key="edad" :value="edad">
                {{ edad }} años
              </option>
            </select>
          </div>
          
          <div class="input-group">
            <label for="grado">🏫 Grado escolar</label>
            <select id="grado" v-model="formData.grado" required>
              <option value="">Selecciona tu grado</option>
              <option v-for="grado in gradosDisponibles" :key="grado" :value="grado">
                {{ grado }}
              </option>
            </select>
          </div>
        </div>

        <!-- Campos específicos para docentes -->
        <div v-if="formData.tipo === 'docente'" class="docente-fields">
          <div class="input-group">
            <label for="institucion">🏫 Institución educativa</label>
            <input
              id="institucion"
              v-model="formData.institucion"
              type="text"
              placeholder="Nombre de tu colegio/escuela"
              required
            />
          </div>
          
          <div class="input-group">
            <label for="materia">📚 Materia principal</label>
            <input
              id="materia"
              v-model="formData.materia"
              type="text"
              placeholder="Ejemplo: Español, Matemáticas, etc."
            />
          </div>
        </div>
        
        <div v-if="authStore.error" class="error">
          {{ authStore.error }}
        </div>
        
        <button type="submit" class="btn-register" :disabled="!isFormValid || authStore.loading">
          <span v-if="authStore.loading">⏳ Creando cuenta...</span>
          <span v-else>🚀 Crear Mi Cuenta</span>
        </button>
      </form>
      
      <div class="register-footer">
        <p>¿Ya tienes cuenta?</p>
        <router-link to="/login" class="btn-login">
          🔑 Iniciar Sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const formData = ref({
      tipo: '',
      nombre: '',
      email: '',
      password: '',
      edad: '',
      grado: '',
      institucion: '',
      materia: ''
    })

    // Computed properties
    const edadesDisponibles = computed(() => {
      const edades = []
      for (let i = 5; i <= 18; i++) {
        edades.push(i)
      }
      return edades
    })

    const gradosDisponibles = computed(() => [
      '1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria',
      '1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria'
    ])

    const isFormValid = computed(() => {
      const baseValid = formData.value.tipo && formData.value.nombre && 
                       formData.value.email && formData.value.password

      if (formData.value.tipo === 'alumno') {
        return baseValid && formData.value.edad && formData.value.grado
      } else if (formData.value.tipo === 'docente') {
        return baseValid && formData.value.institucion
      }

      return baseValid
    })

    // ============================================================================
    // 🚀 LIFECYCLE
    // ============================================================================
    
    onMounted(() => {
      console.log('📝 Iniciando página de registro...')
      
      // Limpiar errores previos
      authStore.clearError()
      
      // Si ya está autenticado, redirigir
      if (authStore.isAuthenticated) {
        console.log('✅ Usuario ya autenticado, redirigiendo...')
        redirectToDashboard()
      }
    })

    // ============================================================================
    // 📝 REGISTRO - SOLO BACKEND REAL
    // ============================================================================
    
    const handleRegister = async () => {
      // Validación adicional
      if (!isFormValid.value) {
        authStore.error = 'Por favor completa todos los campos requeridos'
        return
      }

      if (formData.value.password.length < 6) {
        authStore.error = 'La contraseña debe tener al menos 6 caracteres'
        return
      }

      try {
        console.log('📝 Registrando usuario con backend real...')
        
        // Preparar datos para el backend
        const userData = {
          nombre: formData.value.nombre,
          email: formData.value.email,
          password: formData.value.password,
          tipo: formData.value.tipo
        }

        // Agregar campos específicos según el tipo
        if (formData.value.tipo === 'alumno') {
          userData.edad = parseInt(formData.value.edad)
          userData.grado = formData.value.grado
        } else if (formData.value.tipo === 'docente') {
          userData.institucion = formData.value.institucion
          userData.materia = formData.value.materia || null
        }

        console.log('📊 Datos del registro:', userData)
        
        // Registro usando solo el backend - SIN FALLBACKS
        await authStore.register(userData)
        
        console.log('✅ Registro exitoso')
        
        // Redirigir según el tipo de usuario
        redirectToDashboard()
        
      } catch (error) {
        console.error('❌ Error en registro:', error)
        // El error ya está manejado en el store
      }
    }

    const redirectToDashboard = () => {
      const userType = authStore.userType
      
      if (userType === 'alumno') {
        console.log('🎓 Redirigiendo a dashboard de alumno')
        router.push('/dashboard-alumno')
      } else if (userType === 'docente') {
        console.log('👨‍🏫 Redirigiendo a dashboard de docente')
        router.push('/dashboard-docente')
      } else {
        console.error('❌ Tipo de usuario no reconocido:', userType)
        authStore.error = 'Tipo de usuario no válido'
      }
    }

    return {
      formData,
      authStore,
      edadesDisponibles,
      gradosDisponibles,
      isFormValid,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  padding: 40px;
  width: 100%;
  max-width: 600px;
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

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #667eea;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.register-header p {
  color: #666;
  font-size: 1.1rem;
}

.register-form {
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 25px;
}

.input-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
  font-size: 1rem;
}

.user-type-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.user-type-card {
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.user-type-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}

.user-type-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.type-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.user-type-card h3 {
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.user-type-card p {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.alumno-fields,
.docente-fields {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 15px;
  margin-top: 20px;
  border: 1px solid #e9ecef;
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

.btn-register {
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

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-register:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.register-footer {
  text-align: center;
}

.register-footer p {
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

@media (max-width: 768px) {
  .register-card {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .register-header h1 {
    font-size: 2rem;
  }
  
  .user-type-selection {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 10px;
  }
  
  .register-card {
    padding: 25px 15px;
  }
  
  .register-header h1 {
    font-size: 1.8rem;
  }
}
</style>