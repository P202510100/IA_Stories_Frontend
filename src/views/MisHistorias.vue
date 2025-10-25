<template>
  <div class="mis-historias">
    <div class="container">

      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Mis Historias</h1>
          <p>Todas las aventuras que has vivido</p>
        </div>
        <div class="header-actions">
          <button @click="irACrearHistoria" class="btn btn-primary">
            ✨ Nueva Historia
          </button>
          <button @click="exportarHistorial" class="btn btn-secondary" :disabled="loadingExport">
            <span v-if="loadingExport">📄 Exportando...</span>
            <span v-else>📄 Exportar PDF</span>
          </button>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="filtros-section">
        <div class="filtros-container">
          <div class="search-box">
            <input
              v-model="filtros.busqueda"
              type="text"
              placeholder="🔍 Buscar por título..."
              class="search-input"
            />
          </div>

          <div class="filtro-tema">
            <select v-model="filtros.tema" class="filtro-select">
              <option value="">🎯 Todos los temas</option>
              <option v-for="tema in temasDisponibles" :key="tema.id" :value="tema.id">
                {{ tema.icono }} {{ tema.nombre }}
              </option>
            </select>
          </div>

          <div class="filtro-orden">
            <select v-model="filtros.orden" class="filtro-select">
              <option value="reciente">📅 Más recientes</option>
              <option value="antiguo">📅 Más antiguos</option>
              <option value="titulo">🔤 Por título</option>
              <option value="puntos">⭐ Por puntos</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div v-if="estadisticas" class="stats-section">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">📚</div>
            <div class="stat-info">
              <div class="stat-number">{{ estadisticas.total_historias || 0 }}</div>
              <div class="stat-label">Historias</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <div class="stat-number">{{ estadisticas.puntos_totales || 0 }}</div>
              <div class="stat-label">Puntos</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
              <div class="stat-number">{{ estadisticas.promedio_respuestas || 0 }}%</div>
              <div class="stat-label">Precisión</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🌟</div>
            <div class="stat-info">
              <div class="stat-number">{{ estadisticas.nivel_actual?.nombre || 'Principiante' }}</div>
              <div class="stat-label">Nivel</div>
            </div>
          </div>
        </div>
        <div class="precision-tipos">
          <h3>📊 Precisión por tipo de pregunta</h3>
          <div class="tipos-grid">
            <div class="tipo-card inferencial">
              <span class="tipo-icon">🤔</span>
              <div>
                <strong>Inferencial:</strong>
                <span>{{ estadisticas.detalle_por_tipo.inferencial?.precision || 0 }}%</span>
              </div>
            </div>

            <div class="tipo-card juicio">
              <span class="tipo-icon">⚖️</span>
              <div>
                <strong>Juicio Crítico:</strong>
                <span>{{ estadisticas.detalle_por_tipo.juicio_critico?.precision || 0 }}%</span>
              </div>
            </div>

            <div class="tipo-card creativa">
              <span class="tipo-icon">💡</span>
              <div>
                <strong>Creativa:</strong>
                <span>{{ estadisticas.detalle_por_tipo.creativa?.precision || 0 }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando tus historias...</p>
      </div>

      <!-- Historias filtradas -->
      <div v-else-if="historiasFiltradas.length > 0" class="historias-section">
        <div class="historias-grid">
          <div
            v-for="historia in historiasFiltradas"
            :key="historia.id"
            @click="verHistoria(historia.recorId)"
            class="historia-card"
          >
            <!-- Header de la card -->
            <div class="card-header">
              <div class="tema-badge">
                <span class="tema-icon">{{ getEmojiTema(historia.tema) }}</span>
                <span class="tema-text">{{ getTemaLabel(historia.tema) }}</span>
              </div>
              <div class="fecha">{{ formatDate(historia.created_at) }}</div>
            </div>

            <!-- Contenido principal -->
            <div class="card-content">
              <h3 class="historia-titulo">{{ historia.titulo }}</h3>
              <p class="historia-resumen">{{ getResumen(historia.contenido) }}</p>

              <!-- Estadísticas de la historia -->
              <div class="historia-stats">
                <div class="stat">
                  <span class="stat-icon">📝</span>
                  <span class="stat-text">{{ historia.palabras || 0 }} palabras</span>
                </div>
                <div v-if="historia.puntos_obtenidos" class="stat">
                  <span class="stat-icon">⭐</span>
                  <span class="stat-text">{{ historia.puntos_obtenidos }} puntos</span>
                </div>
                <div v-if="historia.respondidas !== undefined" class="stat">
                  <span class="stat-icon">🎯</span>
                  <span class="stat-text">{{ historia.respondidas }}/{{ historia.total_preguntas }} preguntas</span>
                </div>
              </div>

              <!-- Progreso visual -->
              <div v-if="historia.total_preguntas > 0" class="progreso-container">
                <div class="progreso-bar">
                  <div
                      class="progreso-fill"
                      :style="{ width: getProgressWidth(historia) }"
                  ></div>
                </div>
                <span class="progreso-text">
                  {{ getProgressPercent(historia) }}% completado
                </span>
              </div>

            </div>

            <!-- Footer de la card -->
            <div class="card-footer">
              <button class="btn-accion primario" :class="{ completado: historia.status === 'COMPLETED' }">
                <span v-if="historia.status === 'COMPLETED'">📖 Revisar</span>
                <span v-else>🎯 Continuar</span>
              </button>
              <button @click.stop="compartirHistoria(historia)" class="btn-accion secundario">
                📤 Compartir
              </button>
              <div v-if="historia.status === 'COMPLETED'" class="etiqueta-completado">
                ✅ Completado
              </div>
            </div>
          </div>
        </div>

        <div v-if="totalPaginas > 1" class="paginacion">
          <button
              @click="cambiarPagina(paginaActual - 1)"
              :disabled="paginaActual === 1"
              class="btn-pagina"
          >
            ← Anterior
          </button>

          <div class="pagina-numeros">
            <button
                v-for="num in totalPaginas"
                :key="num"
                @click="cambiarPagina(num)"
                :class="['btn-numero', { activo: num === paginaActual }]"
            >
              {{ num }}
            </button>
          </div>

          <button
              @click="cambiarPagina(paginaActual + 1)"
              :disabled="paginaActual === totalPaginas"
              class="btn-pagina"
          >
            Siguiente →
          </button>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else-if="!loading && !error" class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>¡Aún no tienes historias!</h3>
        <p>Comienza tu primera aventura creando una historia personalizada.</p>
        <button @click="irACrearHistoria" class="btn btn-primary large">
          ✨ Crear Mi Primera Historia
        </button>
      </div>

      <!-- Error state -->
      <div v-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>¡Oops! Algo salió mal</h3>
        <p>{{ error }}</p>
        <button @click="recargarHistorias" class="btn btn-secondary">
          🔄 Intentar de nuevo
        </button>
      </div>

    </div>
    <OverlayLoader
        :visible="loadingExport"
        message="🧾 Generando reporte detallado..."
        submessage="Por favor espera unos segundos mientras se crea el PDF"
        type="book"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useLoaderStore } from '../stores/loaderStore'
