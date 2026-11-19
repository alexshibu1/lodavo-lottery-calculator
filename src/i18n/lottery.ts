/**
 * All copy and per-locale config for the lottery calculator.
 * French is written for Quebec, following the conventions on lodavo.com/fr-ca
 * (vous, « appli », no space before ? and !, space before $ and %).
 *
 * Lodavo claims in this file reuse wording already published on lodavo.com.
 * Do not add odds or prize comparisons between Lodavo and any lottery.
 */

export type Locale = 'en-ca' | 'fr-ca';
export const LOCALE_LIST: Locale[] = ['en-ca', 'fr-ca'];

export interface Preset {
  id: string;
  label: string;
  mode: 'spend' | 'game';
  spend?: number;
  game?: string;
  tickets?: number;
  years: number;
}

export interface LocaleConfig {
  locale: Locale;
  htmlLang: string;
  ogLocale: string;
  intl: string;
  currency: 'CAD' | 'USD';
  path: string;
  home: string;
  toolsHub: string | null;
  defaultGame: string;
  games: string[];
  presets: Preset[];
  cta: { kind: 'download' | 'waitlist'; href: string };
  provablyFair: string;
  contestRules: string | null;
  related: { label: string; href: string }[];
}

const SITE = 'https://www.lodavo.com';
export const abs = (path: string) => SITE + path;

export const CONFIG: Record<Locale, LocaleConfig> = {
  'en-ca': {
    locale: 'en-ca', htmlLang: 'en-CA', ogLocale: 'en_CA', intl: 'en-CA', currency: 'CAD',
    path: '/en-ca/tools/lottery-calculator', home: '/en-ca', toolsHub: '/en-ca/tools',
    defaultGame: 'lottomax', games: ['lottomax', 'lotto649', 'dailygrand'],
    presets: [
      { id: 'five', label: '$5 a week', mode: 'spend', spend: 5, years: 10 },
      { id: 'twenty', label: '$20 a week', mode: 'spend', spend: 20, years: 10 },
      { id: 'pool', label: 'The office pool', mode: 'spend', spend: 10, years: 20 },
      { id: 'everydraw', label: 'Every draw for 10 years', mode: 'game', game: 'lottomax', tickets: 1, years: 10 },
      { id: 'lifetime', label: '6/49 for 40 years', mode: 'game', game: 'lotto649', tickets: 1, years: 40 },
      { id: 'fifty', label: '$50 a week', mode: 'spend', spend: 50, years: 10 },
    ],
    cta: { kind: 'download', href: '/en-ca/download' },
    provablyFair: '/en-ca/provably-fair', contestRules: '/en-ca/contest-rules',
    related: [
      { label: 'All savings tools', href: '/en-ca/tools' },
      { label: 'Compound interest calculator', href: '/en-ca/tools/compound-interest-calculator' },
      { label: 'Savings goal calculator', href: '/en-ca/tools/savings-goal-calculator' },
      { label: '52-week savings challenge', href: '/en-ca/tools/52-week-savings-challenge' },
      { label: 'Prize-linked savings in Canada', href: '/en-ca/blog/prize-linked-savings-canada' },
      { label: 'What to do if you win the lottery in Canada', href: '/en-ca/blog/what-to-do-if-you-win-the-lottery-in-canada' },
    ],
  },
  'fr-ca': {
    locale: 'fr-ca', htmlLang: 'fr-CA', ogLocale: 'fr_CA', intl: 'fr-CA', currency: 'CAD',
    path: '/fr-ca/outils/calculateur-loterie', home: '/fr-ca', toolsHub: '/fr-ca/outils',
    defaultGame: 'lottomax', games: ['lottomax', 'lotto649', 'dailygrand'],
    presets: [
      { id: 'five', label: '5 $ par semaine', mode: 'spend', spend: 5, years: 10 },
      { id: 'twenty', label: '20 $ par semaine', mode: 'spend', spend: 20, years: 10 },
      { id: 'pool', label: 'Le groupe du bureau', mode: 'spend', spend: 10, years: 20 },
      { id: 'everydraw', label: 'Chaque tirage pendant 10 ans', mode: 'game', game: 'lottomax', tickets: 1, years: 10 },
      { id: 'lifetime', label: 'Le 6/49 pendant 40 ans', mode: 'game', game: 'lotto649', tickets: 1, years: 40 },
      { id: 'fifty', label: '50 $ par semaine', mode: 'spend', spend: 50, years: 10 },
    ],
    cta: { kind: 'download', href: '/fr-ca/telechargement' },
    provablyFair: '/fr-ca/verification-equitable', contestRules: '/fr-ca/regles-du-concours',
    related: [
      { label: 'Tous les outils d’épargne', href: '/fr-ca/outils' },
      { label: 'Calculateur d’intérêts composés', href: '/fr-ca/outils/calculateur-interets-composes' },
      { label: 'Calculateur d’épargne', href: '/fr-ca/outils/calculateur-objectif-epargne' },
      { label: 'Défi d’épargne de 52 semaines', href: '/fr-ca/outils/defi-epargne-52-semaines' },
      { label: 'L’épargne liée à des prix au Canada', href: '/fr-ca/blogue/epargne-liee-a-des-prix-canada' },
      { label: 'Glossaire de l’épargne', href: '/fr-ca/blogue/glossaire-epargne' },
    ],
  },
};

