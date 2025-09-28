// router/index.js - INTEGRADO 100% CON EL BACKEND
import { createRouter, createWebHistory } from 'vue-router'

// ============================================================================
// 📍 DEFINICIÓN DE RUTAS
// ============================================================================

const routes = [
  // ============================================================================
  // 🏠 RUTAS PÚBLICAS (NO AUTENTICADAS)
  // ============================================================================
  {
    path: '/',
    name: 'Home',
    redirect: (to) => {
      // Verificar si hay usuario autenticado en localStorage
      const user = localStorage.getItem('user')
      if (user) {
        try {
          const userData = JSON.parse(user)
          if (userData.tipo === 'alumno') {
            return '/dashboard-alumno'
          } else if (userData.tipo === 'docente') {
            return '/dashboard-docente'
          }
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }
      return '/login'
    }
  },
  
  {
    path: '/login',
    name: 'Login', 
    component: () => import('../views/Login.vue'),
    meta: { 
      requiresGuest: true,
      title: 'Iniciar Sesión - IaStories'
    }
  },
  
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { 
      requiresGuest: true,
      title: 'Registro - IaStories'
    }
  },
  
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPasswordView.vue'),
    meta: { 
      requiresGuest: true,
      title: 'Recuperar Contraseña - IaStories'
    }
  },
  
  // ============================================================================
  // 🎓 RUTAS DE ALUMNO (REQUIEREN AUTENTICACIÓN + TIPO ALUMNO)
  // ============================================================================
  {
    path: '/dashboard-alumno',
    name: 'DashboardAlumno',
    component: () => import('../views/DashboardAlumno.vue'),
    meta: { 
      requiresAuth: true, 
      userType: 'alumno',
      title: 'Dashboard - IaStories'
    }
  },
  
  {
    path: '/crear-historia',
    name: 'CrearHistoria',
    component: () => import('../views/CrearHistoria.vue'),
    meta: { 
      requiresAuth: true, 
      userType: 'alumno',
      title: 'Crear Historia - IaStories'
    }
  },
  
  {
    path: '/mis-historias',
    name: 'MisHistorias', 
    component: () => import('../views/MisHistorias.vue'),
    meta: { 
      requiresAuth: true, 
      userType: 'alumno',
      title: 'Mis Historias - IaStories'
    }
  },
  
  {
    path: '/historia/:id',
    name: 'VerHistoria',
    component: () => import('../views/VerHistoria.vue'),
    meta: { 
      requiresAuth: true, 
      title: 'Ver Historia - IaStories'
    },
    props: (route) => ({
      historiaId: parseInt(route.params.id),
      modo: route.query.modo || 'juego'
    })
  },
  
  {
    path: '/ranking',
    name: 'RankingView',
    component: () => import('../views/RankingView.vue'),
    meta: { 
      requiresAuth: true, 
      userType: 'alumno',
      title: 'Ranking - IaStories'
    }
  },
  
  // ============================================================================
  // 👨‍🏫 RUTAS DE DOCENTE (REQUIEREN AUTENTICACIÓN + TIPO DOCENTE)
  // ============================================================================
  {
    path: '/dashboard-docente', 
    name: 'DashboardDocente',
    component: () => import('../views/DashboardDocente.vue'),
    meta: { 
      requiresAuth: true, 
      userType: 'docente',
      title: 'Dashboard Docente - IaStories'
    }
  },
  
  {
    path: '/estudiante/:id',
    name: 'DetalleEstudiante',
    component: () => import('../views/DetalleEstudiante.vue'),
    meta: { 
      requiresAuth: true, 
      userType: 'docente',
      title: 'Detalle Estudiante - IaStories'
    },
    props: (route) => ({
      estudianteId: parseInt(route.params.id)
    })
  },
  
  {
    path: '/gestion-estudiantes',
    name: 'GestionEstudiantes',
    component: () => import('../views/GestionEstudiantes.vue'),
    meta: { 
      requiresAuth: true, 
      userType: 'docente',
      title: 'Gestión de Estudiantes - IaStories'
    }
  },
  
  // ============================================================================
  // 👤 RUTAS COMPARTIDAS (REQUIEREN AUTENTICACIÓN)
  // ============================================================================
  {
    path: '/perfil',
    name: 'ProfileView',
    component: () => import('../views/ProfileView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Mi Perfil - IaStories'
    }
  },
  
  // ============================================================================
  // ❌ RUTA 404 (CATCH ALL)
  // ============================================================================
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: 'Página no encontrada - IaStories'
    }
  }
]

