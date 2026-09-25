import {existsSync, readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {cwd, env as processEnv} from 'node:process'
import type {BlueprintsApiConfig} from '../index.js'
import type {ConfigSource, StackConfig, StackConfigFile, StackIdSources, StackIds} from './types.js'

/**
 * The directory next to the blueprint file that holds the Stack config
 * @category Resolve
 */
export const STACK_CONFIG_DIR = '.sanity'

/**
 * The file in {@link STACK_CONFIG_DIR} that holds the Stack ids
 * @category Resolve
 */
export const STACK_CONFIG_FILE = 'blueprint.config.json'

const ID_KEYS: (keyof BlueprintsApiConfig)[] = ['organizationId', 'projectId', 'stackId']

/**
 * Read `.sanity/blueprint.config.json` from a blueprint directory
 * @param dir The blueprint directory. Defaults to the current working directory.
 * @returns The ids in the file and its path, or `undefined` when the file does not exist
 * @throws When the file exists and is not valid JSON
 * @category Resolve
 */
export function readStackConfigFile(dir: string = cwd()): StackConfigFile | undefined {
  const configPath = resolve(dir, STACK_CONFIG_DIR, STACK_CONFIG_FILE)
  if (!existsSync(configPath)) return undefined

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(readFileSync(configPath, 'utf8'))
  } catch (error) {
    throw new Error(`Unable to parse ${configPath}`, {cause: error})
  }

  return {configPath, ...pickIds(parsed)}
}

/**
 * Read the Stack ids from `SANITY_ORGANIZATION_ID`, `SANITY_PROJECT_ID`, and `SANITY_BLUEPRINT_STACK_ID`
 * @param env The environment to read. Defaults to `process.env`.
 * @category Resolve
 */
export function stackIdsFromEnv(env: NodeJS.ProcessEnv = processEnv): StackIds {
  return pickIds({
    organizationId: env.SANITY_ORGANIZATION_ID,
    projectId: env.SANITY_PROJECT_ID,
    stackId: env.SANITY_BLUEPRINT_STACK_ID,
  })
}

/**
 * Resolve the Stack ids and scope, and which source supplied each id
 *
 * Precedence: `overrides`, `env`, `module`, `config`. The scope is the project if known, else the organization.
 *
 * @example
 * ```ts
 * const config = resolveStackConfig({config: readStackConfigFile()})
 * config.stackId // 'ST-abc123'
 * config.sources.stackId // 'config'
 * ```
 * @category Resolve
 */
export function resolveStackConfig(sources: StackIdSources = {}): StackConfig {
  const ordered: [ConfigSource, StackIds | null | undefined][] = [
    ['overrides', sources.overrides],
    ['env', sources.env === undefined ? stackIdsFromEnv() : sources.env],
    ['module', sources.module],
    ['config', sources.config],
  ]

  const config: StackConfig = {sources: {}}
  for (const [source, values] of ordered) {
    if (!values) continue
    for (const key of ID_KEYS) {
      const value = values[key]
      if (!config[key] && value) {
        config[key] = value
        config.sources[key] = source
      }
    }
  }

  if (config.projectId) {
    config.scopeType = 'project'
    config.scopeId = config.projectId
  } else if (config.organizationId) {
    config.scopeType = 'organization'
    config.scopeId = config.organizationId
  }

  return config
}

function pickIds(values: Record<string, unknown>): StackIds {
  const ids: StackIds = {}
  for (const key of ID_KEYS) {
    const value = values[key]
    if (typeof value === 'string' && value.length > 0) ids[key] = value
  }
  return ids
}
