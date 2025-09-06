// services/PDFService.js - INTEGRADO 100% CON EL BACKEND
import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Servicio para generar y manejar PDFs en IaStories
 * Integrado completamente con el backend para reportes educativos
 */
class PDFService {
  constructor() {
    this.defaultOptions = {
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    }
    
    this.colors = {
      primary: [102, 126, 234],    // #667eea
      secondary: [118, 75, 162],   // #764ba2
      success: [76, 175, 80],      // #4caf50
      warning: [255, 152, 0],      // #ff9800
      danger: [244, 67, 54],       // #f44336
      info: [33, 150, 243],        // #2196f3
      gray: [128, 128, 128],       // #808080
      black: [0, 0, 0],
      white: [255, 255, 255]
    }
  }

  // ============================================================================
  // 📊 REPORTES PARA DOCENTES
  // ============================================================================

  /**
   * Genera reporte completo de estudiante para docentes
   * Usa datos reales del backend
   */
  async generarReporteEstudiante(datosCompletos) {
    try {
      console.log('📄 Generando reporte de estudiante...')
      
      const { estudiante, historias, estadisticas, analisis, progreso } = datosCompletos
      
      const doc = new jsPDF(this.defaultOptions)
      let yPosition = 20
      
      // ============================================================================
      // 📋 HEADER DEL REPORTE
      // ============================================================================
      
      // Logo y título
      doc.setFontSize(24)
      doc.setTextColor(...this.colors.primary)
      doc.text('📊 IaStories - Reporte de Estudiante', 20, yPosition)
      yPosition += 12
      
      // Línea decorativa
      doc.setDrawColor(...this.colors.primary)
      doc.setLineWidth(0.5)
      doc.line(20, yPosition, 190, yPosition)
      yPosition += 15
      
      // Información del estudiante
      doc.setFontSize(18)
      doc.setTextColor(...this.colors.black)
      doc.text(`👨‍🎓 ${estudiante.nombre}`, 20, yPosition)
      yPosition += 10
      
      doc.setFontSize(12)
      doc.setTextColor(...this.colors.gray)
      doc.text(`📧 ${estudiante.email}`, 20, yPosition)
      yPosition += 6
      doc.text(`🎂 ${estudiante.edad ? estudiante.edad + ' años' : 'Edad no especificada'}`, 20, yPosition)
      yPosition += 6
      doc.text(`📅 Fecha del reporte: ${this.formatearFecha(new Date())}`, 20, yPosition)
      yPosition += 6
      doc.text(`📊 Miembro desde: ${this.formatearFecha(estudiante.created_at)}`, 20, yPosition)
      yPosition += 20
      
      // ============================================================================
      // 📈 RESUMEN EJECUTIVO
      // ============================================================================
      
      this.agregarSeccion(doc, '🎯 Resumen Ejecutivo', yPosition)
      yPosition += 15
      
      const resumenData = [
        ['📚 Total de historias creadas', estadisticas.total_historias || 0],
        ['⭐ Puntos acumulados', estadisticas.puntos_totales || 0],
        ['🎯 Precisión promedio', `${Math.round(estadisticas.precision_promedio || 0)}%`],
        ['⏱️ Tiempo promedio por pregunta', this.formatearTiempo(estadisticas.tiempo_promedio || 0)],
        ['🔥 Racha actual', estadisticas.racha_actual || 0],
        ['📊 Nivel actual', estadisticas.nivel_actual || 'Explorador']
      ]
      
      doc.autoTable({
        startY: yPosition,
        head: [['📊 Métrica', '📈 Valor']],
        body: resumenData,
        theme: 'grid',
        headStyles: { 
          fillColor: this.colors.primary,
          textColor: this.colors.white,
          fontSize: 11,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        columnStyles: {
          0: { cellWidth: 120, fontStyle: 'bold' },
          1: { cellWidth: 50, halign: 'center' }
        },
        margin: { left: 20, right: 20 }
      })
      
      yPosition = doc.lastAutoTable.finalY + 20
      
      // ============================================================================
      // 📊 ANÁLISIS POR TIPO DE PREGUNTA
      // ============================================================================
      
      if (analisis && analisis.por_tipo) {
        // Nueva página si es necesario
        if (yPosition > 220) {
          doc.addPage()
          yPosition = 20
        }
        
        this.agregarSeccion(doc, '🧠 Análisis por Tipo de Pregunta', yPosition)
        yPosition += 15
        
        const tiposData = []
        Object.entries(analisis.por_tipo).forEach(([tipo, datos]) => {
          tiposData.push([
            this.getTipoNombre(tipo),
            `${datos.respuestas_correctas}/${datos.total_preguntas}`,
            `${Math.round(datos.porcentaje || 0)}%`,
            datos.recomendacion || 'Continúa practicando'
          ])
        })
        
        doc.autoTable({
          startY: yPosition,
          head: [['🎯 Tipo', '✅ Correctas', '📊 Precisión', '💡 Recomendación']],
          body: tiposData,
          theme: 'striped',
          headStyles: { 
            fillColor: this.colors.info,
            textColor: this.colors.white,
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9
          },
          columnStyles: {
            0: { cellWidth: 35, fontStyle: 'bold' },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 85 }
          },
          margin: { left: 20, right: 20 }
        })
        
        yPosition = doc.lastAutoTable.finalY + 20
      }
      
      // ============================================================================
      // 📚 HISTORIAL DETALLADO DE HISTORIAS
      // ============================================================================
      
      if (historias && historias.length > 0) {
        // Nueva página
        doc.addPage()
        yPosition = 20
        
        this.agregarSeccion(doc, '📖 Historial Detallado de Historias', yPosition)
        yPosition += 15
        
        const historiasData = historias.slice(0, 15).map(historia => [
          historia.titulo || 'Sin título',
          this.getEmojiTema(historia.tema) + ' ' + this.formatearTema(historia.tema),
          this.formatearFecha(historia.created_at),
          historia.puntos_obtenidos || 0,
          historia.completada ? '✅ Sí' : '⏳ No',
          historia.preguntas_correctas ? 
            `${historia.preguntas_correctas}/${historia.total_preguntas || 6}` : 'N/A'
        ])
        
        doc.autoTable({
          startY: yPosition,
          head: [['📚 Título', '🎨 Tema', '📅 Fecha', '⭐ Puntos', '✅ Completa', '🎯 Respuestas']],
          body: historiasData,
          theme: 'grid',
          headStyles: { 
            fillColor: this.colors.success,
            textColor: this.colors.white,
            fontSize: 9,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 8
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 30 },
            2: { cellWidth: 25 },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 25, halign: 'center' }
          },
          margin: { left: 20, right: 20 }
        })
        
        yPosition = doc.lastAutoTable.finalY + 20
      }
      