// ============================================================================
// 🚀 CONFIGURACIÓN DEL ROUTER
// ============================================================================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Restaurar posición guardada o ir al top
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// ============================================================================
// 🛡️ GUARDS DE NAVEGACIÓN (INTEGRADOS CON EL BACKEND)
// ============================================================================
router.beforeEach(async (to, from, next) => {
    console.log(`🚀 Navegando a: ${to.path}`)

    try {
        // Importar dinámicamente el store de auth
        const { useAuthStore } = await import('../stores/auth.js')
        const authStore = useAuthStore()

        // ========================================================================
        // 🔄 INICIALIZAR AUTENTICACIÓN SI ES NECESARIO
        // ========================================================================
        if (!authStore.user && localStorage.getItem('user')) {
            console.log('🔄 Inicializando autenticación desde localStorage...')
            authStore.initAuth()
        }

        const isAuthenticated = authStore.isAuthenticated
        const userType = authStore.userType
        const user = authStore.user

        console.log(`📊 Estado de auth: ${isAuthenticated ? 'autenticado' : 'no autenticado'}, tipo: ${userType}`)

        // ========================================================================
        // 🚪 VERIFICAR RUTAS QUE REQUIEREN AUTENTICACIÓN
        // ========================================================================
        if (to.meta.requiresAuth && !isAuthenticated) {
            console.log('❌ Acceso denegado: requiere autenticación')
            next('/login')
            return
        }

        // ========================================================================
        // 👤 VERIFICAR RUTAS SOLO PARA INVITADOS
        // ========================================================================
        if (to.meta.requiresGuest && isAuthenticated) {
            console.log('♻️ Usuario ya autenticado, redirigiendo a dashboard')
            if (userType === 'alumno') {
                next('/dashboard-alumno')
            } else if (userType === 'docente') {
                next('/dashboard-docente')
            } else {
                authStore.logout()
                next('/login')
            }
            return
        }

        // ========================================================================
        // 🔐 VERIFICAR TIPO DE USUARIO ESPECÍFICO (GENERAL)
        // ========================================================================
        if (to.name !== 'VerHistoria' && to.meta.userType && userType !== to.meta.userType) {
            console.log(`❌ Acceso denegado: requiere tipo ${to.meta.userType}, usuario es ${userType}`)
            if (userType === 'alumno') {
                next('/dashboard-alumno')
            } else if (userType === 'docente') {
                next('/dashboard-docente')
            } else {
                authStore.logout()
                next('/login')
            }
            return
        }

        // ========================================================================
        // 🎯 VALIDACIÓN ESPECIAL PARA VerHistoria
        // ========================================================================
        if (to.name === 'VerHistoria') {
            const historiaId = parseInt(to.params.id)
            const modo = to.query.modo || 'juego'

            if (isNaN(historiaId) || historiaId <= 0) {
                console.log('❌ ID de historia inválido')
                next('/mis-historias')
                return
            }

            if (userType === 'alumno' && modo === 'juego') {
                next() // ✅ alumno puede jugar
                return
            }

            if (userType === 'docente' && modo === 'revision') {
                next() // ✅ docente puede revisar
                return
            }

            // ❌ acceso no válido
            console.log('❌ Acceso no válido a VerHistoria')
            if (userType === 'alumno') {
                next('/dashboard-alumno')
            } else if (userType === 'docente') {
                next('/dashboard-docente')
            } else {
                authStore.logout()
                next('/login')
            }
            return
        }

        // ========================================================================
        // 📋 ESTABLECER TÍTULO DE LA PÁGINA
        // ========================================================================
        document.title = to.meta.title || 'IaStories - Educación con IA'

        // ========================================================================
        // ✅ PERMITIR NAVEGACIÓN
        // ========================================================================
        console.log('✅ Navegación permitida')
        next()

    } catch (error) {
        console.error('❌ Error en guard de navegación:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('profile')
        next('/login')
    }
})

// ============================================================================
// 🔄 HOOK DESPUÉS DE CADA NAVEGACIÓN
// ============================================================================

router.afterEach((to, from) => {
  // Log de navegación exitosa
  console.log(`✅ Navegación completada: ${from.path} → ${to.path}`)
  
  // Cerrar menús móviles si están abiertos
  const mobileMenus = document.querySelectorAll('.mobile-menu, .user-menu, .dropdown-menu')
  mobileMenus.forEach(menu => {
    if (menu.classList.contains('open')) {
      menu.classList.remove('open')
    }
  })
})

// ============================================================================
// ⚠️ MANEJO DE ERRORES DE NAVEGACIÓN
// ============================================================================

router.onError((error, to, from) => {
  console.error('❌ Error de navegación:', error)
  
  // Errores comunes de chunk loading (código dividido)
  if (error.message.includes('Loading chunk') || 
      error.message.includes('Loading CSS chunk') ||
      error.message.includes('Failed to fetch dynamically imported module')) {
    console.log('🔄 Error de chunk loading, recargando página...')
    window.location.reload()
    return
  }
  
  // Otros errores de navegación
  console.log('🚨 Error de navegación no recuperable')
  
  // Intentar navegar a una ruta segura
  try {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      if (userData.tipo === 'alumno') {
        router.push('/dashboard-alumno')
      } else if (userData.tipo === 'docente') {
        router.push('/dashboard-docente')
      } else {
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  } catch (e) {
    console.error('Error en recuperación de navegación:', e)
    router.push('/login')
  }
})

export default router