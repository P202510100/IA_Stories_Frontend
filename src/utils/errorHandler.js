export function parseApiError(error) {
    if (!error.response) {
        return '⚠️ No se pudo conectar con el servidor. Verifica tu conexión a Internet.'
    }

    const { status, data } = error.response

    switch (status) {
        case 400:
            return data?.detail || 'Solicitud incorrecta. Por favor, verifica los datos enviados.'
        case 401:
            return '❌ Credenciales inválidas. Verifica tu correo y contraseña.'
        case 403:
            return '🚫 No tienes permiso para realizar esta acción.'
        case 404:
            return '🔍 No se encontró la información solicitada.'
        case 409:
            return '⚠️ Ya existe un registro con estos datos.'
        case 422:
            return '⚠️ Algunos campos no son válidos. Por favor revisa e intenta de nuevo.'
        case 429:
            return '⏳ Has realizado demasiadas solicitudes. Intenta nuevamente más tarde.'
        case 500:
            return '💥 Error interno del servidor. Intenta nuevamente más tarde.'
        case 503:
            return '🧭 El servidor está en mantenimiento. Vuelve a intentarlo en unos minutos.'
        default:
            return data?.detail || `❌ Error inesperado (${status}). Intenta más tarde.`
    }
}
