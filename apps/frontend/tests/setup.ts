import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Mock CSS imports
vi.mock('*.css', () => ({
  default: {},
}))

// Cleanup after each test
afterEach(() => {
  cleanup()
})
