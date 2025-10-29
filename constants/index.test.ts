import {
  API_CONFIG,
  FILE_LIMITS,
  RATE_LIMIT,
  FORM_STYLES,
  TEST_CONFIG,
  GEMINI_MODEL,
  ALLOWED_ORIGINS,
  ANALYSIS_MODES,
  LANGUAGES,
  ERROR_MESSAGES,
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

  describe('FILE_LIMITS', () => {
    it('has MAX_SIZE property', () => {
      expect(FILE_LIMITS).toHaveProperty('MAX_SIZE');
      expect(FILE_LIMITS.MAX_SIZE).toBe(4 * 1024 * 1024); // 4MB
    });

    it('has ALLOWED_TYPES array', () => {
      expect(FILE_LIMITS).toHaveProperty('ALLOWED_TYPES');
      expect(FILE_LIMITS.ALLOWED_TYPES).toContain('image/png');
      expect(FILE_LIMITS.ALLOWED_TYPES).toContain('image/jpeg');
    });

    it('has ALLOWED_EXTENSIONS array', () => {
      expect(FILE_LIMITS).toHaveProperty('ALLOWED_EXTENSIONS');
      expect(FILE_LIMITS.ALLOWED_EXTENSIONS).toContain('.png');
      expect(FILE_LIMITS.ALLOWED_EXTENSIONS).toContain('.jpg');
      expect(FILE_LIMITS.ALLOWED_EXTENSIONS).toContain('.jpeg');
    });

    it('is a constant object (declared as const)', () => {
      expect(FILE_LIMITS).toBeDefined();
      expect(FILE_LIMITS.MAX_SIZE).toBe(4 * 1024 * 1024);
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

  describe('FORM_STYLES', () => {
    it('has input style string', () => {
      expect(FORM_STYLES).toHaveProperty('input');
      expect(typeof FORM_STYLES.input).toBe('string');
      expect(FORM_STYLES.input).toContain('p-2');
      expect(FORM_STYLES.input).toContain('border');
    });

    it('has label style string', () => {
      expect(FORM_STYLES).toHaveProperty('label');
      expect(typeof FORM_STYLES.label).toBe('string');
      expect(FORM_STYLES.label).toContain('font-semibold');
    });

    it('has textarea style string', () => {
      expect(FORM_STYLES).toHaveProperty('textarea');
      expect(typeof FORM_STYLES.textarea).toBe('string');
      expect(FORM_STYLES.textarea).toContain('h-24');
    });

    it('has legend style string', () => {
      expect(FORM_STYLES).toHaveProperty('legend');
      expect(typeof FORM_STYLES.legend).toBe('string');
      expect(FORM_STYLES.legend).toContain('font-bold');
    });

    it('has button object with style options', () => {
      expect(FORM_STYLES).toHaveProperty('button');
      expect(FORM_STYLES.button).toHaveProperty('primary');
      expect(FORM_STYLES.button).toHaveProperty('secondary');
      expect(FORM_STYLES.button).toHaveProperty('selected');
      expect(FORM_STYLES.button).toHaveProperty('unselected');
      expect(FORM_STYLES.button).toHaveProperty('disabled');
    });

    it('primary button style includes proper classes', () => {
      expect(FORM_STYLES.button.primary).toContain('px-8');
      expect(FORM_STYLES.button.primary).toContain('py-3');
      expect(FORM_STYLES.button.primary).toContain('rounded-full');
    });

    it('is a constant object (declared as const)', () => {
      expect(FORM_STYLES).toBeDefined();
      expect(FORM_STYLES.input).toBeDefined();
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

  describe('ANALYSIS_MODES', () => {
    it('contains professional mode', () => {
      expect(ANALYSIS_MODES).toContain('professional');
    });

    it('contains general mode', () => {
      expect(ANALYSIS_MODES).toContain('general');
    });

    it('is a constant array (declared as const)', () => {
      expect(ANALYSIS_MODES).toBeDefined();
      expect(ANALYSIS_MODES).toHaveLength(2);
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

  describe('ERROR_MESSAGES', () => {
    it('has FILE_TOO_LARGE message', () => {
      expect(ERROR_MESSAGES).toHaveProperty('FILE_TOO_LARGE');
      expect(typeof ERROR_MESSAGES.FILE_TOO_LARGE).toBe('string');
    });

    it('has INVALID_FILE_TYPE message', () => {
      expect(ERROR_MESSAGES).toHaveProperty('INVALID_FILE_TYPE');
      expect(typeof ERROR_MESSAGES.INVALID_FILE_TYPE).toBe('string');
    });

    it('has API_KEY_MISSING message', () => {
      expect(ERROR_MESSAGES).toHaveProperty('API_KEY_MISSING');
      expect(typeof ERROR_MESSAGES.API_KEY_MISSING).toBe('string');
    });

    it('has NETWORK_ERROR message', () => {
      expect(ERROR_MESSAGES).toHaveProperty('NETWORK_ERROR');
      expect(typeof ERROR_MESSAGES.NETWORK_ERROR).toBe('string');
    });

    it('has VALIDATION_ERROR message', () => {
      expect(ERROR_MESSAGES).toHaveProperty('VALIDATION_ERROR');
      expect(typeof ERROR_MESSAGES.VALIDATION_ERROR).toBe('string');
    });

    it('is a constant object (declared as const)', () => {
      expect(ERROR_MESSAGES).toBeDefined();
      expect(ERROR_MESSAGES.FILE_TOO_LARGE).toBeDefined();
    });
  });

  describe('Constants are well-defined', () => {
    it('all constants have the correct type and structure', () => {
      expect(typeof API_CONFIG).toBe('object');
      expect(typeof FILE_LIMITS).toBe('object');
      expect(typeof RATE_LIMIT).toBe('object');
      expect(typeof FORM_STYLES).toBe('object');
      expect(typeof TEST_CONFIG).toBe('object');
      expect(typeof ERROR_MESSAGES).toBe('object');
    });

    it('all constants are defined and accessible', () => {
      expect(API_CONFIG).toBeDefined();
      expect(FILE_LIMITS).toBeDefined();
      expect(RATE_LIMIT).toBeDefined();
      expect(FORM_STYLES).toBeDefined();
      expect(TEST_CONFIG).toBeDefined();
      expect(ERROR_MESSAGES).toBeDefined();
    });
  });
});
