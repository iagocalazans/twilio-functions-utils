// Jest setup file
// Ensure NODE_ENV is set to test
process.env.NODE_ENV = 'test';

// Import Twilio mock to set up globals
require('./dist/lib/twilio.mock.js');