// Twilio mock implementation for testing
// This file sets up global Twilio mock when imported in test environment

// Only set up mocks in test environment
if (process.env.NODE_ENV === 'test') {
  // Create a base Response class that mimics Twilio.Response
  class MockTwilioResponse {
    private _headers: { [key: string]: string } = {};
    private _body: any;
    private _statusCode: number;

    constructor(options: { statusCode?: number; body?: any } = {}) {
      this._statusCode = options.statusCode || 200;
      this._body = options.body;
    }

    appendHeader(key: string, value: string): void {
      this._headers[key] = value;
    }

    setBody(body: any): void {
      this._body = body;
    }

    setStatusCode(statusCode: number): void {
      this._statusCode = statusCode;
    }

    // Getters for testing
    get headers() {
      return this._headers;
    }

    get body() {
      return this._body;
    }

    get statusCode() {
      return this._statusCode;
    }
  }

  // Set up global Twilio object
  (global as any).Twilio = {
    Response: MockTwilioResponse,
    
    // Mock for Twilio client methods
    mockRequestResolvedValue: function(value: any) {
      return jest.fn().mockResolvedValue(value);
    },
    
    mockRequestImplementation: function(impl: (...args: any) => any) {
      return jest.fn().mockImplementation(impl);
    },
    
    mockRequestRejectedValue: function(error: any) {
      return jest.fn().mockRejectedValue(error);
    }
  };

  // Also set up Runtime global for legacy compatibility
  (global as any).Runtime = {
    getFunctions: jest.fn(() => ({})),
    getAssets: jest.fn(() => ({}))
  };
}

export {};
