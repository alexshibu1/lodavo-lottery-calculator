/**
 * Draws the share cards on a <canvas> in Lodavo branding. Browser-only.
 *   story: 1080 × 1920 (Instagram / TikTok story)
 *   og:    1200 × 630  (link preview)
 * The same function renders the default per-locale OG images at build time (scripts/make_og.py).
 */

export interface CardData {
  eyebrow: string;
  line: string;
  spent: string;
  spentLabel: string;
  saved: string;
  savedLabel: string;
  fine: string;
  url: string;
}

export const CARD_SIZES = { story: { w: 1080, h: 1920 }, og: { w: 1200, h: 630 } } as const;
export type CardKind = keyof typeof CARD_SIZES;

const BRAND = '#2200b3';
const SECONDARY = '#0078d7';
const ACCENT = '#ffd700';
const FONT = '"Lexend Deca Variable", "Lexend Deca", system-ui, sans-serif';

// Lodavo mark, from lodavo.com/favicon.svg (viewBox 222 × 222).
const MARK_WHITE = [
  'm123.82,80.81c-4.04,1.53-8.29,2.31-12.63,2.31s-8.59-.78-12.63-2.31l-2.85-1.08,15.48,114.38,15.48-114.38-2.85,1.08Z',
  'm145.31,128.42l2.36,1.99c4.11,3.47,9.33,5.38,14.68,5.38.34,0,4.27-.17,4.27-.17l-33.26,58.49,11.94-65.69Z',
  'm55.88,135.6l3.23.15c.35.02.69.02,1.04.02,5.35,0,10.57-1.91,14.68-5.38l2.36-1.99,11.8,65.74-33.12-58.54Z',
];
const MARK_GOLD: [number, number, number][] = [[111.19, 50.17, 21.87], [161.07, 115.39, 13], [61.13, 115.39, 13]];

function background(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const lin = ctx.createLinearGradient(0, 0, w * 0.6, h);
  lin.addColorStop(0, '#1f00a5');
  lin.addColorStop(0.44, BRAND);
  lin.addColorStop(1, '#103ec6');
  ctx.fillStyle = lin;
  ctx.fillRect(0, 0, w, h);
  const glow = (cx: number, cy: number, r: number, a: number) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(0,120,215,${a})`);
    g.addColorStop(1, 'rgba(0,120,215,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };
  glow(w * 0.88, h * 0.02, Math.max(w, h) * 0.6, 0.8);
  glow(w * 0.02, h * 1.04, Math.max(w, h) * 0.55, 0.42);
  // Sparkle dots at fixed positions (deterministic).
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  for (const [x, y, r] of [[0.12, 0.3, 5], [0.78, 0.22, 11], [0.64, 0.68, 4], [0.3, 0.85, 9], [0.92, 0.78, 5], [0.46, 0.12, 4]]) {
    ctx.beginPath();
    ctx.arc(w * x, h * y, r * (w / 1080), 0, Math.PI * 2);
    ctx.fill();
  }
}

function logo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size / 222;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(111, 111, 111, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = BRAND;
  for (const d of MARK_WHITE) ctx.fill(new Path2D(d));
  ctx.fillStyle = '#e6b800';
  for (const [cx, cy, r] of MARK_GOLD) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = '#fff';
  ctx.font = `600 ${size * 0.78}px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('Lodavo', x + size * 1.22, y + size * 0.54);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && cur) { lines.push(cur); cur = word; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Shrinks the font until `text` fits `maxWidth`; returns the size used. */
function fit(ctx: CanvasRenderingContext2D, text: string, weight: number, size: number, maxWidth: number): number {
  let s = size;
  do { ctx.font = `${weight} ${s}px ${FONT}`; s -= 4; } while (ctx.measureText(text).width > maxWidth && s > 24);
  return s + 4;
}

export function drawCard(canvas: HTMLCanvasElement, kind: CardKind, d: CardData): void {
  const { w, h } = CARD_SIZES[kind];
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  background(ctx, w, h);
  ctx.textBaseline = 'alphabetic';

  if (kind === 'story') {
    const m = 96;
    const inner = w - m * 2;
    logo(ctx, m, 150, 92);
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = `700 30px ${FONT}`;
    (ctx as any).letterSpacing = '3px';
    ctx.fillText(d.eyebrow.toUpperCase(), m, 470);
    (ctx as any).letterSpacing = '0px';
    ctx.fillStyle = '#fff';
    ctx.font = `600 62px ${FONT}`;
    let y = 570;
    for (const ln of wrap(ctx, d.line, inner)) { ctx.fillText(ln, m, y); y += 80; }

    y += 250;
    let s = fit(ctx, d.spent, 900, 210, inner);
    ctx.fillStyle = '#fff';
    ctx.fillText(d.spent, m - 6, y);
    ctx.font = `500 44px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(d.spentLabel, m, y + 76);

    y += 76 + 330;
    s = fit(ctx, d.saved, 900, 250, inner);
    ctx.fillStyle = ACCENT;
    ctx.fillText(d.saved, m - 6, y);
    ctx.font = `500 44px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    let ly = y + 80;
    for (const ln of wrap(ctx, d.savedLabel, inner)) { ctx.fillText(ln, m, ly); ly += 58; }
    void s;

    ctx.fillStyle = '#fff';
    ctx.font = `600 40px ${FONT}`;
    ctx.fillText(d.url, m, h - 200);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `400 28px ${FONT}`;
    let fy = h - 140;
    for (const ln of wrap(ctx, d.fine, inner)) { ctx.fillText(ln, m, fy); fy += 38; }
    return;
  }

  // og 1200 × 630
  const m = 64;
  logo(ctx, m, 52, 56);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff';
  ctx.font = `600 38px ${FONT}`;
  let y = 196;
  for (const ln of wrap(ctx, d.line, w - m * 2)) { ctx.fillText(ln, m, y); y += 50; }

  const colW = (w - m * 2 - 48) / 2;
  const baseY = 430;
  fit(ctx, d.spent, 900, 124, colW);
  ctx.fillStyle = '#fff';
  ctx.fillText(d.spent, m - 3, baseY);
  fit(ctx, d.saved, 900, 124, colW);
  ctx.fillStyle = ACCENT;
  ctx.fillText(d.saved, m + colW + 48 - 3, baseY);
  ctx.font = `500 28px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText(d.spentLabel, m, baseY + 60);
  let ly = baseY + 60;
  for (const ln of wrap(ctx, d.savedLabel, colW)) { ctx.fillText(ln, m + colW + 48, ly); ly += 36; }

  ctx.fillStyle = '#fff';
  ctx.font = `600 26px ${FONT}`;
  ctx.fillText(d.url, m, h - 52);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `400 20px ${FONT}`;
  const fineW = ctx.measureText(d.fine).width;
  ctx.fillText(d.fine, w - m - fineW, h - 52);
}

export async function cardBlob(kind: CardKind, data: CardData): Promise<Blob> {
  if (document.fonts?.load) {
    await Promise.all([document.fonts.load(`900 100px ${FONT}`), document.fonts.load(`600 40px ${FONT}`), document.fonts.load(`500 40px ${FONT}`)]).catch(() => undefined);
  }
  const canvas = document.createElement('canvas');
  drawCard(canvas, kind, data);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/png'));
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