import api from '../services/api.js'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import OverlayLoader from "../components/OverlayLoader.vue";
import {calcularNivel} from "@/utils/levels.js";

const router = useRouter()
const authStore = useAuthStore()
const loader = useLoaderStore()

// Estado
const error = ref(null)
const estadisticas = ref(null)
const historias = ref([])
const loadingExport = ref(false)

// Filtros
const filtros = ref({
  busqueda: '',
  tema: '',
  orden: 'reciente'
})

const temasDisponibles = ref([
  { id: 'aventura', nombre: 'Aventura', icono: '🗺️' },
  { id: 'fantasia', nombre: 'Fantasía', icono: '🧙‍♂️' },
  { id: 'espacio', nombre: 'Espacio', icono: '🚀' },
  { id: 'naturaleza', nombre: 'Naturaleza', icono: '🌿' },
  { id: 'misterio', nombre: 'Misterio', icono: '🔍' },
  { id: 'ciencia', nombre: 'Ciencia', icono: '🔬' },
  { id: 'deportes', nombre: 'Deportes', icono: '⚽' },
  { id: 'amistad', nombre: 'Amistad', icono: '👫' },
])

// Paginación
const paginaActual = ref(1)
const historiasPorPagina = 9

const profile = computed(() => authStore.profile)

