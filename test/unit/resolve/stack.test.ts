import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import {type DeployedStack, readStack} from '../../../src/resolve/index.js'

const document = {
  blueprintVersion: '2024-10-01',
  resources: [
    {type: 'sanity.project.dataset', name: 'production'},
    {type: 'sanity.studio', name: 'studio'},
  ],
}

const stack: DeployedStack = {
  id: 'ST-1',
  name: 'my-stack',
  scopeType: 'project',
  scopeId: 'p1',
  defaultProjectId: null,
  resources: [
    {
      id: 'DS-1',
      name: 'production',
      type: 'sanity.project.dataset',
      externalId: 'p1:production',
      parameters: {project: '$.resources.my-project.id', name: 'production'},
      resolvedParameters: {project: 'p1', name: 'production'},
    },
    // same name as a declared resource, different type: not a match
    {id: 'X-1', name: 'studio', type: 'sanity.other', externalId: 'x', parameters: {}},
  ],
}

let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'sanity-blueprints-stack-'))
  writeFileSync(join(dir, 'blueprint.json'), JSON.stringify(document))
})

afterEach(() => {
  rmSync(dir, {recursive: true, force: true})
})

function writeConfig(values: Record<string, unknown>) {
  mkdirSync(join(dir, '.sanity'), {recursive: true})
  writeFileSync(join(dir, '.sanity', 'blueprint.config.json'), JSON.stringify(values))
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {headers: {'Content-Type': 'application/json'}, ...init})
}

describe('readStack', () => {
  test('should lay the deployed values over the declared resources', async () => {
    writeConfig({projectId: 'p1', stackId: 'ST-1'})
    const fetch = vi.fn(async () => jsonResponse(stack))

    const info = await readStack({path: dir, env: null, token: 'tok', fetch})

    expect(fetch).toHaveBeenCalledWith('https://api.sanity.io/v2026-06-15/blueprints/stacks/ST-1', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer tok',
        'X-Sanity-Scope-Type': 'project',
        'X-Sanity-Scope-Id': 'p1',
        'User-Agent': '@sanity/blueprints',
      },
    })
    expect(info.resources[0]).toStrictEqual({
      type: 'sanity.project.dataset',
      name: 'production',
      externalId: 'p1:production',
      live: {project: 'p1', name: 'production'},
    })
    // declared, but the Stack has no resource of that type and name
    expect(info.resources[1]).toStrictEqual({type: 'sanity.studio', name: 'studio'})
    expect(info.values).toStrictEqual({production: {project: 'p1', name: 'production'}})
    expect(info.resourcesByName.production).toBe(info.resources[0])
    expect(info.resourcesByName.studio).toStrictEqual({type: 'sanity.studio', name: 'studio'})
    expect(info.stack).toStrictEqual(stack)
    expect(info.stackId).toBe('ST-1')
  })

  test('should fall back to parameters when the API has no resolved parameters', async () => {
    writeConfig({projectId: 'p1', stackId: 'ST-1'})
    const [dataset] = stack.resources
    const fetch = vi.fn(async () => jsonResponse({...stack, resources: [{...dataset, resolvedParameters: undefined}]}))

    const info = await readStack({path: dir, env: null, token: 'tok', fetch})

    expect(info.values.production).toStrictEqual(dataset?.parameters)
  })

  test('should use the API origin and version from the environment', async () => {
    writeConfig({organizationId: 'o1', stackId: 'ST-1'})
    const fetch = vi.fn(async () => jsonResponse(stack))

    await readStack({
      path: dir,
      env: {SANITY_INTERNAL_ENV: 'staging', SANITY_BLUEPRINTS_API_VERSION: 'v2099-01-01'},
      token: 'tok',
      fetch,
    })

    expect(fetch).toHaveBeenCalledWith(
      'https://api.sanity.work/v2099-01-01/blueprints/stacks/ST-1',
      expect.objectContaining({
        headers: expect.objectContaining({'X-Sanity-Scope-Type': 'organization', 'X-Sanity-Scope-Id': 'o1'}),
      }),
    )
  })

  test('should prefer apiUrl and apiVersion over the environment', async () => {
    writeConfig({projectId: 'p1', stackId: 'ST-1'})
    const fetch = vi.fn(async () => jsonResponse(stack))

    await readStack({
      path: dir,
      env: {SANITY_INTERNAL_ENV: 'staging'},
      apiUrl: 'http://localhost:3000/',
      apiVersion: 'vX',
      token: 'tok',
      fetch,
    })

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/vX/blueprints/stacks/ST-1', expect.anything())
  })

  test('should throw when no Stack id is known', async () => {
    writeConfig({projectId: 'p1'})
    const fetch = vi.fn()

    await expect(readStack({path: dir, env: null, token: 'tok', fetch})).rejects.toThrow(/No Stack to read/)
    expect(fetch).not.toHaveBeenCalled()
  })

  test('should throw with the API error when the Stack cannot be read', async () => {
    writeConfig({projectId: 'p1', stackId: 'ST-1'})
    const fetch = vi.fn(async () => jsonResponse({message: 'Stack not found'}, {status: 404}))

    await expect(readStack({path: dir, env: null, token: 'tok', fetch})).rejects.toThrow('Failed to read Stack ST-1: 404 Stack not found')
  })

  test('should use the status text when the error body is not JSON', async () => {
    writeConfig({projectId: 'p1', stackId: 'ST-1'})
    const fetch = vi.fn(async () => new Response('oops', {status: 502, statusText: 'Bad Gateway'}))

    await expect(readStack({path: dir, env: null, token: 'tok', fetch})).rejects.toThrow('Failed to read Stack ST-1: 502 Bad Gateway')
  })
})
