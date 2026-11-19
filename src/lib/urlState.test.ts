import { describe, expect, it } from 'vitest';
import { defaultState, parseState, toQuery } from './urlState';

const base = defaultState('lottomax');
const games = ['lottomax', 'lotto649', 'dailygrand'];

describe('urlState', () => {
  it('parses the reel deep link from the brief', () => {
    const { state, touched } = parseState('?spend=10&years=10&game=lottomax', base, games);
    expect(touched).toBe(true);
    expect(state).toMatchObject({ mode: 'spend', spend: 10, years: 10, game: 'lottomax' });
  });
  it('switches to game mode when only a game is given', () => {
    expect(parseState('?game=lotto649&tickets=2&years=40', base, games).state).toMatchObject({ mode: 'game', game: 'lotto649', tickets: 2, years: 40 });
  });
  it('clamps out-of-range and ignores junk', () => {
    const { state } = parseState('?spend=-5&years=400&rate=abc&game=nope', base, games);
    expect(state.spend).toBe(0);
    expect(state.years).toBe(40);
    expect(state.rate).toBe(3);
    expect(state.game).toBe('lottomax');
  });
  it('reports untouched for an empty query', () => {
    expect(parseState('', base, games).touched).toBe(false);
    expect(parseState('?utm_source=tiktok', base, games).touched).toBe(false);
  });
  it('round-trips and keeps UTM params', () => {
    const { state } = parseState('?game=custom&price=2.5&odds=5000000&draws=3&tickets=4&years=7&rate=4.5', base, games);
    const q = toQuery(state, '?utm_source=tiktok&utm_campaign=reel7&spend=99');
    expect(q).toContain('utm_source=tiktok');
    expect(q).toContain('utm_campaign=reel7');
    expect(q).not.toContain('spend=99');
    expect(parseState('?' + q, base, games).state).toEqual(state);
  });
  it('omits the default rate', () => {
    expect(toQuery({ ...base })).toBe('spend=10&game=lottomax&years=10');
  });
});
