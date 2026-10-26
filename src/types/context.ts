import type {BlueprintResource} from '../index.js'

/**
 * A knowledge base served by a Context MCP endpoint.
 *
 * `id` is a reference to a knowledge base in the same blueprint (`$.resources.<name>`) or the ID
 * (`kb…`) of an existing knowledge base.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface ContextKnowledgeBaseSource {
  type: 'knowledge-base'
  id: string
}

/**
 * A Sanity dataset served by a Context MCP endpoint, as `<projectId>.<datasetName>`.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface ContextDatasetSource {
  type: 'dataset'
  id: string
}

/**
 * Content a Context MCP endpoint serves.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export type ContextMcpEndpointSource = ContextKnowledgeBaseSource | ContextDatasetSource

/**
 * A Context knowledge base resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface BlueprintContextKnowledgeBaseResource extends BlueprintResource {
  type: 'sanity.context.knowledge-base'
  /** The knowledge base's title, up to 100 characters. */
  title: string
  /** A short description of what the knowledge base covers, up to 2,000 characters. */
  description: string
}

/**
 * Configuration for a Context knowledge base.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 */
export type BlueprintContextKnowledgeBaseConfig = Omit<BlueprintContextKnowledgeBaseResource, 'type'>

/**
 * A Context MCP endpoint resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface BlueprintContextMcpEndpointResource extends BlueprintResource {
  type: 'sanity.context.mcp'
  /**
   * The endpoint's name, used in the URL agents connect to. Lowercase letters, digits and single
   * hyphens, up to 64 characters. Changing it creates a new endpoint with a new URL.
   */
  name: string
  /** The endpoint's title, up to 100 characters. */
  title: string
  /** What the endpoint serves: any number of knowledge bases and at most one dataset. */
  sources: ContextMcpEndpointSource[]
  /** Instructions for connecting agents, up to 10,000 characters. */
  instructions?: string
  /** A GROQ filter that limits which documents the dataset source serves. Requires a dataset source. */
  groqFilter?: string
}

/**
 * Configuration for a Context MCP endpoint. A knowledge base source can also be the resource
 * returned by {@link defineContextKnowledgeBase}, which becomes a reference to it.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 */
export type BlueprintContextMcpEndpointConfig = Omit<BlueprintContextMcpEndpointResource, 'type' | 'sources'> & {
  sources: Array<ContextMcpEndpointSource | BlueprintContextKnowledgeBaseResource>
}
