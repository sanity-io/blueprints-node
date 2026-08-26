import {
  assertReadableModel,
  DefinitionNotFoundError,
  type DeployDefinitionResult,
  type DeployDefinitionsResult,
  type DeployedDefinition,
  latestDefinitionsGroq,
  resourceAliasesToMap,
  type WorkflowClient,
  type WorkflowDeployment,
  type WorkflowResource,
  type WorkflowTelemetryLogger,
  workflow,
} from '@sanity/workflow-engine'

import {
  assertWorkflowResourceEnvelope,
  isRecord,
  parseWorkflowDeployment,
  parseWorkflowLifecycle,
  WORKFLOW_RESOURCE_TYPE,
  type WorkflowsResource,
} from './resource.js'

/**
 * One provider lifecycle call's scope: the resource document as it arrives
 * from the blueprint service (parsed and validated at this boundary) and a
 * client bound to the deployment's `workflowResource`.
 */
export interface WorkflowResourceScope {
  resource: unknown
  client: WorkflowClient
  telemetry?: WorkflowTelemetryLogger
}

/** The partition-bound receipt a successful create or update returns for exact rollback. */
export interface WorkflowProvisionReceipt extends DeployDefinitionsResult {
  externalId: string
}

/** One latest deployed version managed by the resource being read. */
export interface WorkflowResourceDefinitionSnapshot {
  name: string
  version: number
  contentHash?: string
}

/** The physical partition identity and its manifest-managed deployed state. */
export interface WorkflowResourceSnapshot {
  externalId: string
  definitions: WorkflowResourceDefinitionSnapshot[]
}

export interface WorkflowResourceRollbackScope extends WorkflowResourceScope {
  /** The provision receipt, parsed again before any destructive operation. */
  receipt: unknown
}

/** Provider input is JSON from the stack, never a trusted typed value. */
export function parseWorkflowResource(input: unknown): WorkflowsResource {
  if (!isRecord(input)) {
    throw new Error('workflow resource: expected an object')
  }
  if (input['type'] !== WORKFLOW_RESOURCE_TYPE) {
    throw new Error(`workflow resource: expected type "${WORKFLOW_RESOURCE_TYPE}", got "${String(input['type'])}"`)
  }
  if (typeof input['name'] !== 'string' || input['name'] === '') {
    throw new Error('workflow resource: `name` must be a non-empty string')
  }
  const deployment = parseWorkflowDeployment(input['deployment'], 'workflow resource')
  const parsed = {
    ...input,
    type: WORKFLOW_RESOURCE_TYPE,
    name: input['name'],
    lifecycle: parseWorkflowLifecycle(input['lifecycle'], 'workflow resource'),
    deployment,
  } as const
  assertWorkflowResourceEnvelope(parsed, 'workflow resource')
  return parsed
}

/**
 * Identify the physical deployment partition without ambiguous separators.
 * Resource names are stack-local manifest identity; the deployed definitions
 * themselves are shared by every stack targeting the same resource and tag.
 */
export function workflowResourceExternalId(deployment: Pick<WorkflowDeployment, 'workflowResource' | 'tag'>): string {
  const {type, id} = deployment.workflowResource
  return `${WORKFLOW_RESOURCE_TYPE}:${JSON.stringify([type, id, deployment.tag])}`
}

/** The engine-scope slice of every `workflow.*` call the provider makes. */
interface EngineScope {
  client: WorkflowClient
  tag: string
  workflowResource: WorkflowResource
  telemetry?: WorkflowTelemetryLogger
}

// `exactOptionalPropertyTypes` — an absent telemetry stays absent rather than
// widening every downstream verb arg to `| undefined`.
function engineScope({client, telemetry}: Omit<WorkflowResourceScope, 'resource'>, deployment: WorkflowDeployment): EngineScope {
  return {
    client,
    tag: deployment.tag,
    workflowResource: deployment.workflowResource,
    ...(telemetry === undefined ? {} : {telemetry}),
  }
}

/**
 * One function for create and update: the deploy converges, so re-running after a partial failure is safe. A definition removed from the deployment
 * since the last provision is retained, not deleted.
 */
export async function provisionWorkflowResource({resource, ...scope}: WorkflowResourceScope): Promise<WorkflowProvisionReceipt> {
  const {deployment} = parseWorkflowResource(resource)
  const result = await workflow.deployDefinitions({
    ...engineScope(scope, deployment),
    expectedMinReaderModel: deployment.expectedMinReaderModel,
    resourceAliases: resourceAliasesToMap(deployment.resourceAliases),
    definitions: deployment.definitions,
  })
  return {...result, externalId: workflowResourceExternalId(deployment)}
}

