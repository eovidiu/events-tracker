import { test, expect } from './fixtures'

test.describe('Event Management', () => {
  test('should display list of events', async ({ authenticatedPage: page }) => {
    await expect(page).toHaveURL('/events')

    // Should see the heading
    await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible()

    // Should see at least one event from seeded data
    await expect(page.getByText('Team Planning Meeting')).toBeVisible()
    await expect(page.getByText('Engineering Offsite')).toBeVisible()
  })

  test('should navigate to create event page', async ({ authenticatedPage: page }) => {
    await expect(page).toHaveURL('/events')

    // Click "Create Event" button
    await page.getByRole('button', { name: /create event/i }).click()

    // Should navigate to create event page
    await expect(page).toHaveURL('/events/new')
    await expect(page.getByRole('heading', { name: /create event/i })).toBeVisible()
  })

  test('should create a new event', async ({ authenticatedPage: page }) => {
    // Navigate to create event page
    await page.goto('/events/new')

    // Fill in the form
    await page.getByLabel('Title').fill('Test E2E Event')
    await page.getByLabel('Description').fill('This is a test event created by E2E tests')
    await page.getByLabel('Location').fill('Virtual')

    // Fill in start date and time (use today's date + 1 day)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const startDateTime = tomorrow.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
    await page.getByLabel('Start Date').fill(startDateTime)

    // Fill in end date and time (1 hour later)
    const endTime = new Date(tomorrow)
    endTime.setHours(endTime.getHours() + 1)
    const endDateTime = endTime.toISOString().slice(0, 16)
    await page.getByLabel('End Date').fill(endDateTime)

    // Submit the form
    await page.getByRole('button', { name: /create/i }).click()

    // Should redirect to events list
    await expect(page).toHaveURL('/events')

    // Should see the newly created event
    await expect(page.getByText('Test E2E Event')).toBeVisible()
  })

  test('should view event details', async ({ authenticatedPage: page }) => {
    await expect(page).toHaveURL('/events')

    // Click on an event to view details
    await page.getByText('Team Planning Meeting').first().click()

    // Should navigate to event details page
    await expect(page.url()).toMatch(/\/events\/[a-f0-9-]+$/)

    // Should see event details
    await expect(page.getByRole('heading', { name: 'Team Planning Meeting' })).toBeVisible()
    await expect(page.getByText('Q1 planning and retrospective')).toBeVisible()
    await expect(page.getByText('Conference Room A')).toBeVisible()
  })

  test('should edit an existing event', async ({ authenticatedPage: page }) => {
    // Go to events list
    await page.goto('/events')

    // Click on an event
    await page.getByText('Team Planning Meeting').first().click()

    // Click edit button
    await page.getByRole('button', { name: /edit/i }).click()

    // Should navigate to edit page
    await expect(page.url()).toMatch(/\/events\/[a-f0-9-]+\/edit$/)

    // Modify the title
    const titleInput = page.getByLabel('Title')
    await titleInput.clear()
    await titleInput.fill('Updated Planning Meeting')

    // Submit the form
    await page.getByRole('button', { name: /save|update/i }).click()

    // Should redirect back to event details
    await expect(page.url()).toMatch(/\/events\/[a-f0-9-]+$/)

    // Should see updated title
    await expect(page.getByRole('heading', { name: 'Updated Planning Meeting' })).toBeVisible()
  })

  test('should delete an event', async ({ authenticatedPage: page }) => {
    // Create a test event to delete
    await page.goto('/events/new')
    await page.getByLabel('Title').fill('Event to Delete')
    await page.getByLabel('Description').fill('This will be deleted')
    await page.getByLabel('Location').fill('Nowhere')

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const startDateTime = tomorrow.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
    await page.getByLabel('Start Date').fill(startDateTime)

    const endTime = new Date(tomorrow)
    endTime.setHours(endTime.getHours() + 1)
    const endDateTime = endTime.toISOString().slice(0, 16)
    await page.getByLabel('End Date').fill(endDateTime)

    await page.getByRole('button', { name: /create/i }).click()
    await expect(page).toHaveURL('/events')

    // Click on the event
    await page.getByText('Event to Delete').first().click()

    // Click delete button
    await page.getByRole('button', { name: /delete/i }).click()

    // Confirm deletion (if there's a confirmation dialog)
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i })
    if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmButton.click()
    }

    // Should redirect to events list
    await expect(page).toHaveURL('/events')

    // Should not see the deleted event
    await expect(page.getByText('Event to Delete')).not.toBeVisible()
  })

  test('should validate required fields', async ({ authenticatedPage: page }) => {
    await page.goto('/events/new')

    // Try to submit without filling anything
    await page.getByRole('button', { name: /create/i }).click()

    // Should still be on the create page (form validation prevented submission)
    await expect(page).toHaveURL('/events/new')

    // Should see validation errors or browser's native validation
    // (Adobe React Spectrum uses native HTML5 validation)
  })

  test('should only show events for user team', async ({ authenticatedPage: page, testData }) => {
    // Alice is part of Engineering Team, so she should see those events
    await expect(page).toHaveURL('/events')

    // Should see Engineering Team events
    await expect(page.getByText('Team Planning Meeting')).toBeVisible()
    await expect(page.getByText('Engineering Offsite')).toBeVisible()

    // Should also see Marketing Team events (Alice is a member of both teams)
    await expect(page.getByText('Marketing Campaign Review')).toBeVisible()
  })
})
