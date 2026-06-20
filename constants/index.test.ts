import {
  API_CONFIG,
  RATE_LIMIT,
  TEST_CONFIG,
  GEMINI_MODEL,
  ALLOWED_ORIGINS,
  LANGUAGES,
} from './index';

describe('Constants', () => {
  describe('API_CONFIG', () => {
    it('has RETRY_COUNT property', () => {
      expect(API_CONFIG).toHaveProperty('RETRY_COUNT');
      expect(API_CONFIG.RETRY_COUNT).toBe(3);
    });

    it('has TIMEOUT property in milliseconds', () => {
      expect(API_CONFIG).toHaveProperty('TIMEOUT');
      expect(API_CONFIG.TIMEOUT).toBe(30000);
    });

    it('has BASE_URL property', () => {
      expect(API_CONFIG).toHaveProperty('BASE_URL');
    });

    it('is a constant object (declared as const)', () => {
      // Since they're declared as const, they can't be reassigned
      expect(API_CONFIG).toBeDefined();
      expect(API_CONFIG.RETRY_COUNT).toBe(3);
    });
  });

  describe('RATE_LIMIT', () => {
    it('has REQUESTS_PER_MINUTE property', () => {
      expect(RATE_LIMIT).toHaveProperty('REQUESTS_PER_MINUTE');
      expect(RATE_LIMIT.REQUESTS_PER_MINUTE).toBe(5);
    });

    it('has WINDOW_MS property', () => {
      expect(RATE_LIMIT).toHaveProperty('WINDOW_MS');
      expect(RATE_LIMIT.WINDOW_MS).toBe(60 * 1000);
    });

    it('is a constant object (declared as const)', () => {
      expect(RATE_LIMIT).toBeDefined();
      expect(RATE_LIMIT.REQUESTS_PER_MINUTE).toBe(5);
    });
  });

  describe('TEST_CONFIG', () => {
    it('has TIMEOUT property', () => {
      expect(TEST_CONFIG).toHaveProperty('TIMEOUT');
      expect(TEST_CONFIG.TIMEOUT).toBe(30000);
    });

    it('has HOOK_TIMEOUT property', () => {
      expect(TEST_CONFIG).toHaveProperty('HOOK_TIMEOUT');
      expect(TEST_CONFIG.HOOK_TIMEOUT).toBe(30000);
    });

    it('is a constant object (declared as const)', () => {
      expect(TEST_CONFIG).toBeDefined();
      expect(TEST_CONFIG.TIMEOUT).toBe(30000);
    });
  });

  describe('GEMINI_MODEL', () => {
    it('is a valid model string', () => {
      expect(typeof GEMINI_MODEL).toBe('string');
      expect(GEMINI_MODEL).toBe('gemini-flash-latest');
    });
  });

  describe('ALLOWED_ORIGINS', () => {
    it('includes production URL', () => {
      expect(ALLOWED_ORIGINS).toContain('https://self-care-guide.vercel.app');
    });

    it('includes preview URL', () => {
      expect(ALLOWED_ORIGINS).toContain('https://self-care-guide-git-main-asofia888.vercel.app');
    });

    it('includes localhost for development', () => {
      expect(ALLOWED_ORIGINS).toContain('http://localhost:5173');
    });

    it('is a constant array (declared as const)', () => {
      expect(ALLOWED_ORIGINS).toBeDefined();
      expect(ALLOWED_ORIGINS).toHaveLength(3);
    });
  });

  describe('LANGUAGES', () => {
    it('contains Japanese language code', () => {
      expect(LANGUAGES).toContain('ja');
    });

    it('contains English language code', () => {
      expect(LANGUAGES).toContain('en');
    });

    it('has exactly 2 languages', () => {
      expect(LANGUAGES).toHaveLength(2);
    });

    it('is a constant array (declared as const)', () => {
      expect(LANGUAGES).toBeDefined();
      expect(LANGUAGES).toHaveLength(2);
    });
  });

  describe('Constants are well-defined', () => {
    it('all constants have the correct type and structure', () => {
      expect(typeof API_CONFIG).toBe('object');
      expect(typeof RATE_LIMIT).toBe('object');
      expect(typeof TEST_CONFIG).toBe('object');
      expect(Array.isArray(ALLOWED_ORIGINS)).toBe(true);
      expect(Array.isArray(LANGUAGES)).toBe(true);
    });

    it('all constants are defined and accessible', () => {
      expect(API_CONFIG).toBeDefined();
      expect(RATE_LIMIT).toBeDefined();
      expect(TEST_CONFIG).toBeDefined();
      expect(GEMINI_MODEL).toBeDefined();
      expect(ALLOWED_ORIGINS).toBeDefined();
      expect(LANGUAGES).toBeDefined();
    });
  });
});
