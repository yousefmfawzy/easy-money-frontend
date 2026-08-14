export interface TrendPresentation {
  key: 'up' | 'down' | 'flat';
  label: string;
  icon: string;
  sign: '+' | '-' | '';
  colorVar: string;
  className: string;
}

export function trendPresentation(trend: string): TrendPresentation {
  if (trend === 'UP') {
    return { key: 'up', label: 'Up', icon: '▲', sign: '+', colorVar: 'var(--trend-up)', className: 'trend-up' };
  } else if (trend === 'DOWN') {
    return { key: 'down', label: 'Down', icon: '▼', sign: '-', colorVar: 'var(--trend-down)', className: 'trend-down' };
  } else {
    // FLAT or any unrecognized value
    return { key: 'flat', label: 'No change', icon: '■', sign: '', colorVar: 'var(--trend-flat)', className: 'trend-flat' };
  }
}
