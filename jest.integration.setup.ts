import { mkdirSync, rmSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const workerId = process.env.JEST_WORKER_ID
const runId = process.env.TEST_RUN_ID ?? process.pid.toString()

if (workerId) {
  process.env.DATABASE_URL = `mongodb://root:secret@127.0.0.1:27018/genesis_test_${runId}_${workerId}?authSource=admin`
}

const composeFile = 'docker/docker-compose.yml'
const service = 'mongo-test'
const lockPath = '/tmp/genesis-app-mongo-test.lock'

function hasErrorCode(cause: unknown, code: string): boolean {
  return cause instanceof Error && 'code' in cause && cause.code === code
}

async function acquireLock(): Promise<void> {
  const timeout = Date.now() + 120_000

  while (true) {
    try {
      mkdirSync(lockPath)
      return
    } catch (cause) {
      if (!hasErrorCode(cause, 'EEXIST')) {
        throw cause
      }

      try {
        if (Date.now() - statSync(lockPath).mtimeMs > 120_000) {
          rmSync(lockPath, { recursive: true, force: true })
          continue
        }
      } catch (cause) {
        if (!hasErrorCode(cause, 'ENOENT')) {
          throw cause
        }
      }

      if (Date.now() >= timeout) {
        throw new Error('Timed out waiting for the MongoDB test container lock.')
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

export default async function globalSetup(): Promise<void> {
  await acquireLock()

  try {
    const result = spawnSync('docker', ['compose', '-f', composeFile, 'up', '-d', '--wait', service], {
      stdio: 'inherit',
    })

    if (result.error) {
      throw result.error
    }

    if (result.status !== 0) {
      throw new Error('Could not start the MongoDB test container.')
    }
  } finally {
    rmSync(lockPath, { recursive: true, force: true })
  }
}
