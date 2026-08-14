export function formatDecimal(value: string): string {
  const match = value.match(/^(-?)(\d+)(?:\.(\d+))?$/);
  if (!match) return value;
  
  const [, sign, integerPart, fractionalPart] = match;
  
  let groupedInteger = '';
  for (let i = 0; i < integerPart.length; i++) {
    if (i > 0 && (integerPart.length - i) % 3 === 0) {
      groupedInteger += ',';
    }
    groupedInteger += integerPart[i];
  }
  
  return sign + groupedInteger + (fractionalPart !== undefined ? `.${fractionalPart}` : '');
}

export function formatCurrency(value: string, currency: string): string {
  return `${formatDecimal(value)} ${currency}`;
}

export function formatSignedAmount(value: string): string {
  if (isZeroDecimal(value)) {
    // If it has a minus sign, remove it for zero and group
    return formatDecimal(value.replace(/^-/, ''));
  }
  const grouped = formatDecimal(value);
  // check valid decimal
  if (!grouped.startsWith('-') && value.match(/^-?\d+(?:\.\d+)?$/)) {
    return `+${grouped}`;
  }
  return grouped;
}

export function formatPercentage(value: string): string {
  return `${formatSignedAmount(value)}%`;
}

export function isZeroDecimal(value: string): boolean {
  const match = value.match(/^-?\d+(?:\.\d+)?$/);
  if (!match) return false;
  
  for (let i = 0; i < value.length; i++) {
    if (value[i] !== '0' && value[i] !== '.' && value[i] !== '-') return false;
  }
  return true;
}

export function decimalSign(value: string): -1 | 0 | 1 {
  if (isZeroDecimal(value)) return 0;
  if (value.startsWith('-')) return -1;
  return 1;
}
