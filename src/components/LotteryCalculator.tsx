import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import gamesData from '../data/games.json';
import { COPY, CONFIG, abs, type Locale, type Preset } from '../i18n/lottery';
import { makeFormat } from '../lib/format';
import {
  MAX_YEARS, chanceOfAtLeastOne, clamp, coinFlipsInARow, daysOfSeconds, expectedSpendPerHit, expectedYearsPerHit,
  milestones, project, weeklySpendFromGame, yearlySeries, yearsOfSeconds,
} from '../lib/math';
import { LIMITS, defaultState, parseState, toQuery, type CalcState } from '../lib/urlState';
import { trackLotteryCalculate, trackLotteryShare } from '../lib/analytics';
import { cardBlob, downloadBlob, type CardKind } from '../lib/shareCard';

const BOX = 'mt-1.5 flex items-center gap-1 rounded-[14px] border border-[#f5f5f5] bg-white px-3 py-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition focus-within:border-brand';
const INPUT = 'nums w-full min-w-0 bg-transparent text-lg font-semibold text-ink outline-none placeholder:font-normal placeholder:text-[#4b5563]';
const CHIP = 'rounded-full border px-3 py-1.5 text-sm font-medium transition';
const CHIP_OFF = 'border-brand/15 bg-pale-blue text-brand hover:bg-brand/10';
const CHIP_ON = 'border-brand bg-brand text-white';
const SPENT_COLOR = '#8a6f00'; // accent-dark deepened to clear 3:1 on white for a thin line

function sliderFill(value: number, min: number, max: number) {
  const pct = max > min ? ((clamp(value, min, max) - min) / (max - min)) * 100 : 0;
  return { background: `linear-gradient(90deg, var(--color-brand), var(--color-secondary)) 0 / ${pct}% 100% no-repeat, var(--color-pale-blue)` };
}

interface NumFieldProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  decimal?: boolean;
  prefix?: string;
  suffix?: string;
  aside?: ReactNode;
  slider?: { min: number; max: number; step: number };
  frDecimal?: boolean;
}

/** Text field (numeric keypad on phones) with an optional matching slider, as on Lodavo's other calculators. */
function NumField({ label, value, onChange, min, max, decimal, prefix, suffix, aside, slider, frDecimal }: NumFieldProps) {
  const id = useId();
  const show = (n: number) => (frDecimal ? String(n).replace('.', ',') : String(n));
  const [text, setText] = useState(show(value));
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setText(show(value)); }, [value]);
  const commit = (raw: string) => {
    const cleaned = raw.replace(',', '.').replace(decimal ? /[^0-9.]/g : /[^0-9]/g, '');
    setText(frDecimal ? cleaned.replace('.', ',') : cleaned);
    const n = Number(cleaned);
    if (cleaned !== '' && Number.isFinite(n)) onChange(clamp(n, min, max));
    else if (cleaned === '') onChange(min);
  };
  return (
    <div className="mt-6">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-semibold text-ink">{label}</label>
        {aside}
      </div>
      <div className={BOX}>
        {prefix ? <span className="shrink-0 text-ink/60">{prefix}</span> : null}
        <input
          id={id} type="text" inputMode={decimal ? 'decimal' : 'numeric'} autoComplete="off" placeholder="0" className={INPUT}
          value={text}
          onFocus={() => { focused.current = true; }}
          onBlur={() => { focused.current = false; setText(show(value)); }}
          onChange={(e) => commit(e.target.value)}
        />
        {suffix ? <span className="shrink-0 text-ink/60">{suffix}</span> : null}
      </div>
      {slider ? (
        <input
          type="range" min={slider.min} max={slider.max} step={slider.step} aria-label={label} className="calc-range mt-3"
          style={sliderFill(value, slider.min, slider.max)} value={clamp(value, slider.min, slider.max)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      ) : null}
    </div>
  );
}

interface ChartProps {
  series: { year: number; spent: number; saved: number }[];
  animKey: number;
  labels: { saved: string; spent: string; year: (n: number) => string; desc: string };
  money: (n: number) => string;
  compact: (n: number) => string;
  yearsUnit: (n: number) => string;
}

