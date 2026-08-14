import { describe, it, expect } from 'vitest';
import { multiplyDecimalStrings } from '../lib/decimal';

describe('decimal', () => {
  it('multiplies correctly avoiding float drift', () => {
    expect(multiplyDecimalStrings("0.10", "3")).toBe("0.30");
    expect(multiplyDecimalStrings("1650.00", "2.5")).toBe("4125.00");
    expect(multiplyDecimalStrings("0.005", "1")).toBe("0.01");
    expect(multiplyDecimalStrings("0.10", "0.10")).toBe("0.01");
  });
  
  it('large value multiplies exactly', () => {
    // A value where float would lose precision
    const res = multiplyDecimalStrings("9007199254740993.10", "2.00");
    expect(res).toBe("18014398509481986.20");
  });
  
  it('invalid input returns null', () => {
    expect(multiplyDecimalStrings("abc", "2")).toBeNull();
  });
  
  it('handles signs correctly', () => {
    expect(multiplyDecimalStrings("-1.50", "2")).toBe("-3.00");
    expect(multiplyDecimalStrings("-1.50", "-2")).toBe("3.00");
  });
});
