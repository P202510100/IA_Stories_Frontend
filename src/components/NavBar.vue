<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <h2>📚 IaStories</h2>
        </router-link>
      </div>
      
      <div class="nav-menu">
        <!-- Menú para alumnos -->
        <template v-if="user && user.tipo === 'student'">
          <router-link to="/dashboard-alumno" class="nav-link">
            🏠 Dashboard
          </router-link>
          <router-link to="/crear-historia" class="nav-link">
            ✨ Nueva Historia
          </router-link>
          <router-link to="/mis-historias" class="nav-link">
            📚 Mis Historias
          </router-link>
          <router-link to="/ranking" class="nav-link">
            🏆 Ranking
          </router-link>
        </template>
        
        <!-- Menú para docentes -->
        <template v-if="user && user.tipo === 'teacher'">
          <router-link to="/dashboard-docente" class="nav-link">
            🏠 Dashboard
          </router-link>
          <router-link to="/gestion-estudiantes" class="nav-link">
            👥 Estudiantes
          </router-link>
          <div class="nav-dropdown">
            <span class="nav-link dropdown-toggle">
              📊 Reportes ▼
            </span>
            <div class="dropdown-menu">
              <button @click="descargarReporteGeneral" class="dropdown-item" :disabled="loadingReporte">
                📄 Reporte General
              </button>
              <button @click="descargarReporteGrupal" class="dropdown-item" :disabled="loadingReporte">
                👥 Reporte Grupal
              </button>
            </div>
          </div>
        </template>
      </div>
      
      <div class="nav-user" v-if="user">
        <!-- Información del usuario -->
        <div class="user-info">
          <div class="user-avatar">
            {{ getUserInitials(user.fullname) }}
          </div>
          <div class="user-details">
            <span class="user-name">{{ user.fullname || 'Usuario' }}</span>
            <span class="user-type">{{ getUserTypeLabel(user.tipo) }}</span>
          </div>
        </div>
        
        <!-- Dropdown del usuario -->
        <div class="user-dropdown">
          <button class="user-menu-btn" @click="toggleUserMenu">
            ⚙️
          </button>
          <div v-if="showUserMenu" class="user-menu">
            <router-link to="/perfil" class="menu-item" @click="closeUserMenu">
              👤 Mi Perfil
            </router-link>
            <button @click="handleLogout" class="menu-item logout-btn">
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <div v-if="loadingReporte" class="loading-overlay">
    <div class="loading-spinner"></div>
    <p>🧾 Generando reporte PDF, por favor espera...</p>
  </div>

</template>

