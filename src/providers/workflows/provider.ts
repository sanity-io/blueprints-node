import {env} from 'node:process'

import {errorMessage, type WorkflowClient} from '@sanity/workflow-engine'

import {blueprintApiHostFromEnv, createWorkflowClient, type WorkflowClientFactory, type WorkflowProviderClientContext} from './client.js'
import {
  destroyWorkflowResource,
  parseWorkflowResource,
  provisionWorkflowResource,
  readWorkflowResource,
  rollbackWorkflowResource,
  type WorkflowProvisionReceipt,
  type WorkflowResourceDefinitionSnapshot,
  type WorkflowResourceSnapshot,
  workflowResourceExternalId,
} from './lifecycle.js'
import {isRecord, WORKFLOW_RESOURCE_TYPE, type WorkflowsResource} from './resource.js'

type LogMethod = (level: 'info' | 'warn' | 'error', message: string, metadata?: Record<string, unknown>) => unknown | Promise<unknown>

interface ProviderHelpers {
  log: LogMethod
}

interface BlueprintsResourceContext extends WorkflowProviderClientContext {}

interface ExistingResourceState<T> {
  current: T
  externalId: string
  providerMetadata: Record<string, unknown>
}

interface CreateResourceState<T> {
  desired: T
  assets: Record<string, unknown>
}

interface UpdateResourceState<T> extends ExistingResourceState<T>, CreateResourceState<T> {}

interface DestroyResourceState<T> extends ExistingResourceState<T> {}

interface ValidationResult {
  valid: boolean
  errors: string[]
}

interface ActionFailure {
  success: false
  error: string
  cause?: Error
}

interface RollbackResult {
  success: true
  externalId?: string
}

interface ProvisionActionSuccess {
  success: true
  externalId: string
  resource: ResolvedWorkflowResource
  providerMetadata: Record<string, unknown>
  rollback: () => Promise<RollbackResult | ActionFailure>
}

interface ReadActionSuccess {
  success: true
  resource: ResolvedWorkflowResource
}

interface WorkflowProvider {
  validate(parameters: unknown): ValidationResult
  validateUpdate(state: Omit<UpdateResourceState<WorkflowsResource>, 'assets'>): ValidationResult
  validateDestroy(state: DestroyResourceState<WorkflowsResource>): ValidationResult
  create(state: CreateResourceState<WorkflowsResource>, context: BlueprintsResourceContext): Promise<ProvisionActionSuccess | ActionFailure>
  read(state: ExistingResourceState<WorkflowsResource>, context: BlueprintsResourceContext): Promise<ReadActionSuccess | ActionFailure>
  list(): Promise<ActionFailure>
  update(state: UpdateResourceState<WorkflowsResource>, context: BlueprintsResourceContext): Promise<ProvisionActionSuccess | ActionFailure>
  destroy(state: DestroyResourceState<WorkflowsResource>): Promise<ActionFailure>
}

export interface WorkflowProviderFactory {
  (helpers: ProviderHelpers): WorkflowProvider
  resourceType: string
  apiUrl: string
  displayName: string
  displayNamePlural: string
  lifecycleConfig: {defaultDeletionPolicy: 'retain'; preventDetach: false}
  scope: null
  primaryIdentifierPath: string
}

async function createErrorResponse(
  error: unknown,
  log: LogMethod,
  logMessage: string,
  metadata: Record<string, unknown>,
): Promise<ActionFailure> {
  const message = errorMessage(error)
  await Promise.allSettled([log('error', logMessage, {error: message, ...metadata})])
  return {success: false, error: message, cause: error instanceof Error ? error : new Error(message)}
}

function resourceName(value: unknown): string | undefined {
  return isRecord(value) && typeof value['name'] === 'string' ? value['name'] : undefined
}

export interface ResolvedWorkflowResource extends WorkflowsResource {
  externalId: string
  deployedDefinitions: WorkflowResourceDefinitionSnapshot[]
}

interface ProviderRuntime {
  dependencies: WorkflowProviderDependencies
  log: LogMethod
}

interface ContextualAction<TState> {
  state: TState
  context: BlueprintsResourceContext
  runtime: ProviderRuntime
}

