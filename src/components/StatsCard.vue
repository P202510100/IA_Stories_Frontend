<!-- components/StatsCard.vue - TARJETAS DE ESTADÍSTICAS -->
<template>
  <div 
    class="stats-card"
    :class="[
      `type-${tipo}`,
      `size-${size}`,
      { 
        'clickable': clickable,
        'loading': loading,
        'error': error
      }
    ]"
    @click="handleClick"
  >
    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <p class="error-message">{{ error }}</p>
      <button v-if="onRetry" @click.stop="onRetry" class="retry-btn">
        🔄 Reintentar
      </button>
    </div>

    <!-- Contenido normal -->
    <template v-else>
      <!-- Header de la tarjeta -->
      <div class="stats-header">
        <div class="stats-icon">
          {{ icono }}
        </div>
        <div class="stats-meta">
          <span v-if="categoria" class="stats-categoria">{{ categoria }}</span>
          <span v-if="fecha" class="stats-fecha">{{ formatDate(fecha) }}</span>
        </div>
      </div>

      <!-- Valor principal -->
      <div class="stats-content">
        <div class="stats-valor-principal">
          <span class="valor">{{ formatValue(valor) }}</span>
          <span v-if="unidad" class="unidad">{{ unidad }}</span>
        </div>
        <h3 class="stats-titulo">{{ titulo }}</h3>
        <p v-if="descripcion" class="stats-descripcion">{{ descripcion }}</p>
      </div>

      <!-- Indicador de cambio/tendencia -->
      <div v-if="cambio !== null && cambio !== undefined" class="stats-cambio">
        <span 
          class="cambio-valor"
          :class="getCambioClass(cambio)"
        >
          <span class="cambio-icon">{{ getCambioIcon(cambio) }}</span>
          {{ formatCambio(cambio) }}
        </span>
        <span v-if="textoCambio" class="cambio-texto">{{ textoCambio }}</span>
      </div>

      <!-- Progreso bar si está disponible -->
      <div v-if="progreso !== null && progreso !== undefined" class="stats-progreso">
        <div class="progreso-info">
          <span class="progreso-label">{{ progresoLabel || 'Progreso' }}</span>
          <span class="progreso-valor">{{ Math.round(progreso) }}%</span>
        </div>
        <div class="progreso-bar">
          <div 
            class="progreso-fill"
            :class="getProgresoClass(progreso)"
            :style="{ width: Math.min(progreso, 100) + '%' }"
          ></div>
        </div>
      </div>

      <!-- Mini chart si está disponible -->
      <div v-if="chartData && chartData.length > 0" class="stats-chart">
        <svg 
          class="mini-chart" 
          :width="chartWidth" 
          :height="chartHeight"
          :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
        >
          <polyline
            :points="getChartPoints()"
            class="chart-line"
            :class="`chart-${tipo}`"
          />
          <circle
            v-for="(point, index) in getChartPoints().split(' ')"
            :key="index"
            :cx="point.split(',')[0]"
            :cy="point.split(',')[1]"
            r="2"
            class="chart-point"
            :class="`chart-${tipo}`"
          />
        </svg>
      </div>

      <!-- Detalles adicionales -->
      <div v-if="detalles && detalles.length > 0" class="stats-detalles">
        <div 
          v-for="detalle in detalles" 
          :key="detalle.label"
          class="detalle-item"
        >
          <span class="detalle-label">{{ detalle.label }}:</span>
          <span class="detalle-valor">{{ formatValue(detalle.valor) }}</span>
        </div>
      </div>

      <!-- Footer con acciones -->
      <div v-if="$slots.acciones || mostrarAcciones" class="stats-footer">
        <slot name="acciones" :stats="statsData">
          <button v-if="onVerMas" @click.stop="onVerMas" class="btn-ver-mas">
            Ver más →
          </button>
        </slot>
      </div>

      <!-- Badge de estado/destacado -->
      <div v-if="badge" class="stats-badge" :class="`badge-${badge.tipo || 'info'}`">
        {{ badge.texto }}
      </div>

      <!-- Comparación con objetivo -->
      <div v-if="objetivo" class="stats-objetivo">
        <div class="objetivo-info">
          <span class="objetivo-label">Objetivo: {{ formatValue(objetivo) }}</span>
          <span class="objetivo-progreso">
            {{ Math.round((valor / objetivo) * 100) }}%
          </span>
        </div>
        <div class="objetivo-bar">
          <div 
            class="objetivo-fill"
            :style="{ width: Math.min((valor / objetivo) * 100, 100) + '%' }"
            :class="{ 'objetivo-cumplido': valor >= objetivo }"
          ></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'StatsCard',
  props: {
    // Datos principales
    valor: {
      type: [Number, String],
      required: true
    },
    titulo: {
      type: String,
      required: true
    },
    descripcion: {
      type: String,
      default: ''
    },
    icono: {
      type: String,
      default: '📊'
    },
    unidad: {
      type: String,
      default: ''
    },
    
    // Categorización y metadatos
    tipo: {
      type: String,
      default: 'default', // default, success, warning, danger, info, primary
      validator: (value) => ['default', 'success', 'warning', 'danger', 'info', 'primary'].includes(value)
    },
    categoria: {
      type: String,
      default: ''
    },
    fecha: {
      type: [String, Date],
      default: null
    },
    
    // Tendencias y cambios
    cambio: {
      type: Number,
      default: null
    },
    textoCambio: {
      type: String,
      default: ''
    },
    
    // Progreso
    progreso: {
      type: Number,
      default: null
    },
    progresoLabel: {
      type: String,
      default: ''
    },
    objetivo: {
      type: Number,
      default: null
    },
    
    // Chart
    chartData: {
      type: Array,
      default: () => []
    },
    chartWidth: {
      type: Number,
      default: 150
    },
    chartHeight: {
      type: Number,
      default: 40
    },
    
    // Detalles adicionales
    detalles: {
      type: Array,
      default: () => []
    },
    badge: {
      type: Object,
      default: null // { texto: '', tipo: 'success|warning|danger|info' }
    },
    
    // Configuración de comportamiento
    size: {
      type: String,
      default: 'normal', // small, normal, large
      validator: (value) => ['small', 'normal', 'large'].includes(value)
    },
    clickable: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    mostrarAcciones: {
      type: Boolean,
      default: false
    },
    
    // Callbacks
    onVerMas: {
      type: Function,
      default: null
    },
    onRetry: {
      type: Function,
      default: null
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    // ============================================================================
    // 🔄 COMPUTED PROPERTIES
    // ============================================================================
    
    const statsData = computed(() => ({
      valor: props.valor,
      titulo: props.titulo,
      descripcion: props.descripcion,
      tipo: props.tipo,
      cambio: props.cambio,
      progreso: props.progreso
    }))
    
    // ============================================================================
    // 🎨 MÉTODOS DE FORMATO
    // ============================================================================
    
    const formatValue = (value) => {
      if (value === null || value === undefined) return '—'
      
      if (typeof value === 'number') {
        // Formatear números grandes
        if (value >= 1000000) {
          return (value / 1000000).toFixed(1) + 'M'
        } else if (value >= 1000) {
          return (value / 1000).toFixed(1) + 'K'
        } else if (value % 1 !== 0) {
          return value.toFixed(1)
        }
        return value.toString()
      }
      
      return value.toString()
    }
    
    const formatDate = (date) => {
      if (!date) return ''
      
      const dateObj = typeof date === 'string' ? new Date(date) : date
      const now = new Date()
      const diffTime = Math.abs(now - dateObj)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return 'Hoy'
      if (diffDays === 2) return 'Ayer'
      if (diffDays <= 7) return `Hace ${diffDays} días`
      
      return dateObj.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      })
    }
    
    const formatCambio = (cambio) => {
      if (cambio === null || cambio === undefined) return ''
      
      const valor = Math.abs(cambio)
      if (valor % 1 !== 0) {
        return valor.toFixed(1) + '%'
      }
      return valor + '%'
    }
    
    // ============================================================================
    // 🎯 MÉTODOS DE ESTILO Y CLASES
    // ============================================================================
    
    const getCambioClass = (cambio) => {
      if (cambio > 0) return 'cambio-positivo'
      if (cambio < 0) return 'cambio-negativo'
      return 'cambio-neutral'
    }
    
    const getCambioIcon = (cambio) => {
      if (cambio > 0) return '↗️'
      if (cambio < 0) return '↘️'
      return '➡️'
    }
    
    const getProgresoClass = (progreso) => {
      if (progreso >= 90) return 'progreso-excelente'
      if (progreso >= 70) return 'progreso-bueno'
      if (progreso >= 40) return 'progreso-regular'
      return 'progreso-bajo'
    }
    
    // ============================================================================
    // 📈 MÉTODOS DE CHART
    // ============================================================================
    
    const getChartPoints = () => {
      if (!props.chartData || props.chartData.length === 0) return ''
      
      const data = props.chartData
      const maxVal = Math.max(...data)
      const minVal = Math.min(...data)
      const range = maxVal - minVal || 1
      
      return data.map((value, index) => {
        const x = (index / (data.length - 1)) * props.chartWidth
        const y = props.chartHeight - ((value - minVal) / range) * props.chartHeight
        return `${x},${y}`
      }).join(' ')
    }
    
    // ============================================================================
    // 🎯 MÉTODOS DE INTERACCIÓN
    // ============================================================================
    
    const handleClick = () => {
      if (props.clickable && !props.loading && !props.error) {
        emit('click', statsData.value)
      }
    }
    
    return {
      // Computed
      statsData,
      
      // Métodos de formato
      formatValue,
      formatDate,
      formatCambio,
      
      // Métodos de estilo
      getCambioClass,
      getCambioIcon,
      getProgresoClass,
      
      // Métodos de chart
      getChartPoints,
      
      // Métodos de interacción
      handleClick
    }
  }
}
</script>

