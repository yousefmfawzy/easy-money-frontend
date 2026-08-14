import { describe, it, expect } from 'vitest';
import { formatDecimal, formatCurrency, formatSignedAmount, formatPercentage, isZeroDecimal, decimalSign } from '../lib/money';

describe('money', () => {
  it('formatDecimal groups digits and preserves fractions verbatim', () => {
    expect(formatDecimal("1650.00")).toBe("1,650.00");
    expect(formatDecimal("12345678.99")).toBe("12,345,678.99");
    expect(formatDecimal("0.00")).toBe("0.00");
    expect(formatDecimal("-250.50")).toBe("-250.50");
    expect(formatDecimal("9007199254740993.10")).toBe("9,007,199,254,740,993.10");
    expect(formatDecimal("invalid")).toBe("invalid");
  });

  it('formatCurrency includes both grouped digits and the Arabic label', () => {
    const res = formatCurrency("1650.00", "لحوح");
    expect(res).toContain("1,650.00");
    expect(res).toContain("لحوح");
  });

  it('formatSignedAmount gives correct signs', () => {
    expect(formatSignedAmount("1650.00")).toBe("+1,650.00");
    expect(formatSignedAmount("-250.50")).toBe("-250.50");
    expect(formatSignedAmount("-1250.50")).toBe("-1,250.50");
    expect(formatSignedAmount("0.00")).toBe("0.00");
    expect(formatSignedAmount("-0.00")).toBe("0.00");
  });
  
  it('formatPercentage gives signed percentage', () => {
    expect(formatPercentage("1.50")).toBe("+1.50%");
    expect(formatPercentage("-1.50")).toBe("-1.50%");
    expect(formatPercentage("0.00")).toBe("0.00%");
  });

  it('isZeroDecimal works properly', () => {
    expect(isZeroDecimal("0.00")).toBe(true);
    expect(isZeroDecimal("-0.00")).toBe(true);
    expect(isZeroDecimal("0")).toBe(true);
    expect(isZeroDecimal("0.01")).toBe(false);
    expect(isZeroDecimal("-0.01")).toBe(false);
    expect(isZeroDecimal("..")).toBe(false);
    expect(isZeroDecimal("abc")).toBe(false);
  });
  
  it('decimalSign works properly', () => {
    expect(decimalSign("0.00")).toBe(0);
    expect(decimalSign("1.50")).toBe(1);
    expect(decimalSign("-1.50")).toBe(-1);
  });
});
