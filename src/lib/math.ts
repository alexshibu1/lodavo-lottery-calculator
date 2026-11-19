/**
 * Pure, deterministic math for the lottery calculator and odds translator.
 * No dates, no randomness, no I/O. Every function is unit-tested in math.test.ts.
 *
 * Conventions
 * - A year is 52 weeks (the same convention as Lodavo's 52-week savings challenge).
 * - Savings: one deposit at the end of each week, compounding weekly at annualRate / 52.
 * - Rates are percentages (3 means 3% a year). Odds are "1 in N" (pass N).
 */

export const WEEKS_PER_YEAR = 52;
export const SECONDS_PER_DAY = 86_400;
export const SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY; // 31,536,000 (non-leap year)
export const MAX_YEARS = 40;
export const MILESTONES = [1_000, 5_000, 10_000, 25_000] as const;

const clean = (n: number, fallback = 0) => (Number.isFinite(n) ? n : fallback);
const nonNeg = (n: number) => Math.max(0, clean(n));

/** Weekly spend implied by a game: price × plays per draw × draws per week. */
export function weeklySpendFromGame(pricePerPlay: number, playsPerDraw: number, drawsPerWeek: number): number {
  return nonNeg(pricePerPlay) * nonNeg(playsPerDraw) * nonNeg(drawsPerWeek);
}

/** Total paid for tickets: weekly × 52 × years. */
export function totalSpent(weekly: number, years: number): number {
  return nonNeg(weekly) * WEEKS_PER_YEAR * nonNeg(years);
}

/**
 * Future value of a weekly deposit made at the end of each week.
 * FV = w × ((1 + i)^n − 1) / i, with i = rate / 100 / 52 and n = 52 × years.
 * When the rate is 0 this is simply w × n.
 */
export function futureValue(weekly: number, years: number, annualRatePct: number): number {
  const w = nonNeg(weekly);
  const n = Math.round(WEEKS_PER_YEAR * nonNeg(years));
  const i = nonNeg(annualRatePct) / 100 / WEEKS_PER_YEAR;
  if (w === 0 || n === 0) return 0;
  if (i === 0) return w * n;
  return (w * (Math.pow(1 + i, n) - 1)) / i;
}

export interface Projection {
  weekly: number;
  years: number;
  ratePct: number;
  spent: number;
  saved: number;
  /** saved − spent: the growth earned on top of the deposits. */
  growth: number;
}

export function project(weekly: number, years: number, annualRatePct: number): Projection {
  const spent = totalSpent(weekly, years);
  const saved = futureValue(weekly, years, annualRatePct);
  return { weekly: nonNeg(weekly), years: nonNeg(years), ratePct: nonNeg(annualRatePct), spent, saved, growth: saved - spent };
}

/** One point per year from 0 to `years`, for the chart and the table view. */
export function yearlySeries(weekly: number, years: number, annualRatePct: number): { year: number; spent: number; saved: number }[] {
  const whole = Math.floor(nonNeg(years));
  const out = [];
  for (let y = 0; y <= whole; y++) {
    out.push({ year: y, spent: totalSpent(weekly, y), saved: futureValue(weekly, y, annualRatePct) });
  }
  return out;
}

/**
 * Weeks until the saved balance first reaches `target`.
 * Closed form: n = ceil( ln(1 + T·i / w) / ln(1 + i) ); with i = 0, n = ceil(T / w).
 * Returns null when nothing is being saved.
 */
export function weeksToReach(target: number, weekly: number, annualRatePct: number): number | null {
  const w = nonNeg(weekly);
  const t = nonNeg(target);
  if (t === 0) return 0;
  if (w === 0) return null;
  const i = nonNeg(annualRatePct) / 100 / WEEKS_PER_YEAR;
  let n = i === 0 ? Math.ceil(t / w - 1e-9) : Math.ceil(Math.log(1 + (t * i) / w) / Math.log(1 + i) - 1e-9);
  // Guard against floating-point edges on either side of the boundary.
  while (n > 0 && futureValueWeeks(w, n - 1, i) >= t) n--;
  while (futureValueWeeks(w, n, i) < t) n++;
  return n;
}

function futureValueWeeks(w: number, n: number, i: number): number {
  if (n <= 0) return 0;
  return i === 0 ? w * n : (w * (Math.pow(1 + i, n) - 1)) / i;
}

export interface Milestone {
  target: number;
  weeks: number | null;
  /** The year in which the balance crosses the target (1 = during the first year). */
  year: number | null;
  withinHorizon: boolean;
}

export function milestones(weekly: number, years: number, annualRatePct: number, targets: readonly number[] = MILESTONES): Milestone[] {
  return targets.map((target) => {
    const weeks = weeksToReach(target, weekly, annualRatePct);
    const year = weeks === null ? null : Math.max(1, Math.ceil(weeks / WEEKS_PER_YEAR));
    return { target, weeks, year, withinHorizon: weeks !== null && weeks <= Math.round(nonNeg(years) * WEEKS_PER_YEAR) };
  });
}

/* ------------------------------ Odds translator ------------------------------ */

/** Plays bought per year: plays per week × 52. */
export function playsPerYear(playsPerWeek: number): number {
  return nonNeg(playsPerWeek) * WEEKS_PER_YEAR;
}

/**
 * Average years of play per jackpot-odds hit: odds ÷ plays per year.
 * (The mean of a geometric distribution with p = 1/odds is `odds` plays.)
 * Returns null when no plays are bought.
 */
export function expectedYearsPerHit(odds: number, playsPerWeek: number): number | null {
  const perYear = playsPerYear(playsPerWeek);
  if (perYear === 0 || !(odds > 0)) return null;
  return odds / perYear;
}

/** Average spend per jackpot-odds hit: odds × price per play. */
export function expectedSpendPerHit(odds: number, pricePerPlay: number): number {
  return nonNeg(odds) * nonNeg(pricePerPlay);
}

/**
 * Chance of at least one jackpot in `plays` independent plays: 1 − (1 − 1/odds)^plays.
 * Computed with log1p/expm1 so tiny probabilities stay accurate.
 */
export function chanceOfAtLeastOne(odds: number, plays: number): number {
  const n = nonNeg(plays);
  if (!(odds >= 1) || n === 0) return 0;
  if (odds === 1) return 1;
  return -Math.expm1(n * Math.log1p(-1 / odds));
}

/** How many coin flips in a row have the same odds: log2(odds). */
export function coinFlipsInARow(odds: number): number {
  return odds >= 1 ? Math.log2(odds) : 0;
}

/** One specific second out of this many days: odds ÷ 86,400. */
export function daysOfSeconds(odds: number): number {
  return nonNeg(odds) / SECONDS_PER_DAY;
}

/** One specific second out of this many 365-day years: odds ÷ 31,536,000. */
export function yearsOfSeconds(odds: number): number {
  return nonNeg(odds) / SECONDS_PER_YEAR;
}

/* --------------------------------- Clamping --------------------------------- */

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, clean(n, min)));
}
