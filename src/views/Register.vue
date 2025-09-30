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
                @click="formData.tipo = 'student'"
                :class="['user-type-card', { active: formData.tipo === 'student' }]"
            >
              <div class="type-icon">👨‍🎓</div>
              <h3>Estudiante</h3>
              <p>Quiero crear y leer historias</p>
            </div>
            <div
                @click="formData.tipo = 'teacher'"
                :class="['user-type-card', { active: formData.tipo === 'teacher' }]"
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
        <div v-if="formData.tipo === 'student'" class="alumno-fields">
          <div class="input-group">
            <label for="birth_date">🎂 Fecha de nacimiento</label>
            <input
                id="birth_date"
                v-model="formData.birth_date"
                type="date"
                required
            />
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
        <div v-if="formData.tipo === 'teacher'" class="docente-fields">
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
            <label for="alma_mater">🎓 Alma Mater</label>
            <input
                id="alma_mater"
                v-model="formData.alma_mater"
                type="text"
                placeholder="Ejemplo: Universidad de Lima"
                required
            />
          </div>

          <div class="input-group">
            <label for="degree_level">📜 Nivel académico</label>
            <input
                id="degree_level"
                v-model="formData.degree_level"
                type="text"
                placeholder="Ejemplo: Licenciatura, Maestría"
                required
            />
          </div>

          <div class="input-group">
            <label for="degree_level">Especialización</label>
            <input
                id="degree_level"
                v-model="formData.major"
                type="text"
                placeholder="Ejemplo: Magister en Educación"
                required
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
      birth_date: '',   // cambiado de edad → birth_date (tipo date)
      grado: '',
      institucion: '',
      alma_mater: '',
      degree_level: '',
      major: ''
    })

    const gradosDisponibles = computed(() => [
      '1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria',
      '1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria'
    ])

    const isFormValid = computed(() => {
      const baseValid = formData.value.tipo && formData.value.nombre &&
          formData.value.email && formData.value.password

      if (formData.value.tipo === 'student') {
        return baseValid && formData.value.birth_date && formData.value.grado
      } else if (formData.value.tipo === 'teacher') {
        return baseValid && formData.value.institucion && formData.value.alma_mater && formData.value.degree_level && formData.value.major
      }

      return baseValid
    })

    onMounted(() => {
      authStore.clearError()
      if (authStore.isAuthenticated) redirectToDashboard()
    })

    const handleRegister = async () => {
      if (!isFormValid.value) {
        authStore.error = 'Por favor completa todos los campos requeridos'
        return
      }

      if (formData.value.password.length < 6) {
        authStore.error = 'La contraseña debe tener al menos 6 caracteres'
        return
      }

      try {
        const userData = {
          fullname: formData.value.nombre,
          email: formData.value.email,
          password: formData.value.password,
          tipo: formData.value.tipo
        }

        if (formData.value.tipo === 'student') {
          userData.student_profile = {
            birth_date: formData.value.birth_date,   // ahora se envía como fecha
            current_grade: formData.value.grado
          }
        } else if (formData.value.tipo === 'teacher') {
          userData.teacher_profile = {
            current_school: formData.value.institucion,
            alma_mater: formData.value.alma_mater,
            degree_level: formData.value.degree_level,
            major: formData.value.major
          }
        }
        console.log('this is userData: ', userData)
        await authStore.register(userData)
        redirectToDashboard()

      } catch (error) {
        console.error('❌ Error en registro:', error)
      }
    }

    const redirectToDashboard = () => {
      const userType = authStore.userType
      if (userType === 'student') router.push('/dashboard-alumno')
      else if (userType === 'teacher') router.push('/dashboard-docente')
    }

    return {
      formData,
      authStore,
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