<script>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import apiService from '../services/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default {
  name: 'NavBar',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    // Estados reactivos
    const showUserMenu = ref(false)
    
    // ✅ COMPUTED SIMPLIFICADOS Y SEGUROS
    const user = computed(() => {
      console.log('🔍 NavBar user:', authStore.user)
      return authStore.user
    })
    
    // ============================================================================
    // 🔧 MÉTODOS PRINCIPALES
    // ============================================================================
    
    const handleLogout = async () => {
      try {
        console.log('🚪 Cerrando sesión...')
        authStore.logout()
        await router.push('/login')
        console.log('✅ Sesión cerrada exitosamente')
      } catch (error) {
        console.error('❌ Error cerrando sesión:', error)
      }
    }
    
    const getUserInitials = (nombre) => {
      if (!nombre) return '?'
      const words = nombre.split(' ')
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase()
      }
      return nombre[0].toUpperCase()
    }
    
    const getUserTypeLabel = (tipo) => {
      const labels = {
        'alumno': '👨‍🎓 Alumno',
        'docente': '👨‍🏫 Docente'
      }
      return labels[tipo] || '👤 Usuario'
    }
    
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
    }
    
    const closeUserMenu = () => {
      showUserMenu.value = false
    }
    
    // ============================================================================
    // 🎓 MÉTODOS ESPECÍFICOS PARA DOCENTES
    // ============================================================================

    const loadingReporte = ref(false)

    const generarPDF = (titulo, estudiantes) => {
      const doc = new jsPDF()
      const fecha = new Date().toLocaleDateString()

      doc.setFontSize(16)
      doc.text(titulo, 14, 20)
      doc.setFontSize(10)
      doc.text(`Generado el ${fecha}`, 14, 28)

      const rows = estudiantes.map(e => [
        e.fullname,
        e.email || '-',
        e.current_grade || '-',
        e.total_historias || 0,
        e.total_points || 0,
        e.current_level || '-',
        e.matriculado ? 'Sí' : 'No'
      ])

      autoTable(doc, {
        startY: 35,
        head: [['Nombre', 'Email', 'Grado', 'Historias', 'Puntos', 'Nivel', 'Matriculado']],
        body: rows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [52, 152, 219] }
      })

      const filename = `${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
    }

    const descargarReporteGeneral = async () => {
      loadingReporte.value = true
      try {
        console.log('📄 Generando Reporte General...')
        const docenteId = authStore.profile.id
        const resp = await apiService.obtenerEstudiantesDocente(docenteId)
        const estudiantes = (Array.isArray(resp) ? resp : resp?.estudiantes ?? []).map(e => ({
          ...e,
          matriculado: e.matriculado === true
        }))
        generarPDF('Reporte General de Estudiantes', estudiantes)
        console.log('✅ Reporte General generado')
      } catch (error) {
        console.error('❌ Error generando Reporte General:', error)
        alert('Error generando reporte general')
      } finally {
        loadingReporte.value = false
        closeUserMenu()
      }
    }

    const descargarReporteGrupal = async () => {
      loadingReporte.value = true
      try {
        console.log('Generando Reporte Grupal...')
        const docenteId = authStore.profile.id
        const resp = await apiService.obtenerEstudiantesDocente(docenteId)
        const estudiantes = (Array.isArray(resp) ? resp : resp?.estudiantes ?? [])
            .filter(e => e.matriculado === true)
            .map(e => ({
              ...e,
              matriculado: true
            }))

        generarPDF('Reporte Grupal (Alumnos Matriculados)', estudiantes)
        console.log('✅ Reporte Grupal generado')
      } catch (error) {
        console.error('❌ Error generando Reporte Grupal:', error)
        alert('Error generando reporte grupal')
      } finally {
        loadingReporte.value = false
        closeUserMenu()
      }
    }
    
    // ============================================================================
    // 🎯 LIFECYCLE HOOKS
    // ============================================================================
    
    onMounted(() => {
      console.log('🚀 NavBar montado, usuario actual:', authStore.user)
      
      // Cerrar menú al hacer click fuera
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-dropdown')) {
          showUserMenu.value = false
        }
      })
    })
    
    onUnmounted(() => {
      document.removeEventListener('click', closeUserMenu)
    })
    
    return {
      user,
      showUserMenu,
      handleLogout,
      getUserInitials,
      getUserTypeLabel,
      toggleUserMenu,
      closeUserMenu,
      descargarReporteGeneral,
      descargarReporteGrupal,
      loadingReporte
    }
  }
}
</script>

<style scoped>
/* ============================================================================ */
/* 🎨 ESTILOS PRINCIPALES */
/* ============================================================================ */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.loading-spinner {
  border: 4px solid #ddd;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 70px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ============================================================================ */
/* 🎯 BRAND */
/* ============================================================================ */

.nav-brand .brand-link {
  text-decoration: none;
}

.nav-brand h2 {
  color: #667eea;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  transition: all 0.3s ease;
}

.nav-brand h2:hover {
  transform: scale(1.05);
}

/* ============================================================================ */
/* 📱 MENÚ DE NAVEGACIÓN */
/* ============================================================================ */

.nav-menu {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-link {
  color: #555;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.nav-link:hover {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.nav-link.router-link-active {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* ============================================================================ */
/* 📊 DROPDOWN REPORTES */
/* ============================================================================ */

.nav-dropdown {
  position: relative;
}

.dropdown-toggle {
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1001;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.nav-dropdown:hover .dropdown-menu {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  text-align: left;
  color: #555;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-item:hover {
  background: #f8f9fa;
  color: #667eea;
}

.dropdown-item:first-child {
  border-radius: 8px 8px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 8px 8px;
}

/* ============================================================================ */
/* 👤 ÁREA DE USUARIO */
/* ============================================================================ */

.nav-user {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  color: #333;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.2;
}

.user-type {
  color: #666;
  font-size: 12px;
  line-height: 1.2;
}

/* ============================================================================ */
/* ⚙️ DROPDOWN USUARIO */
/* ============================================================================ */

.user-dropdown {
  position: relative;
}

.user-menu-btn {
  background: #f8f9fa;
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.user-menu-btn:hover {
  background: #e9ecef;
  transform: rotate(90deg);
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  z-index: 1001;
  overflow: hidden;
  margin-top: 5px;
}

.menu-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  text-align: left;
  color: #555;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item:hover {
  background: #f8f9fa;
  color: #667eea;
}

.logout-btn:hover {
  background: #ffebee;
  color: #dc3545;
}

/* ============================================================================ */
/* 📱 RESPONSIVE */
/* ============================================================================ */

@media (max-width: 968px) {
  .nav-menu {
    display: none;
  }
  
  .user-details {
    display: none;
  }
  
  .nav-container {
    padding: 0 15px;
  }
}

@media (max-width: 768px) {
  .navbar {
    height: 60px;
  }
  
  .nav-brand h2 {
    font-size: 20px;
  }
  
  .user-avatar {
    width: 35px;
    height: 35px;
    font-size: 12px;
  }
}
</style>