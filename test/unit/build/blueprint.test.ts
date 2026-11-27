import {afterEach, describe, expect, expectTypeOf, test} from 'vitest'

import {BlueprintHandle, buildBlueprint} from '../../../src/build/blueprint.js'
import {ProjectHandle} from '../../../src/build/project.js'
import type {BlueprintResource} from '../../../src/index.js'
import {getCollectedErrors, resetCollectedErrors} from '../../../src/utils/validation.js'

afterEach(() => resetCollectedErrors())

describe('buildBlueprint', () => {
  test('accepts a callback without config', () => {
    const bpModule = buildBlueprint((blueprint) => {
      blueprint.project({name: 'test-project'})
    })

    expect(bpModule().resources).toStrictEqual([expect.objectContaining({name: 'test-project', type: 'sanity.project'})])
  })

  test('handles expose the resource type as a readonly kind', () => {
    buildBlueprint((blueprint) => {
      const project = blueprint.project({name: 'test-project'})
      const dataset = project.dataset({name: 'production'})
      const webhook = project.documentWebhook({
        name: 'test-webhook',
        apiVersion: 'v2026-01-01',
        dataset: dataset.datasetName,
        on: ['update'],
        url: 'https://example.com',
      })
      const kb = blueprint.contextKnowledgeBase({name: 'product-docs', title: 'Product docs', description: 'Product docs'})
      const mcp = blueprint.contextMcpEndpoint({name: 'support-agent', title: 'Support agent', sources: [kb]})
      const cors = project.corsOrigin({name: 'test-cors', origin: 'https://example.com'})
      const resource = blueprint.resource({name: 'test-resource', type: 'test' as const})

      expect(project.kind).toBe('sanity.project')
      expect(dataset.kind).toBe('sanity.project.dataset')
      expect(webhook.kind).toBe('sanity.project.webhook')
      expect(kb.kind).toBe('sanity.context.knowledge-base')
      expect(mcp.kind).toBe('sanity.context.mcp')
      expect(cors.kind).toBe('sanity.project.cors')
      expect(resource.kind).toBe('test')

      expectTypeOf(dataset).not.toEqualTypeOf(cors)
    })
  })

  test('accepts undefined config', () => {
    const bpModule = buildBlueprint(undefined, (blueprint) => {
      blueprint.project({name: 'test-project'})
    })

    expect(bpModule().resources).toHaveLength(1)
  })

  test('passes top-level settings to the blueprint', () => {
    const bpModule = buildBlueprint({blueprintVersion: '2025-01-01', values: {environment: 'production'}}, (blueprint) => {
      blueprint.corsOrigin({name: 'localhost', origin: 'http://localhost:3333'})
    })

    expect(bpModule()).toMatchObject({blueprintVersion: '2025-01-01', values: {environment: 'production'}})
  })

  test('throws if no callback is given', () => {
    // @ts-expect-error -- the callback is required, which is what we are asserting on
    expect(() => buildBlueprint({values: {}})).toThrow('buildBlueprint requires a callback')
  })

  test('throws the validation errors of the resources it adds', () => {
    expect(() =>
      buildBlueprint((blueprint) => {
        blueprint.corsOrigin({name: 'localhost', origin: ''})
      }),
    ).toThrow('CORS Origin URL is required')
  })

  test('throws if resources share a name', () => {
    expect(() =>
      buildBlueprint((blueprint) => {
        const project = blueprint.project({name: 'my-project'})
        project.dataset({name: 'production'})
        project.corsOrigin({name: 'production', origin: 'http://localhost:3333'})
      }),
    ).toThrow("duplicate name 'production' in resources")
  })

  test('rethrows errors from the callback and resets collected errors', () => {
    expect(() =>
      buildBlueprint((blueprint) => {
        blueprint.corsOrigin({name: 'localhost', origin: ''})
        throw new Error('callback failed')
      }),
    ).toThrow('callback failed')

    expect(getCollectedErrors()).toStrictEqual([])
  })
})

describe('BlueprintHandle', () => {
  function setup() {
    const resources: BlueprintResource[] = []
    return {resources, blueprint: new BlueprintHandle(resources)}
  }

  test('project returns a handle that adds resources to the same blueprint', () => {
    const {resources, blueprint} = setup()

    const project = blueprint.project({name: 'my-project'})
    project.dataset({name: 'production'})

    expect(project).toBeInstanceOf(ProjectHandle)
    expect(resources.map((r) => r.type)).toStrictEqual(['sanity.project', 'sanity.project.dataset'])
  })

  test('contextMcpEndpoint converts knowledge base handles to sources', () => {
    const {resources, blueprint} = setup()

    const kb = blueprint.contextKnowledgeBase({name: 'product-docs', title: 'Product docs', description: 'Product docs'})
    blueprint.contextMcpEndpoint({
      name: 'support-agent',
      title: 'Support agent',
      sources: [kb, {type: 'dataset', id: 'abc123.production'}],
    })

    expect(resources[1]).toHaveProperty('sources', [
      {type: 'knowledge-base', id: '$.resources.product-docs'},
      {type: 'dataset', id: 'abc123.production'},
    ])
    expect(getCollectedErrors()).toStrictEqual([])
  })
})
