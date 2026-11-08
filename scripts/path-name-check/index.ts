import { readdirSync, renameSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { basename, dirname, join } from 'node:path'
import chalk from 'chalk'
import { table } from 'table'

type Action = 'list' | 'fix'
type Scope = 'all' | 'changed' | 'staged'

type Issue = {
  action: Action
  original: string
  fixed: string
}

const ignoredDirectories = new Set(['.git', '.next', 'build', 'coverage', 'node_modules', 'out'])

class PathNameCheck {
  constructor(
    private readonly action: Action,
    private readonly scope: Scope,
  ) {}

  private lintPath(path: string): Issue | null {
    const fixed = join(dirname(path), basename(path).trim())

    if (path === fixed) return null

    if (this.action === 'fix') {
      renameSync(path, fixed)
    }

    return { action: this.action, original: path, fixed }
  }

  private lintDirectory(directory: string): Issue[] {
    const issues: Issue[] = []

    for (const item of readdirSync(directory)) {
      if (directory === '.' && ignoredDirectories.has(item)) continue

      const path = join(directory, item)
      const stats = statSync(path)

      if (stats.isDirectory()) {
        issues.push(...this.lintDirectory(path))
      }

      const issue = this.lintPath(path)
      if (issue) issues.push(issue)
    }

    return issues
  }

  private getScopedPaths(): string[] {
    const args = ['diff', ...(this.scope === 'staged' ? ['--cached'] : []), '--name-only', '-z', '--diff-filter=ACMR']
    const output = execFileSync('git', args, { encoding: 'utf8' })
    return output.split('\0').filter(Boolean)
  }

  private lintPaths(paths: string[]): Issue[] {
    return paths.flatMap(path => {
      try {
        const issue = this.lintPath(path)
        return issue ? [issue] : []
      } catch (cause) {
        if (cause instanceof Error && 'code' in cause && cause.code === 'ENOENT') {
          return []
        }
        throw cause
      }
    })
  }

  run(): void {
    const issues = this.scope === 'all' ? this.lintDirectory('.') : this.lintPaths(this.getScopedPaths())

    if (issues.length === 0) {
      console.log(chalk.green('Path name check: no issues found.'))
      return
    }

    const output = table([['Original path', 'Fixed path'], ...issues.map(issue => [issue.original, issue.fixed])])
    console.log(output)

    if (this.action === 'list') {
      console.error(chalk.red(`${issues.length} path name issue(s) found.`))
      console.error(chalk.yellow('Run "npm run path-name-check:fix" to fix path names, then stage the changes.'))
      process.exitCode = 1
      return
    }

    console.log(chalk.green(`${issues.length} path name issue(s) fixed.`))
  }
}

const action: Action = process.argv.includes('--fix') ? 'fix' : 'list'
const scope: Scope = process.argv.includes('--staged')
  ? 'staged'
  : process.argv.includes('--changed')
    ? 'changed'
    : 'all'
new PathNameCheck(action, scope).run()
