import { describe, expect, it } from 'vitest';
import {
  chanceOfAtLeastOne, clamp, coinFlipsInARow, daysOfSeconds, expectedSpendPerHit, expectedYearsPerHit,
  futureValue, milestones, playsPerYear, project, totalSpent, weeklySpendFromGame, weeksToReach,
  yearlySeries, yearsOfSeconds,
} from './math';
import data from '../data/games.json';

const near = (a: number, b: number, tol = 0.005) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

describe('weeklySpendFromGame', () => {
  it('multiplies price, plays and draws', () => {
    expect(weeklySpendFromGame(6, 1, 2)).toBe(12);
    expect(weeklySpendFromGame(2, 3, 3)).toBe(18);
  });
  it('treats zero, negatives and junk as zero', () => {
    expect(weeklySpendFromGame(6, 0, 2)).toBe(0);
    expect(weeklySpendFromGame(-6, 1, 2)).toBe(0);
    expect(weeklySpendFromGame(NaN, 1, 2)).toBe(0);
  });
});

describe('totalSpent', () => {
  it('is weekly × 52 × years', () => {
    expect(totalSpent(10, 1)).toBe(520);
    expect(totalSpent(10, 10)).toBe(5200);
    expect(totalSpent(20, 40)).toBe(41600);
  });
  it('handles zero', () => {
    expect(totalSpent(0, 10)).toBe(0);
    expect(totalSpent(10, 0)).toBe(0);
  });
});

describe('futureValue', () => {
  it('equals deposits when the rate is 0', () => {
    expect(futureValue(10, 10, 0)).toBe(5200);
  });
  it('matches the annuity formula ($10/week, 10 years, 3%)', () => {
    // Independent check: simulate 520 weekly deposits.
    let bal = 0;
    for (let k = 0; k < 520; k++) bal = bal * (1 + 0.03 / 52) + 10;
    near(futureValue(10, 10, 3), bal, 1e-6);
    near(futureValue(10, 10, 3), 6062.2, 0.01);
  });
  it('matches simulation at the 40-year ceiling', () => {
    let bal = 0;
    for (let k = 0; k < 2080; k++) bal = bal * (1 + 0.03 / 52) + 20;
    near(futureValue(20, 40, 3), bal, 1e-5);
  });
  it('is zero with nothing saved or no time', () => {
    expect(futureValue(0, 10, 3)).toBe(0);
    expect(futureValue(10, 0, 3)).toBe(0);
  });
  it('stays finite for very large inputs', () => {
    const v = futureValue(1_000_000, 40, 20);
    expect(Number.isFinite(v)).toBe(true);
    expect(v).toBeGreaterThan(totalSpent(1_000_000, 40));
  });
  it('never returns less than the deposits', () => {
    for (const r of [0, 0.5, 3, 7, 15]) expect(futureValue(7, 13, r)).toBeGreaterThanOrEqual(totalSpent(7, 13) - 1e-9);
  });
  it('ignores negative rates and junk', () => {
    expect(futureValue(10, 10, -5)).toBe(5200);
    expect(futureValue(NaN, 10, 3)).toBe(0);
  });
});

describe('project', () => {
  it('returns spent, saved and growth', () => {
    const p = project(10, 10, 3);
    expect(p.spent).toBe(5200);
    near(p.growth, p.saved - 5200, 1e-9);
    expect(p.growth).toBeGreaterThan(0);
  });
});

describe('yearlySeries', () => {
  it('has one point per year, starting at zero', () => {
    const s = yearlySeries(10, 10, 3);
    expect(s).toHaveLength(11);
    expect(s[0]).toEqual({ year: 0, spent: 0, saved: 0 });
    expect(s[10].spent).toBe(5200);
  });
  it('covers 40 years', () => {
    expect(yearlySeries(5, 40, 3)).toHaveLength(41);
  });
});

