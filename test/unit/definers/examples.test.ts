import {spawnSync} from 'node:child_process'
import {mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {tmpdir} from 'node:os'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {afterAll, beforeAll, describe, expect, test} from 'vitest'
import * as blueprints from '../../../src/index.js'
import {getCollectedErrors, resetCollectedErrors} from '../../../src/utils/validation.js'

interface Example {
  label: string
  file: string
  tagged: boolean
  code: string
}

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url))
const definersDir = join(repoRoot, 'src', 'definers')

function collectExamples(): Example[] {
  const examples: Example[] = []
  const files = readdirSync(definersDir, {recursive: true, encoding: 'utf8'}).filter((f) => f.endsWith('.ts'))
  for (const file of files) {
    const source = readFileSync(join(definersDir, file), 'utf8')
    for (const block of source.matchAll(/\/\*\*\n([\s\S]*?)\n \*\/\nexport function (\w+)/g)) {
      const [, body, fn] = block
      if (/^ \* @hidden$/m.test(body)) continue
      const lines = body.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] !== ' * ```ts') continue
        const end = lines.indexOf(' * ```', i + 1)
        const tag = lines[i - 1]?.match(/^ \* @example ?(.*)$/)
        examples.push({
          label: `${file} ${fn} ${tag ? tag[1] || '(untitled)' : '(no @example)'}`,
          file: `example-${examples.length}.ts`,
          tagged: Boolean(tag),
          code: lines
            .slice(i + 1, end)
            .map((line) => line.replace(/^ \* ?/, ''))
            .join('\n'),
        })
        i = end
      }
    }
  }
  return examples
}

const examples = collectExamples()
const exportNames = Object.keys(blueprints)
const typeErrors = new Map<string, string[]>()
const unattributedOutput: string[] = []
let workDir = ''

beforeAll(() => {
  workDir = mkdtempSync(join(tmpdir(), 'blueprints-examples-'))
  for (const example of examples) {
    writeFileSync(join(workDir, example.file), `import {${exportNames.join(', ')}} from '@sanity/blueprints'\n${example.code}\nexport {}\n`)
  }
  const tsconfig = {
    compilerOptions: {
      target: 'es2024',
      module: 'nodenext',
      moduleResolution: 'nodenext',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: ['node'],
      typeRoots: [join(repoRoot, 'node_modules', '@types')],
      paths: {'@sanity/blueprints': [join(repoRoot, 'src', 'index.ts')]},
    },
    include: ['*.ts'],
  }
  writeFileSync(join(workDir, 'tsconfig.json'), JSON.stringify(tsconfig))

  const tsc = join(dirname(createRequire(import.meta.url).resolve('typescript/package.json')), 'bin', 'tsc')
  const result = spawnSync(process.execPath, [tsc, '--project', 'tsconfig.json', '--pretty', 'false'], {cwd: workDir, encoding: 'utf8'})
  if (result.error) throw result.error
  for (const line of `${result.stdout}\n${result.stderr}`.split('\n')) {
    if (!line.trim()) continue
    const match = line.match(/^(example-\d+\.ts)\(\d+,\d+\): (error .*)$/)
    if (match) typeErrors.set(match[1], [...(typeErrors.get(match[1]) ?? []), match[2]])
    else unattributedOutput.push(line)
  }
}, 60_000)

afterAll(() => {
  if (workDir) rmSync(workDir, {recursive: true, force: true})
})

describe('definer JSDoc examples', () => {
  test('are found', () => {
    expect(examples.length).toBeGreaterThan(0)
  })

  test('typecheck output belongs to an example', () => {
    expect(unattributedOutput).toStrictEqual([])
  })

  describe.each(examples)('$label', (example) => {
    test('is in an @example block', () => {
      expect(example.tagged).toBe(true)
    })

    test('typechecks', () => {
      expect(typeErrors.get(example.file) ?? []).toStrictEqual([])
    })

    test('runs without validation errors', () => {
      resetCollectedErrors()
      const run = new Function(...exportNames, example.code)
      expect(() => run(...Object.values(blueprints))).not.toThrow()
      expect(getCollectedErrors()).toStrictEqual([])
    })
  })
})