<style scoped>
/* ============================================================================ */
/* 🎨 COMPONENTE STATS CARD */
/* ============================================================================ */

.stats-card {
  position: relative;
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  transition: all 0.3s ease;
}

/* Tipos de tarjetas */
.stats-card.type-default::before {
  background: linear-gradient(45deg, #6c757d, #495057);
}

.stats-card.type-primary::before {
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.stats-card.type-success::before {
  background: linear-gradient(45deg, #4caf50, #8bc34a);
}

.stats-card.type-warning::before {
  background: linear-gradient(45deg, #ff9800, #ffc107);
}

.stats-card.type-danger::before {
  background: linear-gradient(45deg, #f44336, #e57373);
}

.stats-card.type-info::before {
  background: linear-gradient(45deg, #2196f3, #03a9f4);
}

/* Tamaños */
.stats-card.size-small {
  padding: 15px;
  border-radius: 10px;
}

.stats-card.size-large {
  padding: 30px;
  border-radius: 20px;
}

/* Estados */
.stats-card.clickable {
  cursor: pointer;
}

.stats-card.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stats-card.loading {
  pointer-events: none;
}

.stats-card.error {
  border-color: #f44336;
  background: #fff5f5;
}

/* ============================================================================ */
/* 📋 HEADER */
/* ============================================================================ */

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.stats-icon {
  font-size: 2em;
  line-height: 1;
}

.stats-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.stats-categoria {
  font-size: 0.8em;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-fecha {
  font-size: 0.75em;
  color: #adb5bd;
  font-weight: 500;
}

/* ============================================================================ */
/* 📊 CONTENIDO PRINCIPAL */
/* ============================================================================ */

.stats-content {
  margin-bottom: 15px;
}

.stats-valor-principal {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 8px;
}

.valor {
  font-size: 2.5em;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.size-small .valor {
  font-size: 2em;
}

.size-large .valor {
  font-size: 3em;
}

.unidad {
  font-size: 1em;
  color: #718096;
  font-weight: 500;
}

.stats-titulo {
  font-size: 1.1em;
  color: #4a5568;
  font-weight: 600;
  margin-bottom: 5px;
  line-height: 1.2;
}

.stats-descripcion {
  font-size: 0.9em;
  color: #718096;
  line-height: 1.4;
  margin: 0;
}

/* ============================================================================ */
/* 📈 CAMBIOS Y TENDENCIAS */
/* ============================================================================ */

.stats-cambio {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.cambio-valor {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.85em;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
}

.cambio-valor.cambio-positivo {
  background: linear-gradient(45deg, #d4edda, #c3e6cb);
  color: #155724;
}

.cambio-valor.cambio-negativo {
  background: linear-gradient(45deg, #f8d7da, #f5c6cb);
  color: #721c24;
}

.cambio-valor.cambio-neutral {
  background: linear-gradient(45deg, #e2e3e5, #d6d8db);
  color: #383d41;
}

.cambio-icon {
  font-size: 0.9em;
}

.cambio-texto {
  font-size: 0.8em;
  color: #6c757d;
  font-weight: 500;
}

/* ============================================================================ */
/* 📊 PROGRESO */
/* ============================================================================ */

.stats-progreso {
  margin-bottom: 12px;
}

.progreso-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.progreso-label {
  font-size: 0.85em;
  color: #4a5568;
  font-weight: 500;
}

.progreso-valor {
  font-size: 0.8em;
  color: #718096;
  font-weight: 600;
}

.progreso-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progreso-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progreso-fill.progreso-bajo {
  background: linear-gradient(45deg, #f56565, #fc8181);
}

.progreso-fill.progreso-regular {
  background: linear-gradient(45deg, #ed8936, #f6ad55);
}

.progreso-fill.progreso-bueno {
  background: linear-gradient(45deg, #4299e1, #63b3ed);
}

.progreso-fill.progreso-excelente {
  background: linear-gradient(45deg, #48bb78, #68d391);
}

/* ============================================================================ */
/* 📈 MINI CHART */
/* ============================================================================ */

.stats-chart {
  margin-bottom: 12px;
}

.mini-chart {
  width: 100%;
  height: 40px;
}

.chart-line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-point {
  fill: white;
  stroke-width: 1;
}

.chart-line.chart-default,
.chart-point.chart-default {
  stroke: #6c757d;
}

.chart-line.chart-primary,
.chart-point.chart-primary {
  stroke: #667eea;
}

.chart-line.chart-success,
.chart-point.chart-success {
  stroke: #4caf50;
}

.chart-line.chart-warning,
.chart-point.chart-warning {
  stroke: #ff9800;
}

.chart-line.chart-danger,
.chart-point.chart-danger {
  stroke: #f44336;
}

.chart-line.chart-info,
.chart-point.chart-info {
  stroke: #2196f3;
}

/* ============================================================================ */
/* 📋 DETALLES */
/* ============================================================================ */

.stats-detalles {
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
  margin-bottom: 12px;
}

.detalle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 0.85em;
}

.detalle-label {
  color: #718096;
  font-weight: 500;
}

.detalle-valor {
  color: #2d3748;
  font-weight: 600;
}

/* ============================================================================ */
/* 🎯 OBJETIVO */
/* ============================================================================ */

.stats-objetivo {
  margin-bottom: 12px;
}

.objetivo-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.objetivo-label {
  font-size: 0.8em;
  color: #4a5568;
  font-weight: 500;
}

.objetivo-progreso {
  font-size: 0.8em;
  color: #718096;
  font-weight: 600;
}

.objetivo-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.objetivo-fill {
  height: 100%;
  background: linear-gradient(45deg, #ed8936, #f6ad55);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.objetivo-fill.objetivo-cumplido {
  background: linear-gradient(45deg, #48bb78, #68d391);
}

/* ============================================================================ */
/* 🏷️ BADGE */
/* ============================================================================ */

.stats-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.badge-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.badge-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.badge-info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

/* ============================================================================ */
/* 🎯 FOOTER Y ACCIONES */
/* ============================================================================ */

.stats-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
  text-align: center;
}

.btn-ver-mas {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.85em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 5px 10px;
  border-radius: 5px;
}

.btn-ver-mas:hover {
  background: #f7fafc;
  color: #5a6acf;
}

/* ============================================================================ */
/* 🔄 ESTADOS DE CARGA Y ERROR */
/* ============================================================================ */

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
}

.loading-spinner {
  display: flex;
  gap: 4px;
}

.spinner-circle {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: bounce 0.6s infinite alternate;
}

.spinner-circle:nth-child(2) {
  animation-delay: 0.2s;
}

.spinner-circle:nth-child(3) {
  animation-delay: 0.4s;
}

.error-state {
  text-align: center;
  padding: 20px;
  color: #721c24;
}

.error-icon {
  font-size: 2em;
  margin-bottom: 10px;
  display: block;
}

.error-message {
  font-size: 0.9em;
  margin-bottom: 15px;
}

.retry-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: 500;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #d32f2f;
  transform: translateY(-1px);
}

/* ============================================================================ */
/* 📱 RESPONSIVE */
/* ============================================================================ */

@media (max-width: 768px) {
  .stats-card {
    padding: 15px;
  }
  
  .valor {
    font-size: 2em;
  }
  
  .size-large .valor {
    font-size: 2.5em;
  }
  
  .stats-header {
    margin-bottom: 12px;
  }
  
  .stats-icon {
    font-size: 1.5em;
  }
  
  .stats-titulo {
    font-size: 1em;
  }
  
  .detalle-item {
    font-size: 0.8em;
  }
}

/* ============================================================================ */
/* 🎭 ANIMACIONES */
/* ============================================================================ */

@keyframes bounce {
  to {
    transform: translateY(-8px);
  }
}
</style>