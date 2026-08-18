/*
 * Bar-chart scale for the projector.
 *
 * The artboard hardcodes MIN=1000 / MAX=100000 against placeholder data. Real
 * ETFs are seeded at 0 and revalued by hand, so the scale is derived from the
 * live values instead — same six-gridline visual treatment, honest numbers.
 */

export const GRIDLINE_COUNT = 6;

/** Fallback ceiling so the pre-camp all-zero board still draws its gridlines. */
export const EMPTY_SCALE_MAX = 100;

/** Rounds up to a readable axis ceiling (1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10 × 10ⁿ). */
export function niceCeiling(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return EMPTY_SCALE_MAX;

  const exponent = Math.floor(Math.log10(value));
  const base = Math.pow(10, exponent);
  const mantissa = value / base;

  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const step = steps.find((s) => mantissa <= s + 1e-9) ?? 10;

  return step * base;
}

/** Parses a fixed-2-decimal API money string for geometry only, never display. */
export function parseMoney(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export interface ChartScale {
  max: number;
  /** Tick values, highest first — matches the artboard's top-down axis order. */
  ticks: number[];
  /** Height percentage for a bar at `value`, clamped to 0..100. */
  percentFor: (value: number) => number;
}

export function buildScale(values: number[]): ChartScale {
  const highest = values.reduce((acc, v) => (v > acc ? v : acc), 0);
  const max = niceCeiling(highest);

  const ticks: number[] = [];
  for (let i = GRIDLINE_COUNT - 1; i >= 0; i--) {
    ticks.push((max * i) / (GRIDLINE_COUNT - 1));
  }

  return {
    max,
    ticks,
    percentFor: (value) => Math.max(0, Math.min(100, (value / max) * 100)),
  };
}

/** Groups an axis number with thousands separators, as the artboard does. */
export function groupNumber(value: number): string {
  const rounded = Math.round(value);
  const digits = String(Math.abs(rounded));
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ',';
    out += digits[i];
  }
  return (rounded < 0 ? '-' : '') + out;
}
