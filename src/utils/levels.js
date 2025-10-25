export const calcularNivel = (puntos) => {
    const niveles = [
        { min: 0, max: 99, nombre: 'Explorador', icono: '🌱', color: '#4caf50' },
        { min: 100, max: 299, nombre: 'Aventurero', icono: '⭐', color: '#2196f3' },
        { min: 300, max: 599, nombre: 'Narrador', icono: '📚', color: '#ff9800' },
        { min: 600, max: 999, nombre: 'Maestro Cuentista', icono: '👑', color: '#9c27b0' },
        { min: 1000, max: Infinity, nombre: 'Leyenda Literaria', icono: '🏆', color: '#f44336' }
    ]
    return niveles.find(n => puntos >= n.min && puntos <= n.max) || niveles[0]
}

export const getNivelClase = (nivel) => {
    const clases = {
        Explorador: 'nivel-explorador',
        Aventurero: 'nivel-aventurero',
        Narrador: 'nivel-narrador',
        'Maestro Cuentista': 'nivel-maestro',
        'Leyenda Literaria': 'nivel-leyenda'
    }
    return clases[nivel?.nombre] || 'nivel-explorador'
}
