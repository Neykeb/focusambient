import type { ExternalSoundscape } from './soundscapes'

/**
 * Eigene Audiodateien werden unter public/audio abgelegt und hier registriert.
 * Beispiel:
 * {
 *   id: 'ocean-waves',
 *   label: 'Ocean waves',
 *   description: 'A slow and calming shoreline',
 *   source: 'file',
 *   audioUrl: '/audio/ocean-waves.mp3',
 * }
 */
export const externalSoundscapes: readonly ExternalSoundscape[] = []
