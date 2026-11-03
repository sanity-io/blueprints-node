import type {BlueprintError} from '../types/errors.js'

/** Slug pattern an agent `name` must match. */
const AGENT_NAME_SLUG = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/

/** Maximum length of an agent `name`. */
const AGENT_NAME_MAX_LENGTH = 63

/** Maximum length of an agent `description`. */
const AGENT_DESCRIPTION_MAX_LENGTH = 255

/** Allowlisted deploy regions (cities). */
const AGENT_REGIONS = [
  'virginia',
  'ohio',
  'california',
  'portland',
  'montreal',
  'calgary',
  'ireland',
  'london',
  'paris',
  'frankfurt',
  'zurich',
  'stockholm',
  'milan',
  'spain',
] as const

/**
 * Validates that the given resource is a valid Agent.
 *
 * @remarks
 * Validates the `name` slug, optional `description`, the `region` allowlist, and the `model` shape; `model.apiKey` is presence-checked only.
 * @param resource The Agent resource
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateAgent(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Agent config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Agent config must be an object'}]

  const errors: BlueprintError[] = []

  if ('type' in resource && resource.type !== 'sanity.agent') {
    errors.push({type: 'invalid_value', message: 'Agent type must be `sanity.agent`'})
  }

  if (!('name' in resource)) {
    errors.push({type: 'missing_parameter', message: '`name` is required'})
  } else if (typeof resource.name !== 'string') {
    errors.push({type: 'invalid_type', message: '`name` must be a string'})
  } else {
    if (resource.name.length > AGENT_NAME_MAX_LENGTH) {
      errors.push({type: 'invalid_value', message: `\`name\` must be at most ${AGENT_NAME_MAX_LENGTH} characters`})
    }
    if (!AGENT_NAME_SLUG.test(resource.name)) {
      errors.push({type: 'invalid_format', message: '`name` must match the slug pattern `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`'})
    }
  }

  if ('description' in resource && typeof resource.description !== 'undefined') {
    if (typeof resource.description !== 'string') {
      errors.push({type: 'invalid_type', message: '`description` must be a string'})
    } else if (resource.description.length > AGENT_DESCRIPTION_MAX_LENGTH) {
      errors.push({type: 'invalid_value', message: `\`description\` must be at most ${AGENT_DESCRIPTION_MAX_LENGTH} characters`})
    }
  }

  if (!('region' in resource)) {
    errors.push({type: 'missing_parameter', message: '`region` is required'})
  } else if (typeof resource.region !== 'string') {
    errors.push({type: 'invalid_type', message: '`region` must be a string'})
  } else if (!AGENT_REGIONS.includes(resource.region as (typeof AGENT_REGIONS)[number])) {
    errors.push({type: 'invalid_value', message: `\`region\` must be one of ${AGENT_REGIONS.join(', ')}`})
  }

  errors.push(...validateAgentModel(resource))

  return errors
}

/**
 * Validates the `model` value on an agent resource; `apiKey` is presence-checked only.
 * @param resource The agent resource (already known to be an object)
 * @returns A list of validation errors
 */
function validateAgentModel(resource: object): BlueprintError[] {
  if (!('model' in resource) || typeof resource.model === 'undefined' || resource.model === null) {
    return [{type: 'missing_parameter', message: '`model` is required'}]
  }

  const {model} = resource
  if (typeof model !== 'object') {
    return [{type: 'invalid_type', message: '`model` must be an object'}]
  }

  const errors: BlueprintError[] = []

  if (!('provider' in model)) {
    errors.push({type: 'missing_parameter', message: '`model.provider` is required'})
  } else if (typeof model.provider !== 'string') {
    errors.push({type: 'invalid_type', message: '`model.provider` must be a string'})
  } else if (model.provider.length === 0) {
    errors.push({type: 'invalid_value', message: '`model.provider` must be a non-empty string'})
  }

  if (!('id' in model)) {
    errors.push({type: 'missing_parameter', message: '`model.id` is required'})
  } else if (typeof model.id !== 'string') {
    errors.push({type: 'invalid_type', message: '`model.id` must be a string'})
  } else if (model.id.length === 0) {
    errors.push({type: 'invalid_value', message: '`model.id` must be a non-empty string'})
  }

  if ('baseURL' in model && typeof model.baseURL !== 'undefined') {
    if (typeof model.baseURL !== 'string') {
      errors.push({type: 'invalid_type', message: '`model.baseURL` must be a string'})
    } else if (!isWellFormedUrl(model.baseURL)) {
      errors.push({type: 'invalid_format', message: '`model.baseURL` must be a well-formed URL'})
    }
  }

  if (!('apiKey' in model)) {
    errors.push({type: 'missing_parameter', message: '`model.apiKey` is required'})
  } else if (typeof model.apiKey !== 'string') {
    errors.push({type: 'invalid_type', message: '`model.apiKey` must be a string'})
  } else if (model.apiKey.length === 0) {
    errors.push({type: 'invalid_value', message: 'model.apiKey is empty'})
  }

  return errors
}

/**
 * Checks whether a value is a well-formed absolute URL.
 * @param value The value to check
 * @returns `true` if the value parses as a URL
 */
function isWellFormedUrl(value: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(value)
    return true
  } catch {
    return false
  }
}
