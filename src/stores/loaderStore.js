import { defineStore } from 'pinia'

export const useLoaderStore = defineStore('loader', {
    state: () => ({
        activeRequests: 0,
        visible: false,
        message: 'Cargando...',
        submessage: '',
        type: 'dots', // puedes cambiar a 'book', 'ai', etc. por defecto
    }),
    getters: {
        isLoading: (s) => s.visible
    },
    actions: {
        show({ message = 'Cargando...', submessage = '', type = 'dots' } = {}) {
            this.activeRequests++
            this.message = message
            this.submessage = submessage
            this.type = type
            this.visible = true
        },
        async hide() {
            if (this.activeRequests > 0) this.activeRequests--
            if (this.activeRequests === 0) {
                await new Promise(r => setTimeout(r, 200)) // evita parpadeo
                this.visible = false
            }
        },
        reset() {
            this.activeRequests = 0
            this.visible = false
            this.message = 'Cargando...'
            this.submessage = ''
        }
    }
})
