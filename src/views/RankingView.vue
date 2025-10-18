<template>
  <div class="ranking-container">
    <div class="container">
      
      <!-- Header -->
      <div class="ranking-header">
        <button @click="volverAtras" class="btn-back">
          ← Volver
        </button>
        <h1>🏆 Ranking del Salón</h1>
        <p>Ve cómo te comparas con tus compañeros</p>
      </div>
      
      <!-- Filtros -->
      <div class="filtros-section">
        <div class="filtros-card">
          <div class="filtro-grupo">
            <label for="criterio-filtro">📊 Criterio:</label>
            <select id="criterio-filtro" v-model="criterioSeleccionado" @change="cargarRanking">
              <option value="puntos">Puntos totales</option>
              <option value="historias">Historias completadas</option>
              <option value="precision">Precisión promedio</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Mi Posición Destacada -->
      <div v-if="miPosicion" class="mi-posicion-destacada">
        <div class="posicion-card mi-posicion">
          <div class="posicion-crown" v-if="miPosicion.posicion <= 3">
            {{ getCrown(miPosicion.posicion) }}
          </div>
          <div class="posicion-number">
            #{{ miPosicion.posicion }}
          </div>
          <div class="posicion-info">
            <div class="posicion-avatar">
              {{ getInitials(miPosicion.nombre) }}
            </div>
            <div class="posicion-details">
              <h3>{{ miPosicion.nombre }} <span class="you-badge">(Tú)</span></h3>
              <p class="posicion-valor">{{ getValorFormateado(miPosicion) }}</p>
              <div class="posicion-stats">
                <span class="stat-item">📚 {{ miPosicion.historias || 0 }} historias</span>
                <span class="stat-item">⭐ {{ miPosicion.puntos || 0 }} puntos</span>
              </div>
            </div>
          </div>
          <div class="posicion-trend">
            <span class="trend-indicator" :class="getTrendClass(miPosicion.tendencia)">
              {{ getTrendIcon(miPosicion.tendencia) }}
              {{ Math.abs(miPosicion.cambio || 0) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Podio Top 3 -->
      <div v-if="top3.length > 0" class="podio-section">
        <h2>🏆 Podio de Honor</h2>
        <div class="podio">
          <!-- Segundo lugar -->
          <div v-if="top3[1]" class="podio-posicion segundo">
            <div class="podio-crown">🥈</div>
            <div class="podio-avatar">
              {{ getInitials(top3[1].nombre) }}
            </div>
            <div class="podio-info">
              <h4>{{ top3[1].nombre }}</h4>
              <p>{{ getValorFormateado(top3[1]) }}</p>
            </div>
            <div class="podio-pedestal segundo-pedestal">2°</div>
          </div>
          
          <!-- Primer lugar -->
          <div v-if="top3[0]" class="podio-posicion primero">
            <div class="podio-crown">👑</div>
            <div class="podio-avatar">
              {{ getInitials(top3[0].nombre) }}
            </div>
            <div class="podio-info">
              <h4>{{ top3[0].nombre }}</h4>
              <p>{{ getValorFormateado(top3[0]) }}</p>
            </div>
            <div class="podio-pedestal primer-pedestal">1°</div>
          </div>
          
          <!-- Tercer lugar -->
          <div v-if="top3[2]" class="podio-posicion tercero">
            <div class="podio-crown">🥉</div>
            <div class="podio-avatar">
              {{ getInitials(top3[2].nombre) }}
            </div>
            <div class="podio-info">
              <h4>{{ top3[2].nombre }}</h4>
              <p>{{ getValorFormateado(top3[2]) }}</p>
            </div>
            <div class="podio-pedestal tercer-pedestal">3°</div>
          </div>
        </div>
      </div>
      
      <!-- Lista Completa de Rankings -->
      <div class="ranking-completo">
        <div class="ranking-header-section">
          <h2>📋 Ranking Completo</h2>
          <div class="ranking-stats">
            <span class="total-estudiantes">👥 {{ rankingCompleto.length }} estudiantes</span>
          </div>
        </div>
        
        <div v-if="rankingCompleto.length > 0" class="ranking-lista">
          <div
            v-for="(estudiante, index) in rankingCompleto"
            :key="estudiante.id"
            class="ranking-item"
            :class="{ 
              'mi-item': esMiPosicion(estudiante),
              'top-performer': index < 3
            }"
          >
            <div class="ranking-posicion">
              <span class="posicion-numero">{{ index + 1 }}</span>
              <span class="posicion-medal" v-if="index < 3">
                {{ getMedal(index + 1) }}
              </span>
            </div>
            
            <div class="ranking-avatar">
              {{ getInitials(estudiante.nombre) }}
            </div>
            
            <div class="ranking-info">
              <h4>
                {{ estudiante.nombre }}
                <span v-if="esMiPosicion(estudiante)" class="you-indicator">Tú</span>
              </h4>
              <p class="ranking-valor">{{ getValorFormateado(estudiante) }}</p>
              <div class="ranking-detalles">
                <span class="detalle">📚 {{ estudiante.historias || 0 }}</span>
                <span class="detalle">⭐ {{ estudiante.puntos || 0 }}</span>
                <span class="detalle" v-if="estudiante.precision">
                  🎯 {{ estudiante.precision }}%
                </span>
              </div>
            </div>
            
            <div class="ranking-tendencia">
              <div class="tendencia-indicator" :class="getTrendClass(estudiante.tendencia)">
                {{ getTrendIcon(estudiante.tendencia) }}
              </div>
              <span class="cambio-posicion">
                {{ formatearCambio(estudiante.cambio) }}
              </span>
            </div>
            
            <div class="ranking-progreso">
              <div class="progreso-bar">
                <div 
                  class="progreso-fill"
                  :style="{ width: calcularProgreso(estudiante, index) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="!cargando" class="ranking-vacio">
          <div class="vacio-icon">👥</div>
          <h3>No hay datos de ranking</h3>
          <p>Aún no hay suficientes estudiantes o actividades para mostrar un ranking</p>
        </div>
      </div>
      
      <!-- Estadísticas del Período -->
      <div class="estadisticas-periodo">
        <h2>📊 Estadísticas del Período</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <h3>{{ estadisticas.promedioClase || 0 }}%</h3>
            <p>Precisión promedio del salón</p>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <h3>{{ estadisticas.historiasTotal || 0 }}</h3>
            <p>Historias completadas en total</p>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <h3>{{ estadisticas.puntosTotal || 0 }}</h3>
            <p>Puntos conseguidos en total</p>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <h3>{{ estadisticas.rachaMaxima || 0 }}</h3>
            <p>Racha máxima alcanzada</p>
          </div>
        </div>
      </div>
      
      <!-- Loading -->
      <div v-if="cargando" class="loading">
        🔄 Cargando ranking...
      </div>
      
      <!-- Error -->
      <div v-if="error" class="error">
        {{ error }}
      </div>
      <!-- Overlay de carga -->
      <div v-if="cargando" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">Cargando ranking de estudiantes...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import apiService from "../services/api.js";

export default {
  name: 'RankingView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const cargando = ref(true)
    const error = ref('')
    const criterioSeleccionado = ref('puntos')
    const rankingCompleto = ref([])
    const estadisticas = ref({})
    
    const user = computed(() => authStore.user)
    
    const top3 = computed(() => {
      return rankingCompleto.value.slice(0, 3)
    })
    
    const miPosicion = computed(() => {
      const miUsuario = rankingCompleto.value.find(estudiante => 
        estudiante.id === user.value?.id
      )
      
      if (miUsuario) {
        const posicion = rankingCompleto.value.indexOf(miUsuario) + 1
        return {
          ...miUsuario,
          posicion
        }
      }
      
      return null
    })
    
    const cargarRanking = async () => {
      cargando.value = true
      error.value = ''
      
      try {
        // TODO: Llamar API 
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Datos de ejemplo
        const datos = generarDatosRanking()
        rankingCompleto.value = datos.ranking
        estadisticas.value = datos.estadisticas
        
      } catch (err) {
        console.error('Error cargando ranking:', err)
        error.value = 'Error al cargar el ranking'
      } finally {
        cargando.value = false
      }
    }
    
const generarDatosRanking = async () => {
  try {
    const response = await apiService.obtenerRanking();
    console.log('response from ranking', response)
    const estudiantesReales = (response.ranking || []).map((estudiante, index) => ({
      id: estudiante.id,
      nombre: estudiante.nombre,
      puntos: estudiante.puntos || 0,
      historias: estudiante.historias || 0,
      precision: estudiante.precision || 0,
      respuestas_correctas: estudiante.respuestas_correctas || 0,
      total_respuestas: estudiante.total_respuestas || 0,
      tendencia: determinarTendencia(index),
      cambio: Math.floor(Math.random() * 5) - 2
    }));

    rankingCompleto.value = estudiantesReales;
    estadisticas.value = response.estadisticas;

    console.log("✅ Ranking cargado:", estudiantesReales);
  } catch (err) {
    console.error("❌ Error cargando ranking:", err);
    error.value = "Error al cargar el ranking";
  } finally {
    cargando.value = false;
  }
}

//  AGREGAR funciones auxiliares
const calcularPrecisionRanking = (estudiante) => {
  if (estudiante.respuestas_correctas && estudiante.total_respuestas) {
    return Math.round((estudiante.respuestas_correctas / estudiante.total_respuestas) * 100)
  }
  
  // Estimación temporal
  const puntos = estudiante.puntos_totales || 0
  const historias = estudiante.total_historias || 1
  
  return Math.min(100, Math.max(50, Math.round((puntos / (historias * 100)) * 100)))
}

const determinarTendencia = (index) => {
  // Temporal hasta tener datos reales de tendencia
  const tendencias = ['up', 'down', 'stable']
  return tendencias[index % 3]
}

    
    const getInitials = (nombre) => {
      return nombre.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    
    const getCrown = (posicion) => {
      const crowns = ['👑', '🥈', '🥉']
      return crowns[posicion - 1] || ''
    }
    
    const getMedal = (posicion) => {
      const medals = ['🥇', '🥈', '🥉']
      return medals[posicion - 1] || ''
    }
    
    const getValorFormateado = (estudiante) => {
      switch (criterioSeleccionado.value) {
        case 'puntos':
          return `${estudiante.puntos} puntos`
        case 'historias':
          return `${estudiante.historias} historias`
        case 'precision':
          return `${estudiante.precision}% precisión`
        default:
          return `${estudiante.puntos} puntos`
      }
    }
    
    const getTrendClass = (tendencia) => {
      switch (tendencia) {
        case 'up':
          return 'trend-up'
        case 'down':
          return 'trend-down'
        case 'stable':
          return 'trend-stable'
        default:
          return 'trend-stable'
      }
    }
    
    const getTrendIcon = (tendencia) => {
      switch (tendencia) {
        case 'up':
          return '↗️'
        case 'down':
          return '↘️'
        case 'stable':
          return '→'
        default:
          return '→'
      }
    }
    
    const formatearCambio = (cambio) => {
      if (!cambio || cambio === 0) return '='
      if (cambio > 0) return `+${cambio}`
      return `${cambio}`
    }
    
    const calcularProgreso = (estudiante, index) => {
      if (index === 0) return 100
      const mejorValor = rankingCompleto.value[0]?.[criterioSeleccionado.value] || 1
      const valorEstudiante = estudiante[criterioSeleccionado.value] || 0
      return Math.max(10, (valorEstudiante / mejorValor) * 100)
    }
    
    const esMiPosicion = (estudiante) => {
      return estudiante.id === user.value?.id
    }
    
    const volverAtras = () => {
      router.push('/dashboard-alumno')
    }
    
    onMounted(() => {
      cargarRanking()
    })
    
    return {
      cargando,
      error,
      criterioSeleccionado,
      rankingCompleto,
      estadisticas,
      top3,
      miPosicion,
      cargarRanking,
      getInitials,
      getCrown,
      getMedal,
      getValorFormateado,
      getTrendClass,
      getTrendIcon,
      formatearCambio,
      calcularProgreso,
      esMiPosicion,
      volverAtras
    }
  }
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.loading-spinner {
  width: 70px;
  height: 70px;
  border: 6px solid #d3d3d3;
  border-top: 6px solid #4c6ef5;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

.loading-text {
  margin-top: 20px;
  font-size: 1.2rem;
  color: #4c6ef5;
  font-weight: 600;
  text-align: center;
  animation: fadeIn 0.5s ease-in;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.ranking-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.ranking-header {
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

.ranking-header h1 {
  color: white;
  font-size: 2.5em;
  margin-bottom: 10px;
}

.ranking-header p {
  color: rgba(255,255,255,0.8);
  font-size: 1.2em;
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

.filtro-grupo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
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
  transition: border-color 0.3s ease;
}

.filtro-grupo select:focus {
  outline: none;
  border-color: #667eea;
}

.mi-posicion-destacada {
  margin-bottom: 30px;
}

.posicion-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.mi-posicion {
  border: 3px solid #667eea;
  background: linear-gradient(135deg, #f8f9ff, #ffffff);
}

.posicion-crown {
  font-size: 2em;
  position: absolute;
  top: -10px;
  right: 20px;
}

.posicion-number {
  font-size: 2.5em;
  font-weight: bold;
  color: #667eea;
  min-width: 80px;
  text-align: center;
}

.posicion-info {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.posicion-avatar {
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

.posicion-details h3 {
  color: #333;
  margin-bottom: 5px;
  font-size: 1.3em;
}

.you-badge {
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7em;
  margin-left: 10px;
}

.posicion-valor {
  color: #666;
  font-size: 1.1em;
  margin-bottom: 8px;
}

.posicion-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  background: #f1f3f4;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8em;
  color: #666;
}

.posicion-trend {
  text-align: center;
}

.trend-indicator {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9em;
  font-weight: 500;
}

.trend-up {
  background: #d4edda;
  color: #155724;
}

.trend-down {
  background: #f8d7da;
  color: #721c24;
}

.trend-stable {
  background: #f1f3f4;
  color: #666;
}

.podio-section {
  margin-bottom: 40px;
}

.podio-section h2 {
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2em;
}

.podio {
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 20px;
  background: white;
  border-radius: 20px;
  padding: 40px 20px 20px;
  position: relative;
}

.podio-posicion {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  position: relative;
}

.podio-crown {
  font-size: 2.5em;
  margin-bottom: 10px;
}

.podio-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3em;
  font-weight: bold;
  color: white;
}

.primero .podio-avatar {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #8b6400;
  width: 80px;
  height: 80px;
}

.segundo .podio-avatar {
  background: linear-gradient(45deg, #c0c0c0, #e8e8e8);
  color: #666;
}

.tercero .podio-avatar {
  background: linear-gradient(45deg, #cd7f32, #d4a574);
  color: #6b4226;
}

.podio-info {
  text-align: center;
}

.podio-info h4 {
  color: #333;
  margin-bottom: 5px;
  font-size: 1em;
}

.podio-info p {
  color: #666;
  font-size: 0.9em;
}

.podio-pedestal {
  width: 120px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  font-weight: bold;
  color: white;
  border-radius: 8px 8px 0 0;
}

.primer-pedestal {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #8b6400;
  height: 100px;
}

.segundo-pedestal {
  background: linear-gradient(45deg, #c0c0c0, #e8e8e8);
  color: #666;
  height: 80px;
}

.tercer-pedestal {
  background: linear-gradient(45deg, #cd7f32, #d4a574);
  color: #6b4226;
  height: 60px;
}

.ranking-completo {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.ranking-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.ranking-header-section h2 {
  color: #667eea;
  font-size: 1.8em;
}

.total-estudiantes {
  background: #f1f3f4;
  padding: 8px 15px;
  border-radius: 15px;
  color: #666;
  font-size: 0.9em;
}

.ranking-lista {
  display: grid;
  gap: 15px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.ranking-item.mi-item {
  border-color: #667eea;
  background: linear-gradient(135deg, #f8f9ff, #ffffff);
}

.ranking-item.top-performer {
  border-color: #ffc107;
  background: linear-gradient(135deg, #fffbf0, #ffffff);
}

.ranking-posicion {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.posicion-numero {
  font-size: 1.5em;
  font-weight: bold;
  color: #667eea;
}

.posicion-medal {
  font-size: 1.2em;
  margin-top: 5px;
}

.ranking-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1em;
  font-weight: bold;
}

.ranking-info {
  flex: 1;
}

.ranking-info h4 {
  color: #333;
  margin-bottom: 5px;
  font-size: 1.1em;
}

.you-indicator {
  background: #667eea;
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.7em;
  margin-left: 8px;
}

.ranking-valor {
  color: #666;
  margin-bottom: 8px;
  font-size: 0.95em;
}

.ranking-detalles {
  display: flex;
  gap: 10px;
}

.detalle {
  background: #f1f3f4;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75em;
  color: #666;
}

.ranking-tendencia {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.tendencia-indicator {
  font-size: 1.2em;
}

.cambio-posicion {
  font-size: 0.8em;
  color: #666;
  font-weight: 500;
}

.ranking-progreso {
  width: 80px;
}

.progreso-bar {
  width: 100%;
  height: 8px;
  background: #e1e5e9;
  border-radius: 4px;
  overflow: hidden;
}

.progreso-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.ranking-vacio {
  text-align: center;
  padding: 40px 20px;
}

.vacio-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.ranking-vacio h3 {
  color: #667eea;
  margin-bottom: 10px;
}

.ranking-vacio p {
  color: #666;
}

.estadisticas-periodo {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.estadisticas-periodo h2 {
  color: #667eea;
  font-size: 1.8em;
  margin-bottom: 25px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 25px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: #667eea;
}

.stat-icon {
  font-size: 2.5em;
  margin-bottom: 15px;
}

.stat-card h3 {
  color: #667eea;
  font-size: 2em;
  margin-bottom: 10px;
}

.stat-card p {
  color: #666;
  font-size: 0.9em;
}

@media (max-width: 768px) {
  .btn-back {
    position: static;
    margin-bottom: 20px;
  }
  
  .ranking-header {
    text-align: center;
  }
  
  .filtros-card {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filtro-grupo {
    min-width: auto;
  }
  
  .podio {
    flex-direction: column;
    align-items: center;
  }
  
  .podio-posicion {
    margin-bottom: 20px;
  }
  
  .ranking-header-section {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .ranking-item {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .ranking-detalles {
    flex-wrap: wrap;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .ranking-header h1 {
    font-size: 2em;
  }
  
  .posicion-card {
    padding: 20px;
    flex-direction: column;
    text-align: center;
  }
  
  .ranking-item {
    padding: 15px;
    flex-direction: column;
    text-align: center;
  }
}
</style>