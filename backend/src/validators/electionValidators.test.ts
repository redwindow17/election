// ============================================================
// Election Validators Tests
// ============================================================

import { ElectionQuerySchema, ConversationFeedbackSchema } from './electionValidators';

describe('ElectionQuerySchema', () => {
  const validPayload = {
    age: 28,
    state: 'Delhi',
    question: 'How do I register to vote?',
    voterIdStatus: 'registered',
    language: 'en',
  };

  it('accepts a valid payload', () => {
    const result = ElectionQuerySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('accepts minimum valid age (18)', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, age: 18 });
    expect(result.success).toBe(true);
  });

  it('accepts maximum valid age (120)', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, age: 120 });
    expect(result.success).toBe(true);
  });

  it('rejects age below 18', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, age: 17 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/18/);
    }
  });

  it('rejects age above 120', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, age: 121 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer age', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, age: 25.5 });
    expect(result.success).toBe(false);
  });

  it('rejects missing age', () => {
    const { age: _, ...rest } = validPayload;
    const result = ElectionQuerySchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects invalid state', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, state: 'InvalidState' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid Indian states', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, state: 'Tamil Nadu' });
    expect(result.success).toBe(true);
  });

  it('accepts Union Territory', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, state: 'Puducherry' });
    expect(result.success).toBe(true);
  });

  it('rejects question shorter than 5 characters', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, question: 'Hi' });
    expect(result.success).toBe(false);
  });

  it('rejects question longer than 500 characters', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, question: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('accepts question of exactly 5 characters', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, question: 'Hello' });
    expect(result.success).toBe(true);
  });

  it('accepts question of exactly 500 characters', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, question: 'a'.repeat(500) });
    expect(result.success).toBe(true);
  });

  it('trims whitespace from question', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, question: '  How do I vote?  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.question).toBe('How do I vote?');
    }
  });

  it('defaults voterIdStatus to "unsure" when omitted', () => {
    const { voterIdStatus: _, ...rest } = validPayload;
    const result = ElectionQuerySchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.voterIdStatus).toBe('unsure');
    }
  });

  it('defaults language to "en" when omitted', () => {
    const { language: _, ...rest } = validPayload;
    const result = ElectionQuerySchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe('en');
    }
  });

  it('accepts Hindi language', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, language: 'hi' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid language', () => {
    const result = ElectionQuerySchema.safeParse({ ...validPayload, language: 'fr' });
    expect(result.success).toBe(false);
  });
});

describe('ConversationFeedbackSchema', () => {
  const validFeedback = { rating: 4, useful: true };

  it('accepts valid feedback', () => {
    const result = ConversationFeedbackSchema.safeParse(validFeedback);
    expect(result.success).toBe(true);
  });

  it('accepts rating of 1 (minimum)', () => {
    const result = ConversationFeedbackSchema.safeParse({ ...validFeedback, rating: 1 });
    expect(result.success).toBe(true);
  });

  it('accepts rating of 5 (maximum)', () => {
    const result = ConversationFeedbackSchema.safeParse({ ...validFeedback, rating: 5 });
    expect(result.success).toBe(true);
  });

  it('rejects rating below 1', () => {
    const result = ConversationFeedbackSchema.safeParse({ ...validFeedback, rating: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects rating above 5', () => {
    const result = ConversationFeedbackSchema.safeParse({ ...validFeedback, rating: 6 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer rating', () => {
    const result = ConversationFeedbackSchema.safeParse({ ...validFeedback, rating: 3.5 });
    expect(result.success).toBe(false);
  });

  it('accepts optional comment', () => {
    const result = ConversationFeedbackSchema.safeParse({ ...validFeedback, comment: 'Great guide!' });
    expect(result.success).toBe(true);
  });

  it('rejects comment longer than 500 characters', () => {
    const result = ConversationFeedbackSchema.safeParse({ ...validFeedback, comment: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('trims whitespace from comment', () => {
    const result = ConversationFeedbackSchema.safeParse({ ...validFeedback, comment: '  Great!  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.comment).toBe('Great!');
    }
  });

  it('rejects missing useful field', () => {
    const result = ConversationFeedbackSchema.safeParse({ rating: 4 });
    expect(result.success).toBe(false);
  });
});
