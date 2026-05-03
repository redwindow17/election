// ============================================================
// electionValidators — Unit Tests
// ============================================================
// Covers: ElectionQuerySchema (age boundaries, state enum,
// question length/trim, optional fields/defaults) and
// ConversationFeedbackSchema (rating range, comment trim).
// ============================================================

import { ElectionQuerySchema, ConversationFeedbackSchema } from '../../validators/electionValidators';

const VALID_QUERY = {
  age: 28,
  state: 'Delhi',
  question: 'How do I register to vote?',
  voterIdStatus: 'registered',
  language: 'en',
};

describe('ElectionQuerySchema', () => {
  // ── Valid payload ──────────────────────────────────────
  describe('valid payload', () => {
    it('accepts a fully valid payload', () => {
      expect(ElectionQuerySchema.safeParse(VALID_QUERY).success).toBe(true);
    });
  });

  // ── Age validation ─────────────────────────────────────
  describe('age validation', () => {
    it('accepts minimum age (18)', () => {
      expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, age: 18 }).success).toBe(true);
    });

    it('accepts maximum age (120)', () => {
      expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, age: 120 }).success).toBe(true);
    });

    it('rejects age below 18', () => {
      const result = ElectionQuerySchema.safeParse({ ...VALID_QUERY, age: 17 });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toMatch(/18/);
    });

    it('rejects age above 120', () => {
      expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, age: 121 }).success).toBe(false);
    });

    it('rejects non-integer age', () => {
      expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, age: 25.5 }).success).toBe(false);
    });

    it('rejects missing age', () => {
      const { age: _, ...rest } = VALID_QUERY;
      expect(ElectionQuerySchema.safeParse(rest).success).toBe(false);
    });

    it('rejects string age', () => {
      expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, age: '28' }).success).toBe(false);
    });
  });

  // ── State validation ───────────────────────────────────
  describe('state validation', () => {
    it('accepts all 28 states', () => {
      const states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
        'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
        'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
        'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
        'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
        'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      ];
      states.forEach((state) => {
        expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, state }).success).toBe(true);
      });
    });

    it('accepts all 8 Union Territories', () => {
      const uts = [
        'Andaman and Nicobar Islands', 'Chandigarh',
        'Dadra and Nagar Haveli and Daman and Diu',
        'Delhi', 'Jammu and Kashmir', 'Ladakh',
        'Lakshadweep', 'Puducherry',
      ];
      uts.forEach((state) => {
        expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, state }).success).toBe(true);
      });
    });

    it('rejects invalid state', () => {
      expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, state: 'InvalidState' }).success).toBe(false);
    });

    it('rejects missing state', () => {
      const { state: _, ...rest } = VALID_QUERY;
      expect(ElectionQuerySchema.safeParse(rest).success).toBe(false);
    });
  });

  // ── Question validation ────────────────────────────────
  describe('question validation', () => {
    it('accepts question of exactly 5 characters', () => {
      expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, question: 'Hello' }).success).toBe(true);
    });

    it('accepts question of exactly 500 characters', () => {
      expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, question: 'a'.repeat(500) }).success).toBe(true);
    });

    it('rejects question shorter than 5 characters', () => {
      expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, question: 'Hi' }).success).toBe(false);
    });

    it('rejects question longer than 500 characters', () => {
      expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, question: 'a'.repeat(501) }).success).toBe(false);
    });

    it('trims whitespace from question', () => {
      const result = ElectionQuerySchema.safeParse({ ...VALID_QUERY, question: '  How do I vote?  ' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.question).toBe('How do I vote?');
    });

    it('rejects missing question', () => {
      const { question: _, ...rest } = VALID_QUERY;
      expect(ElectionQuerySchema.safeParse(rest).success).toBe(false);
    });
  });

  // ── Optional fields & defaults ─────────────────────────
  describe('optional fields and defaults', () => {
    it('defaults voterIdStatus to "unsure"', () => {
      const { voterIdStatus: _, ...rest } = VALID_QUERY;
      const result = ElectionQuerySchema.safeParse(rest);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.voterIdStatus).toBe('unsure');
    });

    it('defaults language to "en"', () => {
      const { language: _, ...rest } = VALID_QUERY;
      const result = ElectionQuerySchema.safeParse(rest);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.language).toBe('en');
    });

    it('accepts voterIdStatus: not_registered', () => {
      expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, voterIdStatus: 'not_registered' }).success).toBe(true);
    });

    it('accepts language: hi', () => {
      expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, language: 'hi' }).success).toBe(true);
    });

    it('rejects invalid language', () => {
      expect(ElectionQuerySchema.safeParse({ ...VALID_QUERY, language: 'fr' }).success).toBe(false);
    });
  });
});

describe('ConversationFeedbackSchema', () => {
  const VALID_FEEDBACK = { rating: 4, useful: true };

  // ── Valid payload ──────────────────────────────────────
  describe('valid payload', () => {
    it('accepts valid feedback', () => {
      expect(ConversationFeedbackSchema.safeParse(VALID_FEEDBACK).success).toBe(true);
    });
  });

  // ── Rating validation ──────────────────────────────────
  describe('rating validation', () => {
    it('accepts rating 1 (minimum)', () => {
      expect(ConversationFeedbackSchema.safeParse({ ...VALID_FEEDBACK, rating: 1 }).success).toBe(true);
    });

    it('accepts rating 5 (maximum)', () => {
      expect(ConversationFeedbackSchema.safeParse({ ...VALID_FEEDBACK, rating: 5 }).success).toBe(true);
    });

    it('rejects rating 0', () => {
      expect(ConversationFeedbackSchema.safeParse({ ...VALID_FEEDBACK, rating: 0 }).success).toBe(false);
    });

    it('rejects rating 6', () => {
      expect(ConversationFeedbackSchema.safeParse({ ...VALID_FEEDBACK, rating: 6 }).success).toBe(false);
    });

    it('rejects non-integer rating', () => {
      expect(ConversationFeedbackSchema.safeParse({ ...VALID_FEEDBACK, rating: 3.5 }).success).toBe(false);
    });

    it('rejects missing rating', () => {
      const { rating: _, ...rest } = VALID_FEEDBACK;
      expect(ConversationFeedbackSchema.safeParse(rest).success).toBe(false);
    });
  });

  // ── Useful validation ──────────────────────────────────
  describe('useful validation', () => {
    it('accepts useful: false', () => {
      expect(ConversationFeedbackSchema.safeParse({ ...VALID_FEEDBACK, useful: false }).success).toBe(true);
    });

    it('rejects missing useful', () => {
      const { useful: _, ...rest } = VALID_FEEDBACK;
      expect(ConversationFeedbackSchema.safeParse(rest).success).toBe(false);
    });
  });

  // ── Comment validation ─────────────────────────────────
  describe('comment validation', () => {
    it('accepts optional comment', () => {
      expect(ConversationFeedbackSchema.safeParse({ ...VALID_FEEDBACK, comment: 'Great!' }).success).toBe(true);
    });

    it('rejects comment longer than 500 characters', () => {
      expect(ConversationFeedbackSchema.safeParse({ ...VALID_FEEDBACK, comment: 'a'.repeat(501) }).success).toBe(false);
    });

    it('trims whitespace from comment', () => {
      const result = ConversationFeedbackSchema.safeParse({ ...VALID_FEEDBACK, comment: '  Great!  ' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.comment).toBe('Great!');
    });
  });
});
