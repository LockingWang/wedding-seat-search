const apiMode = (import.meta.env.VITE_API_MODE || 'auto').toLowerCase()

export const runtimeMode = apiMode
export const isApiOnlyMode = apiMode === 'api'
export const isMockOnlyMode = apiMode === 'mock'
export const isMockAvailable = apiMode !== 'api'