function GrowthChart({ series, animKey, labels, money, compact, yearsUnit }: ChartProps) {
  const [W, setW] = useState(640);
  const H = W < 480 ? 250 : 300, L = 8, R = 8, T = 22, B = 30;
  const last = series[series.length - 1];
  const maxY = Math.max(last.saved, last.spent, 1);
  const maxX = Math.max(last.year, 1);
  const x = (yr: number) => L + (yr / maxX) * (W - L - R);
  const y = (v: number) => T + (1 - v / maxY) * (H - T - B);
  const line = (key: 'spent' | 'saved') => series.map((p, i) => `${i ? 'L' : 'M'}${x(p.year).toFixed(1)},${y(p[key]).toFixed(1)}`).join('');
  const gap = `${line('saved')}${[...series].reverse().map((p) => `L${x(p.year).toFixed(1)},${y(p.spent).toFixed(1)}`).join('')}Z`;
  const ticks = [0.5, 1].map((f) => maxY * f);
  const [hover, setHover] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  // Draw at the real pixel width so axis text stays 13px on phones.
  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => { const w = Math.round(el.clientWidth); if (w > 0) setW(w); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const move = (clientX: number) => {
    const box = wrap.current?.getBoundingClientRect();
    if (!box) return;
    const rel = ((clientX - box.left) / box.width) * W;
    setHover(clamp(Math.round(((rel - L) / (W - L - R)) * maxX), 0, maxX));
  };
  const hp = hover === null ? null : series[Math.min(hover, series.length - 1)];
  const xTicks = maxX <= (W < 480 ? 5 : 10) ? series.map((p) => p.year) : series.map((p) => p.year).filter((yr) => yr % (maxX <= 10 ? 2 : maxX <= 20 ? 5 : 10) === 0 || yr === maxX && maxX % 5 !== 0 && false);

  return (
    <div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink/70">
        <li className="flex items-center gap-2"><span className="h-[3px] w-5 rounded-full bg-brand" aria-hidden="true" />{labels.saved}</li>
        <li className="flex items-center gap-2">
          <svg width="20" height="4" aria-hidden="true"><line x1="0" y1="2" x2="20" y2="2" stroke={SPENT_COLOR} strokeWidth="2.5" strokeDasharray="5 3" /></svg>
          {labels.spent}
        </li>
      </ul>
      <div
        ref={wrap} className="relative mt-3 touch-pan-y"
        onPointerMove={(e) => move(e.clientX)} onPointerDown={(e) => move(e.clientX)} onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={labels.desc} className="block h-auto w-full">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#02001f" strokeOpacity="0.08" />
              <text x={L + 2} y={y(t) - 6} fontSize="13" fill="#02001f" fillOpacity="0.6" className="nums">{money(t)}</text>
            </g>
          ))}
          <line x1={L} x2={W - R} y1={y(0)} y2={y(0)} stroke="#02001f" strokeOpacity="0.2" />
          {xTicks.map((yr) => (
            <text key={yr} x={x(yr)} y={H - 8} fontSize="13" textAnchor={yr === 0 ? 'start' : yr === maxX ? 'end' : 'middle'} fill="#02001f" fillOpacity="0.6" className="nums">{yr}</text>
          ))}
          <g key={animKey}>
            <path d={gap} fill="#2200b3" fillOpacity="0.1" className="chart-fade" />
            <path d={line('spent')} fill="none" stroke={SPENT_COLOR} strokeWidth="2.5" strokeDasharray="7 5" strokeLinecap="round" className="chart-fade" />
            <path d={line('saved')} fill="none" stroke="#2200b3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="chart-draw" />
            <circle cx={x(last.year)} cy={y(last.spent)} r="5" fill={SPENT_COLOR} stroke="#fff" strokeWidth="2" className="chart-fade" />
            <circle cx={x(last.year)} cy={y(last.saved)} r="5" fill="#2200b3" stroke="#fff" strokeWidth="2" className="chart-fade" />
          </g>
          {hp ? (
            <g aria-hidden="true">
              <line x1={x(hp.year)} x2={x(hp.year)} y1={T} y2={y(0)} stroke="#02001f" strokeOpacity="0.25" />
              <circle cx={x(hp.year)} cy={y(hp.spent)} r="5" fill={SPENT_COLOR} stroke="#fff" strokeWidth="2" />
              <circle cx={x(hp.year)} cy={y(hp.saved)} r="5" fill="#2200b3" stroke="#fff" strokeWidth="2" />
            </g>
          ) : null}
        </svg>
        {hp ? (
          <div
            className="pointer-events-none absolute top-1 z-10 w-max max-w-[70%] rounded-xl border border-black/5 bg-white px-3 py-2 text-xs shadow-md"
            style={x(hp.year) / W > 0.55 ? { right: `${(1 - x(hp.year) / W) * 100 + 2}%` } : { left: `${(x(hp.year) / W) * 100 + 2}%` }}
          >
            <p className="font-semibold text-ink">{labels.year(hp.year)}</p>
            <p className="nums mt-1 flex items-center gap-1.5 text-ink/75"><span className="size-2 rounded-full bg-brand" />{labels.saved}: <span className="font-semibold text-ink">{money(hp.saved)}</span></p>
            <p className="nums flex items-center gap-1.5 text-ink/75"><span className="size-2 rounded-full" style={{ background: SPENT_COLOR }} />{labels.spent}: <span className="font-semibold text-ink">{money(hp.spent)}</span></p>
          </div>
        ) : null}
      </div>
      <p className="mt-1 text-right text-xs text-ink/60">{yearsUnit(2)}</p>
    </div>
  );
}

