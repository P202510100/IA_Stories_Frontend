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
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <h3>{{ estudiantesActivos.length }}</h3>
            <p>Activos esta semana</p>
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
      
      <!-- Acciones principales -->
      <div class="acciones-principales">
        <div class="acciones-grid">
          <button @click="mostrarModalInvitar = true" class="accion-btn invitar">
            <div class="accion-icon">➕</div>
            <div class="accion-content">
              <h3>Invitar Estudiante</h3>
              <p>Agrega un nuevo estudiante a tu clase</p>
            </div>
          </button>
          
          <button @click="generarCodigo" class="accion-btn codigo">
            <div class="accion-icon">🔗</div>
            <div class="accion-content">
              <h3>Código de Clase</h3>
              <p>Genera un código para que se unan</p>
            </div>
          </button>
          
          <button @click="exportarDatos" class="accion-btn exportar" :disabled="exportando">
            <div class="accion-icon">📊</div>
            <div class="accion-content">
              <h3>{{ exportando ? 'Exportando...' : 'Exportar Datos' }}</h3>
              <p>Descarga un reporte en PDF</p>
            </div>
          </button>
          
          <button @click="enviarMensajeGrupal" class="accion-btn mensaje">
            <div class="accion-icon">💌</div>
            <div class="accion-content">
              <h3>Mensaje Grupal</h3>
              <p>Envía un mensaje a todos</p>
            </div>
          </button>
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
            <div class="col-historias">Historias</div>
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
              
              <div class="col-historias">
                <span class="historias-valor">{{ estudiante.total_historias || 0 }}</span>
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
                    <button @click="enviarMensaje(estudiante)" class="dropdown-item">
                      💌 Enviar Mensaje
                    </button>
                    <button @click="resetearProgreso(estudiante)" class="dropdown-item">
                      🔄 Resetear Progreso
                    </button>
                    <button @click="confirmarDesvinculacion(estudiante)" class="dropdown-item danger">
                      🚫 Desvincular
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
              
              <div class="tarjeta-stats">
                <div class="stat-mini">
                  <span class="stat-valor">{{ estudiante.total_historias || 0 }}</span>
                  <span class="stat-etiqueta">Historias</span>
                </div>
              </div>
            </div>
            
            <div class="tarjeta-acciones" @click.stop>
              <button @click="verDetalleEstudiante(estudiante.id)" class="btn-tarjeta primario">
                👁️ Ver Detalle
              </button>
              <button @click="enviarMensaje(estudiante)" class="btn-tarjeta secundario">
                💌 Mensaje
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
          
          <!-- Código de clase -->
          <div v-if="tabInvitacion === 'codigo'" class="invite-content">
            <div class="codigo-clase-section">
              <div class="codigo-display">
                <h4>Tu código de clase:</h4>
                <div class="codigo-valor">
                  <span class="codigo-texto">{{ codigoClase }}</span>
                  <button @click="copiarCodigo" class="btn-copiar" :class="{ copiado: codigoCopiado }">
                    {{ codigoCopiado ? '✅' : '📋' }}
                  </button>
                </div>
              </div>
              
              <div class="codigo-instrucciones">
                <h4>Instrucciones para estudiantes:</h4>
                <ol>
                  <li>Regístrate en IaStories como estudiante</li>
                  <li>Ve a "Unirse a Clase"</li>
                  <li>Ingresa el código: <strong>{{ codigoClase }}</strong></li>
                  <li>¡Listo! Aparecerás en tu lista de estudiantes</li>
                </ol>
              </div>
              
              <div class="codigo-acciones">
                <button @click="generarNuevoCodigo" class="btn btn-secondary">
                  🔄 Generar Nuevo Código
                </button>
                <button @click="compartirCodigo" class="btn btn-primary">
                  📱 Compartir Código
                </button>
              </div>
            </div>
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../components/ToastNotification.vue'
import apiService from "@/services/api.js";

