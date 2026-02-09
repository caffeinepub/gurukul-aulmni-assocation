// Single source of truth for build/version information
// In production, this could be injected via environment variables during build
export const BUILD_VERSION = import.meta.env.VITE_BUILD_VERSION || 'unknown';
