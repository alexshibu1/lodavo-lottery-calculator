/**
 * Analytics hooks. These are intentionally no-ops.
 * Lodavo: wire each one to your own analytics inside the function body
 * (the live site marks result nodes with `ph-no-capture`, so PostHog is the likely target).
 * Nothing here sends data anywhere.
 */

export interface CalculateEvent {
  locale: string;
  mode: 'spend' | 'game';
  game: string;
  weeklySpend: number;
  years: number;
  ratePct: number;
  /** 'preset:<id>', 'url' (deep link from a reel) or 'input'. */
  source: string;
}

export interface ShareEvent {
  locale: string;
  format: 'story_1080x1920' | 'og_1200x630' | 'copy_link';
  weeklySpend: number;
  years: number;
}

export interface CtaClickEvent {
  locale: string;
  kind: 'download' | 'waitlist' | 'provably_fair' | 'secondary';
  placement: string;
  href: string;
}

/** Fired (debounced) whenever a new result is shown. */
export function trackLotteryCalculate(_event: CalculateEvent): void {}

/** Fired when a visitor downloads a share card or copies the result link. */
export function trackLotteryShare(_event: ShareEvent): void {}

/** Fired when a visitor clicks a Lodavo call to action on the tool page. */
export function trackLotteryCtaClick(_event: CtaClickEvent): void {}
