import {
  type BlueprintContextKnowledgeBaseConfig,
  type BlueprintContextKnowledgeBaseResource,
  type BlueprintContextMcpEndpointConfig,
  type BlueprintContextMcpEndpointResource,
  validateContextKnowledgeBase,
  validateContextMcpEndpoint,
} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a Context knowledge base.
 *
 * @remarks
 * The blueprint must be scoped to an organization. A new knowledge base has no sources. Add sources in the Context API
 * or the dashboard.
 *
 * The default deletion policy is `retain`. If the stack is destroyed, the knowledge base is detached and not deleted. If
 * the resource is removed from the blueprint, the deploy fails. To remove the resource, first deploy it with one of these
 * `lifecycle` values:
 * - `{ownershipAction: {type: 'detach'}}` keeps the knowledge base.
 * - `{deletionPolicy: 'allow'}` deletes the knowledge base.
 *
 * @example
 * ```ts
 * defineContextKnowledgeBase({
 *   name: 'product-docs',
 *   title: 'Product docs',
 *   description: 'Everything about the product',
 * })
 * ```
 *
 * @example Detach before removal
 * ```ts
 * defineContextKnowledgeBase({
 *   name: 'product-docs',
 *   title: 'Product docs',
 *   description: 'Everything about the product',
 *   lifecycle: {ownershipAction: {type: 'detach'}},
 * })
 * ```
 * @param parameters The knowledge base configuration
 * @public
 * @alpha Deploying Context via Blueprints is experimental. This feature is not available publicly yet.
 * @hidden
 * @category Definers
 * @expandType BlueprintContextKnowledgeBaseConfig
 * @returns The knowledge base resource
 */
export function defineContextKnowledgeBase(parameters: BlueprintContextKnowledgeBaseConfig): BlueprintContextKnowledgeBaseResource {
  const knowledgeBaseResource: BlueprintContextKnowledgeBaseResource = {
    ...parameters,
    type: 'sanity.context.knowledge-base',
  }

  runValidation(() => validateContextKnowledgeBase(knowledgeBaseResource))

  return knowledgeBaseResource
}

/**
 * Defines a Context MCP endpoint that agents connect to.
 *
 * @remarks
 * The blueprint must be scoped to an organization.
 *
 * @example
 * ```ts
 * defineContextMcpEndpoint({
 *   name: 'support-agent',
 *   title: 'Support agent',
 *   sources: [{type: 'dataset', id: 'abc123.production'}],
 * })
 * ```
 *
 * @example Knowledge base and dataset sources
 * ```ts
 * const productDocs = defineContextKnowledgeBase({
 *   name: 'product-docs',
 *   title: 'Product docs',
 *   description: 'Everything about the product',
 * })
 *
 * defineContextMcpEndpoint({
 *   name: 'support-agent',
 *   title: 'Support agent',
 *   sources: [productDocs, {type: 'dataset', id: 'abc123.production'}],
 *   instructions: 'Answer questions about the product.',
 *   groqFilter: '_type in ["article", "faq"]',
 * })
 * ```
 * @param parameters The MCP endpoint configuration
 * @public
 * @alpha Deploying Context via Blueprints is experimental. This feature is not available publicly yet.
 * @hidden
 * @category Definers
 * @expandType BlueprintContextMcpEndpointConfig
 * @returns The MCP endpoint resource
 */
export function defineContextMcpEndpoint(parameters: BlueprintContextMcpEndpointConfig): BlueprintContextMcpEndpointResource {
  const mcpEndpointResource: BlueprintContextMcpEndpointResource = {
    ...parameters,
    type: 'sanity.context.mcp',
    // Malformed sources pass through untouched, so validation reports them instead of throwing here.
    sources: Array.isArray(parameters.sources)
      ? parameters.sources.map((source) =>
          source?.type === 'sanity.context.knowledge-base' ? {type: 'knowledge-base', id: `$.resources.${source.name}`} : source,
        )
      : parameters.sources,
  }

  runValidation(() => validateContextMcpEndpoint(mcpEndpointResource))

  return mcpEndpointResource
}
