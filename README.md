# Twilio Functions Utils ⚡

<img src="https://avatars.githubusercontent.com/u/109142?s=200&v=4" width="80" />

![npm](https://img.shields.io/npm/v/twilio-functions-utils?color=white&label=version&logo=npm&style=for-the-badge) ![npm](https://img.shields.io/npm/dw/twilio-functions-utils?color=white&logo=npm&style=for-the-badge) ![npms.io (final)](https://img.shields.io/npms-io/final-score/twilio-functions-utils?color=white&label=score&logo=npm&logoColor=white&style=for-the-badge) ![Coveralls](https://img.shields.io/coveralls/github/iagocalazans/twilio-functions-utils?color=white&logo=coveralls&style=for-the-badge)

## 🚀 **Next-Generation Twilio Functions Development**

A powerful, **RxJS-powered** utility library that revolutionizes Twilio serverless function development with reactive streams, functional composition, and zero-boilerplate dependency injection.

**✨ What's New in v2.4+:**
- 🔄 **Reactive Streams**: Built on RxJS for composable, testable functions
- 🎯 **Zero Breaking Changes**: 100% backward compatible with existing code
- 🧪 **Enhanced Testing**: Marble testing and advanced mocking capabilities
- 🛠 **Two API Levels**: Simple injection API + powerful Effects API
- ⚡ **Better Performance**: Optimized stream processing
- 🔒 **Type Safe**: Full TypeScript support with proper inference

```bash
npm install twilio-functions-utils
```

## 📋 **Requirements & Compatibility**

- **Node.js**: >= 14.0.0
- **Twilio Runtime**: Compatible with Twilio Functions runtime
- **TypeScript**: >= 5.0.0 (for TypeScript projects)
- **Dependencies**: RxJS 7.8.2+, Twilio SDK 3.77.2+

### **Peer Dependencies**
- `twilio` - Twilio JavaScript SDK
- `@twilio/runtime-handler` - For local development

---

## 🛠 **Development Setup**

### **Building the Project**
```bash
npm run build        # Compile TypeScript to JavaScript
npm run prebuild     # Clean build directory before building
```

### **Testing**
```bash
npm run test         # Run Jest test suite with coverage
NODE_ENV=test npm test  # Ensure test environment
```

### **Documentation**
```bash
npm run docs         # Generate JSDoc documentation
```

### **Project Structure**
The library supports flexible directory structures:
- `./functions/` or `./src/functions/` for your Twilio Functions
- `./assets/` or `./src/assets/` for static assets
- Automatically detected during testing

---

## 🎯 **Quick Start**

### **Option 1: Simple API (Familiar & Easy)**

```javascript
const { useInjection, Response, BadRequestError, Result } = require('twilio-functions-utils');

// Provider: Your business logic
const sendSmsProvider = async function (to, message) {
  const { client } = this;
  
  try {
    const result = await client.messages.create({
      to,
      from: '+1234567890',
      body: message
    });
    return Result.ok({ sid: result.sid, status: 'sent' });
  } catch (error) {
    return Result.failed(error.message);
  }
};

// Handler: Your Twilio Function
async function sendSmsHandler(event) {
  const { env, providers } = this;
  const { to, message } = event;
  
  if (!to || !message) {
    return new BadRequestError('Missing "to" or "message" parameters');
  }
  
  const result = await providers.sendSms(to, message);
  
  if (result.isError) {
    return new BadRequestError(result.error);
  }
  
  return new Response(result.data, 201);
}

// Export for Twilio
exports.handler = useInjection(sendSmsHandler, {
  providers: { sendSms: sendSmsProvider }
});
```

### **Option 2: RxJS Effects API (Advanced & Powerful)**

```javascript
const { 
  twilioEffect, 
  injectEvent, 
  injectClient, 
  requireFields, 
  ok, 
  handleError 
} = require('twilio-functions-utils');

const { switchMap, map } = require('rxjs/operators');

const sendSmsEffect = context$ => 
  context$.pipe(
    requireFields('to', 'message'),
    injectEvent(),
    injectClient(),
    switchMap(([event, client]) =>
      client.messages.create({
        to: event.to,
        from: '+1234567890',
        body: event.message
      })
    ),
    map(result => ({ sid: result.sid, status: 'sent' })),
    ok(),
    handleError()
  );

exports.handler = twilioEffect(sendSmsEffect);
```

### **TypeScript Examples**

```typescript
import { 
  useInjection, 
  Response, 
  BadRequestError, 
  Result,
  InjectorFunction,
  ProviderFunction 
} from 'twilio-functions-utils';

// Type your environment variables
interface MyEnv {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  FROM_NUMBER: string;
}

// Type your event data
interface SmsEvent {
  to: string;
  message: string;
}

// Type your providers
interface MyProviders {
  sendSms: (to: string, message: string) => Promise<Result<{ sid: string }, string>>;
}

// Provider with full typing
const sendSmsProvider: ProviderFunction<SmsEvent, MyEnv> = async function (
  to: string, 
  message: string
) {
  const { client, env } = this;
  
  try {
    const result = await client.messages.create({
      to,
      from: env.FROM_NUMBER,
      body: message
    });
    return Result.ok({ sid: result.sid });
  } catch (error: any) {
    return Result.failed(error.message);
  }
};

// Handler with full typing
const sendSmsHandler: InjectorFunction<SmsEvent, MyEnv, MyProviders> = async function (event) {
  const { env, providers } = this;
  const { to, message } = event;
  
  if (!to || !message) {
    return new BadRequestError('Missing required parameters');
  }
  
  const result = await providers.sendSms(to, message);
  
  if (result.isError) {
    return new BadRequestError(result.error);
  }
  
  return new Response(result.data, 201);
};

// Export with types
export const handler = useInjection<SmsEvent, MyEnv, MyProviders>(sendSmsHandler, {
  providers: { sendSms: sendSmsProvider }
});
```

### **RxJS Effects with TypeScript**

```typescript
import { 
  twilioEffect, 
  EffectWithContext,
  EffectContext,
  injectEvent, 
  injectClient,
  requireFields,
  ok 
} from 'twilio-functions-utils';
import { switchMap, map } from 'rxjs/operators';

interface SmsEnv {
  FROM_NUMBER: string;
}

interface SmsEvent {
  to: string;
  message: string;
}

const sendSmsEffect: EffectWithContext<SmsEnv, {}, Response> = (context$) =>
  context$.pipe(
    requireFields<SmsEvent>('to', 'message'),
    injectEvent<SmsEvent>(),
    injectClient(),
    switchMap(([event, client]) =>
      client.messages.create({
        to: event.to,
        from: process.env.FROM_NUMBER,
        body: event.message
      })
    ),
    map(result => ({ sid: result.sid, status: 'sent' })),
    ok()
  );

export const handler = twilioEffect<SmsEnv, {}>(sendSmsEffect);
```

---

## 🔥 **Core Features**

### **🎭 Dependency Injection Made Simple**

Access everything you need through clean `this` context:

```javascript
async function myHandler(event) {
  const { 
    env,        // Environment variables
    providers,  // Your business logic
    request,    // HTTP headers & data
    cookies     // Request cookies
  } = this;
  
  // Your logic here...
}
```

### **📦 Result Pattern (No More Try-Catch Hell)**

```javascript
// In your providers
const fetchUser = async function (userId) {
  const { client, env } = this;
  
  try {
    const user = await client.api.accounts(env.ACCOUNT_SID)
      .calls
      .list({ limit: 1 });
    
    return Result.ok(user[0]);
  } catch (error) {
    return Result.failed('User not found');
  }
};

// In your handlers
const userResult = await this.providers.fetchUser(event.userId);

if (userResult.isError) {
  return new NotFoundError(userResult.error);
}

return new Response(userResult.data);
```

### **🎯 Smart Response Handling**

```javascript
// JSON Responses
return new Response({ success: true, data: results }, 201);

// TwiML Responses
const twiml = new Twilio.twiml.VoiceResponse();
twiml.say('Hello from RxJS-powered Twilio!');
return new TwiMLResponse(twiml.toString());

// Error Responses
return new BadRequestError('Invalid input');
return new NotFoundError('Resource not found');
return new UnauthorizedError('Access denied');
return new InternalServerError('Something went wrong');
```

---

## 🔄 **RxJS Effects API**

For advanced use cases, leverage the full power of reactive programming:

### **Composition with Operators**

```javascript
const complexWorkflow = context$ =>
  context$.pipe(
    // Validation
    requireFields('customerId', 'action'),
    authenticated(ctx => ctx.event.token),
    
    // Data fetching
    switchMap(ctx => 
      ctx.providers.customerService.getProfile(ctx.event.customerId)
    ),
    
    // Business logic
    map(customer => ({
      id: customer.id,
      name: customer.name,
      tier: customer.subscriptions.length > 0 ? 'premium' : 'basic'
    })),
    
    // Response formatting
    apiResponse({ message: 'Profile retrieved successfully' }),
    
    // Error handling
    handleError(error => {
      if (error.code === 'CUSTOMER_NOT_FOUND') {
        return new NotFoundError('Customer not found');
      }
      return null; // Use default error handling
    })
  );
```

### **Built-in Operators**

```javascript
// Validation
requireFields('email', 'phone')
validateEvent(event => event.email.includes('@'))
authenticated(ctx => checkApiKey(ctx.event.apiKey))

// Data injection
injectEvent()           // Get event data
injectEnv()            // Get environment vars
injectClient()         // Get Twilio client
injectProviders()      // Get all providers
injectProvider('userService')  // Get specific provider

// Response formatting
ok()                   // 200 response
created()              // 201 response  
apiResponse({ meta: { version: '1.0' } })
toTwiMLResponse()      // Convert TwiML to response

// Error handling
handleError()          // Comprehensive error handling
retryWithBackoff(3)    // Retry failed operations
timeoutWithError(5000) // Timeout after 5 seconds
fallback(defaultValue) // Provide fallback value
```

---

## 🧪 **Testing Made Easy**

### **Simple Testing (Original API)**

```javascript
require('twilio-functions-utils/dist/lib/twilio.mock.js');

const { useMock, Response } = require('twilio-functions-utils');
const { myHandler } = require('../functions/myHandler');

const mockFn = useMock(myHandler, {
  providers: {
    sendSms: async (to, message) => ({ sid: 'SM123', status: 'sent' })
  },
  env: { ACCOUNT_SID: 'AC123' },
  client: { /* mock Twilio client */ }
});

test('should send SMS successfully', async () => {
  const result = await mockFn({ to: '+1234567890', message: 'Hello!' });
  
  expect(result).toBeInstanceOf(Response);
  expect(result.statusCode).toBe(201);
});
```

### **Advanced Testing (RxJS Effects)**

```javascript
const { testEffect, marbleTest, expectEmissions } = require('twilio-functions-utils');

test('should handle SMS sending with marble testing', () => {
  marbleTest(({ cold, expectObservable }) => {
    const context$ = cold('a|', {
      a: { event: { to: '+1234567890', message: 'Test' } }
    });

    const result$ = sendSmsEffect(context$);

    expectObservable(result$).toBe('a|', {
      a: expect.objectContaining({ statusCode: 200 })
    });
  });
});
```

---

## 🔒 **Flex Integration**

Built-in support for Twilio Flex token validation:

```javascript
// Simple API
exports.handler = useInjection(myHandler, {
  providers: { taskService },
  validateToken: true  // Automatically validates Flex tokens
});

// RxJS API  
const flexEffect = context$ =>
  context$.pipe(
    validateFlexToken(),  // Validates token from event.Token
    // ... rest of your logic
  );

// Custom token validation
const customFlexEffect = context$ =>
  context$.pipe(
    validateFlexTokenWithOptions({
      tokenField: 'customToken',
      onValidation: (result) => console.log('Token validated:', result)
    }),
    // ... rest of your logic
  );
```

---

## 📚 **Migration Guide**

### **From v1.x to v2.x: Zero Breaking Changes! 🎉**

Your existing code works without any modifications:

```javascript
// This code works exactly the same in v2.x
const { useInjection, Response, Result } = require('twilio-functions-utils');

async function existingHandler(event) {
  const result = await this.providers.existingProvider(event);
  return new Response(result.data);
}

exports.handler = useInjection(existingHandler, {
  providers: { existingProvider }
});
```

But now you get:
- ✅ **Better error handling** with reactive streams
- ✅ **Enhanced testing** capabilities
- ✅ **Improved performance** through optimized processing
- ✅ **Optional access** to RxJS operators when needed

---

## 🛠 **API Reference**

### **Core Functions**

| Function | Description |
|----------|-------------|
| `useInjection(fn, options)` | Main dependency injection wrapper |
| `twilioEffect(effect, options)` | RxJS Effects wrapper |
| `useMock(fn, options)` | Testing utility (test environment only) |

### **Response Classes**

| Class | Status Code | Usage |
|-------|-------------|-------|
| `Response(body, statusCode)` | Custom | General responses |
| `TwiMLResponse(twiml)` | 200 | TwiML responses |
| `BadRequestError(message)` | 400 | Invalid input |
| `UnauthorizedError(message)` | 401 | Authentication required |
| `NotFoundError(message)` | 404 | Resource not found |
| `InternalServerError(message)` | 500 | Server errors |

### **Utility Classes**

| Class | Description |
|-------|-------------|
| `Result.ok(data)` | Success result wrapper |
| `Result.failed(error)` | Error result wrapper |
| `typeOf(value)` | Enhanced type checking |

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **"Module not found" Error**
```bash
# Ensure you've installed the package
npm install twilio-functions-utils

# For TypeScript projects, ensure proper types
npm install --save-dev typescript @types/node
```

#### **Testing Issues**
```javascript
// ❌ Wrong - Missing mock import
const { useMock } = require('twilio-functions-utils');

// ✅ Correct - Import mock first
require('twilio-functions-utils/dist/lib/twilio.mock.js');
const { useMock } = require('twilio-functions-utils');

// Ensure NODE_ENV=test
process.env.NODE_ENV = 'test';
```

#### **RxJS Operator Issues**
```bash
# Ensure RxJS is installed
npm install rxjs@^7.8.2

# Import operators correctly
const { switchMap, map } = require('rxjs/operators');
```

#### **TypeScript Compilation Errors**
```json
// tsconfig.json - Ensure proper configuration
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

#### **Runtime Context Issues**
```javascript
// ❌ Wrong - Arrow functions lose 'this' context
const handler = (event) => {
  // 'this' is undefined here
};

// ✅ Correct - Use regular functions
async function handler(event) {
  // 'this' context available here
  const { env, providers } = this;
}
```

### **Performance Tips**

- Use `injectMany()` instead of multiple `inject()` calls
- Leverage RxJS operators for complex data transformations
- Use `Result` pattern to avoid try-catch overhead
- Enable TypeScript strict mode for better optimization

### **Getting Help**

- 📖 Check [documentation](https://iagocalazans.github.io/twilio-functions-utils)
- 🐛 Report bugs on [GitHub Issues](https://github.com/iagocalazans/twilio-functions-utils/issues)
- 💬 Ask questions in [Twilio Community](https://www.twilio.com/community)

---

## 🤝 **Contributing**

We welcome contributions! Here's how you can help:

1. **🐛 Report bugs** - Open an issue with reproduction steps
2. **💡 Suggest features** - Describe your use case and proposed solution  
3. **📝 Improve docs** - Help make our documentation clearer
4. **🧪 Write tests** - Add test cases for new features
5. **🔧 Submit PRs** - Follow our coding standards and include tests

---

## 🌟 **Community & Support**

### **📚 Resources**
- 🏠 **[Project Homepage](https://iagocalazans.github.io/twilio-functions-utils)** - Documentation and guides
- 📦 **[NPM Package](https://www.npmjs.com/package/twilio-functions-utils)** - Package details and versions
- 🐙 **[GitHub Repository](https://github.com/iagocalazans/twilio-functions-utils)** - Source code and issues

### **🆘 Getting Help**
- 🐛 **[Report Issues](https://github.com/iagocalazans/twilio-functions-utils/issues)** - Bug reports and feature requests
- 💬 **[Twilio Community](https://www.twilio.com/community)** - General Twilio development discussions
- 📧 **[Contact Author](mailto:iago.calazans@gmail.com)** - Direct support for complex issues

### **🤝 Contributing**
- 🔀 **[Pull Requests](https://github.com/iagocalazans/twilio-functions-utils/pulls)** - Code contributions welcome
- 📖 **[Contributing Guide](https://github.com/iagocalazans/twilio-functions-utils/blob/master/CONTRIBUTING.md)** - How to contribute
- 🧪 **[Running Tests](https://github.com/iagocalazans/twilio-functions-utils#testing)** - Test your changes

### **📊 Project Stats**
- ![npm downloads](https://img.shields.io/npm/dw/twilio-functions-utils?style=flat-square)
- ![GitHub stars](https://img.shields.io/github/stars/iagocalazans/twilio-functions-utils?style=flat-square)
- ![GitHub issues](https://img.shields.io/github/issues/iagocalazans/twilio-functions-utils?style=flat-square)
- ![Coverage Status](https://img.shields.io/coveralls/github/iagocalazans/twilio-functions-utils?style=flat-square)

---

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 **Author**

**[Iago Calazans](https://github.com/iagocalazans)** - Senior Node.js Engineer

---

<div align="center">

**⭐ If this library helps you build amazing Twilio Functions, give it a star! ⭐**

Made with ❤️ and ☕ for the Twilio community

</div>