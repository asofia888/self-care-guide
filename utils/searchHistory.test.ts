import { describe, it, expect } from 'vitest';
import {
  addHistoryEntry,
  findHistoryEntry,
  loadHistory,
  saveHistory,
  HISTORY_STORAGE_KEY,
  MAX_HISTORY_ENTRIES,
  type HistoryEntry,
} from './searchHistory';

const result = {
  integrativeViewpoint: 'Viewpoint',
  westernHerbEntries: [],
  supplementEntries: [],
};

const entry = (query: string, language: 'ja' | 'en' = 'ja', savedAt = 1): HistoryEntry => ({
  query,
  language,
  result,
  savedAt,
});

describe('searchHistory', () => {
  it('finds an entry regardless of case, width, and surrounding spaces', () => {
    const history = [entry('Ginger', 'en'), entry('ｶｯｺﾝﾄｳ')];

    expect(findHistoryEntry(history, '  ginger ', 'en')?.query).toBe('Ginger');
    expect(findHistoryEntry(history, 'カッコントウ', 'ja')?.query).toBe('ｶｯｺﾝﾄｳ');
  });

  it('does not match the same query in another language', () => {
    expect(findHistoryEntry([entry('ginger', 'en')], 'ginger', 'ja')).toBeUndefined();
  });

  it('moves a repeated search to the front without duplicating it', () => {
    const history = [entry('葛根湯'), entry('冷え性')];

    const next = addHistoryEntry(history, entry('冷え性', 'ja', 2));

    expect(next.map((e) => e.query)).toEqual(['冷え性', '葛根湯']);
    expect(next[0].savedAt).toBe(2);
  });

  it(`keeps at most ${MAX_HISTORY_ENTRIES} entries`, () => {
    let history: HistoryEntry[] = [];
    for (let i = 0; i < MAX_HISTORY_ENTRIES + 5; i++) {
      history = addHistoryEntry(history, entry(`query ${i}`));
    }

    expect(history).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(history[0].query).toBe(`query ${MAX_HISTORY_ENTRIES + 4}`);
  });

  it('round-trips history through localStorage', () => {
    saveHistory([entry('葛根湯')]);

    expect(loadHistory()).toEqual([entry('葛根湯')]);
  });

  it('ignores malformed stored data', () => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([{ query: 1 }]));
    expect(loadHistory()).toEqual([]);

    localStorage.setItem(HISTORY_STORAGE_KEY, 'not json');
    expect(loadHistory()).toEqual([]);
  });
});
