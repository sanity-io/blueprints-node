import type {BlueprintProjectResourceLifecycle, BlueprintResource} from '../index.js'

/**
 * The first-class model value carried on a {@link BlueprintAgentResource}.
 *
 * @remarks
 * `provider`, `id`, and `baseURL` are NON-SECRET and ride on the resource
 * literally. `apiKey` is a SECRET supplied BY REFERENCE at blueprint-eval time
 * (the author passes `process.env.OPEN_ROUTER_KEY`); the committed blueprint
 * carries the reference expression, never a literal secret value.
 * @alpha This feature is subject to breaking changes.
 * @hidden
 * @category Resource Types
 */
export interface BlueprintAgentModel {
  /** Non-secret model provider, e.g. `openrouter`. */
  provider: string
  /** Non-secret model identifier, e.g. `anthropic/claude-haiku-4.5`. */
  id: string
  /** Non-secret optional base URL override (defaults per provider). */
  baseURL?: string
  /**
   * SECRET model API key. The author passes `process.env.OPEN_ROUTER_KEY`, read
   * from their own environment at blueprint-eval time. Validation checks only
   * that a value is present and never inspects or logs the value.
   */
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
  /** The name of the agent. Must be a slug, max 63 characters. */
  name: string
  /** The agent description. */
  description?: string
  /** The region to deploy the agent to. One of the 14 allowlisted cities. */
  region: string
  /**
   * The model the agent uses to serve a turn. REQUIRED and not defaulted: a
   * functioning agent needs a model, so there is no useful default. Kept
   * separate from any future `env` map so it stays first-class and checkable.
   */
  model: BlueprintAgentModel
  /**
   * The source path at author time; rewritten to an `AS-...` asset id by asset
   * prep before deploy.
   */
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
   * The source path for the authored agent package.
   * @defaultValue `agents/${name}`
   */
  src?: string
}
