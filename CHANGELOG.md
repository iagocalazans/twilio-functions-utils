# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Released]

## [2.5.0] - 2025-01-06

### 🚀 Major Features

#### **RxJS-Powered Architecture**
- **Complete rewrite** of the core dependency injection system using RxJS reactive streams
- **100% backward compatibility** - all existing code works without any changes
- Enhanced performance through optimized stream processing
- Better error handling and recovery mechanisms

#### **Dual API Architecture**
- **Original API**: Maintains exact same interface but now powered by RxJS internally
- **RxJS Effects API**: New advanced API for reactive programming patterns
- Seamless interoperability between both APIs in the same project

### ✨ New Features

#### **RxJS Effects API**
- `twilioEffect()` - Main wrapper for creating reactive Twilio Functions
- Stream-based composition with functional programming approach
- Advanced error handling and automatic recovery

#### **Comprehensive Operator Library**
- **Injection Operators**: `injectEvent()`, `injectEnv()`, `injectClient()`, `injectProviders()`, `inject()`, `injectMany()`
- **Validation Operators**: `requireFields()`, `validateEvent()`, `requireEnvVars()`, `authenticated()`, `transformEvent()`
- **Response Operators**: `ok()`, `created()`, `accepted()`, `noContent()`, `toJsonResponse()`, `toTwiMLResponse()`, `redirect()`, `apiResponse()`, `withHeaders()`
- **Error Handling Operators**: `handleError()`, `retryWithBackoff()`, `timeoutWithError()`, `validate()`, `fallback()`, `ensureResponse()`
- **Flex Token Operators**: `validateFlexToken()`, `validateFlexTokenWithOptions()`, `requireFlexAuth()`
- **Result Pattern Operators**: `handleResult()`, `toResultOk()`, `toResultFailed()`, `toResult()`, `mapResult()`, `switchMapResult()`

#### **Advanced Testing Capabilities**
- **Marble Testing**: `marbleTest()` for complex stream timing tests
- **Effect Testing**: `testEffect()`, `mockEffect()`, `createEffectTestHarness()`
- **Enhanced Mocking**: RxJS-powered mock system with same API
- Stream assertion utilities: `expectEmissions()`, `expectError()`

### 🔧 Technical Improvements

#### **TypeScript Migration**
- **Complete TypeScript rewrite** from JavaScript
- Full type safety with proper generic inference
- Comprehensive type definitions for both APIs
- Enhanced IDE support and autocomplete

#### **Enhanced Error Handling**
- Stream-based error processing
- Automatic error recovery mechanisms
- Better error propagation and debugging
- Enhanced error context and stack traces

#### **Performance Optimizations**
- Optimized stream processing with RxJS
- Reduced memory footprint
- Better garbage collection through proper stream disposal
- Improved async operation handling

### 📚 Documentation & Examples

#### **Comprehensive Documentation Updates**
- System requirements and compatibility guide
- Development setup instructions
- Complete TypeScript usage examples
- Troubleshooting section with common issues and solutions
- Community and support resources

#### **New Examples**
- RxJS Effects usage examples
- TypeScript integration examples
- Testing examples with marble testing
- Migration comparison guide
- Backward compatibility demonstrations

### 🧪 Testing Infrastructure

#### **Enhanced Test Suite**
- Complete test coverage for RxJS architecture
- Marble testing for complex stream scenarios
- TypeScript test compilation
- Enhanced mock infrastructure
- Performance regression tests

#### **Test Utilities**
- `marbleTest()` for marble testing
- `testEffect()` for Promise-based Effect testing
- `mockEffect()` for Observable-based Effect testing
- `createEffectTestHarness()` for reusable test setups

### 🔄 Migration Notes

#### **Zero Breaking Changes**
- All existing v2.4.x code works without modification
- Same function signatures and behavior
- Same `this` context patterns in handlers
- Same Result pattern and error handling
- Same testing approaches

