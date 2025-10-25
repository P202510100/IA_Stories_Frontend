// ✅ Parser manual robusto (funciona con "2025-10-21T17:50:17.391022")
function parseIsoFlexible(isoString) {
    if (!isoString) return new Date(NaN);

    try {
        const [datePart, timePart] = isoString.split("T");
        if (!datePart || !timePart) return new Date(NaN);

        const [year, month, day] = datePart.split("-").map(Number);

        // Extrae horas, minutos, segundos y fracción (microsegundos)
        const [hms, fractionRaw = "0"] = timePart.split(".");
        const [hours, minutes, secondsRaw] = hms.split(":").map(Number);

        // Elimina cualquier sufijo tipo Z o +00:00
        const seconds = parseInt(secondsRaw || 0);
        const milliseconds = Math.floor(parseFloat("0." + fractionRaw) * 1000);

        // Crea la fecha en UTC (para evitar problemas de zona horaria)
        return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds));
    } catch {
        return new Date(NaN);
    }
}

// ✅ Formatea fecha en estilo "Hoy", "Ayer", "Hace X días"
export const formatDate = (fecha) => {
    if (!fecha) return "No disponible";

    const f = parseIsoFlexible(fecha);
    if (Number.isNaN(f.getTime())) return "Fecha inválida";

    const diffMs = Date.now() - f.getTime();
    const diffDias = diffMs / 86_400_000;

    if (diffDias < 1) return "Hoy";
    if (diffDias < 2) return "Ayer";
    if (diffDias < 7) return `Hace ${Math.floor(diffDias)} días`;

    return f.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: f.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
};

// ✅ Calcula diferencia de tiempo tipo "3h 20m"
export const formatTiempoPromedio = (fechaISO) => {
    console.log('fecha: ',fechaISO)
    if (!fechaISO) return "–";

    const fecha = parseIsoFlexible(fechaISO);
    if (Number.isNaN(fecha.getTime())) return "–";

    const diffSeg = Math.max(0, Math.floor((Date.now() - fecha.getTime()) / 1000));

    if (diffSeg < 60) return `${diffSeg}s`;
    if (diffSeg < 3600) return `${Math.floor(diffSeg / 60)}m`;

    const horas = Math.floor(diffSeg / 3600);
    const minutos = Math.floor((diffSeg % 3600) / 60);
    if (diffSeg < 86400) return `${horas}h ${minutos}m`;

    const dias = Math.floor(diffSeg / 86400);
    return `${dias}d ${horas % 24}h`;
};

// ✅ Mapa de temas (igual)
const temaMap = {
    espacio: { nombre: "Espacio", emoji: "🚀" },
    vaqueros: { nombre: "Vaqueros", emoji: "🤠" },
    fantasia: { nombre: "Fantasía", emoji: "🧙‍♂️" },
    piratas: { nombre: "Piratas", emoji: "🏴‍☠️" },
    aventura: { nombre: "Aventura", emoji: "⛵" },
    ciencia_ficcion: { nombre: "Ciencia Ficción", emoji: "👽" },
    misterio: { nombre: "Misterio", emoji: "🔍" },
    animales: { nombre: "Animales", emoji: "🦁" },
    deportes: { nombre: "Deportes", emoji: "⚽" },
    cocina: { nombre: "Cocina", emoji: "👨‍🍳" },
    musica: { nombre: "Música", emoji: "🎵" },
    arte: { nombre: "Arte", emoji: "🎨" },
};

export const formatTema = (tema) => temaMap[tema]?.nombre || tema;
export const getEmojiTema = (tema) => temaMap[tema]?.emoji || "📚";
