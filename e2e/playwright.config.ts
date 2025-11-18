import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for Events Tracker E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  // Run tests sequentially to avoid database conflicts
  fullyParallel: false,
  workers: 1,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter to use
  reporter: [
    ['html'],
    ['list'],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL for page.goto('/')
    baseURL: 'http://localhost:5173',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on first retry
    video: 'retain-on-failure',
  },

  // Configure projects for Chromium only
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Global setup to start servers and seed database
  globalSetup: require.resolve('./global-setup.ts'),

  // Global teardown to stop servers and cleanup
  globalTeardown: require.resolve('./global-teardown.ts'),

  // Don't run dev server (we manage it in global setup)
  webServer: undefined,
})
