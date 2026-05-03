# Testing Documentation

## Overview

This project includes comprehensive test coverage for both backend (Node.js/Express) and frontend (React/Vite) with **30+ test files** covering integration, unit, and component-level testing.

## Quick Start

### Run All Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Generate Coverage Reports

```bash
# Backend
cd backend
npm run test:coverage

# Frontend
cd frontend
npm run test:coverage
```

## Backend Testing

**Location**: `backend/src/test/`  
**Framework**: Jest + Supertest  
**Coverage**: Unit, Middleware, Integration, Validators, Utils

### Test Files Structure

```
backend/src/test/
├── integration/
│   └── electionController.test.ts     # 393 tests, full workflow
├── middleware/
│   ├── authMiddleware.test.ts         # Auth validation
│   └── errorHandler.test.ts           # Error handling
├── validators/
│   └── electionValidators.test.ts     # Input validation
└── utils/
    ├── hash.test.ts                   # Crypto utilities
    └── promptSanitizer.test.ts        # Injection protection
```

### Integration Tests: electionController.test.ts

**Coverage**: 393 comprehensive test cases for the main API

#### POST /api/election/guide

- ✅ Valid guide generation with all fields (age, state, question, voterIdStatus, language)
- ✅ Age validation (18 minimum, 120 maximum)
- ✅ State enum validation (36 states/UTs)
- ✅ Question length (5-500 characters)
- ✅ Prompt injection detection (19+ attack patterns)
- ✅ DAN mode detection
- ✅ System override pattern rejection
- ✅ Authentication enforcement
- ✅ Demo mode fallback

#### GET /api/election/history

- ✅ Empty history for new users
- ✅ History list retrieval
- ✅ Limit parameter enforcement
- ✅ User isolation
- ✅ Authentication required

#### POST /api/election/conversations/:id/export

- ✅ Export successful conversations
- ✅ 404 for non-existent conversations
- ✅ Inline demo export vs Cloud Storage
- ✅ Authentication enforcement

#### POST /api/election/conversations/:id/feedback

- ✅ Feedback submission (rating 1-5, useful boolean, optional comment)
- ✅ Rating validation (rejects 0, 6)
- ✅ Useful field enforcement
- ✅ Comment length limit (500 chars)
- ✅ 404 for non-existent conversations

#### GET /api/election/insights

- ✅ Metrics aggregation (guideCreated, exportCreated, feedbackSubmitted)
- ✅ Source field (demo vs real)
- ✅ Authentication required

#### GET /api/health & /api/health/google-services

- ✅ Health status without secrets
- ✅ Service status reporting (Vertex AI, Cloud Storage, BigQuery)
- ✅ Demo mode indication
- ✅ No credential leakage

### Middleware Tests

#### authMiddleware.test.ts

- ✅ Missing Authorization header → 401
- ✅ Wrong scheme (Basic instead of Bearer) → 401
- ✅ Empty token → 401
- ✅ Demo token acceptance (when DEMO_AUTH_ENABLED=true)
- ✅ X-Demo-User header extraction
- ✅ User isolation per demo user
- ✅ Firebase unavailable → 503

#### errorHandler.test.ts

- ✅ Default 500 status for generic errors
- ✅ Custom statusCode from error object
- ✅ Development mode: full error message + stack trace
- ✅ Production mode: generic message, no stack trace
- ✅ JSON response format with success: false
- ✅ No credential leakage

### Validator Tests: electionValidators.test.ts

#### ElectionQuerySchema

| Field | Rules | Tests |
|-------|-------|-------|
| **age** | Integer, 18-120 | Boundaries, type validation, required |
| **state** | Enum (36 Indian states/UTs) | All states, UTs, invalid rejection |
| **question** | String, 5-500 chars | Boundaries, trimming, required |
| **voterIdStatus** | Enum: registered, not_registered, unsure | Optional, default: unsure |
| **language** | Enum: en, hi | Optional, default: en |

#### ConversationFeedbackSchema

| Field | Rules | Tests |
|-------|-------|-------|
| **rating** | Integer, 1-5 | Boundaries, type validation, required |
| **useful** | Boolean | Required |
| **comment** | String, 0-500 chars | Optional, trimming, max-length |

### Utility Tests

#### hash.test.ts (95 tests)

**hashIdentifier(value, salt)**
- ✅ Returns 64-char SHA-256 hex string
- ✅ Deterministic (same input = same output)
- ✅ Unique (different input = different output)
- ✅ Salt-dependent (different salt = different hash)
- ✅ No plaintext leakage
- ✅ Privacy-preserving (non-reversible)

