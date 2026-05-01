import crypto from 'crypto';

export function hashIdentifier(value: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

export function createEventId(prefix: string): string {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
}
