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
 * A declared knowledge base starts empty: add its sources through the Context API or dashboard.
 * Removing it from the blueprint keeps the knowledge base, because deleting it would discard its built content.
 *
 * ```ts
 * defineContextKnowledgeBase({
 *   name: 'product-docs',
 *   title: 'Product docs',
 *   description: 'Everything about the product',
 * })
 * ```
 * @param parameters The knowledge base configuration
 * @public
 * @beta Deploying Context via Blueprints is experimental. This feature is subject to breaking changes.
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
 * A knowledge base source can reference a knowledge base in the same blueprint, either as
 * `$.resources.<name>` or by passing the resource returned by {@link defineContextKnowledgeBase}.
 *
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
 *   groqFilter: '_type in ["article", "faq"]',
 * })
 * ```
 * @param parameters The MCP endpoint configuration
 * @public
 * @beta Deploying Context via Blueprints is experimental. This feature is subject to breaking changes.
 * @hidden
 * @category Definers
 * @expandType BlueprintContextMcpEndpointConfig
 * @returns The MCP endpoint resource
 */
export function defineContextMcpEndpoint(parameters: BlueprintContextMcpEndpointConfig): BlueprintContextMcpEndpointResource {
  const mcpEndpointResource: BlueprintContextMcpEndpointResource = {
    ...parameters,
    type: 'sanity.context.mcp',
    sources: parameters.sources.map((source) =>
      source.type === 'sanity.context.knowledge-base' ? {type: 'knowledge-base', id: `$.resources.${source.name}`} : source,
    ),
  }

  runValidation(() => validateContextMcpEndpoint(mcpEndpointResource))

  return mcpEndpointResource
}
