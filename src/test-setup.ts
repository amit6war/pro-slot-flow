import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock crypto for security functions
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    subtle: {
      importKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    },
  },
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://localhost:3000',
    protocol: 'https:',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    origin: 'https://localhost:3000',
  },
  writable: true,
});

// Mock localStorage and sessionStorage
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    length: 0,
    key: vi.fn(),
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
};

// Mock environment variables
vi.mock('@/lib/env', () => ({
  env: {
    VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_mock_key',
    VITE_SUPABASE_URL: 'https://mock.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'mock_supabase_key',
  },
}));

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
  }),
  
  createMockCartItem: (overrides = {}) => ({
    id: 'test-item-1',
    serviceId: 'service-1',
    serviceName: 'Test Service',
    price: 99.99,
    quantity: 1,
    selectedDate: '2024-01-15',
    selectedTime: '10:00',
    ...overrides,
  }),
  
  createMockPaymentIntent: () => ({
    id: 'pi_test_123',
    client_secret: 'pi_test_123_secret_test',
    amount: 9999,
    currency: 'usd',
    status: 'requires_payment_method',
  }),
};

// Extend global types
declare global {
  var testUtils: {
    createMockUser: () => any;
    createMockCartItem: (overrides?: any) => any;
    createMockPaymentIntent: () => any;
  };
}