import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Helper to recursively find all .d.ts files in a directory
function findDtsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        findDtsFiles(filePath, fileList)
      }
    } else if (file.endsWith('.d.ts')) {
      fileList.push(filePath)
    }
  }
  return fileList
}

try {
  // 1. Get staged files matching .ts, .tsx, .js, .jsx
  const stagedOutput = execSync('git diff --cached --name-only --diff-filter=ACMR', {
    encoding: 'utf8'
  })
  const stagedFiles = stagedOutput
    .split('\n')
    .map(f => f.trim())
    .filter(f => f && /\.[jt]sx?$/.test(f) && !f.endsWith('.d.ts') && !f.endsWith('type-check-staged.js'))

  // If no staged JS/TS files, skip type check
  if (stagedFiles.length === 0) {
    process.exit(0)
  }

  // 2. Find all .d.ts files in the src directory (or project)
  const dtsFiles = []
  if (fs.existsSync('src')) {
    findDtsFiles('src', dtsFiles)
  }

  // 3. Create temp tsconfig
  const tempConfigPath = path.resolve('tsconfig.temp.json')
  const tempConfig = {
    extends: './tsconfig.app.json',
    files: [...stagedFiles, ...dtsFiles],
    include: []
  }

  fs.writeFileSync(tempConfigPath, JSON.stringify(tempConfig, null, 2))

  // 4. Run tsc
  console.log(`Type checking ${stagedFiles.length} staged file(s)...`)
  execSync('pnpm exec tsc -p tsconfig.temp.json --noEmit', { stdio: 'inherit' })
} catch (err) {
  console.error('Type checking failed:', err.message)
  // Exit with error if any step (including tsc) fails
  process.exit(1)
} finally {
  // 5. Always clean up temp tsconfig
  try {
    if (fs.existsSync('tsconfig.temp.json')) {
      fs.unlinkSync('tsconfig.temp.json')
    }
  } catch (cleanErr) {
    console.error('Failed to clean up tsconfig.temp.json:', cleanErr.message)
  }
}
