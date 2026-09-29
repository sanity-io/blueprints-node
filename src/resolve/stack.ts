import {env as processEnv} from 'node:process'
import {byName} from './by-name.js'
import {readBlueprint} from './load.js'
import type {DeployedStack, LiveResource, ReadStackOptions, StackInfo} from './types.js'

/**
 * The Blueprints API version {@link readStack} uses when none is configured
 * @category Resolve
 */
export const DEFAULT_BLUEPRINTS_API_VERSION = 'v2026-06-15'

const API_URLS: Record<string, string> = {
  production: 'https://api.sanity.io',
  staging: 'https://api.sanity.work',
}

/**
 * Read a local blueprint and its deployed Stack
 *
 * Adds each deployed resource's `externalId` and `live` values to the declared resource with the same type and name.
 *
 * @example
 * ```ts
 * import {readStack} from '@sanity/blueprints/resolve'
 *
 * const {values, resourcesByName} = await readStack({token: process.env.SANITY_AUTH_TOKEN})
 * values['production-dataset']?.['name'] // the deployed dataset's name
 * resourcesByName['my-function']?.externalId
 * ```
 * @throws When {@link readBlueprint} throws, the Stack id or scope is unknown, or the API responds with an error
 * @category Resolve
 */
export async function readStack(options: ReadStackOptions): Promise<StackInfo> {
  const blueprint = await readBlueprint(options)
  const {stackId, scopeType, scopeId} = blueprint

  if (!stackId || !scopeType || !scopeId) {
    throw new Error(
      `No Stack to read for ${blueprint.path}. Set a Stack id and a project or organization id in ` +
        '.sanity/blueprint.config.json, in defineBlueprint, or in the SANITY_BLUEPRINT_STACK_ID and ' +
        'SANITY_PROJECT_ID or SANITY_ORGANIZATION_ID environment variables.',
    )
  }

  const env = options.env === undefined ? processEnv : options.env
  const apiUrl = (options.apiUrl ?? apiUrlFromEnv(env)).replace(/\/$/, '')
  const apiVersion = options.apiVersion ?? env?.SANITY_BLUEPRINTS_API_VERSION ?? DEFAULT_BLUEPRINTS_API_VERSION
  const fetchFn = options.fetch ?? globalThis.fetch

  const response = await fetchFn(`${apiUrl}/${apiVersion}/blueprints/stacks/${stackId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${options.token}`,
      'X-Sanity-Scope-Type': scopeType,
      'X-Sanity-Scope-Id': scopeId,
      'User-Agent': '@sanity/blueprints',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to read Stack ${stackId}: ${response.status} ${await errorMessage(response)}`)
  }

  const stack: DeployedStack = await response.json()
  const deployed = new Map(stack.resources.map((resource) => [`${resource.type}:${resource.name}`, resource]))

  const resources: LiveResource[] = blueprint.resources.map((resource) => {
    const match = deployed.get(`${resource.type}:${resource.name}`)
    if (!match) return resource
    return {
      ...resource,
      externalId: match.externalId ?? undefined,
      live: match.resolvedParameters ?? match.parameters,
    }
  })

  const values: StackInfo['values'] = {}
  for (const resource of resources) {
    if (resource.live) values[resource.name] = resource.live
  }

  return {...blueprint, stack, resources, resourcesByName: byName(resources), values}
}

function apiUrlFromEnv(env: NodeJS.ProcessEnv | null): string {
  const sanityEnv = env?.SANITY_INTERNAL_ENV?.toLowerCase()
  if (!sanityEnv) return API_URLS.production
  // a value that is not a known environment is the origin itself
  return API_URLS[sanityEnv] ?? sanityEnv
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body: {message?: unknown} = await response.json()
    if (typeof body.message === 'string') return body.message
  } catch {
    // the body was not JSON
  }
  return response.statusText
}
