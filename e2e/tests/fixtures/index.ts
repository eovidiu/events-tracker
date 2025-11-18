import { test as base, Page } from '@playwright/test'

export interface TestData {
  users: {
    alice: { email: string; name: string }
    bob: { email: string; name: string }
    charlie: { email: string; name: string }
  }
  teams: {
    engineering: { id: string; name: string }
    marketing: { id: string; name: string }
  }
}

export interface ApiHelper {
  login: (email: string) => Promise<void>
  logout: () => Promise<void>
  createEvent: (data: any) => Promise<any>
  getEvents: () => Promise<any[]>
}

type CustomFixtures = {
  authenticatedPage: Page
  testData: TestData
  apiHelper: ApiHelper
}

/**
 * Extend Playwright test with custom fixtures
 */
export const test = base.extend<CustomFixtures>({
  // Test data fixture - provides access to seeded test data
  testData: async ({}, use) => {
    const data: TestData = {
      users: {
        alice: { email: 'alice@example.com', name: 'Alice Johnson' },
        bob: { email: 'bob@example.com', name: 'Bob Smith' },
        charlie: { email: 'charlie@example.com', name: 'Charlie Davis' },
      },
      teams: {
        engineering: {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Engineering Team',
        },
        marketing: {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Marketing Team',
        },
      },
    }
    await use(data)
  },

  // API helper fixture - provides methods for direct API calls
  apiHelper: async ({ page }, use) => {
    const helper: ApiHelper = {
      login: async (email: string) => {
        const response = await page.request.post('http://localhost:3000/api/v1/auth/login', {
          data: { email },
        })
        if (!response.ok()) {
          throw new Error(`Login failed: ${response.status()}`)
        }
        // Store cookies from the response
        const cookies = response.headers()['set-cookie']
        if (cookies) {
          await page.context().addCookies(
            cookies.split(',').map((cookie: string) => {
              const [nameValue] = cookie.split(';')
              const [name, value] = nameValue.split('=')
              return {
                name: name.trim(),
                value: value.trim(),
                domain: 'localhost',
                path: '/',
              }
            })
          )
        }
      },

      logout: async () => {
        await page.request.post('http://localhost:3000/api/v1/auth/logout')
      },

      createEvent: async (data: any) => {
        const response = await page.request.post('http://localhost:3000/api/v1/events', {
          data,
        })
        return response.json()
      },

      getEvents: async () => {
        const response = await page.request.get('http://localhost:3000/api/v1/events')
        return response.json()
      },
    }

    await use(helper)
  },

  // Authenticated page fixture - provides a page with logged-in user (alice)
  authenticatedPage: async ({ page, testData }, use) => {
    // Navigate to login page
    await page.goto('/login')

    // Fill in email and submit
    await page.getByLabel('Email').fill(testData.users.alice.email)
    await page.getByRole('button', { name: 'Login' }).click()

    // Wait for redirect to dashboard page (default after login)
    await page.waitForURL('/dashboard')

    // Navigate to events page for tests that expect it
    await page.goto('/events')
    await page.waitForLoadState('networkidle')

    // Provide the authenticated page to the test
    await use(page)

    // Cleanup: logout after test
    const logoutButton = page.getByRole('button', { name: /logout/i })
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
    }
  },
})

export { expect } from '@playwright/test'
