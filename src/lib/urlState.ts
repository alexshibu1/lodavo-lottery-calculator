import { clamp, MAX_YEARS } from './math';

/**
 * Result state <-> URL query string, so a reel can deep-link to a prefilled result.
 *   ?spend=10&years=10                       weekly amount
 *   ?game=lottomax&tickets=1&years=10        game + plays per draw
 *   ?game=custom&price=2&odds=1000000&draws=2
 *   &rate=3   optional (defaults to 3)
 *   &view=odds   optional, scrolls to the odds translator
 * Any other params (utm_*, fbclid, ...) are left untouched.
 */
export interface CalcState {
  mode: 'spend' | 'game';
  spend: number;
  game: string;
  tickets: number;
  years: number;
  rate: number;
  price: number;
  odds: number;
  draws: number;
}

export const LIMITS = { spend: 10_000, tickets: 100, rate: 20, price: 1_000, odds: 1e12, draws: 14 };
const OWN_KEYS = ['spend', 'game', 'tickets', 'years', 'rate', 'price', 'odds', 'draws', 'mode'];

export function defaultState(defaultGame: string): CalcState {
  return { mode: 'spend', spend: 10, game: defaultGame, tickets: 1, years: 10, rate: 3, price: 2, odds: 1_000_000, draws: 2 };
}

const num = (v: string | null) => (v === null || v.trim() === '' ? NaN : Number(v));

export function parseState(search: string, base: CalcState, validGames: string[]): { state: CalcState; touched: boolean } {
  const q = new URLSearchParams(search);
  const s = { ...base };
  let touched = false;
  const set = (key: keyof typeof LIMITS | 'years', min: number, max: number, round = false) => {
    const n = num(q.get(key));
    if (Number.isFinite(n)) { (s as any)[key] = clamp(round ? Math.round(n) : n, min, max); touched = true; }
  };
  const game = q.get('game');
  if (game && (validGames.includes(game) || game === 'custom')) { s.game = game; touched = true; }
  set('spend', 0, LIMITS.spend);
  set('tickets', 1, LIMITS.tickets, true);
  set('years', 1, MAX_YEARS, true);
  set('rate', 0, LIMITS.rate);
  set('price', 0, LIMITS.price);
  set('odds', 1, LIMITS.odds, true);
  set('draws', 1, LIMITS.draws, true);
  const mode = q.get('mode');
  if (mode === 'spend' || mode === 'game') s.mode = mode;
  else if (q.has('spend')) s.mode = 'spend';
  else if (q.has('game') || q.has('tickets')) s.mode = 'game';
  return { state: s, touched };
}

export function toQuery(s: CalcState, currentSearch = ''): string {
  const q = new URLSearchParams(currentSearch);
  for (const k of OWN_KEYS) q.delete(k);
  const own = new URLSearchParams();
  if (s.mode === 'spend') {
    own.set('spend', String(s.spend));
    own.set('game', s.game);
  } else {
    own.set('game', s.game);
    own.set('tickets', String(s.tickets));
  }
  own.set('years', String(s.years));
  if (s.rate !== 3) own.set('rate', String(s.rate));
  if (s.game === 'custom') {
    own.set('price', String(s.price));
    own.set('odds', String(s.odds));
    own.set('draws', String(s.draws));
    if (s.mode === 'spend') own.set('mode', 'spend');
  }
  q.forEach((v, k) => own.append(k, v));
  return own.toString();
}
