import {execFileSync} from 'node:child_process'
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'

// Runs in a separate Node process: vitest would otherwise compile the blueprint file itself

let dir: string

beforeEach(() => {
  // inside this package, so jiti resolves from the blueprint file as it would in a project
  dir = mkdtempSync(join(import.meta.dirname, 'tmp-'))
})

afterEach(() => {
  rmSync(dir, {recursive: true, force: true})
})

function readResourceNames(blueprint: string): string[] {
  writeFileSync(join(dir, 'sanity.blueprint.ts'), blueprint)
  const script = `
    import {readBlueprint} from '@sanity/blueprints/resolve'
    const {resources} = await readBlueprint({path: ${JSON.stringify(dir)}, env: null})
    console.log(JSON.stringify(resources.map((resource) => resource.name)))
  `
  const output = execFileSync(process.execPath, ['--input-type=module', '-e', script], {cwd: import.meta.dirname, encoding: 'utf8'})
  return JSON.parse(output)
}

describe('@sanity/blueprints/resolve in Node', () => {
  it('should load a TS blueprint natively', () => {
    const names = readResourceNames(`
      import {defineBlueprint} from '@sanity/blueprints'
      const name: string = 'production-dataset'
      export default defineBlueprint({resources: [{type: 'sanity.project.dataset', name}]})
    `)
    expect(names).toEqual(['production-dataset'])
  })

  it('should load a TS blueprint with an enum through jiti', () => {
    const names = readResourceNames(`
      import {defineBlueprint} from '@sanity/blueprints'
      enum Names { Dataset = 'production-dataset' }
      export default defineBlueprint({resources: [{type: 'sanity.project.dataset', name: Names.Dataset}]})
    `)
    expect(names).toEqual(['production-dataset'])
  })
})