export default {
  name: 'GestionEstudiantes',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    
    const cargando = ref(true)
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
    const exportando = ref(false)
    const desvinculando = ref(false)
    const estudianteADesvincular = ref(null)
    
    const codigoClase = ref('ABC123')
    const codigoCopiado = ref(false)
    
    const invitacionForm = ref({
      email: '',
      nombre: '',
      mensaje: ''
    })
    
    const user = computed(() => authStore.user)
    
    const estudiantesFiltrados = computed(() => {
      let resultado = [...estudiantes.value]
      
      // Filtrar por texto de búsqueda
      if (busquedaTexto.value) {
        const texto = busquedaTexto.value.toLowerCase()
        resultado = resultado.filter(estudiante =>
          estudiante.nombre.toLowerCase().includes(texto) ||
          estudiante.email.toLowerCase().includes(texto)
        )
      }
      
      // Filtrar por estado
      if (filtroEstado.value) {
        resultado = resultado.filter(estudiante => estudiante.estado === filtroEstado.value)
      }
      
      // Ordenar
      resultado.sort((a, b) => {
        switch (ordenFiltro.value) {
          case 'nombre':
            return a.nombre.localeCompare(b.nombre)
          case 'puntos':
            return (b.puntos_totales || 0) - (a.puntos_totales || 0)
          case 'actividad':
            return new Date(b.ultima_actividad || 0) - new Date(a.ultima_actividad || 0)
          case 'fecha':
            return new Date(b.fecha_registro || 0) - new Date(a.fecha_registro || 0)
          default:
            return 0
        }
      })
      
      return resultado
    })
    
    const estudiantesActivos = computed(() => {
      const unaSemanAtras = new Date()
      unaSemanAtras.setDate(unaSemanAtras.getDate() - 7)
      
      return estudiantes.value.filter(estudiante => {
        if (!estudiante.ultima_actividad) return false
        return new Date(estudiante.ultima_actividad) >= unaSemanAtras
      })
    })
    
    const promedioClase = computed(() => {
      if (estudiantes.value.length === 0) return 0
      const totalPuntos = estudiantes.value.reduce((sum, e) => sum + (e.puntos_totales || 0), 0)
      return Math.round(totalPuntos / estudiantes.value.length)
    })
    
    const mejorEstudiante = computed(() => {
      if (estudiantes.value.length === 0) return null
      return estudiantes.value.reduce((mejor, actual) => {
        return (actual.puntos_totales || 0) > (mejor.puntos_totales || 0) ? actual : mejor
      })
    })

    const cargarEstudiantes = async () => {
      cargando.value = true
      error.value = ''

      try {
        const data = await apiService.obtenerAlumnos()
        estudiantes.value = data
      } catch (err) {
        console.error('Error cargando estudiantes:', err)
        error.value = 'Error al cargar la lista de estudiantes'
      } finally {
        cargando.value = false
      }
    }
    
    const getInitials = (nombre) => {
      return nombre.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    
    const getEstadoClass = (estado) => {
      const clases = {
        'activo': 'estado-activo',
        'inactivo': 'estado-inactivo',
        'nuevo': 'estado-nuevo'
      }
      return clases[estado] || 'estado-activo'
    }
    
    const getEstadoTexto = (estado) => {
      const textos = {
        'activo': 'Activo',
        'inactivo': 'Inactivo',
        'nuevo': 'Nuevo'
      }
      return textos[estado] || 'Activo'
    }
    
    const formatActividad = (fechaStr) => {
      if (!fechaStr) return 'Nunca'
      
      const fecha = new Date(fechaStr)
      const ahora = new Date()
      const diffMs = ahora - fecha
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      
      if (diffDays === 0) {
        if (diffHours === 0) return 'Hace unos minutos'
        return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
      } else if (diffDays === 1) {
        return 'Ayer'
      } else if (diffDays < 7) {
        return `Hace ${diffDays} días`
      } else {
        return fecha.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        })
      }
    }
    
    const toggleDropdown = (estudianteId) => {
      dropdownActivo.value = dropdownActivo.value === estudianteId ? null : estudianteId
    }
    
    const verDetalleEstudiante = (estudianteId) => {
      dropdownActivo.value = null
      router.push(`/estudiante/${estudianteId}`)
    }
    
    const enviarMensaje = (estudiante) => {
      dropdownActivo.value = null
      // TODO: Implementar modal de envío de mensaje
      toastStore.info(`Enviando mensaje a ${estudiante.nombre}`)
    }
    
    const resetearProgreso = async (estudiante) => {
      dropdownActivo.value = null
      
      const confirmacion = confirm(`¿Estás seguro de que quieres resetear el progreso de ${estudiante.nombre}?`)
      if (!confirmacion) return
      
      try {
        // TODO: Llamar API real
        await new Promise(resolve => setTimeout(resolve, 1000))
        toastStore.success(`Progreso de ${estudiante.nombre} reseteado correctamente`)
      } catch (err) {
        toastStore.error('Error al resetear el progreso')
      }
    }
    
    const confirmarDesvinculacion = (estudiante) => {
      dropdownActivo.value = null
      estudianteADesvincular.value = estudiante
      mostrarModalDesvinculacion.value = true
    }
    
    const desvincularEstudiante = async () => {
      if (!estudianteADesvincular.value) return
      
      desvinculando.value = true
      
      try {
        // TODO: Llamar API real
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Remover de la lista local
        const index = estudiantes.value.findIndex(e => e.id === estudianteADesvincular.value.id)
        if (index > -1) {
          estudiantes.value.splice(index, 1)
        }
        
        toastStore.success(`${estudianteADesvincular.value.nombre} ha sido desvinculado de tu clase`)
        mostrarModalDesvinculacion.value = false
        estudianteADesvincular.value = null
        
      } catch (err) {
        toastStore.error('Error al desvincular el estudiante')
      } finally {
        desvinculando.value = false
      }
    }
    
    const enviarInvitacion = async () => {
      if (!invitacionForm.value.email) return
      
      enviandoInvitacion.value = true
      
      try {
        // TODO: Llamar API real
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        toastStore.success(`Invitación enviada a ${invitacionForm.value.email}`)
        mostrarModalInvitar.value = false
        invitacionForm.value = { email: '', nombre: '', mensaje: '' }
        
      } catch (err) {
        toastStore.error('Error al enviar la invitación')
      } finally {
        enviandoInvitacion.value = false
      }
    }
    
    const generarCodigo = () => {
      tabInvitacion.value = 'codigo'
      mostrarModalInvitar.value = true
    }
    
    const copiarCodigo = async () => {
      try {
        await navigator.clipboard.writeText(codigoClase.value)
        codigoCopiado.value = true
        toastStore.success('Código copiado al portapapeles')
        
        setTimeout(() => {
          codigoCopiado.value = false
        }, 2000)
      } catch (err) {
        toastStore.error('Error al copiar el código')
      }
    }
    
    const generarNuevoCodigo = () => {
      codigoClase.value = Math.random().toString(36).substr(2, 6).toUpperCase()
      toastStore.success('Nuevo código generado')
    }
    
    const compartirCodigo = () => {
      const texto = `¡Únete a mi clase en IaStories! Usa el código: ${codigoClase.value}`
      
      if (navigator.share) {
        navigator.share({
          title: 'Código de clase - IaStories',
          text: texto
        })
      } else {
        copiarCodigo()
      }
    }
    
    const exportarDatos = async () => {
      exportando.value = true
      
      try {
        // TODO: Implementar exportación real a PDF
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        toastStore.success('Reporte PDF generado y descargado')
        
      } catch (err) {
        toastStore.error('Error al generar el reporte')
      } finally {
        exportando.value = false
      }
    }
    
    const enviarMensajeGrupal = () => {
      // TODO: Implementar modal de mensaje grupal
      toastStore.info('Funcionalidad de mensaje grupal en desarrollo')
    }
    
    const volverAtras = () => {
      router.push('/dashboard-docente')
    }
    
    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event) => {
      if (!event.target.closest('.acciones-dropdown')) {
        dropdownActivo.value = null
      }
    }
    
    onMounted(() => {
      cargarEstudiantes()
      document.addEventListener('click', handleClickOutside)
      
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    })
    
    return {
      // Reactive data
      cargando,
      error,
      estudiantes,
      busquedaTexto,
      filtroEstado,
      ordenFiltro,
      vistaActual,
      dropdownActivo,
      mostrarModalInvitar,
      mostrarModalDesvinculacion,
      tabInvitacion,
      enviandoInvitacion,
      exportando,
      desvinculando,
      estudianteADesvincular,
      codigoClase,
      codigoCopiado,
      invitacionForm,
      
      // Computed
      user,
      estudiantesFiltrados,
      estudiantesActivos,
      promedioClase,
      mejorEstudiante,
      
      // Methods
      getInitials,
      getEstadoClass,
      getEstadoTexto,
      formatActividad,
      toggleDropdown,
      verDetalleEstudiante,
      enviarMensaje,
      resetearProgreso,
      confirmarDesvinculacion,
      desvincularEstudiante,
      enviarInvitacion,
      generarCodigo,
      copiarCodigo,
      generarNuevoCodigo,
      compartirCodigo,
      exportarDatos,
      enviarMensajeGrupal,
      volverAtras
    }
  }
}
</script>

<style scoped>
/* Estilos base similares a los otros componentes */
.gestion-estudiantes-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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