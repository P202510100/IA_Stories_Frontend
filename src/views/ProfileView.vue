
<template>
  <div class="profile-container">
    <div class="container">
      
      <!-- Header del perfil -->
      <div class="profile-header">
        <div class="header-content">
          <div class="user-avatar-large">
            {{ getUserInitials(user?.nombre) }}
          </div>
          <div class="user-info">
            <h1>Mi Perfil</h1>
            <p class="user-subtitle">{{ user?.email }}</p>
            <div class="user-badge">
              <span class="badge-icon">{{ userTypeIcon }}</span>
              <span class="badge-text">{{ userTypeText }}</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button @click="volverDashboard" class="btn btn-secondary">
            ← Volver al Dashboard
          </button>
        </div>
      </div>

      <!-- Información Personal -->
      <div class="profile-section">
        <div class="section-card">
          <div class="section-header">
            <h2>👤 Información Personal</h2>
            <button 
              v-if="!editandoInfo" 
              @click="habilitarEdicionInfo" 
              class="btn btn-outline"
            >
              ✏️ Editar
            </button>
          </div>
          
          <form v-if="editandoInfo" @submit.prevent="actualizarInformacion" class="form-grid">
            <div class="input-group">
              <label for="nombre">👤 Nombre completo</label>
              <input
                id="nombre"
                v-model="formData.nombre"
                type="text"
                required
                minlength="2"
                placeholder="Ingresa tu nombre completo"
              />
            </div>
            
            <div class="input-group">
              <label for="email">📧 Correo electrónico</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                placeholder="tu@email.com"
              />
            </div>
            
            <div v-if="isAlumno" class="input-group">
              <label for="edad">🎂 Edad</label>
              <input
                id="edad"
                v-model="formData.edad"
                type="number"
                min="6"
                max="18"
                placeholder="Tu edad en años"
              />
            </div>
            
            <div v-if="isDocente" class="input-group">
              <label for="institucion">🏫 Institución</label>
              <input
                id="institucion"
                v-model="formData.institucion"
                type="text"
                placeholder="Nombre de tu institución educativa"
              />
            </div>
            
            <div v-if="isDocente" class="input-group">
              <label for="grado">📚 Grado/Nivel que enseñas</label>
              <select id="grado" v-model="formData.grado">
                <option value="">Selecciona un grado</option>
                <option v-for="grado in gradosDisponibles" :key="grado.value" :value="grado.value">
                  {{ grado.label }}
                </option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="guardandoInfo">
                <span v-if="guardandoInfo">💾 Guardando...</span>
                <span v-else>💾 Guardar Cambios</span>
              </button>
              <button type="button" @click="cancelarEdicionInfo" class="btn btn-secondary">
                ❌ Cancelar
              </button>
            </div>
          </form>
          
          <!-- Vista de solo lectura -->
          <div v-else class="info-display">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">👤 Nombre:</span>
                <span class="info-value">{{ user?.nombre || 'No especificado' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📧 Email:</span>
                <span class="info-value">{{ user?.email || 'No especificado' }}</span>
              </div>
              <div v-if="isAlumno && profile?.edad" class="info-item">
                <span class="info-label">🎂 Edad:</span>
                <span class="info-value">{{ profile.edad }} años</span>
              </div>
              <div v-if="isDocente && profile?.institucion" class="info-item">
                <span class="info-label">🏫 Institución:</span>
                <span class="info-value">{{ profile.institucion }}</span>
              </div>
              <div v-if="isDocente && profile?.grado" class="info-item">
                <span class="info-label">📚 Nivel:</span>
                <span class="info-value">{{ getGradoLabel(profile.grado) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📅 Miembro desde:</span>
                <span class="info-value">{{ formatDate(user?.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Intereses (solo para alumnos) -->
      <div v-if="isAlumno" class="profile-section">
        <div class="section-card">
          <div class="section-header">
            <h2>🎯 Mis Intereses</h2>
            <button 
              v-if="!editandoIntereses" 
              @click="habilitarEdicionIntereses" 
              class="btn btn-outline"
            >
              ✏️ Editar
            </button>
          </div>
          
          <div v-if="editandoIntereses" class="intereses-editor">
            <p class="editor-description">
              Selecciona tus temas favoritos para recibir historias personalizadas:
            </p>
            
            <div class="intereses-grid">
              <div
                v-for="interes in interesesDisponibles"
                :key="interes.id"
                @click="toggleInteres(interes.id)"
                class="interes-card"
                :class="{ 'selected': interesesSeleccionados.includes(interes.id) }"
              >
                <div class="interes-emoji">{{ interes.emoji }}</div>
                <h3 class="interes-nombre">{{ interes.nombre }}</h3>
                <p class="interes-descripcion">{{ interes.descripcion }}</p>
                <div class="interes-checkbox">
                  <span v-if="interesesSeleccionados.includes(interes.id)">✅</span>
                  <span v-else>⭕</span>
                </div>
              </div>
            </div>
            
            <div class="intereses-actions">
              <button @click="guardarIntereses" class="btn btn-primary" :disabled="guardandoIntereses">
                <span v-if="guardandoIntereses">💾 Guardando...</span>
                <span v-else">💾 Guardar Intereses</span>
              </button>
              <button @click="cancelarEdicionIntereses" class="btn btn-secondary">
                ❌ Cancelar
              </button>
            </div>
          </div>
          
          <!-- Vista de intereses actuales -->
          <div v-else class="intereses-display">
            <div v-if="interesesSeleccionados.length > 0" class="intereses-lista">
              <div
                v-for="interesId in interesesSeleccionados"
                :key="interesId"
                class="interes-tag"
              >
                <span class="tag-emoji">{{ getInteresEmoji(interesId) }}</span>
                <span class="tag-nombre">{{ getInteresNombre(interesId) }}</span>
              </div>
            </div>
            <div v-else class="empty-intereses">
              <p>🎯 No has seleccionado intereses aún</p>
              <p class="empty-description">Selecciona tus temas favoritos para recibir historias personalizadas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Cambiar Contraseña -->
      <div class="profile-section">
        <div class="section-card">
          <div class="section-header">
            <h2>🔒 Seguridad</h2>
            <button 
              v-if="!mostrandoCambioPassword" 
              @click="mostrarCambioPassword" 
              class="btn btn-outline"
            >
              🔐 Cambiar Contraseña
            </button>
          </div>
          
          <form v-if="mostrandoCambioPassword" @submit.prevent="cambiarPassword" class="password-form">
            <div class="input-group">
              <label for="currentPassword">🔑 Contraseña actual</label>
              <input
                id="currentPassword"
                v-model="passwordData.current"
                type="password"
                required
                minlength="6"
                placeholder="Tu contraseña actual"
              />
            </div>
            
            <div class="input-group">
              <label for="newPassword">🔐 Nueva contraseña</label>
              <input
                id="newPassword"
                v-model="passwordData.new"
                type="password"
                required
                minlength="6"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <div class="input-group">
              <label for="confirmPassword">🔐 Confirmar nueva contraseña</label>
              <input
                id="confirmPassword"
                v-model="passwordData.confirm"
                type="password"
                required
                minlength="6"
                placeholder="Repite la nueva contraseña"
              />
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-warning" :disabled="cambiandoPassword">
                <span v-if="cambiandoPassword">🔄 Cambiando...</span>
                <span v-else>🔐 Cambiar Contraseña</span>
              </button>
              <button type="button" @click="cancelarCambioPassword" class="btn btn-secondary">
                ❌ Cancelar
              </button>
            </div>
          </form>
          
          <div v-else class="security-info">
            <div class="security-item">
              <span class="security-icon">🔒</span>
              <div class="security-content">
                <h4>Contraseña</h4>
                <p>Última actualización: {{ formatDate(user?.password_updated_at) || 'No disponible' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Configuraciones -->
      <div class="profile-section">
        <div class="section-card">
          <h2>⚙️ Configuraciones</h2>
          
          <div class="configuraciones-lista">
            <div class="config-item">
              <div class="config-info">
                <h4>🔔 Notificaciones</h4>
                <p>Recibir notificaciones de nuevas actividades</p>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="configuraciones.notificaciones"
                  @change="guardarConfiguraciones"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="config-item">
              <div class="config-info">
                <h4>🔊 Sonidos</h4>
                <p>Reproducir sonidos en las interacciones</p>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="configuraciones.sonidos"
                  @change="guardarConfiguraciones"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div v-if="isAlumno" class="config-item">
              <div class="config-info">
                <h4>💾 Auto-guardado</h4>
                <p>Guardar progreso automáticamente</p>
              </div>
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="configuraciones.autoGuardado"
                  @change="guardarConfiguraciones"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Zona de Peligro -->
      <div class="profile-section danger-zone">
        <div class="section-card danger-card">
          <h2>⚠️ Zona de Peligro</h2>
          <p class="danger-description">
            Las acciones en esta sección son irreversibles. Procede con precaución.
          </p>
          
          <div class="danger-actions">
            <button @click="mostrarModalEliminar = true" class="btn btn-danger">
              🗑️ Eliminar mi cuenta
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de confirmación de eliminación -->
      <div v-if="mostrarModalEliminar" class="modal-overlay" @click.self="mostrarModalEliminar = false">
        <div class="modal-content">
          <h3>⚠️ Eliminar Cuenta</h3>
          <p><strong>Esta acción es irreversible.</strong></p>
          <p>Se eliminarán permanentemente:</p>
          <ul class="eliminacion-lista">
            <li v-if="isAlumno">📚 Todas tus historias creadas</li>
            <li v-if="isAlumno">⭐ Tu progreso y puntuaciones</li>
            <li v-if="isDocente">👥 Todos los datos de tus estudiantes</li>
            <li v-if="isDocente">📊 Reportes y estadísticas</li>
            <li>🔒 Tu información personal</li>
            <li>⚙️ Todas las configuraciones</li>
          </ul>
          
          <div class="confirmacion-input">
            <label for="confirmacion">Escribe "ELIMINAR" para confirmar:</label>
            <input
              id="confirmacion"
              v-model="confirmacionEliminacion"
              type="text"
              placeholder="ELIMINAR"
              class="input-confirmacion"
            />
          </div>
          
          <div class="modal-actions">
            <button 
              @click="eliminarCuenta" 
              class="btn btn-danger"
              :disabled="confirmacionEliminacion !== 'ELIMINAR' || eliminandoCuenta"
            >
              <span v-if="eliminandoCuenta">🗑️ Eliminando...</span>
              <span v-else>🗑️ Eliminar Definitivamente</span>
            </button>
            <button @click="cerrarModalEliminar" class="btn btn-secondary">
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Loading global -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>🔄 Cargando información del perfil...</p>
      </div>

      <!-- Mensajes de estado -->
      <div v-if="mensaje" class="mensaje success">
        {{ mensaje }}
      </div>
      
      <div v-if="error" class="mensaje error">
        {{ error }}
      </div>
      
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../components/ToastNotification.vue'
import apiService from '../services/api'

export default {
  name: 'ProfileView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    
    // ============================================================================
    // 📊 ESTADOS REACTIVOS
    // ============================================================================
    
    const loading = ref(false)
    const editandoInfo = ref(false)
    const editandoIntereses = ref(false)
    const mostrandoCambioPassword = ref(false)
    const guardandoInfo = ref(false)
    const guardandoIntereses = ref(false)
    const cambiandoPassword = ref(false)
    const eliminandoCuenta = ref(false)
    const mostrarModalEliminar = ref(false)
    
    const mensaje = ref('')
    const error = ref('')
    const confirmacionEliminacion = ref('')
    
    // Formularios
    const formData = ref({
      nombre: '',
      email: '',
      edad: null,
      institucion: '',
      grado: ''
    })
    
    const formDataOriginal = ref({})
    
    const passwordData = ref({
      current: '',
      new: '',
      confirm: ''
    })
    
    const interesesSeleccionados = ref([])
    const interesesOriginales = ref([])
    
    const configuraciones = ref({
      notificaciones: true,
      sonidos: true,
      autoGuardado: true
    })
    
    // ============================================================================
    // 📋 DATOS DE CONFIGURACIÓN
    // ============================================================================
    
    const interesesDisponibles = [
      {
        id: 'aventura',
        nombre: 'Aventura',
        descripcion: 'Historias emocionantes y llenas de acción',
        emoji: '🗺️'
      },
      {
        id: 'fantasia',
        nombre: 'Fantasía',
        descripcion: 'Mundos mágicos con criaturas fantásticas',
        emoji: '🧙‍♂️'
      },
      {
        id: 'espacio',
        nombre: 'Espacio',
        descripcion: 'Aventuras en galaxias lejanas',
        emoji: '🚀'
      },
      {
        id: 'naturaleza',
        nombre: 'Naturaleza',
        descripcion: 'Historias sobre animales y el medio ambiente',
        emoji: '🌳'
      },
      {
        id: 'amistad',
        nombre: 'Amistad',
        descripcion: 'Relatos sobre compañerismo y valores',
        emoji: '👫'
      },
      {
        id: 'misterio',
        nombre: 'Misterio',
        descripcion: 'Enigmas y casos por resolver',
        emoji: '🔍'
      },
      {
        id: 'ciencia',
        nombre: 'Ciencia',
        descripcion: 'Experimentos y descubrimientos científicos',
        emoji: '🔬'
      },
      {
        id: 'deporte',
        nombre: 'Deporte',
        descripcion: 'Competencias y superación personal',
        emoji: '⚽'
      }
    ]
    
    const gradosDisponibles = [
      { value: 'preescolar', label: '🧸 Preescolar' },
      { value: '1ro', label: '1️⃣ Primer Grado' },
      { value: '2do', label: '2️⃣ Segundo Grado' },
      { value: '3ro', label: '3️⃣ Tercer Grado' },
      { value: '4to', label: '4️⃣ Cuarto Grado' },
      { value: '5to', label: '5️⃣ Quinto Grado' },
      { value: '6to', label: '6️⃣ Sexto Grado' },
      { value: 'secundaria', label: '🎓 Secundaria' },
      { value: 'bachillerato', label: '📚 Bachillerato' }
    ]
    
    // ============================================================================
    // 🔄 COMPUTED PROPERTIES
    // ============================================================================
    
    const user = computed(() => authStore.user)
    const profile = computed(() => authStore.profile)
    const isAlumno = computed(() => authStore.isAlumno)
    const isDocente = computed(() => authStore.isDocente)
    
    const userTypeIcon = computed(() => {
      return isAlumno.value ? '👨‍🎓' : '👨‍🏫'
    })
    
    const userTypeText = computed(() => {
      return isAlumno.value ? 'Estudiante' : 'Docente'
    })
    
    // ============================================================================
    // 🔄 MÉTODOS PRINCIPALES
    // ============================================================================
    
    const cargarDatosPerfil = async () => {
      try {
        loading.value = true
        error.value = ''
        
        console.log('📊 Cargando datos del perfil...')
        
        // Cargar datos básicos del usuario
        if (user.value) {
          formData.value = {
            nombre: user.value.nombre || '',
            email: user.value.email || '',
            edad: profile.value?.edad || null,
            institucion: profile.value?.institucion || '',
            grado: profile.value?.grado || ''
          }
          
          formDataOriginal.value = { ...formData.value }
        }
        
        // Cargar intereses si es alumno
        if (isAlumno.value && profile.value?.id) {
          try {
            const interesesResponse = await apiService.obtenerInteresesAlumno(profile.value.id)
            interesesSeleccionados.value = interesesResponse.intereses || []
            interesesOriginales.value = [...interesesSeleccionados.value]
          } catch (err) {
            console.warn('⚠️ No se pudieron cargar los intereses:', err)
            interesesSeleccionados.value = []
            interesesOriginales.value = []
          }
        }
        
        // Cargar configuraciones desde el backend
        try {
          const configResponse = await apiService.obtenerConfiguracionesUsuario(user.value.id)
          configuraciones.value = {
            ...configuraciones.value,
            ...configResponse.configuraciones
          }
        } catch (err) {
          console.warn('⚠️ No se pudieron cargar las configuraciones:', err)
          // Mantener configuraciones por defecto
        }
        
        console.log('✅ Datos del perfil cargados correctamente')
        
      } catch (err) {
        console.error('❌ Error cargando perfil:', err)
        error.value = 'Error al cargar la información del perfil'
      } finally {
        loading.value = false
      }
    }
    
    const volverDashboard = () => {
      const dashboardRoute = isAlumno.value ? '/dashboard-alumno' : '/dashboard-docente'
      router.push(dashboardRoute)
    }
    
    // ============================================================================
    // 👤 GESTIÓN DE INFORMACIÓN PERSONAL
    // ============================================================================
    
    const habilitarEdicionInfo = () => {
      editandoInfo.value = true
      error.value = ''
    }
    
    const cancelarEdicionInfo = () => {
      editandoInfo.value = false
      formData.value = { ...formDataOriginal.value }
      error.value = ''
    }
    
    const actualizarInformacion = async () => {
      try {
        guardandoInfo.value = true
        error.value = ''
        
        console.log('💾 Actualizando información personal...')
        
        // Enviar datos al backend
        const updateData = {
          user_id: user.value.id,
          nombre: formData.value.nombre,
          email: formData.value.email,
          edad: formData.value.edad,
          institucion: formData.value.institucion,
          grado: formData.value.grado
        }
        
        const response = await apiService.actualizarPerfil(updateData)
        
        // Actualizar datos en el store
        await authStore.updateProfile(response.user, response.profile)
        
        // Actualizar datos locales
        formDataOriginal.value = { ...formData.value }
        editandoInfo.value = false
        
        toastStore.success('Información actualizada correctamente')
        console.log('✅ Información personal actualizada')
        
      } catch (err) {
        console.error('❌ Error actualizando información:', err)
        error.value = err.response?.data?.error || 'Error al actualizar la información'
        toastStore.error(error.value)
      } finally {
        guardandoInfo.value = false
      }
    }
    
    // ============================================================================
    // 🎯 GESTIÓN DE INTERESES (ALUMNOS)
    // ============================================================================
    
    const habilitarEdicionIntereses = () => {
      editandoIntereses.value = true
      error.value = ''
    }
    
    const cancelarEdicionIntereses = () => {
      editandoIntereses.value = false
      interesesSeleccionados.value = [...interesesOriginales.value]
      error.value = ''
    }
    
    const toggleInteres = (interesId) => {
      const index = interesesSeleccionados.value.indexOf(interesId)
      if (index > -1) {
        interesesSeleccionados.value.splice(index, 1)
      } else {
        if (interesesSeleccionados.value.length < 5) { // Máximo 5 intereses
          interesesSeleccionados.value.push(interesId)
        } else {
          toastStore.warning('Puedes seleccionar máximo 5 intereses')
        }
      }
    }
    
    const guardarIntereses = async () => {
      try {
        guardandoIntereses.value = true
        error.value = ''
        
        console.log('🎯 Guardando intereses...')
        
        const response = await apiService.actualizarInteresesAlumno(
          profile.value.id,
          interesesSeleccionados.value
        )
        
        interesesOriginales.value = [...interesesSeleccionados.value]
        editandoIntereses.value = false
        
        toastStore.success('Intereses actualizados correctamente')
        console.log('✅ Intereses guardados')
        
      } catch (err) {
        console.error('❌ Error guardando intereses:', err)
        error.value = err.response?.data?.error || 'Error al guardar los intereses'
        toastStore.error(error.value)
      } finally {
        guardandoIntereses.value = false
      }
    }
    
    // ============================================================================
    // 🔒 CAMBIO DE CONTRASEÑA
    // ============================================================================
    
    const mostrarCambioPassword = () => {
      mostrandoCambioPassword.value = true
      passwordData.value = { current: '', new: '', confirm: '' }
      error.value = ''
    }
    
    const cancelarCambioPassword = () => {
      mostrandoCambioPassword.value = false
      passwordData.value = { current: '', new: '', confirm: '' }
      error.value = ''
    }
    
    const cambiarPassword = async () => {
      try {
        // Validaciones
        if (passwordData.value.new !== passwordData.value.confirm) {
          error.value = 'Las contraseñas nuevas no coinciden'
          return
        }
        
        if (passwordData.value.new.length < 6) {
          error.value = 'La nueva contraseña debe tener al menos 6 caracteres'
          return
        }
        
        cambiandoPassword.value = true
        error.value = ''
        
        console.log('🔐 Cambiando contraseña...')
        
        const response = await apiService.cambiarPassword({
          user_id: user.value.id,
          current_password: passwordData.value.current,
          new_password: passwordData.value.new
        })
        
        mostrandoCambioPassword.value = false
        passwordData.value = { current: '', new: '', confirm: '' }
        
        toastStore.success('Contraseña cambiada correctamente')
        console.log('✅ Contraseña actualizada')
        
      } catch (err) {
        console.error('❌ Error cambiando contraseña:', err)
        error.value = err.response?.data?.error || 'Error al cambiar la contraseña'
        toastStore.error(error.value)
      } finally {
        cambiandoPassword.value = false
      }
    }
    
    // ============================================================================
    // ⚙️ CONFIGURACIONES
    // ============================================================================
    
    const guardarConfiguraciones = async () => {
      try {
        console.log('⚙️ Guardando configuraciones...')
        
        await apiService.actualizarConfiguracionesUsuario(
          user.value.id,
          configuraciones.value
        )
        
        toastStore.success('Configuraciones guardadas')
        console.log('✅ Configuraciones actualizadas')
        
      } catch (err) {
        console.error('❌ Error guardando configuraciones:', err)
        toastStore.error('Error al guardar las configuraciones')
      }
    }
    
    // ============================================================================
    // 🗑️ ELIMINACIÓN DE CUENTA
    // ============================================================================
    
    const cerrarModalEliminar = () => {
      mostrarModalEliminar.value = false
      confirmacionEliminacion.value = ''
      error.value = ''
    }
    
    const eliminarCuenta = async () => {
      try {
        if (confirmacionEliminacion.value !== 'ELIMINAR') {
          error.value = 'Debes escribir "ELIMINAR" para confirmar'
          return
        }
        
        eliminandoCuenta.value = true
        error.value = ''
        
        console.log('🗑️ Eliminando cuenta...')
        
        await apiService.eliminarCuenta(user.value.id)
        
        // Cerrar sesión y limpiar datos
        authStore.logout()
        
        toastStore.success('Cuenta eliminada correctamente', 'Adiós')
        router.push('/login')
        
        console.log('✅ Cuenta eliminada exitosamente')
        
      } catch (err) {
        console.error('❌ Error eliminando cuenta:', err)
        error.value = err.response?.data?.error || 'Error al eliminar la cuenta'
        toastStore.error(error.value)
      } finally {
        eliminandoCuenta.value = false
      }
    }
    
    // ============================================================================
    // 🎨 MÉTODOS DE UTILIDAD
    // ============================================================================
    
    const getUserInitials = (nombre) => {
      if (!nombre) return '?'
      const words = nombre.split(' ')
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase()
      }
      return nombre[0].toUpperCase()
    }
    
    const formatDate = (fecha) => {
      if (!fecha) return 'No disponible'
      
      const fechaObj = new Date(fecha)
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    const getGradoLabel = (gradeValue) => {
      const grado = gradosDisponibles.find(g => g.value === gradeValue)
      return grado ? grado.label : gradeValue
    }
    
    const getInteresEmoji = (interesId) => {
      const interes = interesesDisponibles.find(i => i.id === interesId)
      return interes ? interes.emoji : '🎯'
    }
    
    const getInteresNombre = (interesId) => {
      const interes = interesesDisponibles.find(i => i.id === interesId)
      return interes ? interes.nombre : interesId
    }
    
    // ============================================================================
    // 🎯 LIFECYCLE HOOKS
    // ============================================================================
    
    onMounted(() => {
      console.log('🏠 Iniciando ProfileView...')
      
      // Verificar autenticación
      if (!authStore.isAuthenticated) {
        console.error('❌ Usuario no autenticado')
        router.push('/login')
        return
      }
      
      cargarDatosPerfil()
    })
    
    // ============================================================================
    // 👀 WATCHERS
    // ============================================================================
    
    watch(() => user.value, (newUser) => {
      if (newUser) {
        formData.value.nombre = newUser.nombre || ''
        formData.value.email = newUser.email || ''
      }
    }, { immediate: true })
    
    return {
      // Estados
      loading,
      editandoInfo,
      editandoIntereses,
      mostrandoCambioPassword,
      guardandoInfo,
      guardandoIntereses,
      cambiandoPassword,
      eliminandoCuenta,
      mostrarModalEliminar,
      mensaje,
      error,
      confirmacionEliminacion,
      
      // Formularios
      formData,
      passwordData,
      interesesSeleccionados,
      configuraciones,
      
      // Datos de configuración
      interesesDisponibles,
      gradosDisponibles,
      
      // Computed
      user,
      profile,
      isAlumno,
      isDocente,
      userTypeIcon,
      userTypeText,
      
      // Métodos principales
      volverDashboard,
      
      // Información personal
      habilitarEdicionInfo,
      cancelarEdicionInfo,
      actualizarInformacion,
      
      // Intereses
      habilitarEdicionIntereses,
      cancelarEdicionIntereses,
      toggleInteres,
      guardarIntereses,
      
      // Contraseña
      mostrarCambioPassword,
      cancelarCambioPassword,
      cambiarPassword,
      
      // Configuraciones
      guardarConfiguraciones,
      
      // Eliminación
      cerrarModalEliminar,
      eliminarCuenta,
      
      // Utilidades
      getUserInitials,
      formatDate,
      getGradoLabel,
      getInteresEmoji,
      getInteresNombre
    }
  }
}
</script>

<style scoped>
/* ============================================================================ */
/* 🎨 ESTILOS PRINCIPALES */
/* ============================================================================ */

.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ============================================================================ */
/* 📋 HEADER DEL PERFIL */
/* ============================================================================ */

.profile-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8em;
  font-weight: bold;
  flex-shrink: 0;
}

.user-info h1 {
  color: #333;
  font-size: 2em;
  margin-bottom: 5px;
  font-weight: 700;
}

.user-subtitle {
  color: #666;
  font-size: 1.1em;
  margin-bottom: 10px;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9em;
  font-weight: 600;
}

.badge-icon {
  font-size: 1.1em;
}

/* ============================================================================ */
/* 📄 SECCIONES */
/* ============================================================================ */

.profile-section {
  margin-bottom: 30px;
}

.section-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  color: #333;
  font-size: 1.5em;
  font-weight: 700;
  margin: 0;
}

/* ============================================================================ */
/* 📝 FORMULARIOS */
/* ============================================================================ */

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 600;
  font-size: 0.95em;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 1);
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 10px;
}

/* ============================================================================ */
/* 📊 INFORMACIÓN DE SOLO LECTURA */
/* ============================================================================ */

.info-display {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #666;
  font-weight: 500;
  font-size: 0.9em;
}

.info-value {
  color: #333;
  font-weight: 600;
  text-align: right;
}

/* ============================================================================ */
/* 🎯 INTERESES */
/* ============================================================================ */

.editor-description {
  color: #666;
  margin-bottom: 20px;
  text-align: center;
}

.intereses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 25px;
}

.interes-card {
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.interes-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.interes-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #f8f9ff, #e8f2ff);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.interes-emoji {
  font-size: 2.5em;
  margin-bottom: 12px;
  display: block;
}

.interes-nombre {
  color: #333;
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 8px;
}

.interes-descripcion {
  color: #666;
  font-size: 0.85em;
  line-height: 1.4;
  margin-bottom: 12px;
}

.interes-checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.2em;
}

.intereses-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.intereses-display {
  min-height: 100px;
}

.intereses-lista {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.interes-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 500;
}

.tag-emoji {
  font-size: 1.1em;
}

.empty-intereses {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-description {
  font-size: 0.9em;
  margin-top: 8px;
}

/* ============================================================================ */
/* 🔒 SEGURIDAD */
/* ============================================================================ */

.password-form {
  max-width: 400px;
}

.security-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.security-icon {
  font-size: 1.8em;
  color: #667eea;
}

.security-content h4 {
  color: #333;
  margin-bottom: 4px;
}

.security-content p {
  color: #666;
  font-size: 0.9em;
  margin: 0;
}

/* ============================================================================ */
/* ⚙️ CONFIGURACIONES */
/* ============================================================================ */

.configuraciones-lista {
  display: grid;
  gap: 20px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.config-info h4 {
  color: #333;
  margin-bottom: 4px;
  font-size: 1em;
}

.config-info p {
  color: #666;
  font-size: 0.85em;
  margin: 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 25px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 25px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 19px;
  width: 19px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background: linear-gradient(45deg, #667eea, #764ba2);
}

input:checked + .toggle-slider:before {
  transform: translateX(25px);
}

/* ============================================================================ */
/* ⚠️ ZONA DE PELIGRO */
/* ============================================================================ */

.danger-zone .danger-card {
  border-left: 4px solid #f44336;
}

.danger-description {
  color: #666;
  margin-bottom: 20px;
  font-style: italic;
}

.danger-actions {
  display: flex;
  justify-content: flex-start;
}

/* ============================================================================ */
/* 💬 MODAL */
/* ============================================================================ */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5em;
  text-align: center;
}

.eliminacion-lista {
  background: #fff3e0;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  border-left: 4px solid #ff9800;
}

.eliminacion-lista li {
  margin-bottom: 8px;
  color: #555;
}

.confirmacion-input {
  margin: 20px 0;
}

.input-confirmacion {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #f44336;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

/* ============================================================================ */
/* 🔄 LOADING */
/* ============================================================================ */

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(10px);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ============================================================================ */
/* 💬 MENSAJES */
/* ============================================================================ */

.mensaje {
  padding: 16px 20px;
  border-radius: 12px;
  margin: 20px 0;
  font-weight: 500;
}

.mensaje.success {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  border: 1px solid #c3e6cb;
}

.mensaje.error {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* ============================================================================ */
/* 🎨 BOTONES */
/* ============================================================================ */

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
  text-align: center;
  min-height: 44px;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 2px solid #e1e5e9;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-warning {
  background: linear-gradient(45deg, #ff9800, #ffc107);
  color: white;
}

.btn-danger {
  background: linear-gradient(45deg, #f44336, #ff5722);
  color: white;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* ============================================================================ */
/* 📱 RESPONSIVE */
/* ============================================================================ */

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .section-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .intereses-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .config-item {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .section-card {
    padding: 20px;
  }
  
  .intereses-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    padding: 20px;
    width: 95%;
  }
}
</style>