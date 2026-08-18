import { describe, it, expect } from 'vitest';
import { buildScale, groupNumber, niceCeiling, parseMoney, EMPTY_SCALE_MAX } from '../lib/chartScale';

describe('niceCeiling', () => {
  it('falls back to the empty-state ceiling for zero and negatives', () => {
    expect(niceCeiling(0)).toBe(EMPTY_SCALE_MAX);
    expect(niceCeiling(-5)).toBe(EMPTY_SCALE_MAX);
  });

  it('rounds up to a readable step', () => {
    expect(niceCeiling(94500)).toBe(100000);
    expect(niceCeiling(120)).toBe(150);
    expect(niceCeiling(100)).toBe(100);
  });
});

describe('buildScale', () => {
  it('produces six ticks from max down to zero', () => {
    const scale = buildScale([94500, 12800]);
    expect(scale.max).toBe(100000);
    expect(scale.ticks).toEqual([100000, 80000, 60000, 40000, 20000, 0]);
  });

  it('keeps the pre-camp all-zero board drawable', () => {
    const scale = buildScale([0, 0, 0, 0, 0, 0, 0]);
    expect(scale.max).toBe(EMPTY_SCALE_MAX);
    expect(scale.percentFor(0)).toBe(0);
  });

  it('clamps bar heights into 0..100', () => {
    const scale = buildScale([100]);
    expect(scale.percentFor(100)).toBe(100);
    expect(scale.percentFor(50)).toBe(50);
    expect(scale.percentFor(-10)).toBe(0);
    expect(scale.percentFor(1e9)).toBe(100);
  });
});

describe('parseMoney', () => {
  it('parses the API fixed-decimal strings', () => {
    expect(parseMoney('1234.50')).toBe(1234.5);
    expect(parseMoney('-3.25')).toBe(-3.25);
  });

  it('degrades to zero rather than NaN on junk', () => {
    expect(parseMoney('')).toBe(0);
    expect(parseMoney('abc')).toBe(0);
  });
});

describe('groupNumber', () => {
  it('groups thousands like the artboard', () => {
    expect(groupNumber(94500)).toBe('94,500');
    expect(groupNumber(0)).toBe('0');
    expect(groupNumber(1000000)).toBe('1,000,000');
  });
});
