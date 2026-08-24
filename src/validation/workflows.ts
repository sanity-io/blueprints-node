import type {BlueprintError} from '../types/errors.js'
import {WORKFLOW_TARGET_TYPES} from '../types/workflows.js'
import {validateResource} from './resources.js'

/**
 * Validates the Blueprint manifest envelope for an Editorial Workflows resource.
 *
 * This dependency-free validator checks resource metadata, deployment metadata, targets, aliases, and definition identities. It does not validate
 * complete authored definitions. The registered resource provider must validate the external JSON boundary with the Editorial Workflows engine
 * before provisioning it.
 * @param resource The Editorial Workflows resource
 * @beta This feature is subject to breaking changes.
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

  if ('type' in resource && resource.type !== 'sanity.workflow') {
    errors.push({type: 'invalid_value', message: 'Editorial Workflows type must be `sanity.workflow`'})
  }

  if ('lifecycle' in resource && isRecord(resource.lifecycle)) {
    const policy = valueAt(resource.lifecycle, 'deletionPolicy')
    // Base resource validation owns the complete policy allowlist; this narrows its accepted set for workflows.
    if (policy === 'allow' || policy === 'replace') {
      errors.push({
        type: 'invalid_value',
        message: `Editorial Workflows deletion policy \`${policy}\` is not supported; use \`retain\` (the default) or \`protect\``,
      })
    }
    if ('ownershipAction' in resource.lifecycle) {
      errors.push({
        type: 'invalid_value',
        message: 'Editorial Workflows ownership actions are not supported until the resource provider defines stable ownership semantics',
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

  if ('resourceAliases' in deployment) {
    errors.push(...validateResourceAliases(valueAt(deployment, 'resourceAliases')))
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

function validateResourceAliases(resourceAliases: unknown): BlueprintError[] {
  if (!Array.isArray(resourceAliases)) {
    return [{type: 'invalid_type', message: 'Editorial Workflows resource aliases must be an array'}]
  }

  const errors = resourceAliases.flatMap((binding) => {
    if (!isRecord(binding)) {
      return [{type: 'invalid_type', message: 'Editorial Workflows resource alias must be an object'}]
    }

    const bindingErrors = validateNonEmptyString(binding, 'name', 'resource alias name')
    if (!('resource' in binding)) {
      bindingErrors.push({type: 'missing_parameter', message: 'Editorial Workflows resource alias target is required'})
    } else {
      bindingErrors.push(...validateWorkflowTarget(valueAt(binding, 'resource')))
    }
    return bindingErrors
  })

  const duplicate = firstDuplicateName(resourceAliases.filter(hasStringName))
  if (duplicate !== undefined) {
    errors.push({type: 'invalid_value', message: `Editorial Workflows resource alias name \`${duplicate}\` is duplicated`})
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
    if (typeof targetType !== 'string' || !WORKFLOW_TARGET_TYPES.some((type) => type === targetType)) {
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
  const namedDefinitions = definitions.filter(hasStringName)
  const duplicate = firstDuplicateName(namedDefinitions)
  if (duplicate !== undefined) {
    errors.push({type: 'invalid_value', message: `Editorial Workflows definition name \`${duplicate}\` is duplicated`})
  }
  return errors
}

function firstDuplicateName(items: Array<{name: string}>): string | undefined {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.name)) return item.name
    seen.add(item.name)
  }
  return undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function valueAt(value: Record<string, unknown>, key: string): unknown {
  // A variable key avoids Biome rewriting bracket access to dot access, which TypeScript rejects for index signatures.
  return value[key]
}

function hasStringName(value: unknown): value is Record<string, unknown> & {name: string} {
  return isRecord(value) && typeof valueAt(value, 'name') === 'string'
}