interface ResourceAction {
  resource: WorkflowsResource
  context: BlueprintsResourceContext
  runtime: ProviderRuntime
}

export interface WorkflowProviderDependencies {
  createClient: WorkflowClientFactory
  provisionResource: typeof provisionWorkflowResource
  readResource: typeof readWorkflowResource
  rollbackResource: typeof rollbackWorkflowResource
}

const defaultDependencies: WorkflowProviderDependencies = {
  createClient: createWorkflowClient,
  provisionResource: provisionWorkflowResource,
  readResource: readWorkflowResource,
  rollbackResource: rollbackWorkflowResource,
}

function validateResource(resource: unknown): ValidationResult {
  try {
    parseWorkflowResource(resource)
    return {valid: true, errors: []}
  } catch (error) {
    return {valid: false, errors: [errorMessage(error)]}
  }
}

function assertExternalId(actual: string, expected: string): void {
  if (actual !== expected) {
    throw new Error(`workflow resource: externalId mismatch; expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

function parseExistingResource(state: ExistingResourceState<WorkflowsResource>): WorkflowsResource {
  const resource = parseWorkflowResource(state.current)
  assertExternalId(state.externalId, workflowResourceExternalId(resource.deployment))
  return resource
}

function parseUpdateResource(state: Omit<UpdateResourceState<WorkflowsResource>, 'assets'>): WorkflowsResource {
  const current = parseExistingResource(state)
  const desired = parseWorkflowResource(state.desired)
  const currentExternalId = workflowResourceExternalId(current.deployment)
  const desiredExternalId = workflowResourceExternalId(desired.deployment)
  if (desiredExternalId !== currentExternalId) {
    throw new Error('workflow resource: workflowResource and tag cannot change during update; create a new Blueprint resource instead')
  }
  return desired
}

function resolvedFromReceipt({
  resource,
  externalId,
  receipt,
}: {
  resource: WorkflowsResource
  externalId: string
  receipt: WorkflowProvisionReceipt
}): ResolvedWorkflowResource {
  return {
    ...resource,
    externalId,
    deployedDefinitions: receipt.results.map(({name, version}) => ({
      name,
      version,
    })),
  }
}

function resolvedFromSnapshot(resource: WorkflowsResource, snapshot: WorkflowResourceSnapshot): ResolvedWorkflowResource {
  return {
    ...resource,
    externalId: snapshot.externalId,
    deployedDefinitions: snapshot.definitions,
  }
}

async function provision({resource, context, runtime: {dependencies, log}}: ResourceAction): Promise<{
  client: WorkflowClient
  externalId: string
  receipt: WorkflowProvisionReceipt
  resolved: ResolvedWorkflowResource
}> {
  const externalId = workflowResourceExternalId(resource.deployment)
  const client = dependencies.createClient(resource, context)
  await log('info', `Provisioning Editorial Workflows resource "${resource.name}"`, {externalId})
  const receipt = await dependencies.provisionResource({resource, client})
  assertExternalId(receipt.externalId, externalId)
  return {
    client,
    externalId,
    receipt,
    resolved: resolvedFromReceipt({resource, externalId, receipt}),
  }
}

function rollback({
  resource,
  client,
  receipt,
  externalId,
  dependencies,
}: {
  resource: WorkflowsResource
  client: WorkflowClient
  receipt: WorkflowProvisionReceipt
  externalId: string
  dependencies: WorkflowProviderDependencies
}) {
  return async () => {
    await dependencies.rollbackResource({resource, client, receipt})
    return {success: true as const, externalId}
  }
}

async function createResource({
  state,
  context,
  runtime,
}: ContextualAction<CreateResourceState<WorkflowsResource>>): ReturnType<WorkflowProvider['create']> {
  const {log} = runtime
  try {
    const resource = parseWorkflowResource(state.desired)
    return await provisionAction({resource, context, runtime})
  } catch (error) {
    return createErrorResponse(error, log, 'Failed to create Editorial Workflows deployment', {
      resourceName: resourceName(state.desired),
    })
  }
}

async function updateResource({
  state,
  context,
  runtime,
}: ContextualAction<UpdateResourceState<WorkflowsResource>>): ReturnType<WorkflowProvider['update']> {
  const {log} = runtime
  try {
    const resource = parseUpdateResource(state)
    return await provisionAction({resource, context, runtime})
  } catch (error) {
    return createErrorResponse(error, log, 'Failed to update Editorial Workflows deployment', {
      resourceName: resourceName(state.desired),
      externalId: state.externalId,
    })
  }
}

async function provisionAction({resource, context, runtime}: ResourceAction): ReturnType<WorkflowProvider['create']> {
  const result = await provision({resource, context, runtime})
  return {
    success: true,
    externalId: result.externalId,
    resource: result.resolved,
    providerMetadata: {
      deployId: result.receipt.deployId,
      provisionedDefinitions: result.receipt.results,
    },
    rollback: rollback({
      resource,
      client: result.client,
      receipt: result.receipt,
      externalId: result.externalId,
      dependencies: runtime.dependencies,
    }),
  }
}

async function readAction({
  state,
  context,
  runtime,
}: ContextualAction<ExistingResourceState<WorkflowsResource>>): ReturnType<WorkflowProvider['read']> {
  const {dependencies, log} = runtime
  try {
    const resource = parseExistingResource(state)
    const client = dependencies.createClient(resource, context)
    const snapshot = await dependencies.readResource({resource, client})
    assertExternalId(snapshot.externalId, state.externalId)
    return {success: true, resource: resolvedFromSnapshot(resource, snapshot)}
  } catch (error) {
    return createErrorResponse(error, log, 'Failed to read Editorial Workflows deployment', {
      resourceName: resourceName(state.current),
      externalId: state.externalId,
    })
  }
}

async function destroyAction({
  state,
  runtime: {log},
}: {
  state: DestroyResourceState<WorkflowsResource>
  runtime: ProviderRuntime
}): ReturnType<WorkflowProvider['destroy']> {
  try {
    parseExistingResource(state)
    destroyWorkflowResource()
  } catch (error) {
    return createErrorResponse(error, log, 'Failed to destroy Editorial Workflows deployment', {
      resourceName: resourceName(state.current),
      externalId: state.externalId,
    })
  }
}

function createProvider(dependencies: WorkflowProviderDependencies, helpers: ProviderHelpers): WorkflowProvider {
  const runtime = {dependencies, log: helpers.log}
  return {
    validate(parameters) {
      return validateResource(parameters)
    },
    validateUpdate(state) {
      try {
        parseUpdateResource(state)
        return {valid: true, errors: []}
      } catch (error) {
        return {valid: false, errors: [errorMessage(error)]}
      }
    },
    validateDestroy(state) {
      const parsed = validateResource(state.current)
      if (!parsed.valid) return parsed
      return {
        valid: false,
        errors: ['Editorial Workflows definitions are retain-only; Blueprints must detach this resource instead of destroying it'],
      }
    },
    create: (state, context) => createResource({state, context, runtime}),
    read: (state, context) => readAction({state, context, runtime}),
    list: async () => ({
      success: false,
      error: 'Listing Editorial Workflows resources is not supported; the manifest owns the definition names managed by each resource',
    }),
    update: (state, context) => updateResource({state, context, runtime}),
    destroy: (state) => destroyAction({state, runtime}),
  }
}

export function createWorkflowProviderFactory(dependencies: WorkflowProviderDependencies = defaultDependencies): WorkflowProviderFactory {
  const factory: WorkflowProviderFactory = (helpers) => createProvider(dependencies, helpers)
  factory.resourceType = WORKFLOW_RESOURCE_TYPE
  factory.apiUrl = blueprintApiHostFromEnv(env['BLUEPRINTS_ENV'])
  factory.displayName = 'Editorial Workflows deployment'
  factory.displayNamePlural = 'Editorial Workflows deployments'
  factory.lifecycleConfig = {
    defaultDeletionPolicy: 'retain',
    preventDetach: false,
  }
  factory.scope = null
  factory.primaryIdentifierPath = 'externalId'
  return factory
}
