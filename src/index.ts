// Original API (now RxJS-powered but 100% compatible)
export { useInjection } from './lib/use.injection';
export { typeOf } from './lib/type-of';
export { Result } from './lib/result';
// useMock is only available in test environment
export { useMock } from './lib/use.mock';

// RxJS-based Effects API
export { twilioEffect } from './lib/effects/twilio-effect';

// Injection operators
export { 
  injectEvent,
  injectEnv,
  injectClient,
  injectProviders,
  injectRequest,
  injectProvider,
  inject,
  injectMany
} from './lib/operators/inject';

// Validation operators
export {
  validateEvent,
  requireFields,
  requireEnvVars,
  transformEvent,
  authenticated
} from './lib/operators/validation';

// Response operators
export {
  toJsonResponse,
  ok,
  created,
  accepted,
  noContent,
  toTwiMLResponse,
  toResponse,
  redirect,
  withHeaders,
  withHeader,
  apiResponse
} from './lib/operators/response';

// Error handling operators
export {
  handleError,
  logError,
  retryWithBackoff,
  mapErrorType,
  fallback,
  timeoutWithError,
  validate,
  ensureResponse,
  ignoreErrors
} from './lib/operators/error-handling';

// Flex token validation
export {
  validateFlexToken,
  validateFlexTokenWithOptions,
  requireFlexAuth
} from './lib/operators/flex-token';

// Testing utilities
export {
  mockEffect,
  testEffect,
  createEffectTestHarness
} from './lib/testing/mock-effect';

export {
  createTestScheduler,
  marbleTest,
  toPromise,
  mockDelayedObservable,
  expectEmissions,
  expectError
} from './lib/testing/test-utils';

// Shared response and error classes
export { BadRequestError } from './lib/errors/bad-request.error';
export { InternalServerError } from './lib/errors/internal-server.error';
export { NotFoundError } from './lib/errors/not-found.error';
export { UnauthorizedError } from './lib/errors/unauthorized.error';
export { Response } from './lib/responses/default.response';
export { TwiMLResponse } from './lib/responses/twiml.response';

// Original types for backwards compatibility
export type { 
  InjectorFunction, 
  ProviderFunction, 
  InjectorThis, 
  EnvironmentVars, 
  InjectionContext 
} from './lib/use.injection';

// Result operators for RxJS streams
export {
  handleResult,
  toResultOk,
  toResultFailed,
  toResult,
  mapResult,
  switchMapResult
} from './lib/operators/result';

// RxJS Effect types
export type {
  TwilioEvent,
  TwilioContext,
  EffectContext,
  Effect,
  EffectWithContext,
  EffectOptions,
  ProviderFactory,
  ProvidersFactory
} from './lib/effects/types';