#### **New Capabilities Available**
- Optional RxJS Effects API for advanced use cases
- Enhanced error handling with stream recovery
- Marble testing for complex scenarios
- Functional composition with operator libraries
- Better performance through stream optimization

### 📦 Dependencies

#### **New Dependencies**
- `rxjs@^7.8.2` - Core reactive programming library

#### **Updated Dependencies**
- Full TypeScript development environment
- Enhanced testing infrastructure
- Updated build pipeline

### 🏗 Build System

#### **TypeScript Compilation**
- New TypeScript build pipeline
- Enhanced type checking and inference
- Optimized output for both CommonJS and ES modules
- Source maps and declaration files

#### **Development Experience**
- Enhanced IDE support with full TypeScript types
- Better debugging with source maps
- Improved error messages and stack traces
- Hot reload support for development

### 📋 Files Changed

#### **New Files**
- `src/` - Complete TypeScript source tree
- `src/lib/effects/` - RxJS Effects system
- `src/lib/operators/` - Comprehensive operator library
- `src/lib/testing/` - Enhanced testing utilities
- `examples/rxjs-effects-example.js` - RxJS Effects examples
- `examples/testing-effects-example.test.js` - Testing examples
- `examples/migration-comparison.md` - Migration guide
- `tsconfig.json` - TypeScript configuration

#### **Enhanced Files**
- `README.md` - Comprehensive documentation update
- `package.json` - Updated to v2.5.0 with new dependencies
- All test files updated with TypeScript and RxJS testing
- Enhanced examples and documentation

### 🎯 Use Cases

This release enables:
- **Simple Migration**: Drop-in replacement with enhanced performance
- **Advanced Workflows**: Complex reactive programming with RxJS
- **Better Testing**: Marble testing and enhanced mocking
- **Type Safety**: Full TypeScript support with inference
- **Performance**: Optimized stream processing and error handling

### 🤝 Compatibility

- **Node.js**: >= 14.0.0
- **Twilio Runtime**: Full compatibility maintained
- **TypeScript**: >= 5.0.0 (for TypeScript projects)
- **Existing Code**: 100% backward compatible

## [2.4.1] - 2024-XX-XX

Previous release with JavaScript-based architecture.

## [2.3.0] - 2022-08-29

### Added

- feat(*): ✨ feat the new Result class [b4e24152d1bfc389e9222ab6f5e2206008ec63c3] @iagocalazans

### Tested

- test(*): ✅ Test almost 100% [2bf590597527aa101b869cbd3ba545bfa227d29a] @iagocalazans

### Changed

- fix: exporting unauthorized error [f155a00070312c61792022502b263748552001bb] @iagocalazans
- fix: fixed syncMapItems Resolved value error [c7c35c9a962b9ba62236db9a6786e4efa3abe3ba] @iagocalazans
- fix: made catch similar to original injection [4b639dca7d41cbdc09abf129c053b2fc768900b3] @iagocalazans
- fix: 🐛 Fix client mock and improving Sync capabilities [e8ecf5fafb7ff9d2aab347730bf73940aa701290] @iagocalazans
- fix(*): 🐛 Fix limited useMock customizations [35cac5d1ce7c67a679362a8afbf11fffd04ddafd] @iagocalazans

## [2.2.0] - 2022-08-03

### Added

- test(*): ✅ Test Increasing test coverage [5b5fa738636cc149688c3cd7f85c8fd64a0b0f4a] @iagocalazans
- ci(travis): Travis and Coveralls [477abe342d50dd4d3d489af3fe55d9248a2ac378] @iagocalazans

### Changed

- docs(*): Incrementing README description [d1d2e79eddedc9478e5bac5baab5207f740c741b] @iagocalazans

[Released]: https://github.com/iagocalazans/twilio-functions-utils/compare/v2.3.0...HEAD
[2.3.0]: https://github.com/iagocalazans/twilio-functions-utils/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/iagocalazans/twilio-functions-utils/compare/v1.0.0...v2.2.0
