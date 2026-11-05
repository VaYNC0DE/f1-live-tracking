/**
 * Formula 1 Circuit Maps & Geometry Data
 * Provides SVG track geometries and interactive corner metadata.
 */

export interface CircuitTurn {
  turnNumber: number;
  name?: string;
  x: number;
  y: number;
  isDrs?: boolean;
}

export interface CircuitInfo {
  circuitName: string;
  shortName: string;
  country: string;
  lapLengthKm: number;
  totalTurns: number;
  drsZones: number;
  viewBox: string;
  svgPath: string;
  turns: CircuitTurn[];
}

export const CIRCUITS_MAP: Record<string, CircuitInfo> = {
  // 1. Interlagos (Brazil - Autódromo José Carlos Pace)
  interlagos: {
    circuitName: 'Autódromo José Carlos Pace',
    shortName: 'Interlagos',
    country: 'Brazil',
    lapLengthKm: 4.309,
    totalTurns: 15,
    drsZones: 2,
    viewBox: '0 0 500 360',
    svgPath:
      'M 120 70 C 180 65, 290 65, 340 70 C 370 73, 400 95, 410 130 C 420 165, 400 205, 360 220 C 320 235, 290 220, 270 200 C 250 180, 260 150, 230 145 C 200 140, 180 165, 175 195 C 170 225, 190 250, 215 270 C 240 290, 280 295, 310 320 C 325 333, 315 350, 290 350 C 240 350, 160 310, 120 260 C 80 210, 75 160, 80 120 C 83 95, 95 72, 120 70 Z',
    turns: [
      { turnNumber: 1, name: 'S do Senna', x: 345, y: 72, isDrs: true },
      { turnNumber: 2, name: 'S do Senna (Exit)', x: 385, y: 100 },
      { turnNumber: 3, name: 'Curva do Sol', x: 410, y: 140 },
      { turnNumber: 4, name: 'Descida do Lago', x: 375, y: 215, isDrs: true },
      { turnNumber: 5, name: 'Turn 5', x: 330, y: 230 },
      { turnNumber: 6, name: 'Ferradura', x: 285, y: 210 },
      { turnNumber: 7, name: 'Turn 7', x: 255, y: 175 },
      { turnNumber: 8, name: 'Curva do Laranjinha', x: 220, y: 145 },
      { turnNumber: 9, name: 'Pinheirinho', x: 175, y: 180 },
      { turnNumber: 10, name: 'Bico de Pato', x: 180, y: 220 },
      { turnNumber: 11, name: 'Mergulho', x: 215, y: 265 },
      { turnNumber: 12, name: 'Junção', x: 295, y: 310 },
      { turnNumber: 13, name: 'Subida dos Boxes', x: 270, y: 345 },
      { turnNumber: 14, name: 'Curva do Café', x: 140, y: 280 },
      { turnNumber: 15, name: 'Arquibancadas', x: 80, y: 130 },
    ],
  },

  // 2. Marina Bay (Singapore Street Circuit)
  singapore: {
    circuitName: 'Marina Bay Street Circuit',
    shortName: 'Marina Bay',
    country: 'Singapore',
    lapLengthKm: 4.94,
    totalTurns: 19,
    drsZones: 4,
    viewBox: '0 0 520 380',
    svgPath:
      'M 130 90 L 290 90 C 320 90, 335 105, 335 125 L 335 155 C 335 170, 350 180, 370 180 L 420 180 C 440 180, 455 195, 455 215 L 455 260 C 455 285, 435 305, 410 305 L 350 305 C 335 305, 320 320, 320 335 L 320 355 C 320 370, 305 380, 290 380 L 210 380 C 190 380, 180 365, 180 345 L 180 300 C 180 280, 165 270, 145 270 L 95 270 C 70 270, 55 250, 55 225 L 55 150 C 55 115, 85 90, 130 90 Z',
    turns: [
      { turnNumber: 1, name: 'Sheares', x: 295, y: 90, isDrs: true },
      { turnNumber: 2, name: 'Turn 2', x: 335, y: 110 },
      { turnNumber: 3, name: 'Turn 3', x: 335, y: 145 },
      { turnNumber: 5, name: 'Turn 5', x: 360, y: 180, isDrs: true },
      { turnNumber: 7, name: 'Memorial', x: 445, y: 195 },
      { turnNumber: 8, name: 'Turn 8', x: 455, y: 245 },
      { turnNumber: 9, name: 'Turn 9', x: 425, y: 305 },
      { turnNumber: 10, name: 'Singapore Sling', x: 345, y: 305 },
      { turnNumber: 14, name: 'Connaught', x: 245, y: 380, isDrs: true },
      { turnNumber: 16, name: 'Turn 16', x: 180, y: 320 },
      { turnNumber: 19, name: 'Bay Corner', x: 65, y: 160 },
    ],
  },

  // 3. Autodromo Nazionale Monza (Italy)
  monza: {
    circuitName: 'Autodromo Nazionale Monza',
    shortName: 'Monza',
    country: 'Italy',
    lapLengthKm: 5.793,
    totalTurns: 11,
    drsZones: 2,
    viewBox: '0 0 520 320',
    svgPath:
      'M 80 240 L 320 240 C 350 240, 370 230, 385 205 L 435 125 C 455 95, 445 60, 410 60 L 310 60 C 285 60, 270 75, 260 95 L 245 120 C 235 140, 220 145, 200 145 L 140 145 C 115 145, 95 160, 85 185 L 75 215 C 70 230, 75 240, 80 240 Z',
    turns: [
      { turnNumber: 1, name: 'Variante del Rettifilo (T1)', x: 330, y: 240, isDrs: true },
      { turnNumber: 2, name: 'Variante del Rettifilo (T2)', x: 365, y: 225 },
      { turnNumber: 3, name: 'Curva Grande', x: 415, y: 155 },
      { turnNumber: 4, name: 'Variante della Roggia (T4)', x: 440, y: 90, isDrs: true },
      { turnNumber: 5, name: 'Variante della Roggia (T5)', x: 420, y: 60 },
      { turnNumber: 6, name: 'Curva di Lesmo 1', x: 350, y: 60 },
      { turnNumber: 7, name: 'Curva di Lesmo 2', x: 295, y: 65 },
      { turnNumber: 8, name: 'Variante Ascari (T8)', x: 255, y: 105 },
      { turnNumber: 9, name: 'Variante Ascari (T9)', x: 230, y: 135 },
      { turnNumber: 10, name: 'Variante Ascari (T10)', x: 180, y: 145 },
      { turnNumber: 11, name: 'Curva Alboreto (Parabolica)', x: 80, y: 195, isDrs: true },
    ],
  },

  // 4. Silverstone Circuit (Great Britain)
  silverstone: {
    circuitName: 'Silverstone Circuit',
    shortName: 'Silverstone',
    country: 'Great Britain',
    lapLengthKm: 5.891,
    totalTurns: 18,
    drsZones: 2,
    viewBox: '0 0 520 360',
    svgPath:
      'M 160 280 C 180 280, 210 260, 230 230 C 250 200, 280 180, 310 180 L 360 180 C 390 180, 420 160, 435 130 C 450 100, 440 60, 400 60 L 300 60 C 270 60, 245 80, 230 110 L 210 150 C 195 180, 165 190, 135 190 L 95 190 C 65 190, 50 215, 60 245 C 70 275, 120 280, 160 280 Z',
    turns: [
      { turnNumber: 1, name: 'Abbey', x: 220, y: 240, isDrs: true },
      { turnNumber: 2, name: 'Farm Curve', x: 245, y: 205 },
      { turnNumber: 3, name: 'Village', x: 285, y: 180 },
      { turnNumber: 4, name: 'The Loop', x: 330, y: 180 },
      { turnNumber: 5, name: 'Aintree', x: 375, y: 175, isDrs: true },
      { turnNumber: 6, name: 'Brooklands', x: 425, y: 140 },
      { turnNumber: 7, name: 'Luffield', x: 435, y: 90 },
      { turnNumber: 8, name: 'Woodcote', x: 380, y: 60 },
      { turnNumber: 9, name: 'Copse', x: 290, y: 60, isDrs: true },
      { turnNumber: 10, name: 'Maggotts', x: 240, y: 95 },
      { turnNumber: 11, name: 'Becketts', x: 220, y: 130 },
      { turnNumber: 15, name: 'Stowe', x: 130, y: 190, isDrs: true },
      { turnNumber: 16, name: 'Vale', x: 80, y: 205 },
      { turnNumber: 18, name: 'Club Corner', x: 95, y: 270 },
    ],
  },

  // 5. Circuit de Monaco (Monaco)
  monaco: {
    circuitName: 'Circuit de Monaco',
    shortName: 'Monaco',
    country: 'Monaco',
    lapLengthKm: 3.337,
    totalTurns: 19,
    drsZones: 1,
    viewBox: '0 0 500 360',
    svgPath:
      'M 150 290 L 330 290 C 360 290, 385 270, 385 240 L 385 180 C 385 150, 360 130, 330 130 L 270 130 C 245 130, 225 110, 225 85 C 225 60, 205 45, 180 45 L 140 45 C 110 45, 90 70, 90 100 L 90 200 C 90 230, 105 260, 130 280 Z',
    turns: [
      { turnNumber: 1, name: 'Sainte Dévote', x: 345, y: 290, isDrs: true },
      { turnNumber: 2, name: 'Beau Rivage', x: 385, y: 250 },
      { turnNumber: 3, name: 'Massenet', x: 385, y: 200 },
      { turnNumber: 4, name: 'Casino Square', x: 370, y: 145 },
      { turnNumber: 5, name: 'Mirabeau Haute', x: 310, y: 130 },
      { turnNumber: 6, name: 'Grand Hotel Hairpin', x: 255, y: 125 },
      { turnNumber: 8, name: 'Portier', x: 225, y: 80 },
      { turnNumber: 9, name: 'The Tunnel', x: 190, y: 45 },
      { turnNumber: 10, name: 'Nouvelle Chicane', x: 130, y: 45 },
      { turnNumber: 12, name: 'Tabac', x: 90, y: 120 },
      { turnNumber: 15, name: 'Piscine (Swimming Pool)', x: 90, y: 180 },
      { turnNumber: 18, name: 'La Rascasse', x: 110, y: 260 },
      { turnNumber: 19, name: 'Anthony Noghès', x: 145, y: 290 },
    ],
  },

  // 6. Autódromo Hermanos Rodríguez (Mexico City)
  mexico: {
    circuitName: 'Autódromo Hermanos Rodríguez',
    shortName: 'Mexico City',
    country: 'Mexico',
    lapLengthKm: 4.304,
    totalTurns: 17,
    drsZones: 3,
    viewBox: '0 0 520 340',
    svgPath:
      'M 120 70 L 380 70 C 410 70, 430 90, 430 120 L 430 160 C 430 185, 410 205, 385 205 L 340 205 C 320 205, 305 220, 305 240 L 305 270 C 305 295, 285 315, 260 315 L 160 315 C 130 315, 110 295, 110 265 L 110 200 C 110 170, 95 155, 75 155 C 55 155, 45 135, 45 115 L 45 100 C 45 75, 75 70, 120 70 Z',
    turns: [
      { turnNumber: 1, name: 'Moisés Solana (T1)', x: 385, y: 70, isDrs: true },
      { turnNumber: 2, name: 'Moisés Solana (T2)', x: 420, y: 95 },
      { turnNumber: 3, name: 'Moisés Solana (T3)', x: 430, y: 135 },
      { turnNumber: 4, name: 'Turn 4', x: 410, y: 195, isDrs: true },
      { turnNumber: 6, name: 'Turn 6 Hairpin', x: 345, y: 205 },
      { turnNumber: 7, name: 'Esses (T7)', x: 305, y: 235 },
      { turnNumber: 10, name: 'Esses (T10)', x: 305, y: 280, isDrs: true },
      { turnNumber: 12, name: 'Foro Sol Stadium Entrance', x: 230, y: 315 },
      { turnNumber: 14, name: 'Foro Sol Stadium Arena', x: 145, y: 315 },
      { turnNumber: 17, name: 'Nigel Mansell Curve', x: 55, y: 105, isDrs: true },
    ],
  },

  // 7. Sakhir (Bahrain International Circuit)
  bahrain: {
    circuitName: 'Bahrain International Circuit',
    shortName: 'Sakhir',
    country: 'Bahrain',
    lapLengthKm: 5.412,
    totalTurns: 15,
    drsZones: 3,
    viewBox: '0 0 520 360',
    svgPath:
      'M 120 280 L 360 280 C 390 280, 410 260, 410 230 L 410 170 C 410 140, 385 120, 355 120 L 290 120 C 270 120, 255 105, 255 85 L 255 65 C 255 50, 240 40, 225 40 L 175 40 C 150 40, 135 55, 135 80 L 135 150 C 135 180, 115 200, 85 200 L 65 200 C 45 200, 40 220, 45 240 L 55 260 C 65 280, 90 280, 120 280 Z',
    turns: [
      { turnNumber: 1, name: 'Michael Schumacher Turn', x: 375, y: 280, isDrs: true },
      { turnNumber: 2, name: 'Turn 2', x: 410, y: 250 },
      { turnNumber: 4, name: 'Turn 4', x: 405, y: 155, isDrs: true },
      { turnNumber: 8, name: 'Hairpin', x: 310, y: 120 },
      { turnNumber: 9, name: 'Tricky Downhill Left', x: 255, y: 95 },
      { turnNumber: 10, name: 'Tight Blind Apex', x: 245, y: 55 },
      { turnNumber: 11, name: 'Turn 11', x: 195, y: 40, isDrs: true },
      { turnNumber: 13, name: 'Turn 13', x: 135, y: 110 },
      { turnNumber: 14, name: 'Final Corner Entry', x: 70, y: 210 },
      { turnNumber: 15, name: 'Final Corner Exit', x: 75, y: 265, isDrs: true },
    ],
  },
};