**createEventId(prefix)**
- ✅ Format: `{prefix}-{timestamp}-{random}`
- ✅ Timestamps accurate to millisecond
- ✅ Random suffix (hex, cryptographically unique)
- ✅ 100% collision-free across calls
- ✅ Deterministic prefix

#### promptSanitizer.test.ts (114 tests)

**Injection Pattern Detection** (19+ patterns):
- ✅ "ignore previous instructions"
- ✅ "ignore all previous instructions"
- ✅ "disregard previous rules"
- ✅ "you are now a different AI"
- ✅ "act as a hacker"
- ✅ "DAN mode"
- ✅ "developer mode"
- ✅ "jailbreak"
- ✅ "new system prompt"
- ✅ "[INST] patterns"
- ✅ "<<SYS>> patterns"
- ✅ And 7+ more...

**Dangerous Character Stripping**:
- ✅ `<>` HTML tags removed
- ✅ Backticks removed
- ✅ `{}` braces removed
- ✅ Backslashes removed

**Other Validations**:
- ✅ Whitespace trimming
- ✅ Max-length enforcement (500 chars)
- ✅ Case-insensitive matching
- ✅ Matched pattern reporting
- ✅ Clean input pass-through

### Running Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Specific file
npm test electionController.test.ts

# With verbose output
npm test -- --verbose
```

## Frontend Testing

**Location**: `frontend/src/test/`  
**Framework**: Vitest + React Testing Library  
**Coverage**: Pages, Components, Hooks, Services, Utils

### Test Files Structure

```
frontend/src/test/
├── pages/
│   ├── GuidePage.test.tsx           # Guide generation
│   ├── HistoryPage.test.tsx         # Conversation history
│   ├── HomePage.test.tsx            # Landing page
│   └── NotFoundPage.test.tsx        # 404 page
├── components/
│   ├── GuideResult.test.tsx         # Guide display & actions
│   └── Footer.test.tsx              # Footer rendering
├── hooks/
│   ├── useAuth.test.ts              # Auth context
│   └── useElectionGuide.test.ts     # Guide generation
├── services/
│   ├── apiService.test.ts           # API calls
│   └── telemetryService.test.ts     # Analytics
└── utils/
    └── constants.test.ts            # Data constants
```

### Page Tests

#### GuidePage.test.tsx

- ✅ Initial render with form
- ✅ Successful guide generation
- ✅ API error → fallback preview (conversationId: "local-preview")
- ✅ Export button behavior
- ✅ Feedback flow
- ✅ "Ask Another Question" reset
- ✅ Form state management

#### HistoryPage.test.tsx (192 tests)

- ✅ Loading state indicators
- ✅ Empty state ("No history found")
- ✅ Conversation list rendering
- ✅ Usage insights display (3 metrics)
- ✅ Export integration per conversation
- ✅ Quick feedback ("Mark Useful")
- ✅ Error states with "Try Again" button
- ✅ Retry mechanism
- ✅ Timestamp formatting

#### HomePage.test.tsx

- ✅ Hero section with h1
- ✅ CTA button linking to /guide
- ✅ Feature cards (3 articles)
- ✅ Feature titles: "AI-Powered Insights", "Secure & Private", "All States Covered"
- ✅ Semantic regions with aria-labelledby
- ✅ Accessibility landmarks

#### NotFoundPage.test.tsx

- ✅ 404 heading
- ✅ "Page Not Found" message
- ✅ Return Home link to "/"

### Component Tests

#### GuideResult.test.tsx (182 tests)

- ✅ Personalized advice rendering
- ✅ Steps display (stepNumber, title, description)
- ✅ Important dates section
- ✅ Helpline numbers section
- ✅ Additional resources (links)
- ✅ Export button (disabled when no conversationId)
- ✅ Export → download URL vs inline JSON
- ✅ Export error handling
- ✅ Rating buttons (1-5 stars)
- ✅ Rating state management
- ✅ Feedback submission with comment
- ✅ Feedback success → disabled "Feedback Saved"
- ✅ Feedback error handling
- ✅ Accessibility: aria-pressed on buttons
- ✅ "Ask Another Question" callback

#### Footer.test.tsx

- ✅ Brand text rendering
- ✅ Links and footer structure

### Hook Tests

#### useAuth.test.ts (59 tests)

- ✅ Throws when outside AuthProvider
- ✅ Returns auth context value inside provider
- ✅ Exposes methods: signIn, signUp, signOut, signInWithGoogle, getIdToken, clearError
- ✅ User/loading/error properties
- ✅ Context isolation

#### useElectionGuide.test.ts (136 tests)

- ✅ Initial state: result=null, loading=false, error=null
- ✅ Successful generation: sets result, clears error
- ✅ API failure: fallback guide + error message
- ✅ Loading flag lifecycle
- ✅ clearResult() action
- ✅ clearError() action
- ✅ Error message capture

### Service Tests

#### apiService.test.ts (204 tests)

**fetchElectionGuide**
- ✅ POST to /api/election/guide
- ✅ Success response handling
- ✅ Error response with message
- ✅ Network failure propagation

**fetchConversationHistory**
- ✅ GET from /api/election/history
- ✅ Limit parameter in query string
- ✅ Error handling

**exportConversation**
- ✅ POST to /api/election/conversations/:id/export
- ✅ 404 handling
- ✅ Inline export vs Cloud Storage
- ✅ Error messaging

**submitConversationFeedback**
- ✅ POST to /api/election/conversations/:id/feedback
- ✅ Rating and useful fields
- ✅ Validation errors
- ✅ Error propagation

**fetchElectionInsights**
- ✅ GET aggregate metrics
- ✅ Error handling

**checkHealth**
- ✅ Returns true for healthy server
- ✅ Returns false for errors
- ✅ Network failure handling

#### telemetryService.test.ts (53 tests)

- ✅ trackClientEvent no-ops in demo mode
- ✅ measureAsync returns action result
- ✅ measureAsync handles action failures
- ✅ Works with async actions

### Utils Tests

#### constants.test.ts (116 tests)

**INDIAN_STATES**
- ✅ 36 states/UTs total (28 states + 8 UTs)
- ✅ Contains all states by name
- ✅ Contains all UTs by name
- ✅ No duplicate entries
- ✅ Includes: Delhi, Maharashtra, Karnataka, etc.

**VOTER_ID_STATUS_OPTIONS**
- ✅ 3 options: registered, not_registered, unsure
- ✅ All have value and label

**LANGUAGE_OPTIONS**
- ✅ 2 options: en (English), hi (Hindi)

**SAMPLE_QUESTIONS**
- ✅ 4+ questions provided
- ✅ Length: 5-500 characters (API-valid)

### Running Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# UI dashboard
npm test -- --ui

# Watch mode
npm test -- --watch

# Specific file
npm test GuideResult

# With verbose output
npm test -- --reporter=verbose
```

