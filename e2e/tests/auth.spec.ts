import { test, expect } from './fixtures'

test.describe('Authentication', () => {
  test('should login with valid email', async ({ page, testData }) => {
    await page.goto('/login')

    // Fill in login form
    await page.getByLabel('Email').fill(testData.users.alice.email)
    await page.getByRole('button', { name: 'Login' }).click()

    // Should redirect to events page
    await expect(page).toHaveURL('/events')

    // Should display user email
    await expect(page.getByText(testData.users.alice.email)).toBeVisible()
  })

  test('should show error for invalid email', async ({ page }) => {
    await page.goto('/login')

    // Fill in invalid email
    await page.getByLabel('Email').fill('nonexistent@example.com')
    await page.getByRole('button', { name: 'Login' }).click()

    // Should stay on login page and show error
    await expect(page).toHaveURL('/login')
    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })

  test('should logout successfully', async ({ authenticatedPage: page, testData }) => {
    // Already authenticated via fixture
    await expect(page).toHaveURL('/events')
    await expect(page.getByText(testData.users.alice.email)).toBeVisible()

    // Click logout button
    await page.getByRole('button', { name: /logout/i }).click()

    // Should redirect to login page
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Please login to continue')).toBeVisible()
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access events page directly without authentication
    await page.goto('/events')

    // Should redirect to login page
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Please login to continue')).toBeVisible()
  })

  test('should persist session on page refresh', async ({ authenticatedPage: page, testData }) => {
    // Already authenticated via fixture
    await expect(page).toHaveURL('/events')

    // Refresh the page
    await page.reload()

    // Should still be on events page (not redirected to login)
    await expect(page).toHaveURL('/events')
    await expect(page.getByText(testData.users.alice.email)).toBeVisible()
  })

  test('should redirect authenticated user from login to events', async ({
    authenticatedPage: page,
  }) => {
    // Already authenticated, try to go to login page
    await page.goto('/login')

    // Should redirect to events page
    await expect(page).toHaveURL('/events')
  })
})
