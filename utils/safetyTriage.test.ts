import { describe, it, expect } from 'vitest';
import { detectSafetyConcern, normalizeForTriage } from './safetyTriage';

describe('normalizeForTriage', () => {
  it('folds width, case, katakana, apostrophes and hyphens', () => {
    expect(normalizeForTriage('  ＣＨＥＳＴ　Pain ')).toBe('chest pain');
    expect(normalizeForTriage('リストカット')).toBe('りすとかっと');
    expect(normalizeForTriage("I don't want to live")).toBe('i dont want to live');
    expect(normalizeForTriage('self-harm')).toBe('self harm');
  });
});

describe('detectSafetyConcern', () => {
  it.each([
    '死にたい',
    'もう消えたい',
    'シニタイ',
    '自殺',
    'リスカがやめられない',
    'オーバードーズ',
    'I want to die',
    'suicidal thoughts',
    "I don't want to live anymore",
    'self-harm',
  ])('flags "%s" as a crisis', (query) => {
    expect(detectSafetyConcern(query)).toBe('crisis');
  });

  it.each([
    '胸が痛い',
    '胸 が 痛い',
    '息が苦しい',
    'ろれつが回らない',
    '血便が出た',
    '突然の激しい頭痛',
    'Chest pain',
    "can't breathe",
    'blood in stool',
    'sudden severe headache',
  ])('flags "%s" as urgent', (query) => {
    expect(detectSafetyConcern(query)).toBe('urgent');
  });

  it.each([
    '生姜',
    'ginger',
    '不眠',
    '頭痛',
    '胸やけ',
    '便秘',
    '肩こりを楽にしたい',
    'まぶたのけいれん',
    '脳卒中 予防',
    'stroke prevention',
    'sleep paralysis',
    'food allergy',
    'insomnia',
    '',
    '   ',
  ])('does not flag "%s"', (query) => {
    expect(detectSafetyConcern(query)).toBeNull();
  });

  it('gives crisis precedence over urgent symptoms', () => {
    expect(detectSafetyConcern('胸が痛くて死にたい')).toBe('crisis');
  });
});
