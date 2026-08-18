import type { Etf } from '../types/api';
import { formatPercentage, isZeroDecimal } from './money';

/**
 * Ticker copy for the projector.
 *
 * The artboard's ticker carries hand-written Arabic market news. The backend
 * exposes no news endpoint and inventing one is out of bounds, so the visual
 * treatment is kept and filled from what GET /api/etfs actually returns:
 * real movements, plus the artboard's own standing reminder. Nothing here is
 * fabricated market data.
 */

export interface TickerItem {
  id: string;
  prefix: string;
  strong?: string;
  suffix: string;
}

/** Verbatim from the artboard — a standing rule, not invented news. */
const APPROVAL_REMINDER: TickerItem = {
  id: 'reminder-approval',
  prefix: 'تذكير: كل عملية شراء تحتاج موافقة المشرف',
  suffix: '',
};

const MARKET_OPENING: TickerItem = {
  id: 'market-opening',
  prefix: 'السوق يفتح قريبًا — لم تُسجَّل أي تغييرات بعد',
  suffix: '',
};

export function buildTickerItems(etfs: Etf[]): TickerItem[] {
  const moves: TickerItem[] = [];

  for (const etf of etfs) {
    if (etf.trend === 'FLAT' || isZeroDecimal(etf.last_change_percentage)) continue;

    const rising = etf.trend === 'UP';
    moves.push({
      id: `etf-${etf.id}`,
      prefix: 'سهم ',
      strong: etf.name,
      // The percentage string already carries its own sign from the API.
      suffix: `${rising ? ' يرتفع بنسبة ' : ' ينخفض بنسبة '}${formatPercentage(etf.last_change_percentage)}`,
    });
  }

  // Pre-camp state: seeded ETFs are all 0/FLAT, so the ticker still reads well.
  if (moves.length === 0) return [MARKET_OPENING, APPROVAL_REMINDER];

  return [...moves, APPROVAL_REMINDER];
}