      // ============================================================================
      // 🎯 RECOMENDACIONES EDUCATIVAS
      // ============================================================================
      
      if (analisis && analisis.recomendaciones) {
        if (yPosition > 200) {
          doc.addPage()
          yPosition = 20
        }
        
        this.agregarSeccion(doc, '💡 Recomendaciones Educativas', yPosition)
        yPosition += 15
        
        doc.setFontSize(10)
        doc.setTextColor(...this.colors.black)
        
        analisis.recomendaciones.forEach((recomendacion, index) => {
          if (yPosition > 260) {
            doc.addPage()
            yPosition = 20
          }
          
          doc.setTextColor(...this.colors.primary)
          doc.setFontSize(11)
          doc.text(`${index + 1}. ${recomendacion.titulo}`, 25, yPosition)
          yPosition += 7
          
          doc.setTextColor(...this.colors.black)
          doc.setFontSize(10)
          const descripcionLines = doc.splitTextToSize(recomendacion.descripcion, 160)
          doc.text(descripcionLines, 30, yPosition)
          yPosition += descripcionLines.length * 5 + 8
        })
      }
      
      // ============================================================================
      // 📊 GRÁFICA DE PROGRESO (Texto)
      // ============================================================================
      
      if (progreso && progreso.historico) {
        doc.addPage()
        yPosition = 20
        
        this.agregarSeccion(doc, '📈 Evolución del Rendimiento', yPosition)
        yPosition += 15
        
        // Crear tabla de progreso histórico
        const progresoData = progreso.historico.slice(-10).map(entry => [
          this.formatearFecha(entry.fecha),
          entry.puntos_ganados || 0,
          `${Math.round(entry.precision || 0)}%`,
          entry.tema || 'Variado'
        ])
        
        doc.autoTable({
          startY: yPosition,
          head: [['📅 Fecha', '⭐ Puntos', '📊 Precisión', '🎨 Tema']],
          body: progresoData,
          theme: 'striped',
          headStyles: { 
            fillColor: this.colors.warning,
            textColor: this.colors.white,
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9
          },
          margin: { left: 20, right: 20 }
        })
      }
      
