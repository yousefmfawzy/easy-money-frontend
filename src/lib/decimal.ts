export function multiplyDecimalStrings(a: string, b: string, scale = 2): string | null {
  const matchA = a.match(/^(-?)(\d+)(?:\.(\d+))?$/);
  const matchB = b.match(/^(-?)(\d+)(?:\.(\d+))?$/);
  
  if (!matchA || !matchB) return null;
  
  const [, signA, intA, fracA = ''] = matchA;
  const [, signB, intB, fracB = ''] = matchB;
  
  const valA = BigInt(intA + fracA);
  const valB = BigInt(intB + fracB);
  
  const product = valA * valB;
  const productSign = (signA === '-') !== (signB === '-') && product !== 0n ? '-' : '';
  
  const totalFrac = fracA.length + fracB.length;
  
  let finalVal = product;
  if (totalFrac > scale) {
    const diff = totalFrac - scale;
    const divisor = 10n ** BigInt(diff);
    const halfDivisor = divisor / 2n;
    finalVal = (product + halfDivisor) / divisor;
  } else if (totalFrac < scale) {
    const diff = scale - totalFrac;
    finalVal = product * (10n ** BigInt(diff));
  }
  
  let strVal = finalVal.toString();
  
  while (strVal.length <= scale) {
    strVal = '0' + strVal;
  }
  
  const finalInt = strVal.slice(0, strVal.length - scale);
  const finalFrac = strVal.slice(strVal.length - scale);
  
  return `${productSign}${finalInt}.${finalFrac}`;
}
