<!-- components/CharacterGallery.vue - GALERÍA DE PERSONAJES CON IA -->
<template>
  <div class="character-gallery">
    <!-- Header de la galería -->
    <div class="gallery-header">
      <h2>🎨 Galería de Personajes</h2>
      <p>Imágenes generadas automáticamente de los personajes de tu historia</p>
      
      <!-- Acciones principales -->
      <div class="gallery-actions">
        <button 
          @click="generarPersonajes" 
          :disabled="generando || !props.historia.personajes"
          class="btn-generar"
        >
          <span v-if="generando">🎨 Generando...</span>
          <span v-else>✨ Generar Imágenes</span>
        </button>
        
        <button 
          v-if="personajes.length > 0" 
          @click="regenerarTodos"
          :disabled="algunGenerando"
          class="btn-regenerar"
        >
          🔄 Regenerar Todas
        </button>
        
        <button 
          @click="mostrarConfiguracion = !mostrarConfiguracion"
          class="btn-config"
        >
          ⚙️ Configuración
        </button>
      </div>
    </div>

    <!-- Panel de configuración -->
    <div v-if="mostrarConfiguracion" class="configuracion-panel">
      <h3>⚙️ Configuración de Generación</h3>
      <div class="config-grid">
        <div class="config-item">
          <label>🎨 Estilo artístico:</label>
          <select v-model="configuracion.estilo">
            <option value="caricatura">Caricatura amigable</option>
            <option value="anime">Estilo anime</option>
            <option value="realista">Semi-realista</option>
            <option value="pixel">Pixel art</option>
          </select>
        </div>
        <div class="config-item">
          <label>🌈 Paleta de colores:</label>
          <select v-model="configuracion.paleta">
            <option value="vibrante">Colores vibrantes</option>
            <option value="pastel">Tonos pastel</option>
            <option value="natural">Colores naturales</option>
            <option value="fantasia">Colores fantasía</option>
          </select>
        </div>
        <div class="config-item">
          <label>👦 Edad aparente:</label>
          <select v-model="configuracion.edad">
            <option value="niño">Niño (5-10 años)</option>
            <option value="adolescente">Adolescente (11-15 años)</option>
            <option value="joven">Joven (16-25 años)</option>
            <option value="adulto">Adulto</option>
          </select>
        </div>
      </div>
      <div class="config-actions">
        <button @click="aplicarConfiguracion" class="btn-aplicar">
          ✅ Aplicar Configuración
        </button>
      </div>
    </div>

    <!-- Estado de carga global -->
    <div v-if="generando && personajes.length === 0" class="loading-state">
      <div class="loading-animation">
        <div class="ai-generating">
          <div class="ai-icon">🤖</div>
          <div class="generating-text">
            <h3>{{ getTextoGeneracion() }}</h3>
            <p>Paso {{ currentStep }} de 3</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{width: ((currentStep / 3) * 100) + '%'}"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Galería de personajes -->
    <div v-else-if="personajes.length > 0" class="characters-grid">
      <div 
        v-for="(personaje, index) in personajes"
        :key="index"
        class="character-card"
        :class="{ 'generating': personaje.generando }"
      >
        <!-- Imagen del personaje -->
        <div class="character-image-container">
          <div v-if="personaje.generando" class="generating-overlay">
            <div class="generating-spinner">
              <div class="spinner-circle"></div>
              <div class="spinner-circle"></div>
              <div class="spinner-circle"></div>
            </div>
            <p>Generando...</p>
          </div>
          
          <img
            v-else-if="personaje.imagen_url"
            :src="personaje.imagen_url"
            :alt="personaje.nombre"
            class="character-image"
            @click="abrirModal(personaje)"
            @error="manejarErrorImagen(personaje)"
          />
          
          <div
            v-else-if="personaje.error"
            class="image-error"
            @click="regenerarPersonaje(personaje)"
          >
            <span class="error-icon">⚠️</span>
            <p>Error al generar</p>
            <button class="retry-btn">🔄 Reintentar</button>
          </div>
          
          <div v-else class="image-placeholder">
            <span class="placeholder-icon">👤</span>
            <p>Sin imagen</p>
          </div>
          
          <!-- Botones de acción sobre la imagen -->
          <div v-if="!personaje.generando" class="image-actions">
            <button 
              @click="regenerarPersonaje(personaje)"
              class="action-btn"
              title="Regenerar imagen"
            >
              🔄
            </button>
            <button 
              v-if="personaje.imagen_url"
              @click="descargarImagen(personaje)"
              class="action-btn"
              title="Descargar imagen"
            >
              📥
            </button>
            <button 
              v-if="personaje.imagen_url"
              @click="abrirModal(personaje)"
              class="action-btn"
              title="Ver en grande"
            >
              🔍
            </button>
          </div>
        </div>
        
        <!-- Información del personaje -->
        <div class="character-info">
          <h3 class="character-name">{{ personaje.nombre }}</h3>
          <p class="character-description">{{ personaje.descripcion }}</p>
          
          <!-- Traits del personaje -->
          <div v-if="personaje.traits" class="character-traits">
            <span 
              v-for="trait in personaje.traits" 
              :key="trait"
              class="trait-tag"
            >
              {{ trait }}
            </span>
          </div>
          
          <!-- Metadatos de generación -->
          <div class="generation-meta">
            <small v-if="personaje.timestamp">
              Generado {{ formatearTiempoGeneracion(personaje.timestamp) }}
            </small>
            <small v-if="personaje.metadatos?.modelo" class="model-tag">
              {{ personaje.metadatos.modelo }}
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎭</div>
      <h3>Sin personajes generados</h3>
      <p>Los personajes de tu historia aún no tienen imágenes.</p>
      <button 
        @click="generarPersonajes"
        :disabled="!props.historia.personajes"
        class="btn-generar-principal"
      >
        ✨ Generar Imágenes de Personajes
      </button>
    </div>

    <!-- Modal para vista ampliada -->
    <div v-if="modalPersonaje" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalPersonaje.nombre }}</h3>
          <button @click="cerrarModal" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <img 
            :src="modalPersonaje.imagen_url" 
            :alt="modalPersonaje.nombre"
            class="modal-image"
          />
          <div class="modal-info">
            <p><strong>Descripción:</strong> {{ modalPersonaje.descripcion }}</p>
            <div v-if="modalPersonaje.traits" class="modal-traits">
              <strong>Características:</strong>
              <div class="traits-list">
                <span 
                  v-for="trait in modalPersonaje.traits" 
                  :key="trait"
                  class="trait-tag"
                >
                  {{ trait }}
                </span>
              </div>
            </div>
            <div v-if="modalPersonaje.metadatos" class="modal-metadata">
              <h4>📊 Metadatos de generación</h4>
              <ul>
                <li v-if="modalPersonaje.metadatos.prompt">
                  <strong>Prompt:</strong> {{ modalPersonaje.metadatos.prompt }}
                </li>
                <li v-if="modalPersonaje.metadatos.modelo">
                  <strong>Modelo:</strong> {{ modalPersonaje.metadatos.modelo }}
                </li>
                <li v-if="modalPersonaje.timestamp">
                  <strong>Generado:</strong> {{ formatearFechaCompleta(modalPersonaje.timestamp) }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="descargarImagen(modalPersonaje)" class="btn-download">
            📥 Descargar
          </button>
          <button @click="compartirPersonaje(modalPersonaje)" class="btn-share">
            📤 Compartir
          </button>
          <button @click="regenerarPersonaje(modalPersonaje)" class="btn-regenerate">
            🔄 Regenerar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { api } from '../services/api'

export default {
  name: 'CharacterGallery',
  props: {
    historia: {
      type: Object,
      required: true
    },
    autoGenerar: {
      type: Boolean,
      default: false
    }
  },
  emits: ['personajes-generados', 'error'],
  setup(props, { emit }) {
    // ============================================================================
    // 🔄 ESTADO REACTIVO
    // ============================================================================
    
    const personajes = ref([])
    const generando = ref(false)
    const currentStep = ref(1)
    const modalPersonaje = ref(null)
    const mostrarConfiguracion = ref(false)
    
    const configuracion = ref({
      estilo: 'caricatura',
      paleta: 'vibrante',
      edad: 'niño'
    })
    
    // ============================================================================
    // 🔄 COMPUTED PROPERTIES
    // ============================================================================
    
    const algunGenerando = computed(() => {
      return personajes.value.some(p => p.generando)
    })
    
    // ============================================================================
    // 🎨 MÉTODOS PRINCIPALES
    // ============================================================================
    
    const generarPersonajes = async () => {
      if (!props.historia.personajes) {
        emit('error', 'No hay personajes en la historia para generar imágenes')
        return
      }
      
      generando.value = true
      currentStep.value = 1
      
      try {
        // Paso 1: Extraer personajes del contenido
        currentStep.value = 1
        const personajesTexto = typeof props.historia.personajes === 'string' 
          ? props.historia.personajes 
          : props.historia.personajes.join(', ')
        
        const listaPersonajes = personajesTexto.split(',').map(p => p.trim()).filter(p => p.length > 0)
        
        // Paso 2: Generar prompts para cada personaje
        currentStep.value = 2
        const promptsResponse = await api.post('/historia/generar-prompts-personajes', {
          historia_id: props.historia.id,
          personajes: listaPersonajes,
          tema: props.historia.tema,
          configuracion: configuracion.value
        })
        
        if (!promptsResponse.data.success) {
          throw new Error(promptsResponse.data.error || 'Error generando prompts')
        }
        
        const prompts = promptsResponse.data.prompts
        
        // Paso 3: Inicializar personajes con estado de generación
        currentStep.value = 3
        personajes.value = listaPersonajes.map((nombre, index) => ({
          nombre: nombre,
          descripcion: `Personaje de la historia "${props.historia.titulo}"`,
          traits: generarTraitsAleatorios(),
          prompt: prompts[index] || generarPromptPersonaje(nombre, props.historia.tema),
          generando: true,
          imagen_url: null,
          error: null,
          timestamp: null,
          metadatos: {}
        }))
        
        // Generar imágenes una por una
        for (let i = 0; i < personajes.value.length; i++) {
          await generarImagenPersonaje(i)
        }
        
        emit('personajes-generados', personajes.value)
        
      } catch (error) {
        console.error('Error generando personajes:', error)
        emit('error', error.message || 'Error generando imágenes de personajes')
      } finally {
        generando.value = false
      }
    }
    
    const generarImagenPersonaje = async (index) => {
      const personaje = personajes.value[index]
      
      try {
        personaje.generando = true
        personaje.error = null
        
        // Llamada al backend para generar imagen
        const response = await api.post('/historia/generar-imagen-personaje', {
          historia_id: props.historia.id,
          personaje: personaje.nombre,
          prompt: personaje.prompt,
          configuracion: configuracion.value
        })
        
        if (response.data.success) {
          personaje.imagen_url = response.data.imagen_url
          personaje.metadatos = response.data.metadatos || {}
          personaje.timestamp = new Date().toISOString()
        } else {
          // Si falla la IA, usar imagen de fallback
          personaje.imagen_url = generarURLImagenDemo(personaje)
          personaje.metadatos = { 
            modelo: 'Fallback', 
            nota: 'Imagen de demostración' 
          }
          personaje.timestamp = new Date().toISOString()
        }
        
      } catch (error) {
        console.error(`Error generando imagen para ${personaje.nombre}:`, error)
        personaje.error = 'Error de generación'
        
        // Usar imagen de fallback en caso de error
        personaje.imagen_url = generarURLImagenDemo(personaje)
        personaje.metadatos = { 
          modelo: 'Fallback', 
          nota: 'Imagen de demostración por error' 
        }
        personaje.timestamp = new Date().toISOString()
        
      } finally {
        personaje.generando = false
      }
    }
    
    const regenerarPersonaje = async (personaje) => {
      const index = personajes.value.findIndex(p => p.nombre === personaje.nombre)
      if (index !== -1) {
        await generarImagenPersonaje(index)
      }
    }
    
    const regenerarTodos = async () => {
      if (algunGenerando.value) return
      
      for (let i = 0; i < personajes.value.length; i++) {
        await generarImagenPersonaje(i)
      }
    }
    
    // ============================================================================
    // 🎯 MÉTODOS DE INTERACCIÓN
    // ============================================================================
    
    const abrirModal = (personaje) => {
      modalPersonaje.value = personaje
    }
    
    const cerrarModal = () => {
      modalPersonaje.value = null
    }
    
    const descargarImagen = async (personaje) => {
      if (!personaje.imagen_url) return
      
      try {
        const response = await fetch(personaje.imagen_url)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `${personaje.nombre}_${props.historia.titulo}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error descargando imagen:', error)
      }
    }
    
    const compartirPersonaje = async (personaje) => {
      if (navigator.share && personaje.imagen_url) {
        try {
          await navigator.share({
            title: `Personaje: ${personaje.nombre}`,
            text: `Mira este personaje de mi historia "${props.historia.titulo}"`,
            url: personaje.imagen_url
          })
        } catch (error) {
          console.log('Error compartiendo:', error)
        }
      } else {
        // Fallback: copiar URL al portapapeles
        try {
          await navigator.clipboard.writeText(personaje.imagen_url)
          alert('URL copiada al portapapeles')
        } catch (error) {
          console.error('Error copiando URL:', error)
        }
      }
    }
    
    const manejarErrorImagen = (personaje) => {
      personaje.error = 'Error cargando imagen'
    }
    
    const aplicarConfiguracion = () => {
      mostrarConfiguracion.value = false
      // toastStore.success('Configuración aplicada')
    }
    
    // ============================================================================
    // 🛠️ MÉTODOS AUXILIARES
    // ============================================================================
    
    const getTextoGeneracion = () => {
      const textos = [
        'Analizando personajes...',
        'Creando prompts creativos...',
        'Generando imágenes con IA...'
      ]
      return textos[currentStep.value - 1] || 'Procesando...'
    }
    
    const generarTraitsAleatorios = () => {
      const traits = ['Valiente', 'Inteligente', 'Amigable', 'Curioso', 'Leal', 'Divertido', 'Sabio', 'Ágil', 'Creativo', 'Protector']
      return traits.sort(() => 0.5 - Math.random()).slice(0, 3)
    }
    
    const generarPromptPersonaje = (nombre, tema) => {
      return `${nombre}, personaje de historia ${tema}, estilo caricatura amigable para niños, colores vibrantes`
    }
    
    const generarURLImagenDemo = (personaje) => {
      // URLs de imágenes de demostración usando DiceBear API
      const estilos = ['avataaars', 'big-smile', 'croodles', 'fun-emoji']
      const estilo = estilos[Math.floor(Math.random() * estilos.length)]
      const seed = encodeURIComponent(personaje.nombre)
      return `https://api.dicebear.com/7.x/${estilo}/svg?seed=${seed}&backgroundColor=random`
    }
    
    const formatearTiempoGeneracion = (timestamp) => {
      if (!timestamp) return ''
      const fecha = new Date(timestamp)
      const ahora = new Date()
      const diffMinutos = Math.floor((ahora - fecha) / (1000 * 60))
      
      if (diffMinutos < 1) return 'hace unos segundos'
      if (diffMinutos < 60) return `hace ${diffMinutos} min`
      
      const diffHoras = Math.floor(diffMinutos / 60)
      if (diffHoras < 24) return `hace ${diffHoras}h`
      
      return fecha.toLocaleDateString()
    }
    
    const formatearFechaCompleta = (timestamp) => {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleString('es-ES')
    }
    
    // ============================================================================
    // 🚀 LIFECYCLE
    // ============================================================================
    
    onMounted(() => {
      // Cargar personajes existentes si los hay
      if (props.historia.personajes_imagenes) {
        personajes.value = props.historia.personajes_imagenes
      }
      
      // Auto-generar si está habilitado y no hay personajes
      if (props.autoGenerar && personajes.value.length === 0) {
        generarPersonajes()
      }
    })
    
    return {
      // Estados
      personajes,
      generando,
      currentStep,
      modalPersonaje,
      mostrarConfiguracion,
      configuracion,
      
      // Computed
      algunGenerando,
      
      // Métodos
      generarPersonajes,
      regenerarPersonaje,
      regenerarTodos,
      abrirModal,
      cerrarModal,
      descargarImagen,
      compartirPersonaje,
      manejarErrorImagen,
      aplicarConfiguracion,
      getTextoGeneracion,
      formatearTiempoGeneracion,
      formatearFechaCompleta
    }
  }
}
</script>

<style scoped>
.character-gallery {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin: 25px 0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.gallery-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.gallery-header h2 {
  color: #667eea;
  font-size: 2em;
  margin-bottom: 10px;
}

.gallery-header p {
  color: #666;
  font-size: 1.1em;
  margin-bottom: 20px;
}

.gallery-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-generar,
.btn-regenerar,
.btn-config {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-config {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
}

.btn-generar:hover,
.btn-regenerar:hover:not(:disabled),
.btn-config:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-regenerar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Configuración */
.configuracion-panel {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 25px;
  border: 1px solid #e9ecef;
}

.configuracion-panel h3 {
  margin-bottom: 15px;
  color: #495057;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.config-item label {
  display: block;
  font-weight: 500;
  margin-bottom: 5px;
  color: #495057;
}

.config-item select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  font-size: 14px;
}

.config-actions {
  text-align: center;
}

.btn-aplicar {
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

/* Estados de carga */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.ai-generating {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 30px;
  border-radius: 15px;
  border: 2px solid #dee2e6;
}

.ai-icon {
  font-size: 3em;
  animation: pulse 2s infinite;
}

.generating-text h3 {
  margin-bottom: 10px;
  color: #495057;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

/* Galería de personajes */
.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.character-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  border: 2px solid #f8f9fa;
}

.character-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  border-color: #667eea;
}

.character-card.generating {
  opacity: 0.7;
  pointer-events: none;
}

.character-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
  background: #f8f9fa;
}

.character-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.character-image:hover {
  transform: scale(1.05);
}

.generating-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.generating-spinner {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.spinner-circle {
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  animation: bounce 0.6s infinite alternate;
}

.spinner-circle:nth-child(2) {
  animation-delay: 0.2s;
}

.spinner-circle:nth-child(3) {
  animation-delay: 0.4s;
}

.image-error,
.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  cursor: pointer;
}

.error-icon,
.placeholder-icon {
  font-size: 2em;
  margin-bottom: 10px;
}

.retry-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.image-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.character-card:hover .image-actions {
  opacity: 1;
}

.action-btn {
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(0,0,0,0.9);
  transform: scale(1.1);
}

/* Información del personaje */
.character-info {
  text-align: center;
}

.character-name {
  font-size: 1.3em;
  color: #495057;
  margin-bottom: 8px;
}

.character-description {
  color: #6c757d;
  font-size: 0.9em;
  margin-bottom: 10px;
  line-height: 1.4;
}

.character-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
  margin-bottom: 10px;
}

.trait-tag {
  background: linear-gradient(45deg, #e8f4f8, #d1ecf1);
  color: #0c5460;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
  border: 1px solid #bee5eb;
}

.generation-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.75em;
  color: #adb5bd;
}

.model-tag {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 8px;
  align-self: center;
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.btn-generar-principal {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.btn-generar-principal:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #adb5bd;
}

.modal-body {
  padding: 20px;
}

.modal-image {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 20px;
}

.modal-info h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #495057;
}

.traits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.modal-metadata ul {
  list-style: none;
  padding: 0;
}

.modal-metadata li {
  padding: 5px 0;
  border-bottom: 1px solid #f8f9fa;
}

.modal-actions {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.btn-download,
.btn-share,
.btn-regenerate {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-download {
  background: #28a745;
  color: white;
}

.btn-share {
  background: #17a2b8;
  color: white;
}

.btn-regenerate {
  background: #ffc107;
  color: #212529;
}

.btn-download:hover,
.btn-share:hover,
.btn-regenerate:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

/* Animaciones */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes bounce {
  to { transform: translateY(-10px); }
}

/* Responsive */
@media (max-width: 768px) {
  .character-gallery {
    padding: 20px;
  }
  
  .characters-grid {
    grid-template-columns: 1fr;
  }
  
  .gallery-actions {
    flex-direction: column;
  }
  
  .ai-generating {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>