// =====================================================
// 🧩 Cargar datos (usa loader global)
// =====================================================
async function cargarDatos() {
  error.value = null

  try {
    if (!profile.value?.id) {
      throw new Error('No se encontró información del perfil')
    }

    loader.show({
      message: 'Cargando tus historias...',
      submessage: 'Obteniendo datos desde el servidor',
      type: 'book'
    })

    const response = await api.cargarHistoriasPorAlumno(profile.value.id)
    historias.value = response.map(record => {
      const respondidas =
          record.status === 'COMPLETED'
              ? record.total_questions ?? 0
              : record.correct_answers ?? 0

      return {
        id: record.story.id,
        titulo: record.story.title,
        contenido: record.story.content,
        tema: record.story.topic,
        created_at: record.story.created_at,
        correctas: record.correct_answers ?? 0,
        total_preguntas: record.total_questions ?? 6,
        respondidas,
        puntos_obtenidos: record.points,
        status: record.status,
        palabras: record.story.content?.split(' ').length ?? 0,
        recorId: record.id
      }
    })

    await cargarEstadisticas()
  } catch (err) {
    console.error('❌ Error cargando datos:', err)
    error.value = err.message || 'Error cargando tus historias'
  } finally {
    loader.hide()
  }
}

async function cargarEstadisticas() {
  try {
    const totalHistorias = historias.value.length;
    if (totalHistorias === 0) {
      estadisticas.value = {
        total_historias: 0,
        puntos_totales: 0,
        promedio_respuestas: 0,
        detalle_por_tipo: {},
        nivel_actual: { nombre: 'Principiante' }
      };
      return;
    }

    let puntosTotales = 0;
    let correctasGlobal = 0;
    let totalGlobal = 0;

    // Mapa de tipos de pregunta
    const tipos = {
      inferencial: { correctas: 0, total: 0 },
      juicio_critico: { correctas: 0, total: 0 },
      creativa: { correctas: 0, total: 0 }
    };

    // 🔍 Recorremos historias y buscamos detalles desde el backend
    for (const h of historias.value) {
      try {
        const det = await api.cargarHistoriaPorId(h.recorId);
        const preguntas = det?.story?.question_answer ?? [];
        const respuestas = det?.answers ?? [];

        puntosTotales += h.puntos_obtenidos || 0;

        preguntas.forEach((q, i) => {
          const tipo = (q.tipo || q.type || "inferencial").toLowerCase();
          const respuesta = respuestas.find(r => r.question_index === i);
          const esCorrecta = respuesta?.is_correct === true;

          if (!tipos[tipo]) tipos[tipo] = { correctas: 0, total: 0 };
          tipos[tipo].total += 1;
          if (esCorrecta) tipos[tipo].correctas += 1;

          totalGlobal += 1;
          if (esCorrecta) correctasGlobal += 1;
        });
      } catch (err) {
        console.warn(`⚠️ No se pudieron obtener preguntas de la historia ${h.id}`, err);
      }
    }

    const calcPrec = (c, t) => (t > 0 ? ((c / t) * 100).toFixed(1) : 0);

    estadisticas.value = {
      total_historias: totalHistorias,
      puntos_totales: puntosTotales,
      promedio_respuestas: calcPrec(correctasGlobal, totalGlobal),
      detalle_por_tipo: {
        inferencial: { ...tipos.inferencial, precision: calcPrec(tipos.inferencial.correctas, tipos.inferencial.total) },
        juicio_critico: { ...tipos.juicio_critico, precision: calcPrec(tipos.juicio_critico.correctas, tipos.juicio_critico.total) },
        creativa: { ...tipos.creativa, precision: calcPrec(tipos.creativa.correctas, tipos.creativa.total) }
      },
      nivel_actual: calcularNivel(correctasGlobal, totalGlobal)
    };
  } catch (err) {
    console.error("❌ Error cargando estadísticas:", err);
  }
}

