/**
 * Formula 1 Team Color & Style Mappings
 * Supports 2026 11th Team: Cadillac Racing (#D4AF37 / Gold accent)
 */

export interface TeamStyle {
  name: string;
  pattern: RegExp;
  color: string;
  accentColor: string;
}

export const TEAM_STYLES: TeamStyle[] = [
  // 2026 Cadillac F1 Team (Gold & Obsidian palette)
  {
    name: 'Cadillac Racing',
    pattern: /cadillac/i,
    color: '#D4AF37', // Official Gold accent
    accentColor: '#1E1E1E',
  },
  {
    name: 'Red Bull Racing',
    pattern: /red bull/i,
    color: '#3671C6',
    accentColor: '#CC1E4A',
  },
  {
    name: 'Ferrari',
    pattern: /ferrari/i,
    color: '#E8002D',
    accentColor: '#FFF200',
  },
  {
    name: 'Mercedes',
    pattern: /mercedes/i,
    color: '#27F4D2',
    accentColor: '#C0C0C0',
  },
  {
    name: 'McLaren',
    pattern: /mclaren/i,
    color: '#FF8000',
    accentColor: '#47C7FC',
  },
  {
    name: 'Aston Martin',
    pattern: /aston martin/i,
    color: '#229971',
    accentColor: '#CEDC00',
  },
  {
    name: 'Alpine',
    pattern: /alpine/i,
    color: '#FF87BC',
    accentColor: '#0090FF',
  },
  {
    name: 'Williams',
    pattern: /williams/i,
    color: '#64C4FF',
    accentColor: '#00A3E0',
  },
  {
    name: 'Racing Bulls',
    pattern: /racing bulls|rb|alphatauri|alpha tauri/i,
    color: '#6692FF',
    accentColor: '#FFFFFF',
  },
  {
    name: 'Kick Sauber',
    pattern: /sauber|stake|kick/i,
    color: '#52E252',
    accentColor: '#1A1A1A',
  },
  {
    name: 'Haas F1 Team',
    pattern: /haas/i,
    color: '#B6BABD',
    accentColor: '#E10600',
  },
  {
    name: 'Audi',
    pattern: /audi/i,
    color: '#E50000',
    accentColor: '#000000',
  },
];

export function getTeamColor(teamName?: string | null, rawHex?: string | null): string {
  if (teamName) {
    for (const team of TEAM_STYLES) {
      if (team.pattern.test(teamName)) {
        return team.color;
      }
    }
  }

  if (rawHex) {
    const clean = rawHex.trim().replace(/^#/, '');
    if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
      return `#${clean.toUpperCase()}`;
    }
  }

  return '#808080';
}
