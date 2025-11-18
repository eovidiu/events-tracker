import { db, sqlite } from './client.js'
import { users, teams, teamMembers, events } from './schema.js'

console.log('🌱 Seeding database...')

try {
  // Create test users
  const testUsers = await db.insert(users).values([
    {
      id: 'user-alice',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      hashedPassword: null, // In production, use proper password hashing
    },
    {
      id: 'user-bob',
      email: 'bob@example.com',
      name: 'Bob Smith',
      hashedPassword: null,
    },
    {
      id: 'user-charlie',
      email: 'charlie@example.com',
      name: 'Charlie Davis',
      hashedPassword: null,
    },
  ]).returning()

  console.log(`✅ Created ${testUsers.length} users`)

  // Create test teams
  const testTeams = await db.insert(teams).values([
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Engineering Team',
      description: 'Software engineering team',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Marketing Team',
      description: 'Marketing and communications team',
    },
  ]).returning()

  console.log(`✅ Created ${testTeams.length} teams`)

  // Create team memberships
  const testMemberships = await db.insert(teamMembers).values([
    {
      userId: 'user-alice',
      teamId: '11111111-1111-1111-1111-111111111111',
      role: 'owner',
    },
    {
      userId: 'user-bob',
      teamId: '11111111-1111-1111-1111-111111111111',
      role: 'admin',
    },
    {
      userId: 'user-charlie',
      teamId: '22222222-2222-2222-2222-222222222222',
      role: 'admin',
    },
    {
      userId: 'user-alice',
      teamId: '22222222-2222-2222-2222-222222222222',
      role: 'member',
    },
  ]).returning()

  console.log(`✅ Created ${testMemberships.length} team memberships`)

  // Create sample events
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const testEvents = await db.insert(events).values([
    {
      teamId: '11111111-1111-1111-1111-111111111111',
      title: 'Team Planning Meeting',
      description: 'Q1 planning and retrospective',
      location: 'Conference Room A',
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
      timezone: 'America/Los_Angeles',
      createdBy: 'user-alice',
    },
    {
      teamId: '11111111-1111-1111-1111-111111111111',
      title: 'Engineering Offsite',
      description: 'Team building and technical workshops',
      location: 'Mountain View Campus',
      startDate: nextWeek,
      endDate: new Date(nextWeek.getTime() + 8 * 60 * 60 * 1000), // Full day
      timezone: 'America/Los_Angeles',
      createdBy: 'user-bob',
    },
    {
      teamId: '22222222-2222-2222-2222-222222222222',
      title: 'Marketing Campaign Review',
      description: 'Review Q4 campaign results',
      location: 'Online (Zoom)',
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 1 * 60 * 60 * 1000), // 1 hour
      timezone: 'UTC',
      createdBy: 'user-charlie',
    },
  ]).returning()

  console.log(`✅ Created ${testEvents.length} sample events`)

  console.log('🎉 Database seeding completed successfully!')
} catch (error) {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
} finally {
  sqlite.close()
}