describe('weeksToReach and milestones', () => {
  it('uses ceil(T / w) at 0%', () => {
    expect(weeksToReach(1000, 10, 0)).toBe(100);
    expect(weeksToReach(1000, 3, 0)).toBe(334);
  });
  it('finds the first week the balance reaches the target', () => {
    for (const [t, w, r] of [[1000, 10, 3], [5000, 20, 3], [25000, 6, 4.5], [10000, 12, 0.5]] as const) {
      const n = weeksToReach(t, w, r)!;
      let bal = 0;
      let k = 0;
      while (bal < t) { bal = bal * (1 + r / 100 / 52) + w; k++; }
      expect(n).toBe(k);
    }
  });
  it('returns null when nothing is saved and 0 for a zero target', () => {
    expect(weeksToReach(1000, 0, 3)).toBeNull();
    expect(weeksToReach(0, 10, 3)).toBe(0);
  });
  it('reports the crossing year and whether it is inside the horizon', () => {
    const m = milestones(10, 10, 3);
    expect(m.map((x) => x.target)).toEqual([1000, 5000, 10000, 25000]);
    expect(m[0].year).toBe(2); // week 98
    expect(m[0].withinHorizon).toBe(true);
    expect(m[1].year).toBe(9); // week 440
    expect(m[2].withinHorizon).toBe(false);
  });
  it('gives null years at $0 a week', () => {
    expect(milestones(0, 10, 3).every((x) => x.year === null && !x.withinHorizon)).toBe(true);
  });
});

describe('odds translator', () => {
  const max = data.games.find((g) => g.id === 'lottomax')!;
  it('plays per year', () => {
    expect(playsPerYear(2)).toBe(104);
    expect(playsPerYear(0)).toBe(0);
  });
  it('expected years per hit = odds ÷ plays per year', () => {
    near(expectedYearsPerHit(max.jackpot_odds, 2)!, 33446140 / 104, 1e-6);
    near(expectedYearsPerHit(max.jackpot_odds, 2)!, 321597.5, 0.1);
    expect(expectedYearsPerHit(max.jackpot_odds, 0)).toBeNull();
    expect(expectedYearsPerHit(0, 2)).toBeNull();
  });
  it('expected spend per hit = odds × price', () => {
    expect(expectedSpendPerHit(33446140, 6)).toBe(200676840);
    expect(expectedSpendPerHit(292201338, 2)).toBe(584402676);
  });
  it('chance of at least one hit', () => {
    expect(chanceOfAtLeastOne(2, 1)).toBeCloseTo(0.5, 12);
    expect(chanceOfAtLeastOne(2, 2)).toBeCloseTo(0.75, 12);
    expect(chanceOfAtLeastOne(1, 5)).toBe(1);
    expect(chanceOfAtLeastOne(33446140, 0)).toBe(0);
    // 1,040 plays of Lotto Max: about 1,040 / 33,446,140.
    const p = chanceOfAtLeastOne(33446140, 1040);
    expect(p).toBeGreaterThan(0);
    near(p, 1040 / 33446140, 1e-9);
  });
  it('keeps precision for enormous odds', () => {
    const p = chanceOfAtLeastOne(1e15, 1);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeCloseTo(1e-15, 20);
  });
  it('coin flips = log2(odds)', () => {
    expect(coinFlipsInARow(1024)).toBe(10);
    near(coinFlipsInARow(33446140), 24.995, 0.001);
    near(coinFlipsInARow(292201338), 28.122, 0.001);
    expect(coinFlipsInARow(0)).toBe(0);
  });
  it('seconds comparisons', () => {
    near(daysOfSeconds(33446140), 387.11, 0.01);
    near(yearsOfSeconds(292201338), 9.266, 0.001);
  });
});

describe('clamp', () => {
  it('clamps and repairs junk', () => {
    expect(clamp(50, 1, 40)).toBe(40);
    expect(clamp(-3, 1, 40)).toBe(1);
    expect(clamp(NaN, 1, 40)).toBe(1);
  });
});

describe('games.json integrity', () => {
  it('has positive, sourced values for every game', () => {
    for (const g of data.games) {
      expect(g.price_per_play).toBeGreaterThan(0);
      expect(g.jackpot_odds).toBeGreaterThan(1_000_000);
      expect(g.draws_per_week).toBe(g.draw_days.length);
      expect(g.sources.length).toBeGreaterThan(0);
      for (const s of g.sources) expect(s.url).toMatch(/^https:\/\//);
      expect(g.verified_on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it('matches combinatorics where the game is a simple pick', () => {
    const C = (n: number, k: number) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
    const g = (id: string) => data.games.find((x) => x.id === id)!.jackpot_odds;
    expect(g('lotto649')).toBe(C(49, 6));
    expect(g('dailygrand')).toBe(C(49, 5) * 7);
    expect(g('lottomax')).toBe(C(52, 7) / 4); // 4 selections per $6 play
    expect(g('powerball')).toBe(C(69, 5) * 26);
    expect(g('megamillions')).toBe(C(70, 5) * 24);
  });
});
