import {createClient} from '@sanity/client'
import {ENGINE_API_VERSION, type WorkflowClient} from '@sanity/workflow-engine'
import {describe, expect, test} from 'vitest'

import {workflowProvider} from '../../../../src/providers/workflows/index.js'
import {
  type WorkflowProvisionReceipt,
  type WorkflowResourceRollbackScope,
  workflowResourceExternalId,
} from '../../../../src/providers/workflows/lifecycle.js'
import {createWorkflowProviderFactory, type WorkflowProviderDependencies} from '../../../../src/providers/workflows/provider.js'
import type {WorkflowsResource} from '../../../../src/providers/workflows/resource.js'
import {workflowResource as resource} from './fixtures.js'

const RECEIPT: WorkflowProvisionReceipt = {
  externalId: workflowResourceExternalId(resource().deployment),
  deployId: 'deploy-1',
  results: [{name: 'article-review', version: 2, status: 'created'}],
}

const CLIENT: WorkflowClient = createClient({
  apiVersion: ENGINE_API_VERSION,
  dataset: 'production',
  projectId: 'abc123',
  useCdn: false,
})

const CONTEXT = {environment: 'test' as const, token: 'caller-token'}
type TestLog = (level: 'info' | 'warn' | 'error', message: string, metadata?: Record<string, unknown>) => unknown | Promise<unknown>
const LOG: TestLog = () => undefined

function dependencies(overrides: Partial<WorkflowProviderDependencies> = {}): WorkflowProviderDependencies {
  return {
    createClient: () => CLIENT,
    provisionResource: async () => RECEIPT,
    readResource: async () => {
      throw new Error('readResource not stubbed')
    },
    rollbackResource: async () => {},
    ...overrides,
  }
}

function provider(overrides: Partial<WorkflowProviderDependencies> = {}, log: TestLog = LOG) {
  return createWorkflowProviderFactory(dependencies(overrides))({log})
}

function createState(desired: WorkflowsResource) {
  return {desired, assets: {}}
}

function existingState(current: WorkflowsResource, externalId: string) {
  return {current, externalId, providerMetadata: {}}
}

function updateState(current: WorkflowsResource, desired: WorkflowsResource, externalId: string) {
  return {current, desired, externalId, assets: {}, providerMetadata: {}}
}

function expectSuccess<T extends {success: boolean}>(result: T): asserts result is Extract<T, {success: true}> {
  expect(result.success).toBe(true)
}

function expectFailure<T extends {success: boolean}>(result: T): asserts result is Extract<T, {success: false}> {
  expect(result.success).toBe(false)
}

describe('Editorial Workflows provider factory', () => {
  test('registers sanity.workflow as a scope-agnostic retain-by-default provider', () => {
    expect({
      resourceType: workflowProvider.resourceType,
      apiUrl: workflowProvider.apiUrl,
      displayName: workflowProvider.displayName,
      displayNamePlural: workflowProvider.displayNamePlural,
      lifecycleConfig: workflowProvider.lifecycleConfig,
      primaryIdentifierPath: workflowProvider.primaryIdentifierPath,
      scope: workflowProvider.scope,
    }).toEqual({
      resourceType: 'sanity.workflow',
      apiUrl: 'http://api.sanity.local',
      displayName: 'Editorial Workflows deployment',
      displayNamePlural: 'Editorial Workflows deployments',
      lifecycleConfig: {defaultDeletionPolicy: 'retain', preventDetach: false},
      primaryIdentifierPath: 'externalId',
      scope: null,
    })
  })

  test('accepts a valid resource and rejects deletion lifecycle promises', () => {
    const instance = provider()
    const valid = resource()

    expect(instance.validate(valid)).toEqual({valid: true, errors: []})
    expect(instance.validate({...valid, lifecycle: {deletionPolicy: 'allow'}})).toEqual({
      valid: false,
      errors: [expect.stringMatching(/retain-only/)],
    })
  })
})

describe('Editorial Workflows provider actions', () => {
  test('creates a deployment and binds rollback to the exact provision receipt', async () => {
    const desired = resource()
    const externalId = workflowResourceExternalId(desired.deployment)
    let rollbackScope: WorkflowResourceRollbackScope | undefined
    const instance = provider({
      rollbackResource: async (scope) => {
        rollbackScope = scope
      },
    })

    const result = await instance.create(createState(desired), CONTEXT)
    expectSuccess(result)
    expect({
      externalId: result.externalId,
      resource: result.resource,
      providerMetadata: result.providerMetadata,
    }).toEqual({
      externalId,
      resource: {
        ...desired,
        externalId,
        deployedDefinitions: [{name: 'article-review', version: 2}],
      },
      providerMetadata: {
        deployId: 'deploy-1',
        provisionedDefinitions: RECEIPT.results,
      },
    })

    expect(await result.rollback()).toEqual({success: true, externalId})
    expect(rollbackScope).toEqual({resource: desired, client: CLIENT, receipt: RECEIPT})
  })

  test('rejects a provision receipt from another physical partition', async () => {
    const instance = provider({
      provisionResource: async () => ({...RECEIPT, externalId: 'sanity.workflow:wrong'}),
    })

    const result = await instance.create(createState(resource()), CONTEXT)
    expectFailure(result)
    expect(result.error).toMatch(/externalId mismatch/)
  })

  test('returns the boundary error when malformed state has no resource name', async () => {
    const result = await provider().create({desired: null, assets: {}} as never, CONTEXT)

    expectFailure(result)
    expect(result.error).toBe('workflow resource: expected an object')
  })

  test('preserves the action failure when the error logger rejects', async () => {
    const provisionError = new Error('provision failed')
    const result = await provider(
      {
        provisionResource: async () => {
          throw provisionError
        },
      },
      async (level) => {
        if (level === 'error') throw new Error('logger failed')
      },
    ).create(createState(resource()), CONTEXT)

    expectFailure(result)
    expect(result).toMatchObject({error: 'provision failed', cause: provisionError})
  })

  test('reads only the manifest-managed deployed definitions', async () => {
    const current = resource()
    const externalId = workflowResourceExternalId(current.deployment)
    const instance = provider({
      readResource: async () => ({externalId, definitions: []}),
    })

    const result = await instance.read(existingState(current, externalId), CONTEXT)
    expectSuccess(result)
    expect(result.resource).toEqual({...current, externalId, deployedDefinitions: []})
  })

  test('updates only when the physical deployment partition is unchanged', async () => {
    const current = resource()
    const externalId = workflowResourceExternalId(current.deployment)
    const changedPartition = resource({target: {type: 'dataset', id: 'abc123.other'}})

    expect(provider().validateUpdate(updateState(current, changedPartition, externalId))).toEqual({
      valid: false,
      errors: ['workflow resource: workflowResource and tag cannot change during update; create a new Blueprint resource instead'],
    })
  })

  test('fails if destroy is dispatched instead of a retain detach', async () => {
    const current = resource()
    const externalId = workflowResourceExternalId(current.deployment)
    const state = existingState(current, externalId)
    const instance = provider()

    expect(instance.validateDestroy(state)).toEqual({
      valid: false,
      errors: ['Editorial Workflows definitions are retain-only; Blueprints must detach this resource instead of destroying it'],
    })
    const result = await instance.destroy(state)
    expectFailure(result)
    expect(result.error).toMatch(/destroy is not supported/)
  })

  test('returns an explicit unsupported result for provider-wide listing', async () => {
    await expect(provider().list()).resolves.toEqual({
      success: false,
      error: 'Listing Editorial Workflows resources is not supported; the manifest owns the definition names managed by each resource',
    })
  })
})
