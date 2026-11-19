/** Locale-aware number formatting. Deterministic for a given locale. */
export function makeFormat(intl: string, currency: 'CAD' | 'USD') {
  const money0 = new Intl.NumberFormat(intl, { style: 'currency', currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 });
  const money2 = new Intl.NumberFormat(intl, { style: 'currency', currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const int = new Intl.NumberFormat(intl, { maximumFractionDigits: 0 });
  const compact = new Intl.NumberFormat(intl, { style: 'currency', currency, currencyDisplay: 'narrowSymbol', notation: 'compact', maximumFractionDigits: 1 });
  const dec = (d: number) => new Intl.NumberFormat(intl, { minimumFractionDigits: d, maximumFractionDigits: d });
  return {
    money: (n: number) => money0.format(Math.round(n)),
    /** Whole dollars when possible, cents when needed ($2.50). */
    price: (n: number) => (Number.isInteger(n) ? money0.format(n) : money2.format(n)),
    int: (n: number) => int.format(Math.round(n)),
    compact: (n: number) => compact.format(n),
    dec: (n: number, d: number) => dec(d).format(n),
    rate: (n: number) => {
      const s = new Intl.NumberFormat(intl, { maximumFractionDigits: 2 }).format(n);
      return intl.startsWith('fr') ? `${s} %` : `${s}%`;
    },
    /** A probability as a percentage with enough digits to never read as 0 or 100. */
    pct: (p: number, complement = false) => {
      const v = (complement ? 1 - p : p) * 100;
      const sig = p > 0 ? Math.max(2, Math.ceil(-Math.log10(p * 100)) + 2) : 2;
      const digits = Math.min(12, complement ? sig : sig);
      const s = new Intl.NumberFormat(intl, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
      return intl.startsWith('fr') ? `${s} %` : `${s}%`;
    },
  };
}
export type Format = ReturnType<typeof makeFormat>;
