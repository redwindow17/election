// ============================================================
// Zod Validation Schemas for Election Guide Inputs
// ============================================================

import { z } from 'zod';

/** All 28 states + 8 Union Territories of India */
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry',
] as const;

export const ElectionQuerySchema = z.object({
  age: z
    .number({ required_error: 'Age is required', invalid_type_error: 'Age must be a number' })
    .int('Age must be a whole number')
    .min(18, 'You must be at least 18 years old to vote')
    .max(120, 'Please enter a valid age'),

  state: z.enum(INDIAN_STATES, {
    errorMap: () => ({ message: 'Please select a valid Indian state or Union Territory' }),
  }),

  question: z
    .string({ required_error: 'Question is required' })
    .min(5, 'Question must be at least 5 characters')
    .max(500, 'Question must be at most 500 characters')
    .trim(),

  voterIdStatus: z
    .enum(['registered', 'not_registered', 'unsure'])
    .optional()
    .default('unsure'),

  language: z
    .enum(['en', 'hi'])
    .optional()
    .default('en'),
});

export type ElectionQuerySchemaType = z.infer<typeof ElectionQuerySchema>;
