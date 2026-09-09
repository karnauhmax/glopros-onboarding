import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * The app router as a set of spies. Tests hand it to a `jest.mock('next/navigation', …)` factory
 * and assert on `push` / `replace` instead of on a navigation that jsdom cannot perform.
 */
export function createRouterMock(): AppRouterInstance {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    bfcacheId: 'test-bfcache-id',
  };
}
