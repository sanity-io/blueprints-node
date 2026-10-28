import {type BlueprintError, validateResource} from '../index.js'
import {isReference} from '../utils/validation.js'

const MCP_ENDPOINT_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MCP_ENDPOINT_ID_PATTERN = /^mcp[a-z0-9]{8}$/
const DATASET_SOURCE_PATTERN = /^[a-z0-9]+\.[a-z0-9][a-z0-9_-]*$/

function validateText(resource: object, field: string, label: string, options: {required: boolean; max: number}): BlueprintError[] {
  if (!(field in resource)) {
    return options.required ? [{type: 'missing_parameter', message: `${label} is required`}] : []
  }
  const value: unknown = Reflect.get(resource, field)
  if (typeof value !== 'string') return [{type: 'invalid_type', message: `${label} must be a string`}]
  if (value.length === 0) return [{type: 'invalid_value', message: `${label} must not be empty`}]
  if (value.length > options.max) {
    return [{type: 'invalid_value', message: `${label} must be ${options.max} characters or less`}]
  }
  return []
}

/**
 * Validates that the given resource is a valid Context knowledge base.
 * @param resource The Context knowledge base resource
 * @beta This feature is subject to breaking changes.
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateContextKnowledgeBase(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Knowledge base config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Knowledge base config must be an object'}]

  const errors: BlueprintError[] = validateResource(resource)

  if ('type' in resource && resource.type !== 'sanity.context.knowledge-base') {
    errors.push({type: 'invalid_value', message: 'Knowledge base type must be `sanity.context.knowledge-base`'})
  }

  errors.push(...validateText(resource, 'title', 'Knowledge base title', {required: true, max: 100}))
  errors.push(...validateText(resource, 'description', 'Knowledge base description', {required: true, max: 2000}))

  return errors
}

/**
 * Validates that the given resource is a valid Context MCP endpoint.
 * @param resource The Context MCP endpoint resource
 * @beta This feature is subject to breaking changes.
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateContextMcpEndpoint(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'MCP endpoint config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'MCP endpoint config must be an object'}]

  const errors: BlueprintError[] = validateResource(resource)

  if ('type' in resource && resource.type !== 'sanity.context.mcp') {
    errors.push({type: 'invalid_value', message: 'MCP endpoint type must be `sanity.context.mcp`'})
  }

  if ('name' in resource && typeof resource.name === 'string') {
    if (resource.name.length > 64 || !MCP_ENDPOINT_NAME_PATTERN.test(resource.name)) {
      errors.push({
        type: 'invalid_format',
        message: 'MCP endpoint name must be lowercase letters, digits and single hyphens, up to 64 characters',
      })
    } else if (resource.name === 'by-name' || MCP_ENDPOINT_ID_PATTERN.test(resource.name)) {
      errors.push({type: 'invalid_value', message: `MCP endpoint name "${resource.name}" is reserved`})
    }
  }

  errors.push(...validateText(resource, 'title', 'MCP endpoint title', {required: true, max: 100}))
  errors.push(...validateText(resource, 'instructions', 'MCP endpoint instructions', {required: false, max: 10_000}))
  errors.push(...validateText(resource, 'groqFilter', 'MCP endpoint GROQ filter', {required: false, max: 10_000}))

  if (!('sources' in resource)) {
    errors.push({type: 'missing_parameter', message: 'MCP endpoint sources are required'})
    return errors
  }
  if (!Array.isArray(resource.sources) || resource.sources.length === 0) {
    errors.push({type: 'invalid_value', message: 'MCP endpoint must have at least one source'})
    return errors
  }
  if (resource.sources.length > 100) {
    errors.push({type: 'invalid_value', message: 'MCP endpoint can have at most 100 sources'})
  }

  let datasets = 0
  for (const source of resource.sources) {
    if (!source || typeof source !== 'object' || !('type' in source) || !('id' in source)) {
      errors.push({type: 'invalid_value', message: 'Each MCP endpoint source needs a `type` and an `id`'})
      continue
    }
    if (typeof source.id !== 'string' || source.id.length === 0) {
      errors.push({type: 'invalid_type', message: 'MCP endpoint source `id` must be a non-empty string'})
      continue
    }
    if (source.type === 'dataset') {
      datasets++
      // The provider checks the format before references resolve, and no resource exposes `<projectId>.<datasetName>`
      if (source.id.startsWith('$.resources.')) {
        errors.push({
          type: 'invalid_value',
          message: `Dataset source "${source.id}" must be "<projectId>.<datasetName>", not a resource reference`,
        })
      } else if (!isReference(source.id) && !DATASET_SOURCE_PATTERN.test(source.id)) {
        errors.push({type: 'invalid_format', message: `Dataset source "${source.id}" must be "<projectId>.<datasetName>"`})
      }
    } else if (source.type !== 'knowledge-base') {
      errors.push({type: 'invalid_value', message: 'MCP endpoint source `type` must be `knowledge-base` or `dataset`'})
    }
  }
  if (datasets > 1) {
    errors.push({type: 'invalid_value', message: 'MCP endpoint can have at most one dataset source'})
  }
  if (datasets === 0 && 'groqFilter' in resource) {
    errors.push({type: 'invalid_value', message: 'MCP endpoint GROQ filter requires a dataset source'})
  }

  return errors
}
