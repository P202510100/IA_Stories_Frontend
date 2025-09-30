import { createRouter, createWebHistory } from 'vue-router'

// ============================================================================
//  DEFINICIÓN DE RUTAS
// ============================================================================

const routes = [
  // ============================================================================
  //  RUTA RAÍZ - 
  // ============================================================================
  {
    path: '/',
  name: 'Home',
  redirect: (to) => {
    console.log(' Router: Verificando redirección desde:', to.fullPath)
    
    
    const urlParams = new URLSearchParams(to.fullPath.split('?')[1] || '')
    const forceLogin = urlParams.get('force') === 'true'
    
    if (forceLogin) {
      console.log(' Router: force=true detectado, redirigiendo a login')
      return '/login?force=true'
    }
    
  
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        console.log(' Router: Usuario encontrado en localStorage:', userData.tipo)
        
        if (userData.tipo === 'alumno') {
          console.log(' Router: Redirigiendo a dashboard alumno')
          return '/dashboard-alumno'
        } else if (userData.tipo === 'docente') {
          console.log(' Router: Redirigiendo a dashboard docente')
          return '/dashboard-docente'
        }
      } catch (e) {
        console.error(' Router: Error parsing user data:', e)
        localStorage.removeItem('user')
      }
    }
    
    console.log(' Router: No hay usuario autenticado, redirigiendo a login')
    return '/login'
  }
  },
  
  // ============================================================================
  //  RUTAS PÚBLICAS 
  // ============================================================================
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
  //  RUTAS DE ALUMNO (REQUIEREN AUTENTICACIÓN + TIPO ALUMNO)
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
      userType: 'alumno',
      title: 'Ver Historia - IaStories'
    },
    props: (route) => ({
      historiaId: parseInt(route.params.id)
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
  // 👨 RUTAS DE DOCENTE (REQUIEREN AUTENTICACIÓN + TIPO DOCENTE)
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
  //  RUTAS COMPARTIDAS (REQUIEREN AUTENTICACIÓN)
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
  //  RUTA 404 (CATCH ALL)
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
//  CONFIGURACIÓN DEL ROUTER
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
//  GUARDS DE NAVEGACIÓN MEJORADOS
// ============================================================================

router.beforeEach(async (to, from, next) => {
  console.log(` Navegando a: ${to.path}`)
  
  try {
    // Importar dinámicamente el store de auth
    const { useAuthStore } = await import('../stores/auth.js')
    const authStore = useAuthStore()
    
    // ============================================================================
    //  INICIALIZAR AUTENTICACIÓN SOLO SI NO ESTÁ INICIALIZADA
    // ============================================================================
    
    if (!authStore.user && localStorage.getItem('user')) {
      console.log('🔄 Inicializando autenticación desde localStorage...')
      authStore.initAuth()
    }

    const isAuthenticated = authStore.isAuthenticated
    const userType = authStore.userType
    const user = authStore.user

    console.log(`📊 Estado auth: ${isAuthenticated ? 'autenticado' : 'no autenticado'}, tipo: ${userType}`)

    // ============================================================================
    //  VERIFICAR RUTAS QUE REQUIEREN AUTENTICACIÓN
    // ============================================================================
    
    if (to.meta.requiresAuth && !isAuthenticated) {
      console.log(' Acceso denegado: requiere autenticación')
      // Limpiar datos potencialmente corruptos
      localStorage.removeItem('user')
      next('/login')
      return
    }

    // ============================================================================
    //  VERIFICAR RUTAS SOLO PARA INVITADOS (YA AUTENTICADOS)
    // ============================================================================
    
   if (to.meta.requiresGuest && isAuthenticated) {
  
  // ✅ VERIFICAR SI HAY FORCE=TRUE PARA PERMITIR LOGIN FORZADO
  const forceLogin = to.query.force === 'true' || new URLSearchParams(to.fullPath.split('?')[1] || '').get('force') === 'true'
  
  if (forceLogin) {
    console.log('🔒 Guard: force=true detectado, permitiendo acceso al login')
    // Limpiar sesión para force login
    const { useAuthStore } = await import('../stores/auth.js')
    const authStore = useAuthStore()
    authStore.logout()
    next()
    return
  }
  
  console.log('♻️ Usuario ya autenticado, redirigiendo a dashboard')
  
  if (userType === 'alumno') {
    next('/dashboard-alumno')
  } else if (userType === 'docente') {
    next('/dashboard-docente')
  } else {
    console.warn('⚠️ Tipo de usuario desconocido:', userType)
    authStore.logout()
    next('/login')
  }
  return
}

    // ============================================================================
    //  VERIFICAR TIPO DE USUARIO ESPECÍFICO
    // ============================================================================
    
    if (to.meta.userType && userType !== to.meta.userType) {
      console.log(` Acceso denegado: requiere ${to.meta.userType}, usuario es ${userType}`)
      
      // Redirigir al dashboard correcto del usuario actual
      if (userType === 'alumno') {
        next('/dashboard-alumno')
      } else if (userType === 'docente') {
        next('/dashboard-docente')
      } else {
        console.warn(' Tipo de usuario inválido, cerrando sesión')
        authStore.logout()
        next('/login')
      }
      return
    }

    // ============================================================================
    //  VALIDACIONES ESPECÍFICAS DE RUTAS
    // ============================================================================
    
    // Validar ID de historia para rutas que lo requieren
    if (to.name === 'VerHistoria' && to.params.id) {
      const historiaId = parseInt(to.params.id)
      if (isNaN(historiaId) || historiaId <= 0) {
        console.log(' ID de historia inválido')
        next('/mis-historias')
        return
      }
    }
    
    // Validar ID de estudiante para rutas de docente
    if (to.name === 'DetalleEstudiante' && to.params.id) {
      const estudianteId = parseInt(to.params.id)
      if (isNaN(estudianteId) || estudianteId <= 0) {
        console.log(' ID de estudiante inválido')
        next('/dashboard-docente')
        return
      }
    }

    // ============================================================================
    //  ESTABLECER TÍTULO DE LA PÁGINA
    // ============================================================================
    
    document.title = to.meta.title || 'IaStories - Educación con IA'

    // ============================================================================
    //  PERMITIR NAVEGACIÓN
    // ============================================================================
    
    console.log(' Navegación permitida')
    next()
    
  } catch (error) {
    console.error(' Error en guard de navegación:', error)
    
    // En caso de error crítico, limpiar todo y redirigir al login
    try {
      const { useAuthStore } = await import('../stores/auth.js')
      const authStore = useAuthStore()
      authStore.logout()
    } catch (e) {
      console.error('Error limpiando store:', e)
    }
    
    localStorage.removeItem('user')
    localStorage.removeItem('profile')
    next('/login')
  }
})

// ============================================================================
//  HOOK DESPUÉS DE CADA NAVEGACIÓN
// ============================================================================

router.afterEach((to, from) => {
  console.log(` Navegación completada: ${from.path} → ${to.path}`)
  
  // Cerrar menús móviles si están abiertos
  const mobileMenus = document.querySelectorAll('.mobile-menu, .user-menu, .dropdown-menu')
  mobileMenus.forEach(menu => {
    if (menu.classList.contains('open')) {
      menu.classList.remove('open')
    }
  })
})

// ============================================================================
//  MANEJO DE ERRORES DE NAVEGACIÓN
// ============================================================================

router.onError((error, to, from) => {
  console.error(' Error de navegación:', error)
  
  // Errores comunes de chunk loading (código dividido)
  if (error.message.includes('Loading chunk') || 
      error.message.includes('Loading CSS chunk') ||
      error.message.includes('Failed to fetch dynamically imported module')) {
    console.log(' Error de chunk loading, recargando página...')
    window.location.reload()
    return
  }
  
  // Otros errores de navegación - ir siempre al login en caso de error
  console.log(' Error de navegación no recuperable, redirigiendo al login')
  router.push('/login')
})

export default router