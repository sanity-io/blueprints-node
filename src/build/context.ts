import {AbstractHandle} from './abstract-handle.js'

export class ContextKnowledgeBaseHandle extends AbstractHandle {
  readonly kind = 'sanity.context.knowledge-base'
}

export class ContextMcpEndpointHandle extends AbstractHandle {
  readonly kind = 'sanity.context.mcp'
}
