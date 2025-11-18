import { FullConfig } from '@playwright/test'
import { ChildProcess } from 'child_process'

async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 Cleaning up E2E test environment...\n')

  const backendProcess = global.__BACKEND_PROCESS__ as ChildProcess | undefined
  const frontendProcess = global.__FRONTEND_PROCESS__ as ChildProcess | undefined

  // Kill backend server
  if (backendProcess) {
    console.log('🛑 Stopping backend server...')
    backendProcess.kill('SIGTERM')
    // Wait a bit for graceful shutdown
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (!backendProcess.killed) {
      backendProcess.kill('SIGKILL')
    }
  }

  // Kill frontend server
  if (frontendProcess) {
    console.log('🛑 Stopping frontend server...')
    frontendProcess.kill('SIGTERM')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (!frontendProcess.killed) {
      frontendProcess.kill('SIGKILL')
    }
  }

  console.log('✅ E2E test environment cleaned up!\n')
}

export default globalTeardown
