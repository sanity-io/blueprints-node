import type {Blueprint, BlueprintModule, BlueprintResource, BlueprintsApiConfig} from '../index.js'

/**
 * The scope a Stack lives in
 * @category Resolve
 */
export type ScopeType = 'organization' | 'project'

/**
 * Where a resolved id came from, highest precedence first
 *
 * - `overrides`: passed by the caller, for example from command line flags
 * - `env`: the `SANITY_ORGANIZATION_ID`, `SANITY_PROJECT_ID`, and `SANITY_BLUEPRINT_STACK_ID` environment variables
 * - `module`: attached to the blueprint module by `defineBlueprint`
 * - `config`: `.sanity/blueprint.config.json` next to the blueprint file
 * @category Resolve
 */
export type ConfigSource = 'overrides' | 'env' | 'module' | 'config'

/**
 * The ids that identify a Stack
 * @category Resolve
 */
export type StackIds = Partial<BlueprintsApiConfig>

/**
 * The ids from each source, in the order {@link resolveStackConfig} checks them
 * @category Resolve
 */
export interface StackIdSources {
  overrides?: StackIds | null
  /** Defaults to the `SANITY_*` environment variables. Pass `null` to skip them. */
  env?: StackIds | null
  module?: StackIds | null
  config?: StackIds | null
}

/**
 * The Stack ids and scope, with the source of each id
 * @category Resolve
 */
export interface StackConfig extends StackIds {
  /** `project` when a project id is known, else `organization` when an organization id is known */
  scopeType?: ScopeType
  scopeId?: string
  /** Which source supplied each id */
  sources: {[K in keyof BlueprintsApiConfig]?: ConfigSource}
}

/**
 * The ids in `.sanity/blueprint.config.json`, and the path of that file
 * @category Resolve
 */
export interface StackConfigFile extends StackIds {
  configPath: string
}

/**
 * Imports a blueprint file and returns its default export
 * @category Resolve
 */
export type BlueprintLoader = (path: string) => Promise<unknown>

/**
 * @category Resolve
 */
export interface LoadBlueprintFileOptions {
  /** Imports a JS or TS blueprint file in place of the built-in loading, for example to skip the module cache */
  loader?: BlueprintLoader
}

/**
 * A blueprint file as loaded from disk
 * @category Resolve
 */
export interface LoadedBlueprintFile {
  /** The blueprint document the module returned or the JSON file held */
  blueprint: Blueprint
  /** The default export of a JS or TS file. Absent when the file was JSON. */
  module?: BlueprintModule
}

/**
 * @category Resolve
 */
export interface ReadBlueprintOptions extends LoadBlueprintFileOptions {
  /** A blueprint file or directory. Defaults to the current working directory. */
  path?: string
  /** Ids that win over every other source */
  overrides?: StackIds | null
  /** The environment to read. Defaults to `process.env`. Pass `null` to skip environment variables. */
  env?: NodeJS.ProcessEnv | null
}

/**
 * What a blueprint declares, and the ids that say which Stack it deploys to
 * @category Resolve
 */
export interface BlueprintInfo extends StackConfig, LoadedBlueprintFile {
  /** The absolute path of the blueprint file */
  path: string
  /** `blueprint.resources`, or an empty list */
  resources: BlueprintResource[]
  /** `resources` keyed by name. A later duplicate name wins. */
  resourcesByName: Record<string, BlueprintResource>
  /** The `.sanity/blueprint.config.json` that was read, when one exists */
  configPath?: string
}

/**
 * A resource as the Blueprints API returns it
 * @category Resolve
 */
export interface DeployedResource {
  id: string
  name: string
  type: string
  externalId?: string | null
  parameters?: Record<string, unknown>
  /** Parameters with references to other resources resolved */
  resolvedParameters?: Record<string, unknown>
}

/**
 * A Stack as the Blueprints API returns it
 * @category Resolve
 */
export interface DeployedStack {
  id: string
  name: string
  scopeType: ScopeType
  scopeId: string
  defaultProjectId?: string | null
  resources: DeployedResource[]
}

/**
 * A declared resource with its deployed values, when the Stack has a resource of the same type and name
 * @category Resolve
 */
export type LiveResource = BlueprintResource & {
  /** The id of the resource in the service that owns it */
  externalId?: string
  /** The deployed parameters, with references resolved when the API has them */
  live?: Record<string, unknown>
}

/**
 * A blueprint with the values its deployed Stack holds
 * @category Resolve
 */
export interface StackInfo extends BlueprintInfo {
  stack: DeployedStack
  resources: LiveResource[]
  resourcesByName: Record<string, LiveResource>
  /** `live` parameters by resource name, for the resources the Stack has deployed */
  values: Record<string, Record<string, unknown>>
}

/**
 * @category Resolve
 */
export interface ReadStackOptions extends ReadBlueprintOptions {
  /** A Sanity auth token */
  token: string
  /** Defaults to the global `fetch` */
  fetch?: typeof fetch
  /** The Sanity API origin. Defaults from `SANITY_INTERNAL_ENV`. */
  apiUrl?: string
  /** The Blueprints API version. Defaults to `SANITY_BLUEPRINTS_API_VERSION` or {@link DEFAULT_BLUEPRINTS_API_VERSION}. */
  apiVersion?: string
}
