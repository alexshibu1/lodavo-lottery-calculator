# Lodavo Lottery Calculator

A lottery spending calculator and odds translator for [lodavo.com](https://www.lodavo.com). Available in English (Canada), French (Canada), and English (US).

**"What if you'd saved it instead?"** — Enter what you spend on lottery tickets and see what that money becomes if saved over time.

## Routes

| Locale | Path |
|---|---|
| English (Canada) | `/en-ca/tools/lottery-calculator` |
| French (Canada) | `/fr-ca/outils/calculateur-loterie` |
| English (US) | `/en-us/tools/lottery-calculator` |

## Development

```bash
npm install
npm run dev      # http://localhost:4321/en-ca/tools/lottery-calculator
npm test         # unit tests
npm run build    # static output in dist/
```

## Features

- Lottery spending vs. savings comparison with compound growth
- Preset Canadian and US lotteries (Lotto Max, Lotto 6/49, Daily Grand, Powerball, Mega Millions)
- Custom game entry
- Odds translated into plain language (coin flips, time comparisons)
- Savings milestones ($1K, $5K, $10K, $25K)
- Shareable PNG result cards (1080x1920 and 1200x630)
- Deep-linkable state via query parameters
- Full SEO: WebApplication + FAQPage JSON-LD, hreflang, canonical URLs
- Responsible gambling helpline links for all regions

## Deep links

```
?spend=10&years=10&game=lottomax
?game=lottomax&tickets=2&years=20
?game=custom&price=2&odds=1000000&draws=2&tickets=1&years=5
```

Optional: `&rate=4.5`, `&view=odds`. UTM parameters are preserved and passed through to CTAs.
