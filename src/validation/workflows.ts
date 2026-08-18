import {type BlueprintError, validateResource} from '../index.js'

const WORKFLOW_TARGET_TYPES = ['dataset', 'canvas', 'media-library', 'dashboard']

/**
 * Validates that the given resource is a valid Editorial Workflows resource.
 * @param resource The Editorial Workflows resource
 * @category Validation
 * @returns A list of validation errors
 */
export function validateWorkflows(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Editorial Workflows config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Editorial Workflows config must be an object'}]

  const errors = validateResource(resource)

  if ('name' in resource && resource.name === '') {
    errors.push({type: 'invalid_value', message: 'Editorial Workflows resource name must be a non-empty string'})
  }

  if (!('type' in resource)) {
    errors.push({type: 'missing_parameter', message: 'Editorial Workflows type is required'})
  } else if (resource.type !== 'sanity.workflow') {
    errors.push({type: 'invalid_value', message: 'Editorial Workflows type must be `sanity.workflow`'})
  }

  if ('lifecycle' in resource && isRecord(resource.lifecycle)) {
    const policy = valueAt(resource.lifecycle, 'deletionPolicy')
    if (policy === 'allow' || policy === 'replace') {
      errors.push({
        type: 'invalid_value',
        message: `Editorial Workflows deletion policy \`${policy}\` is not supported; definitions are retain-only through Blueprints`,
      })
    }
  }

  if (!('deployment' in resource)) {
    errors.push({type: 'missing_parameter', message: 'Editorial Workflows deployment is required'})
  } else {
    errors.push(...validateWorkflowDeployment(resource.deployment))
  }

  return errors
}

function validateWorkflowDeployment(deployment: unknown): BlueprintError[] {
  if (!isRecord(deployment)) return [{type: 'invalid_type', message: 'Editorial Workflows deployment must be an object'}]

  const errors: BlueprintError[] = []
  errors.push(...validateNonEmptyString(deployment, 'name', 'deployment name'))
  errors.push(...validateNonEmptyString(deployment, 'tag', 'deployment tag'))

  if (!('expectedMinReaderModel' in deployment)) {
    errors.push({type: 'missing_parameter', message: 'Editorial Workflows expected minimum reader model is required'})
  } else {
    const expectedMinReaderModel = valueAt(deployment, 'expectedMinReaderModel')
    if (!Number.isInteger(expectedMinReaderModel) || Number(expectedMinReaderModel) < 1) {
      errors.push({type: 'invalid_value', message: 'Editorial Workflows expected minimum reader model must be a positive integer'})
    }
  }

  if (!('workflowResource' in deployment)) {
    errors.push({type: 'missing_parameter', message: 'Editorial Workflows target resource is required'})
  } else {
    errors.push(...validateWorkflowTarget(valueAt(deployment, 'workflowResource')))
  }

  const definitions = valueAt(deployment, 'definitions')
  if (!('definitions' in deployment)) {
    errors.push({type: 'missing_parameter', message: 'Editorial Workflows definitions array is required'})
  } else if (!Array.isArray(definitions)) {
    errors.push({type: 'invalid_type', message: 'Editorial Workflows definitions must be an array'})
  } else if (definitions.length === 0) {
    errors.push({type: 'invalid_value', message: 'Editorial Workflows deployment must contain at least one definition'})
  } else {
    errors.push(...validateDefinitions(definitions))
  }

  return errors
}

function validateNonEmptyString(value: Record<string, unknown>, key: string, label: string): BlueprintError[] {
  if (!(key in value)) return [{type: 'missing_parameter', message: `Editorial Workflows ${label} is required`}]
  if (typeof value[key] !== 'string') return [{type: 'invalid_type', message: `Editorial Workflows ${label} must be a string`}]
  if (value[key] === '') return [{type: 'invalid_value', message: `Editorial Workflows ${label} must be a non-empty string`}]
  return []
}

