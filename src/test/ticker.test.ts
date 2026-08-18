import { describe, it, expect } from 'vitest';
import { buildTickerItems } from '../lib/ticker';
import type { Etf } from '../types/api';

const etf = (over: Partial<Etf>): Etf => ({
  id: 1,
  name: 'TECH',
  logo_url: null,
  current_value: '120.00',
  previous_value: '100.00',
  last_change_amount: '20.00',
  last_change_percentage: '20.00',
  trend: 'UP',
  updated_at: '2026-08-18T17:56:00Z',
  currency: 'لحوح',
  ...over,
});

describe('buildTickerItems', () => {
  it('reports real movements and keeps the standing reminder last', () => {
    const items = buildTickerItems([etf({}), etf({ id: 2, name: 'ENERGY', trend: 'DOWN', last_change_percentage: '-3.00' })]);

    expect(items).toHaveLength(3);
    expect(items[0].strong).toBe('TECH');
    expect(items[0].suffix).toContain('يرتفع');
    expect(items[1].strong).toBe('ENERGY');
    expect(items[1].suffix).toContain('ينخفض');
    expect(items[2].id).toBe('reminder-approval');
  });

  it('skips flat ETFs rather than inventing movement', () => {
    const items = buildTickerItems([etf({ trend: 'FLAT', last_change_percentage: '0.00' })]);
    expect(items.some((i) => i.strong === 'TECH')).toBe(false);
  });

  it('falls back to an opening message for the seeded pre-camp board', () => {
    const items = buildTickerItems([]);
    expect(items.map((i) => i.id)).toEqual(['market-opening', 'reminder-approval']);
  });
});
