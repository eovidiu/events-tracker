import { chromium, FullConfig } from '@playwright/test'
import { spawn, ChildProcess } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

let backendProcess: ChildProcess | null = null
let frontendProcess: ChildProcess | null = null

async function globalSetup(config: FullConfig) {
  console.log('\n🚀 Starting E2E test environment setup...\n')

  // Get project root (one level up from e2e directory)
  const projectRoot = path.resolve(__dirname, '..')
  const dbPath = path.join(projectRoot, 'apps/backend/database.sqlite')
  const dbShmPath = path.join(projectRoot, 'apps/backend/database.sqlite-shm')
  const dbWalPath = path.join(projectRoot, 'apps/backend/database.sqlite-wal')

  // Clean up existing database and SQLite temp files
  console.log('🗑️  Removing existing database...')
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath)
  }
  if (fs.existsSync(dbShmPath)) {
    fs.unlinkSync(dbShmPath)
  }
  if (fs.existsSync(dbWalPath)) {
    fs.unlinkSync(dbWalPath)
  }

  // Run database migrations
  console.log('📊 Running database migrations...')
  await runCommand('pnpm --filter @events-tracker/backend migrate', projectRoot)

  // Seed test data
  console.log('🌱 Seeding test data...')
  await runCommand('pnpm --filter @events-tracker/backend seed', projectRoot)

  // Start backend server
  console.log('🔧 Starting backend server...')
  backendProcess = spawn('pnpm', ['--filter', '@events-tracker/backend', 'dev'], {
    cwd: projectRoot,
    shell: true,
    stdio: 'pipe',
  })

  // Capture backend logs
  let backendOutput = ''
  backendProcess.stdout?.on('data', (data) => {
    backendOutput += data.toString()
  })
  backendProcess.stderr?.on('data', (data) => {
    backendOutput += data.toString()
  })

  // Wait for backend to be ready
  await waitForServer('http://localhost:3000/health', 'Backend', 30000, () => backendOutput)

  // Start frontend server
  console.log('🎨 Starting frontend server...')
  frontendProcess = spawn('pnpm', ['--filter', '@events-tracker/frontend', 'dev'], {
    cwd: projectRoot,
    shell: true,
    stdio: 'pipe',
  })

  // Capture frontend logs
  let frontendOutput = ''
  frontendProcess.stdout?.on('data', (data) => {
    frontendOutput += data.toString()
  })
  frontendProcess.stderr?.on('data', (data) => {
    frontendOutput += data.toString()
  })

  // Wait for frontend to be ready
  await waitForServer('http://localhost:5173', 'Frontend', 30000, () => frontendOutput)

  console.log('✅ E2E test environment ready!\n')

  // Store process handles globally for teardown
  global.__BACKEND_PROCESS__ = backendProcess
  global.__FRONTEND_PROCESS__ = frontendProcess
}

async function runCommand(command: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, {
      cwd,
      shell: true,
      stdio: 'inherit',
    })

    proc.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${command}`))
      }
    })

    proc.on('error', reject)
  })
}

async function waitForServer(
  url: string,
  name: string,
  timeout: number,
  getOutput: () => string
): Promise<void> {
  const startTime = Date.now()
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  while (Date.now() - startTime < timeout) {
    try {
      const response = await page.goto(url, { timeout: 2000, waitUntil: 'domcontentloaded' })
      if (response && response.ok()) {
        console.log(`✅ ${name} server is ready at ${url}`)
        await browser.close()
        return
      }
    } catch (error) {
      // Server not ready yet, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  await browser.close()
  console.error(`❌ ${name} server failed to start within ${timeout}ms`)
  console.error('Server output:')
  console.error(getOutput())
  throw new Error(`${name} server did not start in time`)
}

export default globalSetup
