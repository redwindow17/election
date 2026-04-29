// ============================================================
// Prompt Injection Protection
// ============================================================

import logger from './logger';

/**
 * Patterns that indicate prompt injection attempts.
 * Each pattern is tested case-insensitively against user input.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?above\s+instructions/i,
  /disregard\s+(all\s+)?previous/i,
  /forget\s+(all\s+)?previous/i,
  /you\s+are\s+now\s+a/i,
  /act\s+as\s+(a\s+)?/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /new\s+system\s+prompt/i,
  /override\s+system/i,
  /\bsystem\s*:\s*/i,
  /\bassistant\s*:\s*/i,
  /\buser\s*:\s*/i,
  /\[INST\]/i,
  /<<SYS>>/i,
  /jailbreak/i,
  /DAN\s+mode/i,
  /developer\s+mode/i,
];

/**
 * Characters / sequences that should be stripped from user prompts.
 */
const DANGEROUS_CHARS = /[<>{}\\`]/g;

export interface SanitizationResult {
  sanitized: string;
  isSuspicious: boolean;
  matchedPatterns: string[];
}

/**
 * Sanitize a user prompt: strip dangerous characters and check for
 * injection patterns. Returns the cleaned string and whether the
 * input was flagged as suspicious.
 */
export function sanitizePrompt(input: string): SanitizationResult {
  const matchedPatterns: string[] = [];

  // Check for injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      matchedPatterns.push(pattern.source);
    }
  }

  if (matchedPatterns.length > 0) {
    logger.warn('Prompt injection attempt detected', {
      matchedPatterns,
      inputLength: input.length,
    });
  }

  // Strip dangerous characters
  const sanitized = input
    .replace(DANGEROUS_CHARS, '')
    .trim()
    .slice(0, 500); // Enforce max length

  return {
    sanitized,
    isSuspicious: matchedPatterns.length > 0,
    matchedPatterns,
  };
}
