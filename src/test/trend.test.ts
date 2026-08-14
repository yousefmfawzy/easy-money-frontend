import { describe, it, expect } from 'vitest';
import { trendPresentation } from '../lib/trend';

describe('trend', () => {
  it('returns correct presentation for UP', () => {
    const res = trendPresentation('UP');
    expect(res.key).toBe('up');
    expect(res.icon).toBe('▲');
    expect(res.sign).toBe('+');
    expect(res.label).toBe('Up');
    expect(res.colorVar).toBe('var(--trend-up)');
  });
  
  it('returns correct presentation for DOWN', () => {
    const res = trendPresentation('DOWN');
    expect(res.key).toBe('down');
    expect(res.icon).toBe('▼');
    expect(res.sign).toBe('-');
    expect(res.label).toBe('Down');
    expect(res.colorVar).toBe('var(--trend-down)');
  });
  
  it('returns flat presentation for FLAT and unknown values', () => {
    const flat = trendPresentation('FLAT');
    expect(flat.key).toBe('flat');
    expect(flat.icon).toBe('■');
    expect(flat.sign).toBe('');
    
    const unknown = trendPresentation('SIDEWAYS');
    expect(unknown.key).toBe('flat');
    expect(unknown.icon).toBe('■');
  });
  
  it('up and down are distinguishable by icon and sign alone', () => {
    const up = trendPresentation('UP');
    const down = trendPresentation('DOWN');
    expect(up.icon).not.toBe(down.icon);
    expect(up.sign).not.toBe(down.sign);
  });
});