export interface Faq { q: string; a: string }

export interface Copy {
  meta: { title: string; description: string; ogAlt: string };
  breadcrumbTools: string;
  hero: { eyebrow: string; h1: string; intro: string };
  ui: {
    scenario: string; modeLegend: string; modeSpend: string; modeGame: string;
    weekly: string; perWeek: string; game: string; custom: string; plays: string; playsUnit: (n: number) => string;
    gameSummary: (weekly: string, draws: number) => string;
    customPrice: string; customOdds: string; customOddsPrefix: string; customDraws: string;
    years: string; yearsUnit: (n: number) => string; rate: string; rateTag: string; rateNote: string;
    resultEyebrow: string; inYears: (n: number) => string;
    summary: (spent: string, growth: string) => string; summaryZero: string;
    spent: string; growth: string; saved: string; along: string; alongSpent: string; alongSaved: string;
    share: string; shareStory: string; shareOg: string; copyLink: string; copied: string; shareHint: string;
    chartTitle: string; chartDesc: (spent: string, saved: string, years: number) => string;
    legendSaved: string; legendSpent: string; year: (n: number) => string; table: string; thYear: string;
    milestonesTitle: string; milestoneAt: (year: number) => string; milestoneNever: string; milestoneBeyond: (year: number) => string;
    oddsEyebrow: string; oddsTitle: (odds: string) => string; oddsIntro: (game: string, price: string) => string;
    math: string; oddsNote: string;
    flips: (n: string) => string; flipsMath: (odds: string, v: string) => string;
    second: (span: string) => string; secondMath: (odds: string, v: string, unitSeconds: string) => string;
    days: (n: string) => string; yearsSpan: (n: string) => string;
    wait: (plays: string, years: string) => string; waitNone: string; waitMath: (odds: string, plays: string, v: string) => string;
    cost: (amount: string) => string; costMath: (odds: string, price: string, v: string) => string;
    horizon: (years: number, plays: string, pct: string, none: string) => string; horizonMath: (odds: string, plays: string, pct: string) => string;
    how: string; howBody: string[];
    card: { line: (weekly: string, years: number) => string; spent: string; saved: (rate: string) => string; fine: string };
  };
  methodology: { title: string; body: string[] };
  faqTitle: string;
  faqs: Faq[];
  sources: { title: string; intro: string; thGame: string; thPrice: string; thOdds: string; thDraws: string; thSource: string; verified: string; perWeek: (n: number) => string; perPlay: string };
  related: string;
  bridge: { eyebrow: string; title: string; lines: string[]; fair: string; cta: string; ctaAlt?: { label: string; href: string }; disclaimerBefore: string; disclaimerLink?: string; disclaimerAfter?: string; why: string };
  support: { text: string };
}