function cambiarPagina(nuevaPagina) {
  // Evitar salir de rango
  if (nuevaPagina < 1 || nuevaPagina > totalPaginas.value) return;
  paginaActual.value = nuevaPagina;

  // Scroll hacia arriba para mejorar UX
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

async function recargarHistorias() {
  await cargarDatos()
}

// =====================================================
// 📄 Exportar PDF (usa loader local, no global)
// =====================================================
async function exportarHistorial() {
  loadingExport.value = true;
  try {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const MARGIN_X = 15;
    const RIGHT = 195;
    const WRAP_W = 175;
    let y = 20;

    // Utilidades ASCII-safe
    const idxToLetter = (idx) => String.fromCharCode(65 + Number(idx)); // 0->A, 1->B, ...
    const normalizeIndex = (ans) => {
      if (ans === null || ans === undefined) return null;
      if (typeof ans === "number") return ans;
      const s = String(ans).trim();
      if (/^\d+$/.test(s)) return parseInt(s, 10);            // "1" -> 1
      if (/^[a-z]$/i.test(s)) return s.toLowerCase().charCodeAt(0) - 97; // "b" -> 1
      return null;
    };
    const stripLeadingLetter = (txt) =>
        String(txt).replace(/^\s*[A-Za-z]\)\s*/, ""); // quita "A) ", "b) ", etc.

    const drawWrap = (text, x, y0, width) => {
      const lines = doc.splitTextToSize(text, width);
      lines.forEach((ln) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(ln, x, y);
        y += 5;
      });
      return y;
    };
    const hr = () => { doc.setDrawColor(200); doc.line(MARGIN_X, y, RIGHT, y); y += 8; };
    const checkPage = () => { if (y > 270) { doc.addPage(); y = 20; } };

    // Header
    const alumno = profile.value || {};
    doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text("Reporte Detallado de Historias", MARGIN_X, y); y += 10;

    doc.setFont("helvetica", "normal"); doc.setFontSize(12);
    y = drawWrap(`Alumno: ${alumno.fullname || "-"}`, MARGIN_X, y, WRAP_W);
    y = drawWrap(`Email: ${alumno.email || "-"}`, MARGIN_X, y, WRAP_W);
    y = drawWrap(`Docente: ${alumno.teacher_name || "No asignado"}`, MARGIN_X, y, WRAP_W);
    y = drawWrap(`Matriculado: ${alumno.matriculado ? "Sí" : "No"}`, MARGIN_X, y, WRAP_W);
    y = drawWrap(`Generado: ${new Date().toLocaleString("es-ES")}`, MARGIN_X, y, WRAP_W);
    hr();

    // Historias
    for (const [ix, h] of historias.value.entries()) {
      checkPage();
      doc.setFont("helvetica", "bold"); doc.setFontSize(14);
      y = drawWrap(`${ix + 1}. ${h.titulo}`, MARGIN_X, y, WRAP_W);

      doc.setFont("helvetica", "italic"); doc.setFontSize(11);
      y = drawWrap(`Tema: ${getTemaLabel(h.tema)} | Fecha: ${formatDate(h.created_at)}`, MARGIN_X, y, WRAP_W);

      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      y = drawWrap(`Puntos: ${h.puntos_obtenidos ?? 0} | Estado: ${h.status}`, MARGIN_X, y, WRAP_W);
      y += 2;

      // Texto de la historia
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      y = drawWrap(h.contenido || "Sin contenido", MARGIN_X, y, WRAP_W);
      hr();

      // Preguntas
      try {
        const det = await api.cargarHistoriaPorId(h.recorId);
        const preguntas = det?.story?.question_answer ?? [];
        const respuestas = det?.answers ?? []; // [{question_index, response}, ...]

        if (preguntas.length) {
          doc.setFont("helvetica", "bold"); doc.setFontSize(12);
          y = drawWrap("Preguntas y respuestas", MARGIN_X, y, WRAP_W);

          preguntas.forEach((q, i) => {
            checkPage();

            // Título de pregunta
            doc.setFont("helvetica", "bold"); doc.setFontSize(10);
            y = drawWrap(`${i + 1}. ${q.question}`, MARGIN_X, y, WRAP_W);

            // Normalizar CORRECTA (puede venir 1 o "a")
            const correctIdx = normalizeIndex(q.answer);
            const correctLetter = correctIdx !== null ? idxToLetter(correctIdx) : "-";

            // Respuesta marcada del alumno (puede ser índice, letra o texto)
            const rawAlumno = respuestas.find(a => a.question_index === i)?.response ?? null;

            // Determinar índice marcado si se puede
            let markedIdx = null;
            if (rawAlumno !== null) {
              // Si coincide por índice/letra
              const maybeIdx = normalizeIndex(rawAlumno);
              if (maybeIdx !== null) markedIdx = maybeIdx;
              else {
                // Si vino como texto completo, buscar match con opción
                const t = String(rawAlumno).trim().toLowerCase();
                const found = (q.options || []).findIndex(op => String(op).trim().toLowerCase() === t);
                markedIdx = found >= 0 ? found : null;
              }
            }
            const markedLetter = markedIdx !== null ? idxToLetter(markedIdx) : "-";

            // Opciones: imprimimos A) ... ; marcamos con sufijos ASCII [MARCADA], [CORRECTA]
            doc.setFont("helvetica", "normal"); doc.setFontSize(10);
            (q.options || []).forEach((op, idx) => {
              checkPage();
              const cleanText = stripLeadingLetter(op);
              const letter = idxToLetter(idx);
              const isMarked = markedIdx === idx;
              const isCorrect = correctIdx === idx;

              // 100% ASCII para evitar símbolos raros
              let suffix = "";
              if (isCorrect && isMarked) suffix = "  [CORRECTA][MARCADA]";
              else if (isCorrect)       suffix = "  [CORRECTA]";
              else if (isMarked)        suffix = "  [MARCADA]";

              y = drawWrap(`${letter}) ${cleanText}${suffix}`, MARGIN_X + 6, y, WRAP_W - 6);
            });

            // Líneas “Respuesta marcada” y “Correcta” (sin duplicar la alternativa)
            const correctText = correctIdx !== null && q.options?.[correctIdx]
                ? stripLeadingLetter(q.options[correctIdx])
                : "-";

            doc.setFont("helvetica", "italic"); doc.setFontSize(9);
            y = drawWrap(`-> Respuesta marcada: ${markedLetter}`, MARGIN_X + 6, y, WRAP_W - 6);
            y = drawWrap(`-> Correcta: (${correctLetter}) ${correctText}`, MARGIN_X + 6, y, WRAP_W - 6);
            y += 4;
          });
        } else {
          doc.setFont("helvetica", "italic"); doc.setFontSize(10);
          y = drawWrap("Esta historia no tiene preguntas registradas.", MARGIN_X, y, WRAP_W);
        }
      } catch (e) {
        doc.setFont("helvetica", "italic"); doc.setFontSize(10);
        y = drawWrap("No se pudieron obtener las preguntas de esta historia.", MARGIN_X, y, WRAP_W);
        console.error("Detalle historia error:", e);
      }

      hr();
    }

    // Footer
    doc.setFont("helvetica", "italic"); doc.setFontSize(10);
    doc.text("Generado por IAStories", MARGIN_X, 285);

    const filename = `reporte_detallado_${(alumno.fullname || "alumno").replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error("Export PDF error:", err);
    error.value = "Error al exportar el PDF.";
  } finally {
    loadingExport.value = false;
  }
}

// =====================================================
// 🧭 Navegación
// =====================================================
const irACrearHistoria = () => router.push('/crear-historia')
const verHistoria = id => router.push(`/historia/${id}`)

// =====================================================
// 🧮 Filtros y helpers
// =====================================================
const historiasFiltradas = computed(() => {
  let resultado = [...historias.value]

  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(h =>
        h.titulo.toLowerCase().includes(busqueda) || h.contenido.toLowerCase().includes(busqueda)
    )
  }

  if (filtros.value.tema) {
    resultado = resultado.filter(h => h.tema === filtros.value.tema)
  }

  switch (filtros.value.orden) {
    case 'reciente':
      resultado.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'antiguo':
      resultado.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case 'titulo':
      resultado.sort((a, b) => a.titulo.localeCompare(b.titulo))
      break
    case 'puntos':
      resultado.sort((a, b) => (b.puntos_obtenidos || 0) - (a.puntos_obtenidos || 0))
      break
  }

  const inicio = (paginaActual.value - 1) * historiasPorPagina
  const fin = inicio + historiasPorPagina
  return resultado.slice(inicio, fin)
})

const totalPaginas = computed(() =>
    Math.ceil(historias.value.length / historiasPorPagina)
)

// Helpers visuales
const getEmojiTema = tema => temasDisponibles.value.find(t => t.id === tema)?.icono || '📚'
const getTemaLabel = tema => temasDisponibles.value.find(t => t.id === tema)?.nombre || tema
const getResumen = c => (c ? c.split(' ').slice(0, 25).join(' ') + '...' : 'Sin resumen')
const formatDate = d => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
const getProgressPercent = h =>
    h.total_preguntas ? Math.round((h.respondidas / h.total_preguntas) * 100) : 0
const getProgressWidth = h => `${getProgressPercent(h)}%`

// =====================================================
// 🔁 Lifecycle
// =====================================================
onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.isAlumno) {
    router.push('/login')
    return
  }
  await cargarDatos()
})
</script>

<style scoped>
.pagina-numeros {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-numero {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-numero:hover {
  background: #f3f4f6;
}

.btn-numero.activo {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.precision-tipos {
  margin-top: 1.5rem;
  text-align: center;
}

.tipos-grid {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  flex-wrap: wrap;
  margin-top: 0.8rem;
}

.tipo-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.tipo-card:hover {
  transform: scale(1.03);
}

.tipo-icon {
  font-size: 1.2rem;
}

.tipo-card.inferencial {
  border-color: #3b82f6;
}

.tipo-card.juicio {
  border-color: #f59e0b;
}

.tipo-card.creativa {
  border-color: #10b981;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.loading-spinner {
  border: 4px solid #ddd;
  border-top: 4px solid #007bff;
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

.completado {
  background-color: #4caf50;
  color: white;
}
.etiqueta-completado {
  background: #4caf50;
  color: white;
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 6px;
  margin-top: 5px;
  display: inline-block;
}
.mis-historias {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  color: white;
  flex-wrap: wrap;
  gap: 20px;
}

.header-content h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header-content p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid white;
}

.btn.large {
  padding: 15px 30px;
  font-size: 1.1rem;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.filtros-section {
  background: white;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.filtros-container {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  align-items: center;
}

.search-input,
.filtro-select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus,
.filtro-select:focus {
  outline: none;
  border-color: #667eea;
}

.stats-section {
  background: white;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 15px;
}

.stat-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.loading-container,
.error-container,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.historias-section {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.historias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.historia-card {
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.historia-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  border-color: #667eea;
}

.card-header {
  background: #f8f9fa;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.tema-badge {
  display: flex;
  align-items: center;
  background: #667eea;
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
}

.tema-icon {
  margin-right: 5px;
}

.fecha {
  font-size: 0.8rem;
  color: #666;
}

.card-content {
  padding: 20px;
}

.historia-titulo {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 10px;
  font-weight: bold;
}

.historia-resumen {
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.historia-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.stat {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
}

.stat-icon {
  margin-right: 5px;
}

.progreso-container {
  margin-bottom: 15px;
}

.progreso-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progreso-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progreso-text {
  font-size: 0.8rem;
  color: #666;
}

.card-footer {
  padding: 15px 20px;
  background: #f8f9fa;
  display: flex;
  gap: 10px;
  border-top: 1px solid #e0e0e0;
}

.btn-accion {
  flex: 1;
  padding: 8px 15px;
  border: none;
  border-radius: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-accion.primario {
  background: #667eea;
  color: white;
}

.btn-accion.secundario {
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-accion:hover {
  transform: translateY(-1px);
}

.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.btn-pagina {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-pagina:hover:not(:disabled) {
  background: #5a6fd8;
}

.btn-pagina:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagina-info {
  color: #666;
  font-weight: bold;
}

.empty-icon,
.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3,
.error-container h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.empty-state p,
.error-container p {
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
  }
  
  .filtros-container {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .historias-grid {
    grid-template-columns: 1fr;
  }
  
  .card-footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>