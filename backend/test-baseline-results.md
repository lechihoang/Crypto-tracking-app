# Baseline Test Results

**Date:** November 19, 2025
**Purpose:** Document test suite status before backend refactoring

## Test Summary

- **Total Test Suites:** 7
  - Passed: 4
  - Failed: 3
- **Total Tests:** 86
  - Passed: 62
  - Failed: 24

## Failed Test Suites

### 1. auth.controller.spec.ts
**Status:** Compilation Error
**Issue:** TypeScript error - `signIn` method expects 2 arguments but got 1
```
src/auth/test/auth.controller.spec.ts:107:39 - error TS2554: Expected 2 arguments, but got 1.
```

### 2. email.service.spec.ts
**Status:** 7 tests failed
**Issue:** `TypeError: Cannot read properties of undefined (reading 'charAt')`
**Affected Tests:**
- should send price alert email when price goes above target
- should send price alert email when price goes below target
- should include current price and target price in email
- should throw error when email sending fails
- should format prices with comma separators
- should send email when notifications are enabled
- should check preference for each user separately

**Root Cause:** `capitalizeCoinName` method receiving undefined coinName

### 3. auth.service.spec.ts
**Status:** 16 tests failed
**Issue:** Dependency injection error - UserService not available in test module
```
Nest can't resolve dependencies of the AuthService (Auth0Service, ?). 
Please make sure that the argument UserService at index [1] is available in the RootTestModule context.
```

**Affected Tests:** All tests in the suite (signUp, signIn, resetPassword, updatePassword, changePassword, getUser)

## Passing Test Suites

1. ✅ alerts.service.spec.ts
2. ✅ auth0.service.spec.ts
3. ✅ embedding.service.spec.ts
4. ✅ rag-integration.spec.ts

## Notes

- Tests have issues with proper teardown (worker process force exit warning)
- Extensive console.log output from RAG integration tests (630+ categories logged)
- Some tests may be leaking resources (suggested to run with --detectOpenHandles)

## Action Items

These test failures should be addressed during or after the refactoring process:
1. Fix auth.controller.spec.ts compilation error
2. Fix email.service.spec.ts undefined coinName issue
3. Fix auth.service.spec.ts dependency injection setup
4. Improve test cleanup to prevent worker process issues
