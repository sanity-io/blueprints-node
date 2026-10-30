import type {BlueprintProjectResourceLifecycle, BlueprintResource} from '../index.js'

/**
 * The model value carried on a {@link BlueprintAgentResource}.
 *
 * @remarks
 * `provider`, `id`, and `baseURL` are non-secret and ride on the resource literally; `apiKey` is passed by reference and resolved at blueprint-eval time.
 * @alpha This feature is subject to breaking changes.
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
 * @see https://www.sanity.io/docs/content-lake/agents
 * @alpha This feature is subject to breaking changes.
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
}

/**
 * Configuration for an Agent resource.
 * @see https://www.sanity.io/docs/content-lake/agents
 * @alpha This feature is subject to breaking changes.
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
