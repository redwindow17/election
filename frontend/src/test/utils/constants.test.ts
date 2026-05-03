// ============================================================
// constants — Unit Tests
// ============================================================
// Covers: INDIAN_STATES completeness, VOTER_ID_STATUS_OPTIONS
// values, LANGUAGE_OPTIONS values, SAMPLE_QUESTIONS content.
// ============================================================

import { describe, expect, it } from 'vitest';
import {
  INDIAN_STATES,
  VOTER_ID_STATUS_OPTIONS,
  LANGUAGE_OPTIONS,
  SAMPLE_QUESTIONS,
} from '../../utils/constants';

describe('INDIAN_STATES', () => {
  it('contains 36 states and UTs', () => {
    expect(INDIAN_STATES).toHaveLength(36);
  });

  it('includes Delhi', () => {
    expect(INDIAN_STATES).toContain('Delhi');
  });

  it('includes all 28 states', () => {
    const states = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
      'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
      'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
      'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
      'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
      'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    ];
    states.forEach((state) => expect(INDIAN_STATES).toContain(state));
  });

  it('includes all 8 Union Territories', () => {
    const uts = [
      'Andaman and Nicobar Islands', 'Chandigarh',
      'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi', 'Jammu and Kashmir', 'Ladakh',
      'Lakshadweep', 'Puducherry',
    ];
    uts.forEach((ut) => expect(INDIAN_STATES).toContain(ut));
  });

  it('has no duplicate entries', () => {
    const unique = new Set(INDIAN_STATES);
    expect(unique.size).toBe(INDIAN_STATES.length);
  });
});

describe('VOTER_ID_STATUS_OPTIONS', () => {
  it('has 3 options', () => {
    expect(VOTER_ID_STATUS_OPTIONS).toHaveLength(3);
  });

  it('includes registered option', () => {
    expect(VOTER_ID_STATUS_OPTIONS.find((o) => o.value === 'registered')).toBeDefined();
  });

  it('includes not_registered option', () => {
    expect(VOTER_ID_STATUS_OPTIONS.find((o) => o.value === 'not_registered')).toBeDefined();
  });

  it('includes unsure option', () => {
    expect(VOTER_ID_STATUS_OPTIONS.find((o) => o.value === 'unsure')).toBeDefined();
  });

  it('all options have value and label', () => {
    VOTER_ID_STATUS_OPTIONS.forEach((opt) => {
      expect(opt.value).toBeTruthy();
      expect(opt.label).toBeTruthy();
    });
  });
});

describe('LANGUAGE_OPTIONS', () => {
  it('has 2 options', () => {
    expect(LANGUAGE_OPTIONS).toHaveLength(2);
  });

  it('includes English (en)', () => {
    expect(LANGUAGE_OPTIONS.find((o) => o.value === 'en')).toBeDefined();
  });

  it('includes Hindi (hi)', () => {
    expect(LANGUAGE_OPTIONS.find((o) => o.value === 'hi')).toBeDefined();
  });
});

describe('SAMPLE_QUESTIONS', () => {
  it('has at least 4 sample questions', () => {
    expect(SAMPLE_QUESTIONS.length).toBeGreaterThanOrEqual(4);
  });

  it('all questions are non-empty strings', () => {
    SAMPLE_QUESTIONS.forEach((q) => {
      expect(typeof q).toBe('string');
      expect(q.length).toBeGreaterThan(0);
    });
  });

  it('all questions are at least 5 characters (valid for API)', () => {
    SAMPLE_QUESTIONS.forEach((q) => {
      expect(q.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('all questions are at most 500 characters (valid for API)', () => {
    SAMPLE_QUESTIONS.forEach((q) => {
      expect(q.length).toBeLessThanOrEqual(500);
    });
  });
});
