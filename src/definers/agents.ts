import {type BlueprintAgentConfig, type BlueprintAgentResource, validateAgent} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines an Agent to be managed in a Blueprint.
 *
 * @remarks
 * `model` is required; its `apiKey` is passed by reference and resolved at blueprint-eval time.
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
    ...rest,
    name,
    type: 'sanity.agent',
    src: src ?? `agents/${name}`,
  }

  runValidation(() => validateAgent(agentResource))

  return agentResource
}
