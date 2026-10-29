import {type BlueprintAgentConfig, type BlueprintAgentResource, validateAgent} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines an Agent to be managed in a Blueprint.
 *
 * @remarks
 * `model` is REQUIRED: a functioning agent needs a model to serve a turn. The
 * non-secret `model.provider`, `model.id`, and `model.baseURL` ride on the
 * resource; `model.apiKey` is a SECRET supplied by reference
 * (`process.env.OPEN_ROUTER_KEY`) at blueprint-eval time, so the committed
 * blueprint carries the reference expression, not a literal secret.
 *
 * @example
 * ```ts
 * defineAgent({
 *   name: 'demo-agent',
 *   region: 'virginia',
 *   model: {
 *     provider: 'openrouter',
 *     id: 'anthropic/claude-haiku-4.5',
 *     apiKey: process.env.OPEN_ROUTER_KEY,
 *   },
 * })
 * ```
 *
 * @example All options
 * ```ts
 * defineAgent({
 *   name: 'demo-agent',
 *   description: 'end-to-end blueprints demo agent',
 *   region: 'virginia',
 *   src: 'agents/demo-agent',
 *   model: {
 *     provider: 'openrouter',
 *     id: 'anthropic/claude-haiku-4.5',
 *     baseURL: 'https://openrouter.ai/api/v1',
 *     apiKey: process.env.OPEN_ROUTER_KEY,
 *   },
 * })
 * ```
 * @param config The agent configuration
 * @alpha Deploying Agents via Blueprints is experimental. This feature is subject to breaking changes.
 * @hidden
 * @category Definers
 * @expandType BlueprintAgentConfig
 * @returns The agent resource
 */
export function defineAgent(config: BlueprintAgentConfig): BlueprintAgentResource {
  const {name, src, ...rest} = config

  const agentResource: BlueprintAgentResource = {
    ...rest, // carries `model` through unchanged
    name,
    type: 'sanity.agent',
    // Default the source path the same way defineFunction defaults it. Prep
    // rewrites this to an AS-... id before deploy.
    src: src ?? `agents/${name}`,
  }

  runValidation(() => validateAgent(agentResource))

  return agentResource
}