// Generic Default F1 Grand Prix Circuit for unmapped circuits
export const DEFAULT_CIRCUIT: CircuitInfo = {
  circuitName: 'FIA Formula 1 World Championship Circuit',
  shortName: 'Grand Prix Circuit',
  country: 'Championship',
  lapLengthKm: 5.25,
  totalTurns: 16,
  drsZones: 2,
  viewBox: '0 0 500 340',
  svgPath:
    'M 120 75 L 360 75 C 395 75, 420 100, 420 135 L 420 175 C 420 205, 395 230, 365 230 L 305 230 C 280 230, 260 250, 260 275 C 260 300, 240 320, 215 320 L 135 320 C 95 320, 65 290, 65 250 L 65 140 C 65 95, 90 75, 120 75 Z',
  turns: [
    { turnNumber: 1, name: 'Turn 1', x: 365, y: 75, isDrs: true },
    { turnNumber: 3, name: 'Turn 3', x: 420, y: 125 },
    { turnNumber: 4, name: 'Turn 4', x: 415, y: 195, isDrs: true },
    { turnNumber: 7, name: 'Turn 7', x: 325, y: 230 },
    { turnNumber: 10, name: 'Turn 10', x: 260, y: 285 },
    { turnNumber: 12, name: 'Turn 12', x: 180, y: 320, isDrs: true },
    { turnNumber: 15, name: 'Final Corner', x: 65, y: 180 },
  ],
};