      // ============================================================================
      // 📄 FOOTER EN TODAS LAS PÁGINAS
      // ============================================================================
      
      this.agregarFooters(doc)
      
      console.log('✅ Reporte de estudiante generado exitosamente')
      return doc
      
    } catch (error) {
      console.error('❌ Error generando reporte de estudiante:', error)
      throw new Error('No se pudo generar el reporte: ' + error.message)
    }
  }

  /**
   * Genera reporte general de clase para docentes
   */
  async generarReporteClase(datosClase) {
    try {
      console.log('📊 Generando reporte general de clase...')
      
      const { docente, estudiantes, estadisticas, ranking } = datosClase
      
      const doc = new jsPDF(this.defaultOptions)
      let yPosition = 20
      
      // Header
      doc.setFontSize(24)
      doc.setTextColor(...this.colors.primary)
      doc.text('📊 IaStories - Reporte General de Clase', 20, yPosition)
      yPosition += 15
      
      // Información del docente
      doc.setFontSize(16)
      doc.setTextColor(...this.colors.black)
      doc.text(`👨‍🏫 Prof. ${docente.nombre}`, 20, yPosition)
      yPosition += 10
      
      doc.setFontSize(12)
      doc.setTextColor(...this.colors.gray)
      doc.text(`🏫 ${docente.institucion || 'Institución no especificada'}`, 20, yPosition)
      yPosition += 6
      doc.text(`📅 ${this.formatearFecha(new Date())}`, 20, yPosition)
      yPosition += 20
      
      // Estadísticas de la clase
      this.agregarSeccion(doc, '📈 Estadísticas Generales de la Clase', yPosition)
      yPosition += 15
      
      const estadisticasClaseData = [
        ['👥 Total de estudiantes', estudiantes.length],
        ['📚 Historias creadas (total)', estadisticas.total_historias || 0],
        ['⭐ Puntos acumulados (total)', estadisticas.puntos_totales || 0],
        ['📊 Precisión promedio de la clase', `${Math.round(estadisticas.precision_promedio || 0)}%`],
        ['🏆 Estudiantes activos esta semana', estadisticas.activos_semana || 0],
        ['🎯 Actividades completadas', estadisticas.actividades_completadas || 0]
      ]
      
      doc.autoTable({
        startY: yPosition,
        body: estadisticasClaseData,
        theme: 'grid',
        styles: { 
          fontSize: 11,
          cellPadding: 8
        },
        columnStyles: {
          0: { 
            cellWidth: 120, 
            fontStyle: 'bold',
            textColor: this.colors.primary
          },
          1: { 
            cellWidth: 50, 
            halign: 'center',
            fontStyle: 'bold'
          }
        },
        margin: { left: 20, right: 20 }
      })
      
      yPosition = doc.lastAutoTable.finalY + 20
      
      // Ranking de estudiantes
      if (ranking && ranking.length > 0) {
        this.agregarSeccion(doc, '🏆 Ranking de Estudiantes', yPosition)
        yPosition += 15
        
        const rankingData = ranking.slice(0, 10).map((estudiante, index) => [
          index + 1,
          this.getMedallaEmoji(index),
          estudiante.nombre,
          estudiante.puntos_totales || 0,
          estudiante.historias_completadas || 0,
          `${Math.round(estudiante.precision_promedio || 0)}%`
        ])
        
        doc.autoTable({
          startY: yPosition,
          head: [['#', '🏅', '👨‍🎓 Estudiante', '⭐ Puntos', '📚 Historias', '📊 Precisión']],
          body: rankingData,
          theme: 'striped',
          headStyles: { 
            fillColor: this.colors.warning,
            textColor: this.colors.white,
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9
          },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 60 },
            3: { cellWidth: 25, halign: 'center' },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 30, halign: 'center' }
          },
          margin: { left: 20, right: 20 }
        })
      }
      
      this.agregarFooters(doc)
      return doc
      
    } catch (error) {
      console.error('❌ Error generando reporte de clase:', error)
      throw new Error('No se pudo generar el reporte de clase: ' + error.message)
    }
  }

  // ============================================================================
  // 📚 REPORTES PARA ESTUDIANTES
  // ============================================================================

  /**
   * Genera historial de estudiante en PDF
   */
  async generarHistorialEstudiante(datosEstudiante) {
    try {
      console.log('📖 Generando historial de estudiante...')
      
      const { alumno, historias, estadisticas, logros, progreso } = datosEstudiante
      
      const doc = new jsPDF(this.defaultOptions)
      let yPosition = 20
      
      // Header personalizado para estudiante
      doc.setFontSize(24)
      doc.setTextColor(...this.colors.primary)
      doc.text('📚 Mi Historial de Aventuras', 20, yPosition)
      yPosition += 15
      
      // Saludo personalizado
      doc.setFontSize(18)
      doc.setTextColor(...this.colors.black)
      doc.text(`¡Hola ${alumno.nombre}! 👋`, 20, yPosition)
      yPosition += 10
      
      doc.setFontSize(12)
      doc.setTextColor(...this.colors.gray)
      doc.text('Este es tu increíble historial de historias y aventuras', 20, yPosition)
      yPosition += 8
      doc.text(`Generado el: ${this.formatearFecha(new Date())}`, 20, yPosition)
      yPosition += 20
      
      // Mis logros principales
      this.agregarSeccion(doc, '🏆 Mis Súper Logros', yPosition)
      yPosition += 15
      
      const logrosData = [
        ['📖 Historias que he leído', historias.length],
        ['⭐ Puntos que he ganado', estadisticas.puntos_totales || 0],
        ['🎯 Preguntas que respondí bien', estadisticas.total_correctas || 0],
        ['📊 Qué tan bien lo hago', `${Math.round(estadisticas.precision_promedio || 0)}%`],
        ['🔥 Mi racha más larga', estadisticas.mejor_racha || 0],
        ['🌟 Mi nivel actual', estadisticas.nivel_actual || 'Explorador']
      ]
      
      doc.autoTable({
        startY: yPosition,
        body: logrosData,
        theme: 'plain',
        styles: { 
          fontSize: 12,
          cellPadding: 8
        },
        columnStyles: {
          0: { 
            cellWidth: 120,
            fontStyle: 'bold',
            textColor: this.colors.primary
          },
          1: { 
            cellWidth: 50,
            halign: 'center',
            fontStyle: 'bold',
            fontSize: 14,
            textColor: this.colors.success
          }
        },
        margin: { left: 20, right: 20 }
      })
      
      yPosition = doc.lastAutoTable.finalY + 20
      
      // Mis temas favoritos
      const temasFavoritos = this.calcularTemasFavoritos(historias)
      if (temasFavoritos.length > 0) {
        this.agregarSeccion(doc, '🎨 Mis Temas Favoritos', yPosition)
        yPosition += 15
        
        const temasData = temasFavoritos.slice(0, 5).map(tema => [
          this.getEmojiTema(tema.nombre),
          this.formatearTema(tema.nombre),
          tema.cantidad,
          `${Math.round(tema.porcentaje)}%`
        ])
        
        doc.autoTable({
          startY: yPosition,
          head: [['🎨', '📚 Tema', '📖 Historias', '📊 Porcentaje']],
          body: temasData,
          theme: 'grid',
          headStyles: { 
            fillColor: this.colors.info,
            textColor: this.colors.white,
            fontSize: 11,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 10
          },
          columnStyles: {
            0: { cellWidth: 20, halign: 'center' },
            1: { cellWidth: 80 },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 40, halign: 'center' }
          },
          margin: { left: 20, right: 20 }
        })
        
        yPosition = doc.lastAutoTable.finalY + 20
      }
      
      // Todas mis historias
      if (historias.length > 0) {
        // Nueva página
        doc.addPage()
        yPosition = 20
        
        this.agregarSeccion(doc, '📚 Todas Mis Historias', yPosition)
        yPosition += 15
        
        const historiasData = historias.map(historia => [
          historia.titulo || 'Historia sin título',
          this.getEmojiTema(historia.tema),
          this.formatearFecha(historia.created_at),
          historia.puntos_obtenidos || 0,
          historia.completada ? '✅' : '⏳'
        ])
        
        doc.autoTable({
          startY: yPosition,
          head: [['📖 Mi Historia', '🎨', '📅 Cuándo', '⭐ Puntos', '✅']],
          body: historiasData,
          theme: 'striped',
          headStyles: { 
            fillColor: this.colors.success,
            textColor: this.colors.white,
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 30 },
            3: { cellWidth: 25, halign: 'center' },
            4: { cellWidth: 15, halign: 'center' }
          },
          margin: { left: 20, right: 20 }
        })
      }
      
      // Mensaje motivacional final
      doc.addPage()
      yPosition = 100
      
      doc.setFontSize(18)
      doc.setTextColor(...this.colors.primary)
      doc.text('¡Sigue siendo increíble! 🌟', 20, yPosition)
      yPosition += 15
      
      doc.setFontSize(12)
      doc.setTextColor(...this.colors.black)
      const mensajeFinal = [
        '¡Has hecho un trabajo fantástico leyendo y aprendiendo!',
        'Cada historia que lees te hace más inteligente y creativo.',
        '¡Sigue explorando nuevos temas y aventuras!',
        '',
        '¡Estamos muy orgullosos de ti! 🎉'
      ]
      
      mensajeFinal.forEach(linea => {
        doc.text(linea, 20, yPosition)
        yPosition += 8
      })
      
      this.agregarFooters(doc)
      return doc
      
    } catch (error) {
      console.error('❌ Error generando historial de estudiante:', error)
      throw new Error('No se pudo generar el historial: ' + error.message)
    }
  }

  // ============================================================================
  // 🛠️ MÉTODOS AUXILIARES
  // ============================================================================

  /**
   * Agrega una sección con título estilizado
   */
  agregarSeccion(doc, titulo, yPosition) {
    doc.setFontSize(14)
    doc.setTextColor(...this.colors.secondary)
    doc.setFont(undefined, 'bold')
    doc.text(titulo, 20, yPosition)
    
    // Línea debajo del título
    doc.setDrawColor(...this.colors.secondary)
    doc.setLineWidth(0.3)
    doc.line(20, yPosition + 2, 120, yPosition + 2)
    
    return yPosition + 10
  }

  /**
   * Agrega footers a todas las páginas
   */
  agregarFooters(doc) {
    const pageCount = doc.internal.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(...this.colors.gray)
      
      // Número de página
      doc.text(`Página ${i} de ${pageCount}`, 160, 285)
      
      // Marca de agua
      doc.text('📚 Generado por IaStories - Educación con IA', 20, 285)
      
      // Logo pequeño en el footer
      doc.setFontSize(10)
      doc.text('🌟', 190, 285)
    }
  }

  /**
   * Formatea fechas en español
   */
  formatearFecha(fechaInput) {
    try {
      const fecha = fechaInput instanceof Date ? fechaInput : new Date(fechaInput)
      
      if (isNaN(fecha.getTime())) {
        return 'Fecha no válida'
      }
      
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    } catch (error) {
      return 'Fecha no disponible'
    }
  }

  /**
   * Formatea tiempo en formato legible
   */
  formatearTiempo(segundos) {
    if (!segundos || segundos === 0) return 'N/A'
    
    if (segundos < 60) {
      return `${Math.round(segundos)}s`
    } else if (segundos < 3600) {
      const minutos = Math.floor(segundos / 60)
      const segs = Math.round(segundos % 60)
      return segs > 0 ? `${minutos}m ${segs}s` : `${minutos}m`
    } else {
      const horas = Math.floor(segundos / 3600)
      const minutos = Math.floor((segundos % 3600) / 60)
      return `${horas}h ${minutos}m`
    }
  }

  /**
   * Obtiene emoji según el tema
   */
  getEmojiTema(tema) {
    const emojis = {
      'espacio': '🚀',
      'vaqueros': '🤠',
      'fantasia': '🧙‍♂️',
      'piratas': '🏴‍☠️',
      'aventura': '⛵',
      'ciencia_ficcion': '👽',
      'misterio': '🔍',
      'animales': '🦁',
      'deportes': '⚽',
      'cocina': '👨‍🍳',
      'musica': '🎵',
      'arte': '🎨',
      'naturaleza': '🌳',
      'amistad': '👫',
      'ciencia': '🔬'
    }
    return emojis[tema] || '📚'
  }

  /**
   * Formatea nombre del tema
   */
  formatearTema(tema) {
    const temas = {
      'espacio': 'Espacio',
      'vaqueros': 'Vaqueros',
      'fantasia': 'Fantasía',
      'piratas': 'Piratas',
      'aventura': 'Aventura',
      'ciencia_ficcion': 'Ciencia Ficción',
      'misterio': 'Misterio',
      'animales': 'Animales',
      'deportes': 'Deportes',
      'cocina': 'Cocina',
      'musica': 'Música',
      'arte': 'Arte',
      'naturaleza': 'Naturaleza',
      'amistad': 'Amistad',
      'ciencia': 'Ciencia'
    }
    return temas[tema] || tema.charAt(0).toUpperCase() + tema.slice(1)
  }

  /**
   * Obtiene nombre del tipo de pregunta
   */
  getTipoNombre(tipo) {
    const tipos = {
      'inferenciales': '🧠 Inferenciales',
      'juicio_critico': '🔍 Juicio Crítico',
      'creativas': '🎨 Creativas'
    }
    return tipos[tipo] || tipo
  }

  /**
   * Obtiene emoji de medalla según posición
   */
  getMedallaEmoji(posicion) {
    if (posicion === 0) return '🥇'
    if (posicion === 1) return '🥈'
    if (posicion === 2) return '🥉'
    return '🏆'
  }

  /**
   * Calcula temas favoritos del estudiante
   */
  calcularTemasFavoritos(historias) {
    if (!historias || historias.length === 0) return []
    
    const conteoTemas = {}
    
    historias.forEach(historia => {
      const tema = historia.tema
      conteoTemas[tema] = (conteoTemas[tema] || 0) + 1
    })
    
    return Object.entries(conteoTemas)
      .map(([tema, cantidad]) => ({
        nombre: tema,
        cantidad,
        porcentaje: (cantidad / historias.length) * 100
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
  }

  // ============================================================================
  // 📥 MÉTODOS DE DESCARGA
  // ============================================================================

  /**
   * Descarga el PDF con nombre personalizado
   */
  async descargarPDF(doc, tipoReporte, nombrePersonalizado = null) {
    try {
      const fecha = new Date().toISOString().split('T')[0]
      let nombreArchivo = nombrePersonalizado || `iastories_${tipoReporte}_${fecha}`
      
      // Limpiar nombre de archivo
      nombreArchivo = nombreArchivo
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase()
      
      doc.save(`${nombreArchivo}.pdf`)
      
      console.log(`✅ PDF descargado: ${nombreArchivo}.pdf`)
      return true
      
    } catch (error) {
      console.error('❌ Error descargando PDF:', error)
      throw new Error('No se pudo descargar el PDF: ' + error.message)
    }
  }

  /**
   * Previsualiza el PDF en una nueva ventana
   */
  async previsualizarPDF(doc) {
    try {
      const pdfBlob = doc.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      
      const nuevaVentana = window.open(pdfUrl, '_blank')
      
      if (!nuevaVentana) {
        throw new Error('Popup bloqueado por el navegador')
      }
      
      // Limpiar URL después de un tiempo
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl)
      }, 10000)
      
      console.log('✅ PDF abierto en nueva ventana')
      return true
      
    } catch (error) {
      console.error('❌ Error previsualizando PDF:', error)
      throw new Error('No se pudo previsualizar el PDF: ' + error.message)
    }
  }

  // ============================================================================
  // 🧪 MÉTODO DE PRUEBA
  // ============================================================================

  /**
   * Genera un PDF de prueba para verificar funcionalidad
   */
  async generarPDFPrueba() {
    try {
      const doc = new jsPDF(this.defaultOptions)
      
      doc.setFontSize(20)
      doc.setTextColor(...this.colors.primary)
      doc.text('🧪 PDF de Prueba - IaStories', 20, 30)
      
      doc.setFontSize(12)
      doc.setTextColor(...this.colors.black)
      doc.text('Este es un PDF de prueba generado exitosamente.', 20, 50)
      doc.text(`Fecha: ${this.formatearFecha(new Date())}`, 20, 65)
      
      doc.setTextColor(...this.colors.success)
      doc.text('✅ El servicio PDF está funcionando correctamente!', 20, 85)
      
      this.agregarFooters(doc)
      
      return doc
      
    } catch (error) {
      console.error('❌ Error generando PDF de prueba:', error)
      throw new Error('Error en el servicio PDF: ' + error.message)
    }
  }
}

// Exportar instancia única del servicio
export default new PDFService()