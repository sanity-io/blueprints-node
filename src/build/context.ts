import {AbstractHandle} from './abstract-handle.js'

/**
 * A Context knowledge base in a {@link buildBlueprint} callback. See {@link defineContextKnowledgeBase}.
 * @public
 * @beta
 * @category Builder
 */
export class ContextKnowledgeBaseHandle extends AbstractHandle {
  readonly kind = 'sanity.context.knowledge-base'
}

/**
 * A Context MCP endpoint in a {@link buildBlueprint} callback. See {@link defineContextMcpEndpoint}.
 * @public
 * @beta
 * @category Builder
 */
export class ContextMcpEndpointHandle extends AbstractHandle {
  readonly kind = 'sanity.context.mcp'
}