function validateWorkflowTarget(target: unknown): BlueprintError[] {
  if (!isRecord(target)) return [{type: 'invalid_type', message: 'Editorial Workflows target resource must be an object'}]

  const errors = validateNonEmptyString(target, 'id', 'target resource ID')
  if (!('type' in target)) {
    errors.push({type: 'missing_parameter', message: 'Editorial Workflows target resource type is required'})
  } else {
    const targetType = valueAt(target, 'type')
    if (typeof targetType !== 'string' || !WORKFLOW_TARGET_TYPES.includes(targetType)) {
      errors.push({
        type: 'invalid_value',
        message: `Editorial Workflows target resource type must be one of ${WORKFLOW_TARGET_TYPES.join(', ')}`,
      })
    }
  }
  return errors
}

function validateDefinitions(definitions: unknown[]): BlueprintError[] {
  const errors = definitions.flatMap((definition) => {
    if (!isRecord(definition)) return [{type: 'invalid_type', message: 'Editorial Workflows definition must be an object'}]
    return validateNonEmptyString(definition, 'name', 'definition name')
  })
  const namedDefinitions = definitions.filter(isNamedDefinition)
  const duplicate = firstDuplicateName(namedDefinitions)
  if (duplicate !== undefined) {
    errors.push({type: 'invalid_value', message: `Editorial Workflows definition name \`${duplicate}\` is duplicated`})
  }
  const cycle = firstCycleName(namedDefinitions)
  if (cycle !== undefined) {
    errors.push({type: 'invalid_value', message: `Editorial Workflows definitions contain a reference cycle involving \`${cycle}\``})
  }
  return errors
}

function firstDuplicateName(definitions: Array<Record<string, unknown> & {name: string}>): string | undefined {
  const seen = new Set<string>()
  for (const definition of definitions) {
    if (seen.has(definition.name)) return definition.name
    seen.add(definition.name)
  }
  return undefined
}

function firstCycleName(definitions: Array<Record<string, unknown> & {name: string}>): string | undefined {
  const byName = new Map(definitions.map((definition) => [definition.name, definition]))
  const visited = new Set<string>()
  const visiting = new Set<string>()

  function visit(name: string): string | undefined {
    if (visited.has(name)) return undefined
    if (visiting.has(name)) return name
    const definition = byName.get(name)
    if (definition === undefined) return undefined

    visiting.add(name)
    for (const reference of spawnReferenceNames(definition)) {
      if (!byName.has(reference)) continue
      const cycle = visit(reference)
      if (cycle !== undefined) return cycle
    }
    visiting.delete(name)
    visited.add(name)
    return undefined
  }

  for (const name of byName.keys()) {
    const cycle = visit(name)
    if (cycle !== undefined) return cycle
  }
  return undefined
}

function spawnReferenceNames(definition: Record<string, unknown>): string[] {
  return arrayAt(definition, 'stages')
    .filter(isRecord)
    .flatMap((stage) => arrayAt(stage, 'activities'))
    .filter(isRecord)
    .flatMap((activity) => arrayAt(activity, 'actions'))
    .filter(isRecord)
    .flatMap((action) => {
      const spawn = valueAt(action, 'spawn')
      if (!isRecord(spawn)) return []
      const referencedDefinition = valueAt(spawn, 'definition')
      if (!isRecord(referencedDefinition)) return []
      const referencedName = valueAt(referencedDefinition, 'name')
      return typeof referencedName === 'string' ? [referencedName] : []
    })
}

function arrayAt(value: Record<string, unknown>, key: string): unknown[] {
  return Array.isArray(value[key]) ? value[key] : []
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function valueAt(value: Record<string, unknown>, key: string): unknown {
  return value[key]
}

function isNamedDefinition(value: unknown): value is Record<string, unknown> & {name: string} {
  return isRecord(value) && typeof valueAt(value, 'name') === 'string'
}
