import { Pool } from "pg";

// Global test setup
beforeAll(async () => {
  // Setup test environment
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-secret";
  process.env.PORT = "3002";

  // Use test database URL if available
  if (process.env.TEST_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  }
});

afterAll(async () => {
  // Cleanup connections
  if ((global as any).pool) {
    await ((global as any).pool as Pool).end();
  }
});

beforeEach(async () => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(async () => {
  // Additional cleanup if needed
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to silence logs during tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
