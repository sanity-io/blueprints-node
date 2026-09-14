import {type BlueprintError, validateResource} from '../index.js'
import {isReference} from '../utils/validation.js'

const WORKFLOW_TARGET_TYPES = ['dataset', 'canvas', 'media-library', 'dashboard']
const LAKE_SEGMENT = /^[a-z0-9][a-z0-9-]*$/
const DATASET_RESOURCE_ID = /^[^.\s]+\.[^.\s]+$/

/**
 * Validates that the given resource is a valid Editorial Workflows resource.
 * @param resource The Editorial Workflows resource
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateWorkflows(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Editorial Workflows config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Editorial Workflows config must be an object'}]

  const errors: BlueprintError[] = validateResource(resource)

  if ('name' in resource && resource.name === '') {
    errors.push({type: 'invalid_value', message: 'Editorial Workflows resource name must be a non-empty string'})
  }

  if (!('type' in resource)) {
    errors.push({type: 'missing_parameter', message: 'Editorial Workflows type is required'})
  } else if (resource.type !== 'sanity.workflow') {
    errors.push({type: 'invalid_value', message: 'Editorial Workflows type must be `sanity.workflow`'})
  }

  if ('lifecycle' in resource && isRecord(resource.lifecycle) && 'deletionPolicy' in resource.lifecycle) {
    const policy = resource.lifecycle.deletionPolicy
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
  errors.push(...validateLakeSegment(deployment, 'name', 'deployment name'))
  errors.push(...validateLakeSegment(deployment, 'tag', 'deployment tag'))

  if (!('expectedMinReaderModel' in deployment)) {
    errors.push({type: 'missing_parameter', message: 'Editorial Workflows expected minimum reader model is required'})
  } else {
    const expectedMinReaderModel = deployment.expectedMinReaderModel
    if (!Number.isInteger(expectedMinReaderModel) || Number(expectedMinReaderModel) < 1) {
      errors.push({type: 'invalid_value', message: 'Editorial Workflows expected minimum reader model must be a positive integer'})
    }
  }

  if (!('workflowResource' in deployment)) {
    errors.push({type: 'missing_parameter', message: 'Editorial Workflows target resource is required'})
  } else {
    errors.push(...validateWorkflowTarget(deployment.workflowResource))
  }

  if ('resourceAliases' in deployment) {
    errors.push(...validateResourceAliases(deployment.resourceAliases))
  }

  if (!('definitions' in deployment)) {
    errors.push({type: 'missing_parameter', message: 'Editorial Workflows definitions array is required'})
  } else if (!Array.isArray(deployment.definitions)) {
    errors.push({type: 'invalid_type', message: 'Editorial Workflows definitions must be an array'})
  } else if (deployment.definitions.length === 0) {
    errors.push({type: 'invalid_value', message: 'Editorial Workflows deployment must contain at least one definition'})
  } else {
    errors.push(...validateDefinitions(deployment.definitions))
  }

  return errors
}

function validateNonEmptyString(value: object, key: string, label: string): BlueprintError[] {
  if (!(key in value)) return [{type: 'missing_parameter', message: `Editorial Workflows ${label} is required`}]
  const field = valueAt(value, key)
  if (typeof field !== 'string') return [{type: 'invalid_type', message: `Editorial Workflows ${label} must be a string`}]
  if (field === '') return [{type: 'invalid_value', message: `Editorial Workflows ${label} must be a non-empty string`}]
  return []
}

function validateLakeSegment(value: object, key: string, label: string): BlueprintError[] {
  const errors = validateNonEmptyString(value, key, label)
  const segment = valueAt(value, key)
  if (errors.length === 0 && typeof segment === 'string' && !isReference(segment) && !LAKE_SEGMENT.test(segment)) {
    errors.push({
      type: 'invalid_format',
      message: `Editorial Workflows ${label} must contain only lowercase letters, digits, and dashes, and must not start with a dash`,
    })
  }
  return errors
}

function validateWorkflowTarget(target: unknown): BlueprintError[] {
  if (!isRecord(target)) return [{type: 'invalid_type', message: 'Editorial Workflows target resource must be an object'}]

  const errors = validateNonEmptyString(target, 'id', 'target resource ID')
  if (!('type' in target)) {
    errors.push({type: 'missing_parameter', message: 'Editorial Workflows target resource type is required'})
  } else if (typeof target.type !== 'string' || !WORKFLOW_TARGET_TYPES.includes(target.type)) {
    errors.push({
      type: 'invalid_value',
      message: `Editorial Workflows target resource type must be one of ${WORKFLOW_TARGET_TYPES.join(', ')}`,
    })
  } else if (target.type === 'dataset' && 'id' in target && typeof target.id === 'string' && target.id !== '') {
    if (!isReference(target.id) && !DATASET_RESOURCE_ID.test(target.id)) {
      errors.push({
        type: 'invalid_format',
        message: 'Editorial Workflows dataset target resource ID must be in the form `<projectId>.<dataset>`',
      })
    }
  }
  return errors
}

function validateResourceAliases(aliases: unknown): BlueprintError[] {
  if (!Array.isArray(aliases)) return [{type: 'invalid_type', message: 'Editorial Workflows resource aliases must be an array'}]

  return aliases.flatMap((alias): BlueprintError[] => {
    if (!isRecord(alias)) return [{type: 'invalid_type', message: 'Editorial Workflows resource alias must be an object'}]

    const errors = validateNonEmptyString(alias, 'name', 'resource alias name')
    if (!('resource' in alias)) {
      errors.push({type: 'missing_parameter', message: 'Editorial Workflows resource alias resource is required'})
    } else {
      errors.push(...validateWorkflowTarget(alias.resource))
    }
    return errors
  })
}

function validateDefinitions(definitions: unknown[]): BlueprintError[] {
  const errors = definitions.flatMap((definition): BlueprintError[] => {
    if (!isRecord(definition)) return [{type: 'invalid_type', message: 'Editorial Workflows definition must be an object'}]
    return validateNonEmptyString(definition, 'name', 'definition name')
  })

  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const definition of definitions) {
    if (!isRecord(definition) || !('name' in definition) || typeof definition.name !== 'string') continue
    if (seen.has(definition.name)) duplicates.add(definition.name)
    seen.add(definition.name)
  }
  for (const name of duplicates) {
    errors.push({type: 'invalid_value', message: `Editorial Workflows definition name \`${name}\` is duplicated`})
  }

  return errors
}

function isRecord(value: unknown): value is object {
  return typeof value === 'object' && value !== null
}

function valueAt(value: object, key: string): unknown {
  return (value as Record<string, unknown>)[key]
}
