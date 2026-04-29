// ============================================================
// Constants — Indian States, Voter ID Status, etc.
// ============================================================

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

export const VOTER_ID_STATUS_OPTIONS = [
  { value: 'registered', label: 'Yes, I have a Voter ID' },
  { value: 'not_registered', label: 'No, I need to register' },
  { value: 'unsure', label: "I'm not sure" },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
] as const;

export const SAMPLE_QUESTIONS = [
  'How do I register to vote for the first time?',
  'What documents do I need to carry on election day?',
  'How does the EVM (Electronic Voting Machine) work?',
  'Can I vote if I have moved to a different state?',
  'What is NOTA and when should I use it?',
  'How do I apply for a postal ballot?',
];