const en = (us: boolean): Copy => {
  const g1 = us ? 'Powerball' : 'Lotto Max';
  const odds1 = us ? '292,201,338' : '33,446,140';
  const price1 = us ? '$2' : '$6';
  return {
    meta: us
      ? {
          title: 'Lottery Calculator: What You Spend vs. What You’d Save | Lodavo',
          description: 'Free lottery calculator. See how much you spend on the lottery over time, what the same money would grow to if you saved it, and what Powerball and Mega Millions odds really mean. Runs in your browser, no sign-up.',
          ogAlt: 'Lottery calculator: what if you’d saved it instead?',
        }
      : {
          title: 'Lottery Calculator (Canada): What You Spend vs. What You’d Save | Lodavo',
          description: 'Free Canadian lottery calculator. See how much you spend on the lottery over time, what the same money would grow to if you saved it, and what Lotto Max and Lotto 6/49 odds really mean. Runs in your browser, no sign-up.',
          ogAlt: 'Lottery calculator: what if you’d saved it instead?',
        },
    breadcrumbTools: 'Savings tools',
    hero: {
      eyebrow: 'Free savings tool',
      h1: 'Lottery calculator: what if you’d saved it instead?',
      intro: `See what your lottery tickets add up to, and what the same money would become if you saved it. $10 a week for 10 years is $5,200 in tickets. Saved at 3% instead, it grows to about $6,060. Then pick a game to see what the odds really mean. It’s free and runs entirely in your browser.`,
    },
    ui: {
      scenario: 'Try a scenario', modeLegend: 'How do you want to enter it?', modeSpend: 'Weekly amount', modeGame: 'Pick a game',
      weekly: 'Spent on tickets each week', perWeek: 'a week', game: 'Game', custom: 'Custom game',
      plays: 'Plays per draw', playsUnit: (n) => (n === 1 ? 'play' : 'plays'),
      gameSummary: (weekly, draws) => `${weekly} a week (${draws} draws a week)`,
      customPrice: 'Price per play', customOdds: 'Jackpot odds', customOddsPrefix: '1 in', customDraws: 'Draws per week',
      years: 'Number of years', yearsUnit: (n) => (n === 1 ? 'year' : 'years'),
      rate: 'Savings rate', rateTag: 'Example rate, not an offer',
      rateNote: 'This is the rate your own savings account might pay, not Lodavo. Lodavo pays no interest. It adds free weekly draw tickets for what you save.',
      resultEyebrow: 'If you’d saved it', inYears: (n) => `in ${n} ${n === 1 ? 'year' : 'years'}`,
      summary: (spent, growth) => `That’s the ${spent} you’d spend on tickets, still yours, plus about ${growth} of growth.`,
      summaryZero: 'Enter what you spend on tickets to see what it adds up to.',
      spent: 'Spent on tickets', growth: 'Growth if saved', saved: 'Saved instead', along: 'Along the way', alongSpent: 'tickets', alongSaved: 'saved',
      share: 'Share my number', shareStory: 'Download story image', shareOg: 'Download link image', copyLink: 'Copy link', copied: 'Link copied',
      shareHint: 'The link opens this exact result.',
      chartTitle: 'Tickets bought vs. money saved',
      chartDesc: (spent, saved, years) => `Line chart over ${years} years. Tickets bought reach ${spent}. The same money saved reaches ${saved}.`,
      legendSaved: 'Saved instead', legendSpent: 'Spent on tickets', year: (n) => `Year ${n}`, table: 'Show the year-by-year table', thYear: 'Year',
      milestonesTitle: 'When the savings would cross',
      milestoneAt: (y) => `Year ${y}`, milestoneNever: 'Not reached', milestoneBeyond: (y) => `Year ${y}, past your timeline`,
      oddsEyebrow: 'Odds translator', oddsTitle: (o) => `What 1 in ${o} actually means`,
      oddsIntro: (game, price) => `The jackpot odds for one ${price} play of ${game}, turned into things you can picture.`,
      math: 'Show the math',
      oddsNote: 'These are averages, not promises. Every draw is independent, and smaller prizes aren’t counted here.',
      flips: (n) => `Like calling a coin flip right ${n} times in a row.`,
      flipsMath: (odds, v) => `log₂(${odds}) = ${v} flips. Each flip halves your chances.`,
      second: (span) => `Like guessing the one second someone secretly picked out of ${span}.`,
      secondMath: (odds, v, unit) => `${odds} seconds ÷ ${unit} = ${v}.`,
      days: (n) => `${n} days`, yearsSpan: (n) => `${n} years`,
      wait: (plays, years) => `At ${plays} a week, one jackpot comes along about once every ${years} years on average.`,
      waitNone: 'Add a weekly amount or a number of plays to see how long it would take on average.',
      waitMath: (odds, plays, v) => `${odds} ÷ (${plays} plays a week × 52 weeks) = ${v} years.`,
      cost: (amount) => `On average, that’s ${amount} in tickets for every jackpot won.`,
      costMath: (odds, price, v) => `${odds} plays × ${price} a play = ${v}.`,
      horizon: (years, plays, pct, none) => `Over your ${years} ${years === 1 ? 'year' : 'years'} (${plays} plays), the chance of at least one jackpot is ${pct}. The chance of none is ${none}.`,
      horizonMath: (odds, plays, pct) => `1 − (1 − 1/${odds})^${plays} = ${pct}.`,
      how: 'How we calculate this',
      howBody: [
        'Tickets: your weekly amount × 52 weeks × the number of years. If you pick a game, the weekly amount is the price per play × plays per draw × draws per week.',
        'Saved instead: the same amount goes into savings at the end of each week, and the rate compounds weekly. The gap between the two is the growth.',
        'Numbers are rounded and meant as a guide, not financial advice or a guaranteed return. Savings rates change, and small lottery prizes you might win along the way aren’t subtracted.',
      ],
      card: {
        line: (weekly, years) => `${weekly} a week on lottery tickets for ${years} ${years === 1 ? 'year' : 'years'}`,
        spent: 'spent on tickets', saved: (rate) => `if you’d saved it at ${rate}*`,
        fine: '*Example rate, not an offer. Lodavo pays no interest.',
      },
    },
    methodology: {
      title: 'How the lottery calculator works',
      body: [
        `Total spent is simple multiplication: weekly amount × 52 × years. ${us ? 'One Powerball play at every draw is $2 × 3 draws = $6 a week, or $312 a year.' : 'One Lotto Max play at every draw is $6 × 2 draws = $12 a week, or $624 a year.'}`,
        'The savings side assumes you put the same amount aside at the end of every week and earn the rate you enter, compounded weekly. In plain terms: each week, last week’s balance earns a sliver of interest, then your new deposit lands on top. The 3% default is an example rate, not an offer, and you can change it to match your own account.',
        'Milestones are the first week the saved balance reaches $1,000, $5,000, $10,000 and $25,000, shown as the year that week falls in.',
        `The odds translator uses the operator’s published jackpot odds for one play (${g1}: 1 in ${odds1} per ${price1} play) and nothing else. Coin flips are log₂ of the odds. The “one second” comparison divides the odds by the seconds in a day or a 365-day year. The average wait divides the odds by your plays per year. The chance over your timeline is 1 − (1 − 1/odds) raised to your number of plays.`,
        'What it leaves out: smaller prizes, taxes, inflation, and changes to ticket prices or savings rates. The calculator shows what tickets cost and what steady saving adds up to. What you do with that is up to you.',
      ],
    },
    faqTitle: 'Frequently asked questions',
    faqs: us
      ? [
          { q: 'How much do I spend on the lottery in a year?', a: 'Multiply what you spend in a typical week by 52. $10 a week is $520 a year, $5,200 over 10 years and $20,800 over 40 years. One Powerball play at every draw is $6 a week, or $312 a year.' },
          { q: 'Is the lottery worth it?', a: 'As a way to make money, no. The odds of a Powerball jackpot are 1 in 292,201,338 per $2 play, and Mega Millions is 1 in 290,472,336 per $5 play. As entertainment, that’s your call. What helps is knowing the real yearly cost and deciding if the fun is worth that amount to you.' },
          { q: 'What are the odds of winning Powerball?', a: 'The odds of winning the Powerball Grand Prize are 1 in 292,201,338 for each $2 play, according to Powerball. Drawings are held every Monday, Wednesday and Saturday.' },
          { q: 'What are the odds of winning Mega Millions?', a: 'The odds of winning the Mega Millions jackpot are 1 in 290,472,336 for each $5 play, according to Mega Millions. Drawings are held on Tuesdays and Fridays.' },
          { q: 'What would my lottery money be worth if I saved it instead?', a: 'At an example rate of 3%, $10 a week grows to about $6,060 in 10 years ($5,200 of deposits plus about $860 of growth) and about $40,200 in 40 years. $20 a week grows to about $12,120 in 10 years. Your own result depends on the rate your account pays.' },
          { q: 'How long would I have to play to win the jackpot?', a: 'There’s no number of plays that guarantees a win, because every drawing is independent. On average, buying one Powerball play at every drawing (156 a year), a jackpot comes along about once every 1.87 million years.' },
          { q: 'Does the calculator count smaller prizes?', a: 'No. It shows what tickets cost, not your net result after small wins. Smaller prizes return part of ticket sales to players as a group, but any one person’s results vary a lot, so the calculator leaves them out and says so.' },
          { q: 'What is prize-linked savings?', a: 'Prize-linked savings gives you chances to win cash prizes for saving money, instead of for buying a ticket. With Lodavo you keep saving in your own bank account, and the more you save, the more free tickets you get for weekly cash prize draws. Lodavo never holds your money. It’s live in Canada and coming to the US. No purchase necessary. Void where prohibited.' },
        ]
      : [
          { q: 'How much do I spend on the lottery in a year?', a: 'Multiply what you spend in a typical week by 52. $10 a week is $520 a year, $5,200 over 10 years and $20,800 over 40 years. One Lotto Max play at every draw is $12 a week, or $624 a year.' },
          { q: 'Is the lottery worth it?', a: 'As a way to make money, no. The odds of a Lotto Max jackpot are 1 in 33,446,140 per $6 play, and OLG says 48% of Lotto 6/49 sales are paid out in prizes. As entertainment, that’s your call. What helps is knowing the real yearly cost and deciding if the fun is worth that amount to you.' },
          { q: 'What are the odds of winning Lotto Max?', a: 'The odds of winning the main Lotto Max jackpot are 1 in 33,446,140 for each $6 play, according to OLG. One play gives you four sets of seven numbers from 1 to 52. Draws are every Tuesday and Friday.' },
          { q: 'What are the odds of winning Lotto 6/49 and Daily Grand?', a: 'The odds of winning the Lotto 6/49 Classic Draw jackpot are 1 in 13,983,816 for each $3 play. The odds of winning the Daily Grand top prize are 1 in 13,348,188 for each $3 play. Both figures come from the lottery operators.' },
          { q: 'What would my lottery money be worth if I saved it instead?', a: 'At an example rate of 3%, $10 a week grows to about $6,060 in 10 years ($5,200 of deposits plus about $860 of growth) and about $40,200 in 40 years. $20 a week grows to about $12,120 in 10 years. Your own result depends on the rate your account pays.' },
          { q: 'How long would I have to play to win the jackpot?', a: 'There’s no number of plays that guarantees a win, because every draw is independent. On average, buying one Lotto Max play at every draw (104 a year), a jackpot comes along about once every 321,600 years.' },
          { q: 'Does the calculator count smaller prizes?', a: 'No. It shows what tickets cost, not your net result after small wins. Smaller prizes return part of ticket sales to players as a group, but any one person’s results vary a lot, so the calculator leaves them out and says so.' },
          { q: 'What is prize-linked savings?', a: 'Prize-linked savings gives you chances to win cash prizes for saving money, instead of for buying a ticket. With Lodavo you keep saving in your own Canadian bank account, and what you save earns free tickets in a weekly draw. Lodavo is free, never holds your money and pays no interest. No purchase necessary.' },
        ],
    sources: {
      title: 'Sources', intro: 'Every figure comes from the lottery operator’s own published game information.',
      thGame: 'Game', thPrice: 'Price', thOdds: 'Jackpot odds', thDraws: 'Draws', thSource: 'Official source',
      verified: 'Checked', perWeek: (n) => `${n} a week`, perPlay: 'per play',
    },
    related: 'Keep going',
    bridge: us
      ? {
          eyebrow: 'Prize-linked savings, coming to the US',
          title: 'Keep the thrill. Keep your money.',
          lines: [
            'Prize-linked savings gives you chances to win cash just for saving money.',
            'The more you save, the more free tickets you get for weekly cash prize draws.',
            'Your money never leaves your account, and it’s always free.',
          ],
          fair: 'See how the draws are provably fair',
          cta: 'Join the waitlist',
          ctaAlt: { label: 'In Canada? Get the app', href: '/en-ca/download' },
          disclaimerBefore: 'No purchase necessary. Void where prohibited. Lodavo is live in Canada. US prizes, amounts and odds will be announced at launch.',
          why: 'A lottery ticket is exciting. Saving usually isn’t. Lodavo was built so saving could come with that same excitement, without putting your money at risk.',
        }
      : {
          eyebrow: 'Canada’s first prize-linked savings app',
          title: 'Keep the thrill. Keep your money.',
          lines: [
            'Prize-linked savings means you keep saving in your own bank account, like you do now.',
            'The more you save, the more free tickets you get for a weekly cash prize draw.',
            'Your money never leaves your account, and it’s always free. There’s no losing, just saving.',
          ],
          fair: 'See how the draws are provably fair',
          cta: 'Download Lodavo',
          disclaimerBefore: 'No purchase necessary. STQ required. ',
          disclaimerLink: 'Rules & odds',
          disclaimerAfter: '.',
          why: 'A lottery ticket is exciting. Saving usually isn’t. Lodavo was built so saving could come with that same excitement, without putting your money at risk.',
        },
    support: {
      text: us
        ? 'If gambling is causing problems for you or someone close to you, free, confidential help is available 24/7.'
        : 'If gambling is causing problems for you or someone close to you, free, confidential help is available in every province.',
    },
  };
};

