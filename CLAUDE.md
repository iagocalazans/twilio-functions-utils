# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript utility library called `twilio-functions-utils` (v2.4.2) that simplifies working with Twilio serverless functions. The library provides dependency injection, simplified error handling, response utilities, and testing helpers to reduce boilerplate code when building Twilio Functions.

## Key Commands

### Build and Development
- `npm run build` - Compiles TypeScript to JavaScript (output: ./dist/)
- `npm run prebuild` - Cleans the build directory before building
- `npm run lint` - Currently skipped (TypeScript compiler handles type checking)
- `npm run test` - Runs Jest test suite with coverage reporting via coveralls
- `npm run docs` - Generates JSDoc documentation

### Testing Setup
- Tests require `NODE_ENV=test` environment variable
- All test files must import `require('twilio-functions-utils/dist/lib/twilio.mock.js')` at the top
- Use `useMock()` function to create testable versions of functions (only available in test mode)
- Mock Twilio API calls with `Twilio.mockRequestResolvedValue()`, `Twilio.mockRequestImplementation()`, `Twilio.mockRequestRejectedValue()`

## Core Architecture

### Main Entry Point
- `src/index.ts` - Main exports all utilities with proper TypeScript types
- `dist/index.js` - Compiled JavaScript entry point

### Core Modules

#### Dependency Injection System (`src/lib/use.injection.ts`)
- `useInjection<Data, Env, Providers>(fn, params)` - Main DI function with full TypeScript generics
- Provides strongly-typed `this.providers`, `this.env`, `this.request`, `this.cookies` context
- Supports optional Twilio Flex token validation via `validateToken: true`
- Handles errors automatically and converts them to appropriate response types
- Functions must be regular functions (not arrow functions) for proper `this` binding

#### Result Pattern (`src/lib/result.ts`)
- `Result<T, E>` class provides organized error handling without try-catch blocks
- `Result.ok<T>(data: T)` - Creates success result with typed data
- `Result.failed<E>(error: E)` - Creates error result with typed error
- `result.isError: boolean` - Type guard for checking result state
- `result.data: T` - Access successful data (throws if error)
- `result.error: E` - Access error data (throws if success)

#### Response System (`src/lib/responses/`)
- `Response` class extends `Twilio.Response` with CORS headers and JSON handling
- `TwiMLResponse` for TwiML responses with proper content-type headers
- Auto-strips internal Twilio SDK properties from responses
- Fully typed constructors and methods

#### Error Handling (`src/lib/errors/`)
- `BadRequestError`, `InternalServerError`, `NotFoundError`, `UnauthorizedError`
- All errors extend Response class and return proper HTTP status codes
- TypeScript ensures proper error message typing

#### Type Checking (`src/lib/type-of.ts`)
- `typeOf(value: any): string` - More specific type checking than native `typeof`
- Returns `Array`, `Object`, `String`, `Number`, `Symbol` instead of generic `object`

#### Testing Support (`src/lib/use.mock.ts`)
- `useMock(fn, params)` - Creates testable versions of functions with mocked dependencies
- Automatically sets up Runtime global with mocked functions and assets
- Only works in NODE_ENV=test environment
- Supports flexible directory structures: `./functions` or `./src/functions`
- Fully typed mock parameters and return values

## TypeScript Configuration

### Build Configuration
- Target: ES2018
- Module: CommonJS
- Strict mode enabled
- Declaration files generated
- Source maps included
- Output directory: `./dist/`

### Type Exports
The main entry point exports all types for consumer convenience:
- `InjectorFunction<Event, Env, Providers>`
- `ProviderFunction<Data, Env>`
- `InjectorThis<Env, Providers>`
- `EnvironmentVars<T>`
- `InjectionContext<T>`

## Project Structure

```
├── src/                        # TypeScript source files
│   ├── index.ts               # Main entry point with type exports
│   └── lib/
│       ├── use.injection.ts   # DI system with full typing
│       ├── result.ts          # Result pattern with generics
│       ├── type-of.ts         # Enhanced type checking
│       ├── use.mock.ts        # Testing utilities
│       ├── twilio.mock.ts     # TypeScript declarations for mocks
│       ├── responses/         # Response classes
│       └── errors/            # Error classes
├── dist/                      # Compiled JavaScript output
│   ├── index.js              # Main compiled entry
│   ├── *.d.ts                # Type declaration files
│   └── lib/                  # Compiled library files
├── assets/                   # Test assets directory
├── functions/                # Test functions directory
└── tests/                    # Test files
```

## Usage Patterns

### Function Structure with Types
Functions using this library should:
1. Be written as regular async functions (not arrow functions for DI to work)
2. Use `useInjection<Data, Env, Providers>()` with proper type parameters
3. Access dependencies via `this.providers`, environment via `this.env`
4. Return Response objects or Error objects
5. Use Result pattern for internal operations: `Result.ok<T>(data)` or `Result.failed<E>(error)`

### Provider Pattern with Types
Providers are injected functions that receive:
- `this.client: Twilio` - Twilio client instance
- `this.env: Env` - Typed environment variables
- Should return Result objects for consistent error handling

### Testing Pattern
1. Export both the function and handler from your function files
2. Import the function (not handler) in tests
3. Use `useMock()` to create testable version with mocked providers
4. Set up test environment with `NODE_ENV=test`
5. Mock Twilio API calls appropriately
6. Import `require('twilio-functions-utils/dist/lib/twilio.mock.js')` for mocking

## Configuration

### Jest Configuration
- Uses ts-jest preset for TypeScript support
- Node test environment
- Verbose output enabled
- Tests match patterns: `**/tests/**/*.[jt]s?(x)` and `**/?(*.)+(spec|test).[jt]s?(x)`
- Ignores `assets/`, `functions/`, and `dist/` directories
- Sets up Twilio mocking automatically

### TypeScript Configuration
- Strict type checking enabled
- ES2018 target with CommonJS modules
- Declaration files and source maps generated
- Supports experimental decorators
- Resolves JSON modules

### Directory Structure Support
- Supports both `./functions` and `./src/functions` structures
- Supports both `./assets` and `./src/assets` structures
- Automatically detects and uses appropriate structure during testing

## Key Dependencies

- `twilio` - Core Twilio SDK
- `@twilio/runtime-handler` - Twilio runtime support
- `twilio-flex-token-validator` - Token validation for Flex applications
- `lodash` - Utility functions for object manipulation
- `@folder/readdir` - Directory reading utilities for testing
- `typescript` - TypeScript compiler
- `ts-jest` - Jest TypeScript support
- `@types/*` - Type definitions for dependencies