function Fact({ children, math, mathLabel }: { children: ReactNode; math: string; mathLabel: string }) {
  return (
    <li className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-pretty text-lg font-semibold leading-snug text-ink">{children}</p>
      <details className="group mt-3">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-semibold text-brand [&::-webkit-details-marker]:hidden">
          {mathLabel}
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 transition group-open:rotate-180" aria-hidden="true"><path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z" /></svg>
        </summary>
        <p className="nums mt-2 rounded-xl bg-pale-blue px-3 py-2 text-sm leading-relaxed text-ink/80">{math}</p>
      </details>
    </li>
  );
}

export default function LotteryCalculator({ locale }: { locale: Locale }) {
  const cfg = CONFIG[locale];
  const t = COPY[locale].ui;
  const f = useMemo(() => makeFormat(cfg.intl, cfg.currency), [cfg]);
  const isFr = locale === 'fr-ca';
  const games = useMemo(() => gamesData.games.filter((g) => cfg.games.includes(g.id)), [cfg]);
  const [s, setS] = useState<CalcState>(() => defaultState(cfg.defaultGame));
  const [preset, setPreset] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const ready = useRef(false);
  const source = useRef('input');
  const selectId = useId();

  const patch = (p: Partial<CalcState>, from = 'input') => { source.current = from; if (from === 'input') setPreset(null); setS((prev) => ({ ...prev, ...p })); };

  // Read a deep link (?spend=10&years=10&game=lottomax) once, after hydration.
  useEffect(() => {
    const { state, touched } = parseState(window.location.search, defaultState(cfg.defaultGame), cfg.games);
    if (touched) { source.current = 'url'; setS(state); setAnimKey((k) => k + 1); }
    ready.current = true;
    if (new URLSearchParams(window.location.search).get('view') === 'odds') {
      requestAnimationFrame(() => document.getElementById('odds')?.scrollIntoView());
    }
  }, []);

  // Keep the URL in step with the result, and report it (debounced).
  useEffect(() => {
    if (!ready.current) return;
    const id = window.setTimeout(() => {
      const q = toQuery(s, window.location.search);
      window.history.replaceState(null, '', `${window.location.pathname}?${q}${window.location.hash}`);
      trackLotteryCalculate({ locale, mode: s.mode, game: s.game, weeklySpend: weekly, years: s.years, ratePct: s.rate, source: source.current });
    }, 400);
    return () => window.clearTimeout(id);
  }, [s]);

  const official = games.find((g) => g.id === s.game);
  const game = official
    ? { name: isFr ? official.name_fr : official.name, price: official.price_per_play, odds: official.jackpot_odds, draws: official.draws_per_week }
    : { name: t.custom, price: s.price, odds: s.odds, draws: s.draws };
  const weekly = s.mode === 'game' ? weeklySpendFromGame(game.price, s.tickets, game.draws) : s.spend;
  const playsPerWeek = s.mode === 'game' ? s.tickets * game.draws : game.price > 0 ? weekly / game.price : 0;
  const p = project(weekly, s.years, s.rate);
  const series = useMemo(() => yearlySeries(weekly, s.years, s.rate), [weekly, s.years, s.rate]);
  const marks = milestones(weekly, s.years, s.rate);
  const along = [1, 5, 10].filter((yr) => yr < s.years).map((yr) => ({ yr, ...project(weekly, yr, s.rate) }));
  const savedPct = p.saved > 0 ? (p.spent / p.saved) * 100 : 100;

  const applyPreset = (pr: Preset) => {
    setPreset(pr.id);
    setAnimKey((k) => k + 1);
    patch({ mode: pr.mode, spend: pr.spend ?? s.spend, game: pr.game ?? s.game, tickets: pr.tickets ?? 1, years: pr.years, rate: 3 }, `preset:${pr.id}`);
  };

  const shareUrl = () => `${abs(cfg.path)}?${toQuery(s)}`;
  const card = () => ({
    eyebrow: COPY[locale].hero.eyebrow,
    line: t.card.line(f.price(weekly), s.years),
    spent: f.money(p.spent), spentLabel: t.card.spent,
    saved: f.money(p.saved), savedLabel: t.card.saved(f.rate(s.rate)),
    fine: t.card.fine, url: `lodavo.com${cfg.path}`,
  });
  const download = async (kind: CardKind) => {
    setBusy(kind);
    try {
      downloadBlob(await cardBlob(kind, card()), `lodavo-lottery-${kind === 'story' ? 'story-1080x1920' : 'card-1200x630'}.png`);
      trackLotteryShare({ locale, format: kind === 'story' ? 'story_1080x1920' : 'og_1200x630', weeklySpend: weekly, years: s.years });
    } finally { setBusy(null); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(shareUrl()); } catch { window.prompt(t.copyLink, shareUrl()); }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
    trackLotteryShare({ locale, format: 'copy_link', weeklySpend: weekly, years: s.years });
  };

  // Odds translator values
  const odds = Math.max(1, game.odds);
  const oddsStr = f.int(odds);
  const flips = coinFlipsInARow(odds);
  const secDays = daysOfSeconds(odds);
  const secYears = yearsOfSeconds(odds);
  const useYears = secDays >= 730;
  const waitYears = expectedYearsPerHit(odds, playsPerWeek);
  const totalPlays = Math.round(playsPerWeek * 52 * s.years);
  const chance = chanceOfAtLeastOne(odds, totalPlays);
  const playsStr = (n: number) => `${f.dec(n, Number.isInteger(n) ? 0 : 1)} ${t.playsUnit(n)}`;

  const gameSelect = (
    <div className="mt-6">
      <label htmlFor={selectId} className="block text-sm font-semibold text-ink">{t.game}</label>
      <div className={`${BOX} pr-2`}>
        <select id={selectId} className="w-full min-w-0 cursor-pointer bg-transparent text-lg font-semibold text-ink outline-none" value={s.game} onChange={(e) => patch({ game: e.target.value })}>
          {games.map((g) => <option key={g.id} value={g.id}>{isFr ? g.name_fr : g.name}</option>)}
          <option value="custom">{t.custom}</option>
        </select>
      </div>
    </div>
  );
  const customFields = s.game === 'custom' ? (
    <>
      <NumField label={t.customPrice} value={s.price} onChange={(n) => patch({ price: n })} min={0} max={LIMITS.price} decimal frDecimal={isFr} prefix={isFr ? undefined : '$'} suffix={isFr ? '$' : undefined} />
      <NumField label={t.customOdds} value={s.odds} onChange={(n) => patch({ odds: Math.max(1, Math.round(n)) })} min={1} max={LIMITS.odds} prefix={t.customOddsPrefix} />
      <NumField label={t.customDraws} value={s.draws} onChange={(n) => patch({ draws: Math.max(1, Math.round(n)) })} min={1} max={LIMITS.draws} />
    </>
  ) : null;

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inputs */}
        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <p className="text-sm font-semibold text-ink">{t.scenario}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {cfg.presets.map((pr) => (
                <button key={pr.id} type="button" aria-pressed={preset === pr.id} className={`${CHIP} ${preset === pr.id ? CHIP_ON : CHIP_OFF}`} onClick={() => applyPreset(pr)}>{pr.label}</button>
              ))}
            </div>
          </div>

          <fieldset className="mt-6 border-t border-black/5 pt-6">
            <legend className="sr-only">{t.modeLegend}</legend>
            <div className="grid grid-cols-2 gap-1 rounded-full bg-pale-blue p-1">
              {(['spend', 'game'] as const).map((m) => (
                <button key={m} type="button" aria-pressed={s.mode === m} onClick={() => patch({ mode: m })}
                  className={`rounded-full px-3 py-2 text-sm font-semibold transition ${s.mode === m ? 'bg-white text-brand shadow-sm' : 'text-ink/70 hover:text-brand'}`}>
                  {m === 'spend' ? t.modeSpend : t.modeGame}
                </button>
              ))}
            </div>
          </fieldset>

          {s.mode === 'spend' ? (
            <NumField label={t.weekly} value={s.spend} onChange={(n) => patch({ spend: n })} min={0} max={LIMITS.spend} decimal frDecimal={isFr}
              prefix={isFr ? undefined : '$'} suffix={isFr ? '$' : undefined} slider={{ min: 0, max: 100, step: 1 }} />
          ) : (
            <>
              {gameSelect}
              {customFields}
              <NumField label={t.plays} value={s.tickets} onChange={(n) => patch({ tickets: Math.max(1, Math.round(n)) })} min={1} max={LIMITS.tickets}
                suffix={t.playsUnit(s.tickets)} slider={{ min: 1, max: 10, step: 1 }}
                aside={<span className="nums text-sm text-ink/60">{t.gameSummary(f.price(weekly), game.draws)}</span>} />
            </>
          )}

          <NumField label={t.years} value={s.years} onChange={(n) => patch({ years: Math.max(1, Math.round(n)) })} min={1} max={MAX_YEARS}
            suffix={t.yearsUnit(s.years)} slider={{ min: 1, max: MAX_YEARS, step: 1 }} />

          <div className="mt-7 border-t border-black/5 pt-1">
            <NumField label={t.rate} value={s.rate} onChange={(n) => patch({ rate: n })} min={0} max={LIMITS.rate} decimal frDecimal={isFr} suffix="%"
              aside={<span className="rounded-full bg-pale-blue px-2.5 py-1 text-xs font-semibold text-brand">{t.rateTag}</span>} />
            <p className="mt-2 text-xs leading-relaxed text-ink/60">{t.rateNote}</p>
          </div>
        </div>

        {/* Result */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="calc-card rounded-3xl border border-brand/10 p-5 shadow-sm sm:p-7" aria-live="polite">
            <p className="caps text-xs text-brand">{t.resultEyebrow}</p>
            <div className="ph-no-capture mt-3">
              <p className="nums text-balance text-4xl font-black leading-none tracking-tight text-brand sm:text-5xl" data-testid="saved">{f.money(p.saved)}</p>
              <p className="mt-1.5 text-sm font-semibold text-ink/60">{t.inYears(s.years)}</p>
              <p className="mt-3 text-pretty text-lg leading-snug text-ink">{weekly > 0 ? t.summary(f.money(p.spent), f.money(p.growth)) : t.summaryZero}</p>

              <div className="mt-6 border-t border-brand/10 pt-5">
                <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-white/70" aria-hidden="true">
                  <span className="brand-gradient-r rounded-full" style={{ width: `${savedPct}%` }} />
                  <span className="rounded-full bg-accent-dark" style={{ width: `${100 - savedPct}%` }} />
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex min-w-0 items-center gap-2 text-ink/70"><span className="size-2.5 shrink-0 rounded-full bg-brand" />{t.spent}</dt>
                    <dd className="nums shrink-0 whitespace-nowrap font-semibold text-ink" data-testid="spent">{f.money(p.spent)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex min-w-0 items-center gap-2 text-ink/70"><span className="size-2.5 shrink-0 rounded-full bg-accent-dark" />{t.growth}</dt>
                    <dd className="nums shrink-0 whitespace-nowrap font-semibold text-ink">{f.money(p.growth)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-brand/10 pt-2">
                    <dt className="min-w-0 font-semibold text-ink">{t.saved}</dt>
                    <dd className="nums shrink-0 whitespace-nowrap font-bold text-ink">{f.money(p.saved)}</dd>
                  </div>
                </dl>

                {along.length ? (
                  <div className="mt-5 border-t border-brand/10 pt-4">
                    <p className="caps text-[0.7rem] text-ink/60">{t.along}</p>
                    <dl className="mt-2 space-y-1.5 text-sm">
                      {along.map((a) => (
                        <div key={a.yr} className="flex items-center justify-between gap-3">
                          <dt className="text-ink/70">{t.inYears(a.yr)}</dt>
                          <dd className="nums shrink-0 whitespace-nowrap text-ink/80"><span className="font-semibold">{f.money(a.spent)}</span> {t.alongSpent}, <span className="font-semibold">{f.money(a.saved)}</span> {t.alongSaved}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}
              </div>

              <div className="mt-6">
                <button type="button" aria-expanded={shareOpen} onClick={() => setShareOpen((o) => !o)} disabled={weekly <= 0}
                  className="brand-gradient-r w-full rounded-full px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-95 disabled:opacity-50">
                  {t.share}
                </button>
                {shareOpen && weekly > 0 ? (
                  <div className="mt-3 rounded-2xl bg-white/80 p-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={`${CHIP} ${CHIP_OFF}`} disabled={busy !== null} onClick={() => download('story')}>{t.shareStory}<span className="nums text-brand/70"> 1080×1920</span></button>
                      <button type="button" className={`${CHIP} ${CHIP_OFF}`} disabled={busy !== null} onClick={() => download('og')}>{t.shareOg}<span className="nums text-brand/70"> 1200×630</span></button>
                      <button type="button" className={`${CHIP} ${CHIP_OFF}`} onClick={copy}>{copied ? t.copied : t.copyLink}</button>
                    </div>
                    <p className="mt-2 text-xs text-ink/60" role="status">{t.shareHint}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <details className="group mt-4 rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {t.how}
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0 text-ink/40 transition group-open:rotate-180" aria-hidden="true"><path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z" /></svg>
            </summary>
            <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink/70">{t.howBody.map((b) => <p key={b}>{b}</p>)}</div>
          </details>
        </div>
      </div>

      {/* Chart + milestones */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-7 lg:col-span-2" aria-labelledby={`${selectId}-chart`}>
          <h2 id={`${selectId}-chart`} className="text-lg font-bold text-ink">{t.chartTitle}</h2>
          <div className="mt-4">
            <GrowthChart series={series} animKey={animKey} money={f.money} compact={f.compact} yearsUnit={() => t.years}
              labels={{ saved: t.legendSaved, spent: t.legendSpent, year: t.year, desc: t.chartDesc(f.money(p.spent), f.money(p.saved), s.years) }} />
          </div>
          <details className="group mt-3">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-semibold text-brand [&::-webkit-details-marker]:hidden">{t.table}</summary>
            <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-black/5">
              <table className="nums w-full text-left text-sm">
                <thead className="sticky top-0 bg-pale-blue text-ink/80"><tr><th scope="col" className="px-3 py-2 font-semibold">{t.thYear}</th><th scope="col" className="px-3 py-2 text-right font-semibold">{t.legendSpent}</th><th scope="col" className="px-3 py-2 text-right font-semibold">{t.legendSaved}</th></tr></thead>
                <tbody>{series.slice(1).map((r) => <tr key={r.year} className="border-t border-black/5"><th scope="row" className="px-3 py-1.5 font-medium text-ink/70">{r.year}</th><td className="px-3 py-1.5 text-right">{f.money(r.spent)}</td><td className="px-3 py-1.5 text-right font-semibold">{f.money(r.saved)}</td></tr>)}</tbody>
              </table>
            </div>
          </details>
        </section>

        <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-7" aria-labelledby={`${selectId}-ms`}>
          <h2 id={`${selectId}-ms`} className="text-lg font-bold text-ink">{t.milestonesTitle}</h2>
          <ol className="mt-4 space-y-3">
            {marks.map((m) => (
              <li key={m.target} className="flex items-center justify-between gap-3">
                <span className={`nums rounded-full px-3 py-1 text-sm font-bold ${m.withinHorizon ? 'bg-brand text-white' : 'bg-pale-blue text-brand'}`}>{f.money(m.target)}</span>
                <span className={`text-right text-sm ${m.withinHorizon ? 'font-semibold text-ink' : 'text-ink/60'}`}>
                  {m.year === null || m.year > 200 ? t.milestoneNever : m.withinHorizon ? t.milestoneAt(m.year) : t.milestoneBeyond(m.year)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Odds translator */}
      <section id="odds" className="mt-6 scroll-mt-28 rounded-3xl border border-brand/10 bg-pale-blue/70 p-5 sm:p-7" aria-labelledby={`${selectId}-odds`}>
        <p className="caps text-xs text-brand">{t.oddsEyebrow}</p>
        <h2 id={`${selectId}-odds`} className="nums mt-2 text-balance text-2xl font-black tracking-tight text-ink sm:text-3xl">{t.oddsTitle(oddsStr)}</h2>
        <p className="mt-2 max-w-2xl text-ink/75">{t.oddsIntro(game.name, f.price(game.price))}</p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t.game}>
          {games.map((g) => (
            <button key={g.id} type="button" aria-pressed={s.game === g.id} className={`${CHIP} ${s.game === g.id ? CHIP_ON : 'border-brand/15 bg-white text-brand hover:bg-brand/10'}`} onClick={() => patch({ game: g.id })}>{isFr ? g.name_fr : g.name}</button>
          ))}
          <button type="button" aria-pressed={s.game === 'custom'} className={`${CHIP} ${s.game === 'custom' ? CHIP_ON : 'border-brand/15 bg-white text-brand hover:bg-brand/10'}`} onClick={() => patch({ game: 'custom' })}>{t.custom}</button>
        </div>
        {s.mode === 'spend' && s.game === 'custom' ? <div className="mt-2 grid gap-x-4 sm:grid-cols-3">{customFields}</div> : null}

        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          <Fact mathLabel={t.math} math={t.flipsMath(oddsStr, f.dec(flips, 2))}>{t.flips(f.int(flips))}</Fact>
          <Fact mathLabel={t.math} math={t.secondMath(oddsStr, useYears ? t.yearsSpan(f.dec(secYears, 2)) : t.days(f.dec(secDays, 1)), useYears ? f.int(31_536_000) : f.int(86_400))}>
            {t.second(useYears ? t.yearsSpan(f.dec(secYears, 1)) : t.days(f.int(secDays)))}
          </Fact>
          <Fact mathLabel={t.math} math={waitYears === null ? '—' : t.waitMath(oddsStr, f.dec(playsPerWeek, Number.isInteger(playsPerWeek) ? 0 : 2), f.int(waitYears))}>
            {waitYears === null ? t.waitNone : t.wait(s.mode === 'game' ? playsStr(playsPerWeek) : f.price(weekly), f.int(waitYears))}
          </Fact>
          <Fact mathLabel={t.math} math={t.costMath(oddsStr, f.price(game.price), f.money(expectedSpendPerHit(odds, game.price)))}>{t.cost(f.money(expectedSpendPerHit(odds, game.price)))}</Fact>
          <li className="md:col-span-2">
            <ul><Fact mathLabel={t.math} math={t.horizonMath(oddsStr, f.int(totalPlays), f.pct(chance))}>{t.horizon(s.years, f.int(totalPlays), f.pct(chance), f.pct(chance, true))}</Fact></ul>
          </li>
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-ink/60">{t.oddsNote}</p>
      </section>
    </div>
  );
}
