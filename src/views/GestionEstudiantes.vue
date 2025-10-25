<template>
  <div class="gestion-estudiantes-container">
    <div class="container">
      
      <!-- Header -->
      <div class="gestion-header">
        <button @click="volverAtras" class="btn-back">
          ← Volver al Dashboard
        </button>
        <h1>👥 Gestión de Estudiantes</h1>
        <p>Administra los estudiantes asignados a tu clase</p>
      </div>
      
      <!-- Estadísticas rápidas -->
      <div class="stats-rapidas">
        <div class="stat-card">
          <div class="stat-icon">👨‍🎓</div>
          <div class="stat-info">
            <h3>{{ estudiantes.length }}</h3>
            <p>Estudiantes totales</p>
          </div>
        </div>

        
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <h3>{{ promedioClase }}%</h3>
            <p>Promedio de clase</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <h3>{{ mejorEstudiante?.nombre || 'N/A' }}</h3>
            <p>Mejor estudiante</p>
          </div>
        </div>
      </div>
      
      <!-- Filtros y búsqueda -->
      <div class="filtros-section">
        <div class="filtros-card">
          <div class="busqueda-grupo">
            <div class="search-input-container">
              <input
                v-model="busquedaTexto"
                type="text"
                placeholder="🔍 Buscar estudiante por nombre o email..."
                class="search-input"
              />
              <button v-if="busquedaTexto" @click="busquedaTexto = ''" class="clear-search">
                ✕
              </button>
            </div>
          </div>
          
          <div class="filtro-grupo">
            <label for="estado-filtro">Estado:</label>
            <select id="estado-filtro" v-model="filtroEstado">
              <option value="">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="nuevo">Nuevos</option>
            </select>
          </div>
          
          <div class="filtro-grupo">
            <label for="orden-filtro">Ordenar por:</label>
            <select id="orden-filtro" v-model="ordenFiltro">
              <option value="nombre">Nombre A-Z</option>
              <option value="puntos">Mayor puntuación</option>
              <option value="actividad">Última actividad</option>
              <option value="fecha">Fecha de registro</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Lista de estudiantes -->
      <div class="estudiantes-section">
        <div class="section-header">
          <h2>📋 Lista de Estudiantes</h2>
          <div class="vista-toggle">
            <button 
              @click="vistaActual = 'lista'" 
              class="toggle-btn"
              :class="{ active: vistaActual === 'lista' }"
            >
              📋 Lista
            </button>
            <button 
              @click="vistaActual = 'tarjetas'" 
              class="toggle-btn"
              :class="{ active: vistaActual === 'tarjetas' }"
            >
              🎴 Tarjetas
            </button>
          </div>
        </div>
        
        <!-- Vista de lista -->
        <div v-if="vistaActual === 'lista' && estudiantesFiltrados.length > 0" class="estudiantes-tabla">
          <div class="tabla-header">
            <div class="col-estudiante">Estudiante</div>
            <div class="col-estado">Estado</div>
            <div class="col-puntos">Puntos</div>
            <div class="col-historias">Level</div>
            <div class="col-actividad">Última Actividad</div>
            <div class="col-acciones">Acciones</div>
          </div>
          
          <div class="tabla-body">
            <div
              v-for="estudiante in estudiantesFiltrados"
              :key="estudiante.id"
              class="tabla-fila"
              @click="verDetalleEstudiante(estudiante.id)"
            >
              <div class="col-estudiante">
                <div class="estudiante-info">
                  <div class="estudiante-avatar">
                    {{ getInitials(estudiante.nombre) }}
                  </div>
                  <div class="estudiante-datos">
                    <h4>{{ estudiante.nombre }}</h4>
                    <p>{{ estudiante.email }}</p>
                  </div>
                </div>
              </div>

              <div class="col-estado">
                <span class="estado-badge" :class="getEstadoClass(estudiante.estado)">
                  {{ getEstadoTexto(estudiante.estado) }}
                </span>
              </div>

              <div class="col-puntos">
                ⭐ {{ estudiante.puntos_totales || 0 }}
              </div>

              <div class="col-historias">
                📚 {{ estudiante.current_level || 0 }}
              </div>

              <div class="col-actividad">
                🕒 {{ formatActividad(estudiante.last_updated_date) }}
              </div>

              <div class="col-acciones" @click.stop>
                <div class="acciones-dropdown">
                  <button
                    @click="toggleDropdown(estudiante.id)"
                    class="dropdown-trigger"
                    :class="{ active: dropdownActivo === estudiante.id }"
                  >
                    ⋮
                  </button>

                  <div v-if="dropdownActivo === estudiante.id" class="dropdown-menu">
                    <button @click="verDetalleEstudiante(estudiante.id)" class="dropdown-item">
                      👁️ Ver Detalle
                    </button>
                    <!-- Matricular / Desmatricular -->
                    <button
                        @click="toggleMatricula(estudiante)"
                        class="dropdown-item matricula-btn"
                        :class="{
                            'matricular': !estudiante.matriculado && !estudiante.cargandoMatricula,
                            'desmatricular': estudiante.matriculado && !estudiante.cargandoMatricula,
                            'cargando': estudiante.cargandoMatricula
                          }"
                        :disabled="estudiante.cargandoMatricula"
                    >
                      <span v-if="estudiante.cargandoMatricula">⏳ Procesando...</span>
                      <span v-else>
                        {{ estudiante.matriculado ? '🚫 Desmatricular' : '✅ Matricular' }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vista de tarjetas -->
        <div v-else-if="vistaActual === 'tarjetas' && estudiantesFiltrados.length > 0" class="estudiantes-grid">
          <div
            v-for="estudiante in estudiantesFiltrados"
            :key="estudiante.id"
            class="estudiante-tarjeta"
            :class="{ 'matriculado-card': estudiante.matriculado }"
            @click="verDetalleEstudiante(estudiante.id)"
          >
            <div class="tarjeta-header">
              <div class="estudiante-avatar-grande">
                {{ getInitials(estudiante.nombre) }}
              </div>
              <div class="estudiante-estado">
                <span class="estado-badge" :class="getEstadoClass(estudiante.estado)">
                  {{ getEstadoTexto(estudiante.estado) }}
                </span>
              </div>
            </div>

            <div class="tarjeta-info">
              <h3>{{ estudiante.nombre }}</h3>
              <p class="estudiante-email">{{ estudiante.email }}</p>


            </div>

            <div class="tarjeta-acciones" @click.stop>
              <button @click="verDetalleEstudiante(estudiante.id)" class="btn-tarjeta primario">
                👁️ Ver Detalle
              </button>
              <button
                  @click="toggleMatricula(estudiante)"
                  class="btn-tarjeta"
                  :class="{
                    'btn-matricular': !estudiante.matriculado && !estudiante.cargandoMatricula,
                    'btn-desmatricular': estudiante.matriculado && !estudiante.cargandoMatricula,
                    'btn-cargando': estudiante.cargandoMatricula
                  }"
                  :disabled="estudiante.cargandoMatricula"
              >
                <span v-if="estudiante.cargandoMatricula">⏳ Procesando...</span>
                <span v-else>
                  {{ estudiante.matriculado ? '🚫 Desmatricular' : '✅ Matricular' }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else-if="estudiantesFiltrados.length === 0 && !cargando" class="estado-vacio">
          <div class="vacio-icon">👨‍🎓</div>
          <h3>{{ busquedaTexto ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados' }}</h3>
          <p>
            {{ busquedaTexto
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Invita estudiantes a tu clase para comenzar'
            }}
          </p>
          <button v-if="!busquedaTexto" @click="mostrarModalInvitar = true" class="btn btn-primary">
            ➕ Invitar Primer Estudiante
          </button>
        </div>
      </div>

      <!-- Modal Invitar Estudiante -->
      <div v-if="mostrarModalInvitar" class="modal-overlay" @click="mostrarModalInvitar = false">
        <div class="modal-content" @click.stop>
          <h3>➕ Invitar Estudiante</h3>

          <div class="invite-tabs">
            <button
              @click="tabInvitacion = 'email'"
              class="tab-btn"
              :class="{ active: tabInvitacion === 'email' }"
            >
              📧 Por Email
            </button>
            <button
              @click="tabInvitacion = 'codigo'"
              class="tab-btn"
              :class="{ active: tabInvitacion === 'codigo' }"
            >
              🔗 Código de Clase
            </button>
          </div>

          <!-- Invitación por email -->
          <div v-if="tabInvitacion === 'email'" class="invite-content">
            <form @submit.prevent="enviarInvitacion">
              <div class="input-group">
                <label for="invite-email">📧 Email del estudiante</label>
                <input
                  id="invite-email"
                  v-model="invitacionForm.email"
                  type="email"
                  placeholder="estudiante@ejemplo.com"
                  required
                />
              </div>

              <div class="input-group">
                <label for="invite-nombre">👤 Nombre del estudiante (opcional)</label>
                <input
                  id="invite-nombre"
                  v-model="invitacionForm.nombre"
                  type="text"
                  placeholder="Nombre del estudiante"
                />
              </div>

              <div class="input-group">
                <label for="invite-mensaje">💌 Mensaje personalizado (opcional)</label>
                <textarea
                  id="invite-mensaje"
                  v-model="invitacionForm.mensaje"
                  placeholder="Mensaje de invitación personalizado..."
                  rows="3"
                ></textarea>
              </div>

              <div class="modal-form-actions">
                <button type="submit" class="btn btn-primary" :disabled="enviandoInvitacion">
                  <span v-if="enviandoInvitacion">📤 Enviando...</span>
                  <span v-else>📤 Enviar Invitación</span>
                </button>
                <button @click="mostrarModalInvitar = false" type="button" class="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal Confirmación Desvinculación -->
      <div v-if="mostrarModalDesvinculacion" class="modal-overlay" @click="mostrarModalDesvinculacion = false">
        <div class="modal-content" @click.stop>
          <h3>⚠️ Desvincular Estudiante</h3>
          <p>¿Estás seguro de que quieres desvincular a <strong>{{ estudianteADesvincular?.nombre }}</strong>?</p>

          <div class="warning-info">
            <h4>Esta acción:</h4>
            <ul>
              <li>Removerá al estudiante de tu clase</li>
              <li>El estudiante perderá acceso a las actividades de tu clase</li>
              <li>Los datos del estudiante se conservarán</li>
              <li>Podrás volver a invitarlo más tarde</li>
            </ul>
          </div>

          <div class="modal-form-actions">
            <button @click="desvincularEstudiante" class="btn btn-danger" :disabled="desvinculando">
              <span v-if="desvinculando">🗑️ Desvinculando...</span>
              <span v-else>🗑️ Confirmar Desvinculación</span>
            </button>
            <button @click="mostrarModalDesvinculacion = false" class="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="cargando" class="loading">
        🔄 Cargando estudiantes...
      </div>

      <!-- Error -->
      <div v-if="error" class="error">
        {{ error }}
      </div>

    </div>
    <div v-if="mostrarPopupMatricula" class="modal-overlay" @click="mostrarPopupMatricula = false">
      <div class="modal-content" @click.stop>
        <h3>Confirmar Matrícula</h3>
        <p>¿Deseas matricular a <strong>{{ estudianteSeleccionado?.nombre }}</strong> en tu clase?</p>

        <div class="modal-form-actions">
          <button @click="confirmarMatricula" class="btn btn-primary">✅ Confirmar</button>
          <button @click="mostrarPopupMatricula = false" class="btn btn-secondary">❌ Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useLoaderStore } from '../stores/loaderStore'
import { useToastStore } from '../components/ToastNotification.vue'
import { parseApiError } from '../utils/errorHandler'
import apiService from '../services/api'

// -------------------------------
// 📦 Stores y Router
// -------------------------------
const router = useRouter()
const authStore = useAuthStore()
const loader = useLoaderStore()
const toastStore = useToastStore()

// -------------------------------
// ⚙️ Reactive Data
// -------------------------------
const cargando = ref(false)
const error = ref('')
const estudiantes = ref([])
const busquedaTexto = ref('')
const filtroEstado = ref('')
const ordenFiltro = ref('nombre')
const vistaActual = ref('tarjetas')
const dropdownActivo = ref(null)
const mostrarModalInvitar = ref(false)
const mostrarModalDesvinculacion = ref(false)
const tabInvitacion = ref('email')
const enviandoInvitacion = ref(false)
const desvinculando = ref(false)
const estudianteADesvincular = ref(null)
const mostrarPopupMatricula = ref(false)
const estudianteSeleccionado = ref(null)

const invitacionForm = ref({ email: '', nombre: '', mensaje: '' })
const user = computed(() => authStore.user)

// -------------------------------
// 🧠 Computed
// -------------------------------
const estudiantesFiltrados = computed(() => {
  let resultado = [...estudiantes.value]

  if (busquedaTexto.value) {
    const texto = busquedaTexto.value.toLowerCase()
    resultado = resultado.filter(e =>
        e.nombre.toLowerCase().includes(texto) || e.email.toLowerCase().includes(texto)
    )
  }

  if (filtroEstado.value) {
    resultado = resultado.filter(e => e.estado === filtroEstado.value)
  }

  resultado.sort((a, b) => {
    switch (ordenFiltro.value) {
      case 'nombre':
        return a.nombre.localeCompare(b.nombre)
      case 'puntos':
        return (b.puntos_totales || 0) - (a.puntos_totales || 0)
      case 'fecha':
        return new Date(b.fecha_registro || 0) - new Date(a.fecha_registro || 0)
      default:
        return 0
    }
  })
  return resultado
})

const promedioClase = computed(() => {
  if (!estudiantes.value.length) return 0
  const total = estudiantes.value.reduce((sum, e) => sum + (e.puntos_totales || 0), 0)
  return Math.round(total / estudiantes.value.length)
})

const mejorEstudiante = computed(() => {
  if (!estudiantes.value.length) return null
  return estudiantes.value.reduce((a, b) =>
      (b.puntos_totales || 0) > (a.puntos_totales || 0) ? b : a
  )
})

// -------------------------------
// 🚀 Cargar Estudiantes
// -------------------------------
const cargarEstudiantes = async () => {
  try {
    cargando.value = true
    error.value = ''
    loader.show({
      message: 'Cargando estudiantes...',
      submessage: 'Recuperando datos desde el servidor 👩‍🏫',
      type: 'dots'
    })

    const data = await apiService.obtenerEstudiantesDocente(user.value.teacher_profile.id)
    estudiantes.value = data.map(e => ({
      id: e.id,
      nombre: e.fullname || 'Sin nombre',
      email: e.email || 'Sin email',
      estado: e.activo ? 'activo' : 'inactivo',
      puntos_totales: e.total_points || 0,
      current_level: e.current_level || 'Principiante',
      last_updated_date: e.last_updated_date,
      matriculado: e.matriculado || false,
      cargandoMatricula: false
    }))
  } catch (err) {
    console.error('❌ Error cargando estudiantes:', err)
    error.value = parseApiError(err)
    toastStore.error(error.value)
  } finally {
    loader.hide()
    cargando.value = false
  }
}

// -------------------------------
// 🔄 Matricular / Desmatricular
// -------------------------------
const toggleMatricula = async (estudiante) => {
  try {
    estudiante.cargandoMatricula = true
    const docenteId = user.value.teacher_profile.id

    if (estudiante.matriculado) {
      await apiService.unenrollStudent(docenteId, estudiante.id)
      estudiante.matriculado = false
      toastStore.info(`${estudiante.nombre} fue desmatriculado ❌`)
    } else {
      await apiService.enrollStudentWithTeacher(docenteId, estudiante.id)
      estudiante.matriculado = true
      toastStore.success(`${estudiante.nombre} fue matriculado 🎉`)
    }
  } catch (err) {
    console.error('Error en matrícula:', err)
    toastStore.error(parseApiError(err))
  } finally {
    estudiante.cargandoMatricula = false
  }
}

// -------------------------------
// 💌 Invitación de estudiantes
// -------------------------------
const enviarInvitacion = async () => {
  if (!invitacionForm.value.email) return
  enviandoInvitacion.value = true

  try {
    loader.show({
      message: 'Enviando invitación...',
      submessage: 'Enviando correo electrónico 📧',
      type: 'heart'
    })

    // TODO: Reemplazar con endpoint real de invitación
    await new Promise(res => setTimeout(res, 1500))

    toastStore.success(`Invitación enviada a ${invitacionForm.value.email}`)
    mostrarModalInvitar.value = false
    invitacionForm.value = { email: '', nombre: '', mensaje: '' }
  } catch (err) {
    toastStore.error(parseApiError(err))
  } finally {
    loader.hide()
    enviandoInvitacion.value = false
  }
}

// -------------------------------
// ⚠️ Desvincular estudiante
// -------------------------------
const confirmarDesvinculacion = (estudiante) => {
  estudianteADesvincular.value = estudiante
  mostrarModalDesvinculacion.value = true
}

const desvincularEstudiante = async () => {
  if (!estudianteADesvincular.value) return
  desvinculando.value = true

  try {
    const docenteId = user.value.teacher_profile.id
    await apiService.unenrollStudent(docenteId, estudianteADesvincular.value.id)

    const i = estudiantes.value.findIndex(e => e.id === estudianteADesvincular.value.id)
    if (i > -1) estudiantes.value[i].matriculado = false

    toastStore.success(`${estudianteADesvincular.value.nombre} ha sido desvinculado.`)
    mostrarModalDesvinculacion.value = false
  } catch (err) {
    toastStore.error(parseApiError(err))
  } finally {
    desvinculando.value = false
  }
}

// -------------------------------
// 🧭 Navegación y auxiliares
// -------------------------------
const volverAtras = () => router.push('/dashboard-docente')
const verDetalleEstudiante = (id) => router.push(`/estudiante/${id}`)

const getInitials = (nombre) =>
    nombre ? nombre.split(' ').map(n => n[0]).join('').toUpperCase() : '??'

const getEstadoClass = (estado) => ({
  activo: 'estado-activo',
  inactivo: 'estado-inactivo',
  nuevo: 'estado-nuevo'
}[estado] || 'estado-activo')

const getEstadoTexto = (estado) => ({
  activo: 'Activo',
  inactivo: 'Inactivo',
  nuevo: 'Nuevo'
}[estado] || 'Activo')

const formatActividad = (fechaStr) => {
  if (!fechaStr) return 'Nunca'
  const f = new Date(fechaStr)
  const diff = (Date.now() - f) / (1000 * 60 * 60)
  if (diff < 1) return 'Hace unos minutos'
  if (diff < 24) return `Hace ${Math.floor(diff)} hora(s)`
  if (diff < 48) return 'Ayer'
  if (diff < 168) return `Hace ${Math.floor(diff / 24)} día(s)`
  return f.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

// -------------------------------
// 🔄 Lifecycle
// -------------------------------
onMounted(() => {
  cargarEstudiantes()
  document.addEventListener('click', e => {
    if (!e.target.closest('.acciones-dropdown')) dropdownActivo.value = null
  })
})
</script>


<style scoped>
/* --- Matricula / Desmatricula UI --- */
.matricula-btn {
  width: 100%;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  margin-top: 5px;
  padding: 10px 15px;
  transition: all 0.3s ease;
  text-align: center;
}

.matricula-btn.matricular {
  background: #28a745;
  color: white;
}

.matricula-btn.matricular:hover {
  background: #218838;
  transform: translateY(-1px);
}

.matricula-btn.desmatricular {
  background: #dc3545;
  color: white;
}

.matricula-btn.desmatricular:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.matricula-btn.cargando {
  background: #adb5bd;
  color: white;
  cursor: not-allowed;
  opacity: 0.8;
}

/* --- Tarjetas --- */
.btn-matricular {
  background: linear-gradient(45deg, #28a745, #34ce57);
  color: white;
  font-weight: 600;
}

.btn-desmatricular {
  background: linear-gradient(45deg, #dc3545, #e4606d);
  color: white;
  font-weight: 600;
}

.btn-cargando {
  background: #adb5bd;
  color: white;
  cursor: not-allowed;
  opacity: 0.8;
}

.btn-matricular:hover {
  background: linear-gradient(45deg, #218838, #28a745);
  transform: translateY(-2px);
}

.btn-desmatricular:hover {
  background: linear-gradient(45deg, #c82333, #dc3545);
  transform: translateY(-2px);
}


/* Estilos base similares a los otros componentes */
.gestion-estudiantes-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.matriculado-card {
  background: #fff3e0; /* naranja claro */
  border: 2px solid #ff9800;
}
.btn-tarjeta.matricular:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}
.gestion-header {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
  position: relative;
}

.btn-back {
  position: absolute;
  left: 30px;
  top: 30px;
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: rgba(255,255,255,0.3);
  transform: translateX(-5px);
}

.gestion-header h1 {
  color: white;
  font-size: 2.5em;
  margin-bottom: 10px;
}

.gestion-header p {
  color: rgba(255,255,255,0.8);
  font-size: 1.2em;
}

.stats-rapidas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.stat-icon {
  font-size: 2.5em;
  flex-shrink: 0;
}

.stat-info h3 {
  color: #667eea;
  font-size: 1.8em;
  margin-bottom: 5px;
}

.stat-info p {
  color: #666;
  font-size: 0.9em;
}

.acciones-principales {
  margin-bottom: 30px;
}

.acciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.accion-btn {
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 15px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.accion-btn:hover:not(:disabled) {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.accion-btn.invitar:hover {
  border-color: #28a745;
}

.accion-btn.codigo:hover {
  border-color: #17a2b8;
}

.accion-btn.exportar:hover {
  border-color: #ffc107;
}

.accion-btn.mensaje:hover {
  border-color: #6f42c1;
}

.accion-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.accion-icon {
  font-size: 2em;
  flex-shrink: 0;
}

.accion-content h3 {
  color: #333;
  margin-bottom: 5px;
  font-size: 1.1em;
}

.accion-content p {
  color: #666;
  font-size: 0.9em;
  margin: 0;
}

.filtros-section {
  margin-bottom: 30px;
}

.filtros-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  align-items: center;
}

.busqueda-grupo {
  flex: 1;
  min-width: 300px;
}

.search-input-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 45px 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 25px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #666;
}

.filtro-grupo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
}

.filtro-grupo label {
  font-weight: 500;
  color: #555;
}

.filtro-grupo select {
  padding: 10px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
}

.estudiantes-section {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.section-header h2 {
  color: #667eea;
  font-size: 1.8em;
}

.vista-toggle {
  display: flex;
  gap: 5px;
}

.toggle-btn {
  padding: 8px 16px;
  border: 2px solid #e1e5e9;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s ease;
}

.toggle-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Vista de tabla */
.estudiantes-tabla {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e1e5e9;
}

.tabla-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr 1fr;
  gap: 20px;
  background: #f8f9fa;
  padding: 15px 20px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e1e5e9;
}

.tabla-body {
  display: grid;
  gap: 1px;
  background: #e1e5e9;
}

.tabla-fila {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr 1fr;
  gap: 20px;
  background: white;
  padding: 15px 20px;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tabla-fila:hover {
  background: #f8f9ff;
}

.estudiante-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.estudiante-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9em;
  font-weight: bold;
}

.estudiante-datos h4 {
  color: #333;
  margin-bottom: 3px;
  font-size: 1em;
}

.estudiante-datos p {
  color: #666;
  font-size: 0.8em;
  margin: 0;
}

.estado-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
}

.estado-activo {
  background: #d4edda;
  color: #155724;
}

.estado-inactivo {
  background: #f8d7da;
  color: #721c24;
}

.estado-nuevo {
  background: #d1ecf1;
  color: #0c5460;
}

.puntos-valor,
.historias-valor {
  font-weight: 600;
  color: #667eea;
}

.actividad-texto {
  font-size: 0.9em;
  color: #666;
}

.acciones-dropdown {
  position: relative;
}

.dropdown-trigger {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-size: 1.2em;
}

.dropdown-trigger:hover,
.dropdown-trigger.active {
  background: #f8f9fa;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  z-index: 100;
  min-width: 180px;
}

.dropdown-item {
  width: 100%;
  padding: 10px 15px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f8f9fa;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item.danger {
  color: #dc3545;
}

.dropdown-item.danger:hover {
  background: #f8d7da;
}

/* Vista de tarjetas */
.estudiantes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.estudiante-tarjeta {
  border: 2px solid #e1e5e9;
  border-radius: 15px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.estudiante-tarjeta:hover {
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.tarjeta-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.estudiante-avatar-grande {
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  font-weight: bold;
}

.tarjeta-info h3 {
  color: #333;
  margin-bottom: 5px;
  font-size: 1.2em;
}

.estudiante-email {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 15px;
}

.tarjeta-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.stat-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-valor {
  font-size: 1.1em;
  font-weight: bold;
  color: #667eea;
}

.stat-etiqueta {
  font-size: 0.8em;
  color: #666;
}

.ultima-actividad {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 20px;
}

.actividad-label {
  font-size: 0.8em;
  color: #666;
}

.actividad-valor {
  font-size: 0.9em;
  color: #333;
  font-weight: 500;
}

.tarjeta-acciones {
  display: flex;
  gap: 10px;
}

.btn-tarjeta {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.8em;
  transition: all 0.3s ease;
}

.btn-tarjeta.primario {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-tarjeta.secundario {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #e1e5e9;
}

.btn-tarjeta:hover {
  transform: translateY(-2px);
}

/* Estado vacío */
.estado-vacio {
  text-align: center;
  padding: 60px 20px;
}

.vacio-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.estado-vacio h3 {
  color: #667eea;
  font-size: 1.5em;
  margin-bottom: 10px;
}

.estado-vacio p {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.5;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 15px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5em;
  text-align: center;
}

.invite-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #e1e5e9;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.invite-content {
  margin-top: 20px;
}

.codigo-clase-section {
  text-align: center;
}

.codigo-display {
  margin-bottom: 25px;
}

.codigo-display h4 {
  color: #333;
  margin-bottom: 10px;
}

.codigo-valor {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.codigo-texto {
  background: #f8f9fa;
  padding: 15px 25px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1.5em;
  font-weight: bold;
  font-family: monospace;
  color: #667eea;
}

.btn-copiar {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2em;
  transition: all 0.3s ease;
}

.btn-copiar.copiado {
  background: #28a745;
}

.codigo-instrucciones {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  text-align: left;
}

.codigo-instrucciones h4 {
  color: #333;
  margin-bottom: 10px;
}

.codigo-instrucciones ol {
  color: #666;
  line-height: 1.6;
}

.codigo-acciones {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.modal-form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.warning-info {
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
}

.warning-info h4 {
  color: #856404;
  margin-bottom: 10px;
}

.warning-info ul {
  color: #856404;
  margin-left: 20px;
}

.warning-info li {
  margin-bottom: 5px;
}

/* Responsive */
@media (max-width: 768px) {
  .btn-back {
    position: static;
    margin-bottom: 20px;
  }
  
  .gestion-header {
    text-align: center;
  }
  
  .filtros-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .busqueda-grupo {
    min-width: auto;
  }
  
  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .tabla-header,
  .tabla-fila {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .tabla-header {
    display: none;
  }
  
  .tabla-fila {
    display: block;
    padding: 20px;
    border-bottom: 1px solid #e1e5e9;
  }
  
  .estudiantes-grid {
    grid-template-columns: 1fr;
  }
  
  .tarjeta-stats {
    justify-content: center;
  }
  
  .codigo-acciones {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .gestion-header h1 {
    font-size: 2em;
  }
  
  .acciones-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-rapidas {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>