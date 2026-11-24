/**
 * Numeri in formato italiano: punto per le migliaia (1.234), virgola per i decimali (7,03).
 * Il grafico li scrive sempre così, qualunque sia la lingua del browser.
 */

/** Punto ogni tre cifre della parte intera: "1234567" diventa "1.234.567". */
const groupThousands = (digits: string): string => digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** Numero intero con le migliaia separate: 1234 diventa "1.234". */
export function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  return new Intl.NumberFormat('it-IT', { useGrouping: false, maximumFractionDigits: 0 })
    .format(value)
    .replace(/^(-?)(\d+)/, (_whole, sign: string, digits: string) => sign + groupThousands(digits));
}
