import {ENGINE_API_VERSION} from '@sanity/workflow-engine'
import {describe, expect, test} from 'vitest'

import {blueprintApiHostFromEnv, blueprintsClientConfig} from '../../../../src/providers/workflows/client.js'
import {workflowResource} from './fixtures.js'

describe('blueprintsClientConfig', () => {
  test('uses the caller token, staging host, and dataset address for a dataset deployment', () => {
    const config = blueprintsClientConfig(
      workflowResource({
        target: {type: 'dataset', id: 'abc123.production'},
      }),
      {
        environment: 'staging',
        token: 'caller-token',
      },
    )

    expect(config).toEqual({
      projectId: 'abc123',
      dataset: 'production',
      apiHost: 'https://api.sanity.work',
      apiVersion: ENGINE_API_VERSION,
      requestTagPrefix: 'sanity.workflows.blueprints',
      token: 'caller-token',
      useCdn: false,
    })
  })

  test('uses the test host and GDR resource address for a non-dataset deployment', () => {
    const target = {type: 'canvas', id: 'canvas-resource'} as const
    const config = blueprintsClientConfig(workflowResource({target}), {
      environment: 'test',
      token: 'test-token',
    })

    expect(config).toEqual({
      resource: target,
      apiHost: 'http://api.sanity.local',
      apiVersion: ENGINE_API_VERSION,
      requestTagPrefix: 'sanity.workflows.blueprints',
      token: 'test-token',
      useCdn: false,
    })
  })

  test('uses the production host when Blueprints runs in production', () => {
    const config = blueprintsClientConfig(
      workflowResource({
        target: {type: 'dataset', id: 'abc123.production'},
      }),
      {
        environment: 'production',
        token: 'production-token',
      },
    )

    expect(config.apiHost).toBe('https://api.sanity.io')
  })
})

describe('blueprintApiHostFromEnv', () => {
  test.each([
    ['production', 'https://api.sanity.io'],
    ['staging', 'https://api.sanity.work'],
    ['test', 'http://api.sanity.local'],
    [undefined, 'http://api.sanity.local'],
  ])('maps %s to %s', (environment, expected) => {
    expect(blueprintApiHostFromEnv(environment)).toBe(expected)
  })

  test('rejects an unknown environment instead of silently targeting the test API', () => {
    expect(() => blueprintApiHostFromEnv('unknown')).toThrow('Unknown Blueprints environment: "unknown"')
  })
})
