import type {BlueprintProjectResourceLifecycle, BlueprintResource} from '../index.js'

/**
 * The model value carried on a {@link BlueprintAgentResource}.
 *
 * This feature is subject to breaking changes.
 *
 * @remarks
 * `provider`, `id`, and `baseURL` are non-secret and ride on the resource literally; `apiKey` is passed by reference and resolved at blueprint-eval time.
 * @alpha
 * @hidden
 * @category Resource Types
 */
export interface BlueprintAgentModel {
  /** Model provider, e.g. `openrouter`. */
  provider: string
  /** Model identifier, e.g. `anthropic/claude-haiku-4.5`. */
  id: string
  /** Optional base URL override. */
  baseURL?: string
  /** Secret model API key, passed by reference at eval time; presence-checked only. */
  apiKey: string
}

/**
 * Represents an Agent resource.
 *
 * This feature is subject to breaking changes.
 * @alpha
 * @hidden
 * @category Resource Types
 */
export interface BlueprintAgentResource extends BlueprintResource<BlueprintProjectResourceLifecycle> {
  type: 'sanity.agent'
  /** Agent name slug, max 63 characters. */
  name: string
  /** Agent description. */
  description?: string
  /** Deploy region, one of the allowlisted cities. */
  region: string
  /** The model the agent uses to serve a turn. */
  model: BlueprintAgentModel
  /** Author-time source path; rewritten to an `AS-...` asset id before deploy. */
  src: string
  /**
   * Robot token for the agent's Sanity tools, usually a reference such as `'$.resources.agent-robot.token'`.
   * Delivered to the agent's runtime and sandbox as `SANITY_AUTH_TOKEN`.
   */
  robotToken?: string
  /**
   * Dataset the agent's Sanity tools use.
   * @defaultValue 'production'
   */
  dataset?: string
}

/**
 * Configuration for an Agent resource.
 * @alpha
 * @hidden
 * @category Resource Types
 * @interface
 */
export type BlueprintAgentConfig = Omit<BlueprintAgentResource, 'type' | 'src'> & {
  /**
   * Source path for the authored agent package.
   * @defaultValue `agents/${name}`
   */
  src?: string
}
