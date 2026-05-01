import crypto from 'crypto';

export interface ConversationCreatedInput {
  userId: string;
  conversationId: string;
  query?: {
    age?: number;
    state?: string;
    voterIdStatus?: string;
    language?: string;
  };
  createdAt?: string;
}

export interface SanitizedAnalyticsEvent {
  eventId: string;
  eventName: 'guide_created';
  userHash: string;
  timestamp: string;
  conversationId: string;
  state?: string;
  language?: string;
  voterIdStatus?: string;
  ageGroup?: string;
  source: 'functions';
}

function getAgeGroup(age?: number): string | undefined {
  if (!age) return undefined;
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 50) return '35-49';
  if (age < 65) return '50-64';
  return '65+';
}

function hashIdentifier(value: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

export function buildConversationCreatedEvent(
  input: ConversationCreatedInput,
  salt: string
): SanitizedAnalyticsEvent {
  return {
    eventId: `functions-guide-created-${Date.now()}-${input.conversationId}`,
    eventName: 'guide_created',
    userHash: hashIdentifier(input.userId, salt),
    timestamp: input.createdAt ?? new Date().toISOString(),
    conversationId: input.conversationId,
    state: input.query?.state,
    language: input.query?.language,
    voterIdStatus: input.query?.voterIdStatus,
    ageGroup: getAgeGroup(input.query?.age),
    source: 'functions',
  };
}