/**
 * Read the actual latest versions for the definition names managed by this
 * manifest resource. Deployed names omitted from the manifest are unmanaged
 * and deliberately absent from the snapshot, even though they remain in the
 * physical partition.
 */
export async function readWorkflowResource({resource, ...scope}: WorkflowResourceScope): Promise<WorkflowResourceSnapshot> {
  const {deployment} = parseWorkflowResource(resource)
  const managedNames = new Set(deployment.definitions.map((definition) => definition.name))
  const deployed = (
    await workflow.query<DeployedDefinition[]>({
      ...engineScope(scope, deployment),
      groq: latestDefinitionsGroq(),
    })
  )
    .filter((definition) => managedNames.has(definition.name))
    .map(assertReadableModel)
    .map(({name, version, contentHash}) => ({
      name,
      version,
      ...(contentHash === undefined ? {} : {contentHash}),
    }))
  return {externalId: workflowResourceExternalId(deployment), definitions: deployed}
}

/**
 * Roll back one successful provision by deleting only versions its receipt
 * marks as created. Exact-version, non-cascading deletion preserves earlier
 * definitions and every instance.
 */
export async function rollbackWorkflowResource({resource, receipt, ...scope}: WorkflowResourceRollbackScope): Promise<void> {
  const {deployment} = parseWorkflowResource(resource)
  const parsedReceipt = parseWorkflowProvisionReceipt(receipt)
  const externalId = workflowResourceExternalId(deployment)
  if (parsedReceipt.externalId !== externalId) {
    throw new Error(`workflow resource: rollback receipt belongs to "${parsedReceipt.externalId}", expected "${externalId}"`)
  }
  const managedNames = new Set(deployment.definitions.map((definition) => definition.name))
  const unmanagedResult = parsedReceipt.results.find((result) => !managedNames.has(result.name))
  if (unmanagedResult !== undefined) {
    throw new Error(`workflow resource: rollback receipt contains unmanaged definition "${unmanagedResult.name}"`)
  }
  // Deploy results are children-first; rollback must remove referrers before dependencies.
  const created = parsedReceipt.results.filter((result) => result.status === 'created').toReversed()
  for (const result of created) {
    try {
      await workflow.deleteDefinition({
        ...engineScope(scope, deployment),
        definition: result.name,
        version: result.version,
      })
    } catch (error) {
      if (!(error instanceof DefinitionNotFoundError)) throw error
    }
  }
}

function parseWorkflowProvisionReceipt(input: unknown): WorkflowProvisionReceipt {
  if (!isRecord(input)) throw new Error('workflow resource: rollback receipt must be an object')
  const {deployId, externalId, results} = input
  if (typeof deployId !== 'string' || deployId === '') {
    throw new Error('workflow resource: rollback receipt deployId must be a non-empty string')
  }
  if (typeof externalId !== 'string' || externalId === '') {
    throw new Error('workflow resource: rollback receipt externalId must be a non-empty string')
  }
  if (!Array.isArray(results)) {
    throw new Error('workflow resource: rollback receipt results must be an array')
  }
  return {deployId, externalId, results: results.map(parseWorkflowProvisionResult)}
}

function parseWorkflowProvisionResult(input: unknown, index: number): DeployDefinitionResult {
  if (!isRecord(input)) {
    throw new Error(`workflow resource: rollback receipt result ${index} must be an object`)
  }
  const {name, status, version, warnings} = input
  if (typeof name !== 'string' || name === '') {
    throw new Error(`workflow resource: rollback receipt result ${index} name must be non-empty`)
  }
  if (typeof version !== 'number' || !Number.isInteger(version) || version <= 0) {
    throw new Error(`workflow resource: rollback receipt result ${index} version must be a positive integer`)
  }
  if (status !== 'created' && status !== 'unchanged') {
    throw new Error(`workflow resource: rollback receipt result ${index} status must be created or unchanged`)
  }
  if (warnings !== undefined && !isStringArray(warnings)) {
    throw new Error(`workflow resource: rollback receipt result ${index} warnings must be strings`)
  }
  return {name, status, version, ...(warnings === undefined ? {} : {warnings})}
}

function isStringArray(input: unknown): input is string[] {
  return Array.isArray(input) && input.every((value) => typeof value === 'string')
}

/**
 * Refuses physical destruction. The Blueprints retain path must detach the
 * resource without calling this function, so stack teardown cannot delete
 * deployed definitions or instances.
 */
export function destroyWorkflowResource(): never {
  throw new Error(
    'workflow resource: destroy is not supported — Editorial Workflows definitions are ' +
      'retain-only through Blueprints. Deployed definitions and their instances outlive the ' +
      "stack; delete deliberately with the workflow CLI's `definition delete`.",
  )
}