/**
 * Resolves circuit geometry and metadata from session names or circuit strings.
 */
export function getCircuitData(query?: string | null): CircuitInfo {
  if (!query) return DEFAULT_CIRCUIT;
  const q = query.toLowerCase();

  if (q.includes('brazil') || q.includes('interlagos') || q.includes('pace') || q.includes('são paulo') || q.includes('sao paulo')) {
    return CIRCUITS_MAP.interlagos;
  }
  if (q.includes('singapore') || q.includes('marina bay')) {
    return CIRCUITS_MAP.singapore;
  }
  if (q.includes('monza') || q.includes('italy') || q.includes('italian')) {
    return CIRCUITS_MAP.monza;
  }
  if (q.includes('silverstone') || q.includes('great britain') || q.includes('british')) {
    return CIRCUITS_MAP.silverstone;
  }
  if (q.includes('monaco') || q.includes('monte carlo')) {
    return CIRCUITS_MAP.monaco;
  }
  if (q.includes('mexico') || q.includes('rodriguez') || q.includes('hermanos')) {
    return CIRCUITS_MAP.mexico;
  }
  if (q.includes('bahrain') || q.includes('sakhir')) {
    return CIRCUITS_MAP.bahrain;
  }

  return DEFAULT_CIRCUIT;
}