## Coverage Reports

### Backend Coverage

```bash
cd backend
npm run test:coverage
# Generates: coverage/lcov-report/index.html
```

View in browser:
```bash
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
start coverage\lcov-report\index.html  # Windows
```

### Frontend Coverage

```bash
cd frontend
npm run test:coverage
# Generates: coverage/index.html
```

## Test Execution Order

### For CI/CD

```bash
# Backend
cd backend && npm install && npm test

# Frontend
cd frontend && npm install && npm test

# Build
npm run build
```

## Key Test Patterns

### Backend: Integration Test Example

```typescript
describe('POST /api/election/guide', () => {
  it('returns 200 with guide on valid input', async () => {
    const app = buildTestApp();
    const res = await request(app)
      .post('/api/election/guide')
      .set(auth('test-user'))
      .send({ 
        age: 28, 
        state: 'Delhi', 
        question: 'How do I vote?' 
      })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.conversationId).toBeTruthy();
  });
});
```

### Frontend: Component Test Example

```typescript
describe('GuideResult', () => {
  it('calls exportConversation when Export clicked', async () => {
    render(<GuideResult result={FULL_RESULT} onReset={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    await waitFor(() => expect(exportConversation).toHaveBeenCalledWith('conv-1'));
  });
});
```

## Common Issues & Solutions

### Backend Tests Timeout

```bash
# Increase timeout
jest.setTimeout(20000);  # 20 seconds
```

### Frontend Tests: "Element not found"

```typescript
// Use waitFor for async operations
await waitFor(() => expect(screen.getByText('Success')).toBeInTheDocument());
```

### Module Resolution Issues

```bash
# Clear Jest cache
npm test -- --clearCache
```

### Port Already in Use (Windows)

```bash
# Windows: Find process on port 4000
netstat -ano | findstr :4000
# Kill process
taskkill /PID <PID> /F

# Or use a different port
PORT=5555 npm run dev
```

## Future Testing Improvements

- [ ] E2E tests with Cypress/Playwright
- [ ] Performance benchmarks
- [ ] Accessibility audit (axe-core)
- [ ] Mutation testing
- [ ] Load testing for Vertex AI endpoints
- [ ] BigQuery query validation tests
- [ ] Firebase security rules tests

## Contact & Support

For questions about tests:
1. Check test file comments (detailed coverage info at top)
2. Review GitHub issues
3. Run tests with `--verbose` flag
4. Check coverage reports for gaps
