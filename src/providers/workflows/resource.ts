import {
  type AcknowledgedWorkflowDeployment,
  assertReaderModelAcknowledgement,
  errorMessage,
  expandResourceAliases,
  parseDefinitionInput,
  type ResourceAliases,
  refsOf,
  requiredDefinitionReaderModel,
  resourceAliasesToMap,
  validateDefinition,
  type WorkflowConfigInput,
  type WorkflowDefinition,
} from '@sanity/workflow-engine'
import {defineWorkflowConfig} from '@sanity/workflow-engine/define'
import type {BlueprintResource, BlueprintResourceLifecycle} from '../../types/resources.js'
import {validateResource} from '../../validation/resources.js'

export const WORKFLOW_RESOURCE_TYPE = 'sanity.workflow'

/**
 * A Workflows deployment declared as a Sanity Blueprints resource.
 * Pure data: the blueprint manifest serializes it verbatim into the stack
 * mutation, and the provider reads it back to run the definition deploy.
 * Blueprints matches resources by `name`; retain-only lifecycle means removing
 * or renaming this resource in an ordinary stack update is rejected.
 */
export interface WorkflowsResource extends BlueprintResource {
  type: typeof WORKFLOW_RESOURCE_TYPE
  /** The deployment to provision — the same shape as one `deployments[]`
   *  entry of a `sanity.workflow.ts` config, its floor asserted. Definitions
   *  are carried in authored form; `@<handle>:` aliases expand at provision,
   *  not here. */
  deployment: AcknowledgedWorkflowDeployment
}

export function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null
}

/** Provider input may bypass factory validation, so this boundary rejects lifecycle behavior
 *  the provider cannot implement. */
export function parseWorkflowLifecycle(input: unknown, caller: string): unknown {
  if (input === undefined) return {deletionPolicy: 'retain'}
  if (!isRecord(input)) {
    throw new Error(`${caller}: \`lifecycle\` must be an object`)
  }
  const deletionPolicy = input['deletionPolicy']
  if (deletionPolicy === 'allow' || deletionPolicy === 'replace') {
    throw new Error(
      `${caller}: deletionPolicy '${deletionPolicy}' is not supported — ` +
        'Editorial Workflows definitions are retain-only through Blueprints; delete deliberately with ' +
        "the workflow CLI's `definition delete`.",
    )
  }
  if (Object.hasOwn(input, 'ownershipAction')) {
    throw new Error(`${caller}: ownershipAction is not supported for Editorial Workflows resources`)
  }
  return {
    ...input,
    ...(deletionPolicy === undefined ? {deletionPolicy: 'retain'} : {}),
  }
}

export function assertWorkflowResourceEnvelope<T>(
  input: T,
  caller: string,
): asserts input is T & BlueprintResource & {lifecycle: BlueprintResourceLifecycle} {
  // The Blueprints assertion collects errors for a later manifest pass; these boundaries use
  // the validator directly so invalid input throws immediately.
  const errors = validateResource(input)
  if (errors.length > 0) {
    throw new Error(`${caller}: ${errors.map((error) => error.message).join('; ')}`)
  }
}

/**
 * Validates one deployment before a provider action can mutate the Content Lake. Returns the parsed deployment with definition document envelopes
 * stripped, so a fetched definition document round-trips cleanly.
 */
export function parseWorkflowDeployment(input: unknown, caller: string): AcknowledgedWorkflowDeployment {
  // The cast only feeds the typed signature — defineWorkflowConfig
  // runtime-parses its input, which is the actual boundary check.
  const config = defineWorkflowConfig({deployments: [input]} as WorkflowConfigInput)
  const [deployment] = config.deployments
  if (deployment === undefined) {
    throw new Error(`${caller}: expected a workflow deployment`)
  }
  const definitions = deployment.definitions.map((def) => parseDefinitionInput(def as Record<string, unknown>, caller))
  assertReaderModelAcknowledgement(deployment.expectedMinReaderModel, {
    context: caller,
    requiredMinReaderModel: requiredDefinitionReaderModel(definitions),
  })
  const expectedMinReaderModel = deployment.expectedMinReaderModel
  assertUniqueDefinitionNames(definitions, caller)
  definitions.forEach(validateDefinition)
  const aliases = resourceAliasesToMap(deployment.resourceAliases)
  for (const def of definitions) {
    expandOrReattribute({def, aliases, caller})
  }
  assertAcyclicSpawnRefs(definitions, caller)
  // Re-pins the floor: a bare `{...deployment}` spread would widen it back to optional.
  return {...deployment, expectedMinReaderModel, definitions}
}

// A duplicate name would silently collapse in the destroy ordering's name-keyed map.
function assertUniqueDefinitionNames(definitions: WorkflowDefinition[], caller: string): void {
  const seen = new Set<string>()
  for (const def of definitions) {
    if (seen.has(def.name)) {
      throw new Error(`${caller}: duplicate definition name "${def.name}" in deployment`)
    }
    seen.add(def.name)
  }
}

// Reattributes the engine's deploy-verb error prefix because this validation does not run a deploy.
function expandOrReattribute({def, aliases, caller}: {def: WorkflowDefinition; aliases: ResourceAliases; caller: string}): void {
  try {
    expandResourceAliases(def, aliases)
  } catch (error) {
    throw new Error(errorMessage(error).replace(/^workflow\.deployDefinitions: /, `${caller}: `), {
      cause: error,
    })
  }
}

// Version-blind (bare name), not the engine's version-aware resolution — a
// version-pinned mutual reference could deploy but never be deleted.
function assertAcyclicSpawnRefs(definitions: WorkflowDefinition[], caller: string): void {
  const remaining = new Map(definitions.map((def) => [def.name, def]))
  while (remaining.size > 0) {
    const referenced = new Set(
      [...remaining.values()].flatMap((def) => refsOf(def).map((ref) => ref.name)).filter((name) => remaining.has(name)),
    )
    const free = [...remaining.values()].filter((def) => !referenced.has(def.name))
    if (free.length === 0) {
      throw new Error(`${caller}: reference cycle among definitions ${[...remaining.keys()].join(', ')}`)
    }
    for (const def of free) {
      remaining.delete(def.name)
    }
  }
}
