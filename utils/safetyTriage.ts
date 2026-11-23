/**
 * Keyword-based safety triage that runs before a search is sent to the AI.
 *
 * - 'crisis': the query suggests thoughts of suicide or self-harm. The app shows
 *   support resources instead of herb or supplement information.
 * - 'urgent': the query describes symptoms that may need prompt medical care.
 *   The app recommends seeing a doctor first; the person can still choose to
 *   view the information.
 *
 * Keywords are symptom and first-person phrases rather than disease names, so
 * that research queries such as "stroke prevention" are not interrupted.
 */
export type SafetyLevel = 'crisis' | 'urgent';

const toHiragana = (text: string): string =>
  text.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));

/**
 * Normalizes text so that width (全角/半角), case, katakana/hiragana, apostrophes
 * and hyphens do not affect matching.
 */
export const normalizeForTriage = (text: string): string =>
  toHiragana(text.normalize('NFKC').toLowerCase())
    .replace(/['’‘`]/g, '')
    .replace(/[-‐‑–—_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const CRISIS_KEYWORDS = [
  // Japanese
  '死にたい',
  'しにたい',
  '死のうと',
  '死んでしまいたい',
  '死んだほうがまし',
  '死んだ方がまし',
  '消えたい',
  'きえたい',
  'いなくなりたい',
  '生きていたくない',
  '生きたくない',
  '生きる意味がない',
  '生きるのがつらい',
  '生きるのが辛い',
  '生きているのがつらい',
  '生きているのが辛い',
  '自殺',
  '自死',
  '自傷',
  'リストカット',
  'リスカ',
  '首吊り',
  '首を吊',
  '首をつる',
  '首つり',
  '飛び降り',
  'オーバードーズ',
  '殺してほしい',
  // English
  'suicid',
  'kill myself',
  'killing myself',
  'want to die',
  'wanna die',
  'end my life',
  'ending my life',
  'take my own life',
  'self harm',
  'selfharm',
  'harm myself',
  'hurt myself',
  'cutting myself',
  'dont want to live',
  'do not want to live',
  'no reason to live',
  'better off dead',
];

const URGENT_KEYWORDS = [
  // Japanese: chest pain and breathing
  '胸痛',
  '胸が痛',
  '胸の痛み',
  '胸が締め付け',
  '胸がしめつけ',
  '胸が苦し',
  '胸の圧迫感',
  '息ができない',
  '息が苦し',
  '息苦し',
  '呼吸困難',
  '呼吸が苦し',
  '呼吸ができない',
  // Consciousness and seizures
  '意識がない',
  '意識を失',
  '意識障害',
  '失神',
  '気を失',
  // Generic "けいれん" is left out: eyelid twitching (まぶたのけいれん) is a common, benign query.
  'けいれん発作',
  '痙攣発作',
  '全身のけいれん',
  '全身の痙攣',
  '全身けいれん',
  '全身痙攣',
  'ひきつけ',
  // Stroke signs
  'ろれつが回らない',
  'ろれつがまわらない',
  '呂律が回らない',
  '顔のゆがみ',
  '顔の片側',
  '片側の麻痺',
  '半身麻痺',
  '半身の麻痺',
  '片側のしびれ',
  '半身のしびれ',
  '急に見えなく',
  '視野が欠け',
  '突然の激しい頭痛',
  '激しい頭痛',
  '今までにない頭痛',
  '経験したことのない頭痛',
  // Bleeding
  '吐血',
  '血を吐',
  '喀血',
  '下血',
  '血便',
  '黒い便',
  'タール便',
  '大量出血',
  '出血が止まらない',
  // Allergy, abdomen, poisoning
  'アナフィラキシー',
  '喉が腫れ',
  'のどが腫れ',
  '唇が腫れ',
  '激しい腹痛',
  '誤飲',
  '誤って飲',
  // English
  'chest pain',
  'chest tightness',
  'chest pressure',
  'tight chest',
  'cant breathe',
  'cannot breathe',
  'can not breathe',
  'difficulty breathing',
  'trouble breathing',
  'struggling to breathe',
  'short of breath',
  'shortness of breath',
  'unconscious',
  'passed out',
  'fainted',
  'fainting',
  'loss of consciousness',
  'seizure',
  'convulsion',
  'slurred speech',
  'facial droop',
  'face drooping',
  'drooping face',
  'weakness on one side',
  'numbness on one side',
  'one sided weakness',
  'one sided numbness',
  'sudden vision loss',
  'worst headache',
  'sudden severe headache',
  'thunderclap headache',
  'vomiting blood',
  'coughing up blood',
  'blood in stool',
  'bloody stool',
  'black stool',
  'tarry stool',
  'heavy bleeding',
  'bleeding wont stop',
  'anaphylaxis',
  'anaphylactic',
  'throat swelling',
  'swollen throat',
  'throat closing',
  'swollen tongue',
  'severe abdominal pain',
  'poisoning',
  'swallowed poison',
];

const normalizeKeywords = (keywords: string[]): string[] => keywords.map(normalizeForTriage);

const NORMALIZED_CRISIS = normalizeKeywords(CRISIS_KEYWORDS);
const NORMALIZED_URGENT = normalizeKeywords(URGENT_KEYWORDS);

const matchesAny = (query: string, keywords: string[]): boolean => {
  // Japanese is matched without spaces so "胸 が 痛い" still matches "胸が痛".
  const compact = query.replace(/ /g, '');
  return keywords.some((keyword) =>
    /[a-z]/.test(keyword) ? query.includes(keyword) : compact.includes(keyword)
  );
};

/**
 * Returns the safety level for a search query, or null when the query can be
 * searched normally. Crisis takes precedence over urgent symptoms.
 */
export const detectSafetyConcern = (query: string): SafetyLevel | null => {
  const normalized = normalizeForTriage(query);
  if (!normalized) return null;
  if (matchesAny(normalized, NORMALIZED_CRISIS)) return 'crisis';
  if (matchesAny(normalized, NORMALIZED_URGENT)) return 'urgent';
  return null;
};
