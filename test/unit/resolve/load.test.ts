import {mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import {findBlueprintFile, loadBlueprintFile, readBlueprint} from '../../../src/resolve/index.js'

const document = {
  blueprintVersion: '2024-10-01',
  resources: [
    {type: 'sanity.project.dataset', name: 'production'},
    {type: 'sanity.studio', name: 'studio'},
  ],
}

// A module shaped like the one defineBlueprint returns, with a type annotation Node strips
const TS_MODULE = `
type Doc = {blueprintVersion: string; resources: {type: string; name: string}[]}
function blueprint(): Doc {
  return ${JSON.stringify(document)}
}
blueprint.projectId = 'p-module'
blueprint.stackId = 'ST-module'
export default blueprint
`

let dir: string

beforeEach(() => {
  // realpath: macOS tmpdir is a symlink, and returned paths are resolved
  dir = realpathSync(mkdtempSync(join(tmpdir(), 'sanity-blueprints-load-')))
})

afterEach(() => {
  rmSync(dir, {recursive: true, force: true})
})

function write(name: string, content: unknown) {
  const path = join(dir, name)
  mkdirSync(join(path, '..'), {recursive: true})
  writeFileSync(path, typeof content === 'string' ? content : JSON.stringify(content))
  return path
}

describe('findBlueprintFile', () => {
  test('should return a file path as is', () => {
    const path = write('custom.json', document)
    expect(findBlueprintFile(path)).toBe(path)
  })

  test('should find a blueprint file in a directory', () => {
    const path = write('sanity.blueprint.ts', TS_MODULE)
    expect(findBlueprintFile(dir)).toBe(path)
  })

  test('should prefer names earlier in BLUEPRINT_FILE_NAMES', () => {
    write('sanity.blueprint.ts', TS_MODULE)
    const path = write('blueprint.json', document)
    expect(findBlueprintFile(dir)).toBe(path)
  })

  test('should search parent directories', () => {
    const path = write('blueprint.json', document)
    mkdirSync(join(dir, 'a', 'b'), {recursive: true})
    expect(findBlueprintFile(join(dir, 'a', 'b'))).toBe(path)
  })

  test('should prefer the nearest directory', () => {
    write('blueprint.json', document)
    const path = write('a/sanity.blueprint.ts', TS_MODULE)
    expect(findBlueprintFile(join(dir, 'a'))).toBe(path)
  })

  test('should return undefined when the path does not exist', () => {
    expect(findBlueprintFile(join(dir, 'missing'))).toBeUndefined()
  })
})

describe('loadBlueprintFile', () => {
  test('should parse a JSON file', async () => {
    const path = write('blueprint.json', document)
    expect(await loadBlueprintFile(path)).toStrictEqual({blueprint: document})
  })

  test('should import a TS file and call its default export', async () => {
    const path = write('sanity.blueprint.ts', TS_MODULE)
    const {blueprint, module} = await loadBlueprintFile(path)

    expect(blueprint).toStrictEqual(document)
    expect(module).toBeInstanceOf(Function)
    expect(module?.stackId).toBe('ST-module')
  })

  test('should import through the loader when one is passed', async () => {
    const path = write('sanity.blueprint.ts', 'this is not parsed')
    const loader = vi.fn(async () => () => document)

    const {blueprint} = await loadBlueprintFile(path, {loader})

    expect(loader).toHaveBeenCalledWith(path)
    expect(blueprint).toStrictEqual(document)
  })

  test('should throw when the loader throws', async () => {
    const path = write('sanity.blueprint.ts', '')
    const loader = async () => {
      throw new Error('boom')
    }
    await expect(loadBlueprintFile(path, {loader})).rejects.toThrow(/Unable to import .*sanity\.blueprint\.ts: boom\.$/)
  })

  test('should throw on invalid JSON', async () => {
    const path = write('blueprint.json', '{not json')
    await expect(loadBlueprintFile(path)).rejects.toThrow(/Unable to parse .*blueprint\.json/)
  })

  test('should throw when the default export is not a function', async () => {
    const path = write('blueprint.mjs', 'export default {resources: []}')
    await expect(loadBlueprintFile(path)).rejects.toThrow(/must export a default function/)
  })

  test('should throw when the default export throws', async () => {
    const path = write('blueprint.mjs', 'export default () => { throw new Error("bad config") }')
    await expect(loadBlueprintFile(path)).rejects.toThrow(/Error executing the default export of .*: bad config\./)
  })

  test('should throw when the file does not produce an object', async () => {
    const path = write('blueprint.json', '[]')
    await expect(loadBlueprintFile(path)).rejects.toThrow(/did not produce a blueprint object/)
  })

  test('should throw on an unsupported extension', async () => {
    const path = write('blueprint.yaml', '')
    await expect(loadBlueprintFile(path)).rejects.toThrow(/Unsupported blueprint file extension ".yaml"/)
  })
})

describe('readBlueprint', () => {
  test('should return the resources and the ids, with the source of each id', async () => {
    const path = write('sanity.blueprint.ts', TS_MODULE)
    const configPath = write('.sanity/blueprint.config.json', {organizationId: 'o1', projectId: 'p-config'})

    const info = await readBlueprint({path: dir, env: null})

    expect(info.path).toBe(path)
    expect(info.configPath).toBe(configPath)
    expect(info.resources.map((resource) => resource.name)).toStrictEqual(['production', 'studio'])
    expect(info.blueprint).toStrictEqual(document)
    expect(info.module).toBeInstanceOf(Function)
    expect(info).toMatchObject({
      organizationId: 'o1',
      projectId: 'p-module',
      stackId: 'ST-module',
      scopeType: 'project',
      scopeId: 'p-module',
      sources: {organizationId: 'config', projectId: 'module', stackId: 'module'},
    })
  })

  test('should let overrides and env win', async () => {
    write('blueprint.json', document)
    write('.sanity/blueprint.config.json', {projectId: 'p1', stackId: 'ST-1'})

    const info = await readBlueprint({path: dir, overrides: {stackId: 'ST-flag'}, env: {SANITY_PROJECT_ID: 'p-env'}})

    expect(info.stackId).toBe('ST-flag')
    expect(info.projectId).toBe('p-env')
    expect(info.sources).toStrictEqual({projectId: 'env', stackId: 'overrides'})
  })

  test('should return an empty resource list when the blueprint has none', async () => {
    write('blueprint.json', {blueprintVersion: '2024-10-01'})
    const info = await readBlueprint({path: dir, env: null})
    expect(info.resources).toStrictEqual([])
    expect(info.configPath).toBeUndefined()
  })

  test('should throw when no blueprint file is found', async () => {
    await expect(readBlueprint({path: dir})).rejects.toThrow(/No blueprint file found in .* or its parent directories/)
  })

  test('should return resources as declared, without validating them', async () => {
    const resources = [{type: 'sanity.project.dataset', name: 'ok'}, {name: 'no-type'}, {type: 'x'}]
    write('blueprint.json', {resources})
    const info = await readBlueprint({path: dir, env: null})
    expect(info.resources).toStrictEqual(resources)
  })

  test('should key resources by name', async () => {
    write('blueprint.json', document)
    const info = await readBlueprint({path: dir, env: null})
    expect(info.resourcesByName).toStrictEqual({
      production: {type: 'sanity.project.dataset', name: 'production'},
      studio: {type: 'sanity.studio', name: 'studio'},
    })
  })

  test('should leave nameless resources out of resourcesByName, and let a later duplicate win', async () => {
    write('blueprint.json', {
      resources: [{type: 'a', name: 'dup'}, {type: 'b', name: 'dup'}, {type: 'c', name: 42}, {type: 'd'}],
    })
    const info = await readBlueprint({path: dir, env: null})
    expect(info.resources).toHaveLength(4)
    expect(info.resourcesByName).toStrictEqual({dup: {type: 'b', name: 'dup'}})
  })

  test('should throw when resources is not an array', async () => {
    write('blueprint.json', {resources: {}})
    await expect(readBlueprint({path: dir})).rejects.toThrow(/`resources` must be an array/)
  })
})
