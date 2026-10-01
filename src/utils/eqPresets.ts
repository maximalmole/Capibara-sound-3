import { EQPreset } from '../types';

export const EQ_BANDS = [
  { freq: 100, label: '100 Hz', description: 'Sub-bajos' },
  { freq: 300, label: '300 Hz', description: 'Graves / Bajo' },
  { freq: 1200, label: '1.2 kHz', description: 'Medios / Voces' },
  { freq: 4000, label: '4 kHz', description: 'Presencia' },
  { freq: 8000, label: '8 kHz', description: 'Agudos / Brillo' }
];

export const EQ_PRESETS: EQPreset[] = [
  {
    name: 'Personalizado',
    label: 'Manual / Ajuste Libre 🎛️',
    gains: [0, 0, 0, 0, 0]
  },
  {
    name: 'Plano',
    label: 'Plano (Normal)',
    gains: [0, 0, 0, 0, 0]
  },
  {
    name: 'Bass Boost',
    label: 'Bajos Potentes 🔊',
    gains: [30, 22, -6, -16, -24]
  },
  {
    name: 'Voces Claras',
    label: 'Voces / Podcasts 🎙️',
    gains: [-24, -16, 22, 28, 16]
  },
  {
    name: 'Acústico',
    label: 'Acústico 🎸',
    gains: [12, 8, 4, 16, 24]
  },
  {
    name: 'Rock',
    label: 'Rock & Metal ⚡',
    gains: [24, 16, -12, 18, 26]
  },
  {
    name: 'Electrónica',
    label: 'Electrónica / Club 🎛️',
    gains: [28, 20, -8, 16, 24]
  },
  {
    name: 'Suave',
    label: 'Suave / Lo-Fi 🌙',
    gains: [12, 4, -12, -22, -30]
  },
  {
    name: 'Agudos Boost',
    label: 'Agudos Potentes 🎼',
    gains: [-24, -16, 4, 22, 30]
  }
];

export const CROSSFADE_OPTIONS = [
  { value: 5, label: '5 segundos ⚡' },
  { value: 6, label: '6 segundos' },
  { value: 7, label: '7 segundos' },
  { value: 8, label: '8 segundos 🔥' },
  { value: 0, label: 'Desactivado' }
];
