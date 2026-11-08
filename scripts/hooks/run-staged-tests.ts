import { execFileSync } from 'node:child_process'

const stagedFiles = execFileSync('git', ['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'], {
  encoding: 'utf8',
})
  .split('\0')
  .filter(Boolean)

const testableFiles = stagedFiles.filter(file => {
  if (!file.startsWith('src/')) return false
  if (!/\.(?:js|jsx|ts|tsx)$/.test(file)) return false
  if (/\.d\.ts$|[-.]dto\.[jt]sx?$|[-.]types\.[jt]sx?$|[-.]interface\.[jt]sx?$/.test(file)) return false
  return true
})

if (testableFiles.length === 0) {
  console.log('No testable staged source files found. Skipping related tests.')
  process.exit(0)
}

console.log(`Running tests related to ${testableFiles.length} staged source file(s).`)
execFileSync('npx', ['--no-install', 'jest', '--findRelatedTests', '--passWithNoTests', ...testableFiles], {
  stdio: 'inherit',
})