const fr: Copy = {
  meta: {
    title: 'Calculateur de loterie : ce que coûtent vos billets, et ce que ça donnerait en épargne | Lodavo',
    description: 'Calculateur de loterie gratuit. Voyez combien vous dépensez à la loterie avec le temps, ce que le même argent deviendrait en épargne, et ce que veulent vraiment dire les chances au Lotto Max et au Lotto 6/49. Tout se calcule dans votre navigateur.',
    ogAlt: 'Calculateur de loterie : et si vous l’aviez épargné?',
  },
  breadcrumbTools: 'Outils d’épargne',
  hero: {
    eyebrow: 'Outil d’épargne gratuit',
    h1: 'Calculateur de loterie : et si vous l’aviez épargné?',
    intro: 'Voyez ce que vos billets de loterie finissent par coûter, et ce que le même argent deviendrait si vous le mettiez de côté. 10 $ par semaine pendant 10 ans, c’est 5 200 $ en billets. Épargné à 3 %, ça donne environ 6 060 $. Choisissez ensuite un jeu pour voir ce que les chances veulent vraiment dire. C’est gratuit et tout se calcule dans votre navigateur.',
  },
  ui: {
    scenario: 'Essayez un scénario', modeLegend: 'Comment voulez-vous l’entrer?', modeSpend: 'Par semaine', modeGame: 'Par jeu',
    weekly: 'Dépensé en billets chaque semaine', perWeek: 'par semaine', game: 'Jeu', custom: 'Jeu personnalisé',
    plays: 'Mises par tirage', playsUnit: (n) => (n === 1 ? 'mise' : 'mises'),
    gameSummary: (weekly, draws) => `${weekly} par semaine (${draws} tirages par semaine)`,
    customPrice: 'Prix par mise', customOdds: 'Chances de gagner le gros lot', customOddsPrefix: '1 sur', customDraws: 'Tirages par semaine',
    years: 'Nombre d’années', yearsUnit: (n) => (n === 1 ? 'an' : 'ans'),
    rate: 'Taux d’épargne', rateTag: 'Exemple, pas une offre',
    rateNote: 'C’est le taux que pourrait payer votre propre compte d’épargne, pas Lodavo. Lodavo ne verse pas d’intérêts : l’appli ajoute des billets de tirage gratuits pour ce que vous épargnez.',
    resultEyebrow: 'Si vous l’aviez épargné', inYears: (n) => `dans ${n} ${n === 1 ? 'an' : 'ans'}`,
    summary: (spent, growth) => `Ce sont les ${spent} que vous auriez mis dans les billets, encore à vous, plus environ ${growth} de croissance.`,
    summaryZero: 'Entrez ce que vous dépensez en billets pour voir ce que ça représente.',
    spent: 'Dépensé en billets', growth: 'Croissance en épargne', saved: 'Épargné à la place', along: 'En chemin', alongSpent: 'en billets', alongSaved: 'épargnés',
    share: 'Partager mon chiffre', shareStory: 'Télécharger l’image pour story', shareOg: 'Télécharger l’image pour lien', copyLink: 'Copier le lien', copied: 'Lien copié',
    shareHint: 'Le lien ouvre exactement ce résultat.',
    chartTitle: 'Billets achetés et argent épargné',
    chartDesc: (spent, saved, years) => `Graphique linéaire sur ${years} ans. Les billets achetés atteignent ${spent}. Le même argent épargné atteint ${saved}.`,
    legendSaved: 'Épargné à la place', legendSpent: 'Dépensé en billets', year: (n) => `Année ${n}`, table: 'Afficher le tableau année par année', thYear: 'Année',
    milestonesTitle: 'Le moment où l’épargne franchirait',
    milestoneAt: (y) => `Année ${y}`, milestoneNever: 'Non atteint', milestoneBeyond: (y) => `Année ${y}, après votre horizon`,
    oddsEyebrow: 'Traducteur de chances', oddsTitle: (o) => `Ce que 1 chance sur ${o} veut vraiment dire`,
    oddsIntro: (game, price) => `Les chances de gagner le gros lot avec une mise de ${price} au ${game}, traduites en images concrètes.`,
    math: 'Voir le calcul',
    oddsNote: 'Ce sont des moyennes, pas des promesses. Chaque tirage est indépendant, et les lots secondaires ne sont pas comptés ici.',
    flips: (n) => `C’est comme deviner pile ou face ${n} fois de suite.`,
    flipsMath: (odds, v) => `log₂(${odds}) = ${v} lancers. Chaque lancer coupe vos chances en deux.`,
    second: (span) => `C’est comme deviner la seconde précise que quelqu’un a choisie en secret sur ${span}.`,
    secondMath: (odds, v, unit) => `${odds} secondes ÷ ${unit} = ${v}.`,
    days: (n) => `${n} jours`, yearsSpan: (n) => `${n} ans`,
    wait: (plays, years) => `À ${plays} par semaine, un gros lot arrive en moyenne une fois tous les ${years} ans.`,
    waitNone: 'Ajoutez un montant ou un nombre de mises pour voir le temps que ça prendrait en moyenne.',
    waitMath: (odds, plays, v) => `${odds} ÷ (${plays} mises par semaine × 52 semaines) = ${v} ans.`,
    cost: (amount) => `En moyenne, ça représente ${amount} en billets pour chaque gros lot gagné.`,
    costMath: (odds, price, v) => `${odds} mises × ${price} la mise = ${v}.`,
    horizon: (years, plays, pct, none) => `Sur vos ${years} ${years === 1 ? 'an' : 'ans'} (${plays} mises), la probabilité de gagner au moins un gros lot est de ${pct}. Celle de n’en gagner aucun est de ${none}.`,
    horizonMath: (odds, plays, pct) => `1 − (1 − 1/${odds})^${plays} = ${pct}.`,
    how: 'Comment on calcule',
    howBody: [
      'Billets : votre montant par semaine × 52 semaines × le nombre d’années. Si vous choisissez un jeu, le montant par semaine est le prix par mise × les mises par tirage × les tirages par semaine.',
      'Épargné à la place : le même montant est mis de côté à la fin de chaque semaine, et le taux compose chaque semaine. L’écart entre les deux, c’est la croissance.',
      'Les chiffres sont arrondis et servent de repère. Ce n’est pas un conseil financier ni un rendement garanti. Les taux d’épargne changent, et les petits lots que vous pourriez gagner en chemin ne sont pas soustraits.',
    ],
    card: {
      line: (weekly, years) => `${weekly} par semaine en billets de loterie pendant ${years} ${years === 1 ? 'an' : 'ans'}`,
      spent: 'dépensés en billets', saved: (rate) => `si vous l’aviez épargné à ${rate}*`,
      fine: '*Taux d’exemple, pas une offre. Lodavo ne verse pas d’intérêts.',
    },
  },
  methodology: {
    title: 'Comment fonctionne le calculateur de loterie',
    body: [
      'Le total dépensé est une simple multiplication : montant par semaine × 52 × années. Une mise au Lotto Max à chaque tirage, c’est 6 $ × 2 tirages = 12 $ par semaine, ou 624 $ par année.',
      'Du côté de l’épargne, on suppose que vous mettez le même montant de côté à la fin de chaque semaine, au taux que vous indiquez, composé chaque semaine. En clair : chaque semaine, le solde de la semaine d’avant rapporte un peu d’intérêts, puis votre nouveau dépôt s’ajoute. Le taux de 3 % par défaut est un exemple, pas une offre, et vous pouvez le changer pour celui de votre propre compte.',
      'Les jalons indiquent la première semaine où le solde épargné atteint 1 000 $, 5 000 $, 10 000 $ et 25 000 $, présentée selon l’année où tombe cette semaine.',
      'Le traducteur de chances utilise uniquement les chances de gagner le gros lot publiées par la société de loterie pour une mise (Lotto Max : 1 sur 33 446 140 par mise de 6 $). Les lancers de pile ou face correspondent au log₂ des chances. La comparaison de « la seconde » divise les chances par le nombre de secondes dans une journée ou dans une année de 365 jours. L’attente moyenne divise les chances par votre nombre de mises par année. La probabilité sur votre horizon est 1 − (1 − 1/chances) à la puissance de votre nombre de mises.',
      'Ce qui n’est pas compté : les lots secondaires, l’inflation et les changements de prix des billets ou de taux d’épargne. Le calculateur montre ce que coûtent les billets et ce que donne une épargne régulière. La suite vous appartient.',
    ],
  },
  faqTitle: 'Questions fréquentes',
  faqs: [
    { q: 'Combien est-ce que je dépense à la loterie par année?', a: 'Multipliez ce que vous dépensez dans une semaine normale par 52. 10 $ par semaine, c’est 520 $ par année, 5 200 $ sur 10 ans et 20 800 $ sur 40 ans. Une mise au Lotto Max à chaque tirage, c’est 12 $ par semaine, ou 624 $ par année.' },
    { q: 'Est-ce que la loterie en vaut la peine?', a: 'Comme façon de faire de l’argent, non. Les chances de gagner le gros lot du Lotto Max sont de 1 sur 33 446 140 par mise de 6 $. Comme divertissement, c’est à vous de voir. Ce qui aide, c’est de connaître le coût réel par année et de décider si le plaisir vaut ce montant pour vous.' },
    { q: 'Quelles sont les chances de gagner au Lotto Max?', a: 'Les chances de gagner le gros lot du Lotto Max sont de 1 sur 33 446 140 pour chaque mise de 6 $, selon les sociétés de loterie. Une mise donne quatre sélections de sept numéros de 1 à 52. Les tirages ont lieu tous les mardis et vendredis.' },
    { q: 'Quelles sont les chances de gagner au Lotto 6/49 et à la Grande Vie?', a: 'Les chances de gagner le gros lot du tirage classique du Lotto 6/49 sont de 1 sur 13 983 816 pour chaque mise de 3 $, selon Loto-Québec. Les chances de gagner le gros lot de la Grande Vie sont de 1 sur 13 348 188 pour chaque mise de 3 $.' },
    { q: 'Que vaudrait mon argent de loterie si je l’épargnais?', a: 'À un taux d’exemple de 3 %, 10 $ par semaine donne environ 6 060 $ en 10 ans (5 200 $ de dépôts plus environ 860 $ de croissance) et environ 40 200 $ en 40 ans. 20 $ par semaine donne environ 12 120 $ en 10 ans. Votre résultat dépend du taux que paie votre compte.' },
    { q: 'Combien de temps faudrait-il jouer pour gagner le gros lot?', a: 'Aucun nombre de mises ne garantit un gain, parce que chaque tirage est indépendant. En moyenne, avec une mise au Lotto Max à chaque tirage (104 par année), un gros lot arrive environ une fois tous les 321 600 ans.' },
    { q: 'Est-ce que le calculateur compte les lots secondaires?', a: 'Non. Il montre ce que coûtent les billets, pas votre résultat net après les petits gains. Les lots secondaires retournent une partie des ventes à l’ensemble des joueurs, mais le résultat d’une seule personne varie beaucoup, alors le calculateur les laisse de côté et le dit clairement.' },
    { q: 'Qu’est-ce que l’épargne liée à des prix?', a: 'L’épargne liée à des prix vous donne des chances de gagner des prix en argent parce que vous épargnez, pas parce que vous achetez un billet. Avec Lodavo, vous continuez d’épargner dans votre propre compte bancaire canadien, et ce que vous épargnez vous donne des billets gratuits pour un tirage hebdomadaire. Lodavo est gratuite, ne détient jamais votre argent et ne verse pas d’intérêts. Aucun achat requis.' },
  ],
  sources: {
    title: 'Sources', intro: 'Chaque chiffre vient de l’information de jeu publiée par la société de loterie elle-même.',
    thGame: 'Jeu', thPrice: 'Prix', thOdds: 'Chances (gros lot)', thDraws: 'Tirages', thSource: 'Source officielle',
    verified: 'Vérifié le', perWeek: (n) => `${n} par semaine`, perPlay: 'par mise',
  },
  related: 'Pour aller plus loin',
  bridge: {
    eyebrow: 'Première appli d’épargne liée à des prix au Canada',
    title: 'Gardez le frisson. Gardez votre argent.',
    lines: [
      'L’épargne liée à des prix, c’est continuer d’épargner dans votre propre compte bancaire, comme vous le faites déjà.',
      'Plus vous épargnez, plus vous obtenez de billets gratuits pour un tirage hebdomadaire de prix en argent.',
      'Votre argent ne quitte jamais votre compte, et c’est toujours gratuit. Il n’y a pas de pertes, juste de l’épargne.',
    ],
    fair: 'Voyez comment les tirages sont vérifiables',
    cta: 'Télécharger Lodavo',
    disclaimerBefore: 'Aucun achat requis. QH requise. ',
    disclaimerLink: 'Règles et chances',
    disclaimerAfter: '.',
    why: 'Un billet de loterie, c’est excitant. Épargner, d’habitude, moins. Lodavo a été créée pour que l’épargne vienne avec le même frisson, sans jamais mettre votre argent à risque.',
  },
  support: { text: 'Si le jeu vous cause des problèmes, à vous ou à un proche, de l’aide gratuite et confidentielle est offerte 24 heures sur 24, partout au Québec.' },
};

export const COPY: Record<Locale, Copy> = { 'en-ca': en(false), 'fr-ca': fr };
