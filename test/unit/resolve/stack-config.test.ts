import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import {readStackConfigFile, resolveStackConfig, stackIdsFromEnv} from '../../../src/resolve/index.js'

let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'sanity-blueprints-stack-config-'))
})

afterEach(() => {
  rmSync(dir, {recursive: true, force: true})
  vi.unstubAllEnvs()
})

function writeConfig(content: string) {
  mkdirSync(join(dir, '.sanity'), {recursive: true})
  writeFileSync(join(dir, '.sanity', 'blueprint.config.json'), content)
}

describe('readStackConfigFile', () => {
  test('should return the ids and the path of the file', () => {
    writeConfig(JSON.stringify({projectId: 'p1', stackId: 'ST-1', blueprintConfigVersion: 'v2025-05-08'}))

    expect(readStackConfigFile(dir)).toStrictEqual({
      configPath: join(dir, '.sanity', 'blueprint.config.json'),
      projectId: 'p1',
      stackId: 'ST-1',
    })
  })

  test('should drop ids that are not non-empty strings', () => {
    writeConfig(JSON.stringify({organizationId: '', projectId: 42, stackId: 'ST-1'}))

    expect(readStackConfigFile(dir)).toStrictEqual({configPath: join(dir, '.sanity', 'blueprint.config.json'), stackId: 'ST-1'})
  })

  test('should return undefined when the file does not exist', () => {
    expect(readStackConfigFile(dir)).toBeUndefined()
  })

  test('should throw when the file is not valid JSON', () => {
    writeConfig('{not json')
    expect(() => readStackConfigFile(dir)).toThrow(/Unable to parse .*blueprint\.config\.json/)
  })
})

describe('stackIdsFromEnv', () => {
  test('should read the SANITY_* variables', () => {
    expect(
      stackIdsFromEnv({SANITY_ORGANIZATION_ID: 'o1', SANITY_PROJECT_ID: 'p1', SANITY_BLUEPRINT_STACK_ID: 'ST-1', OTHER: 'x'}),
    ).toStrictEqual({organizationId: 'o1', projectId: 'p1', stackId: 'ST-1'})
  })
})

describe('resolveStackConfig', () => {
  test('should apply overrides > env > module > config', () => {
    const config = resolveStackConfig({
      overrides: {projectId: 'p-override'},
      env: {projectId: 'p-env', stackId: 'ST-env'},
      module: {stackId: 'ST-module', organizationId: 'o-module'},
      config: {organizationId: 'o-config'},
    })

    expect(config).toStrictEqual({
      organizationId: 'o-module',
      projectId: 'p-override',
      stackId: 'ST-env',
      scopeType: 'project',
      scopeId: 'p-override',
      sources: {organizationId: 'module', projectId: 'overrides', stackId: 'env'},
    })
  })

  test('should fall through empty values', () => {
    const config = resolveStackConfig({env: null, overrides: {projectId: ''}, config: {projectId: 'p-config'}})
    expect(config.projectId).toBe('p-config')
    expect(config.sources.projectId).toBe('config')
  })

  test('should scope to the organization when no project id is known', () => {
    const config = resolveStackConfig({env: null, config: {organizationId: 'o1'}})
    expect(config.scopeType).toBe('organization')
    expect(config.scopeId).toBe('o1')
  })

  test('should have no scope when no ids are known', () => {
    expect(resolveStackConfig({env: null})).toStrictEqual({sources: {}})
  })

  test('should read process.env when env is not passed', () => {
    vi.stubEnv('SANITY_BLUEPRINT_STACK_ID', 'ST-process')
    expect(resolveStackConfig({config: {stackId: 'ST-config'}}).sources.stackId).toBe('env')
  })

  test('should skip the environment when env is null', () => {
    vi.stubEnv('SANITY_BLUEPRINT_STACK_ID', 'ST-process')
    expect(resolveStackConfig({env: null, config: {stackId: 'ST-config'}}).sources.stackId).toBe('config')
  })
})
