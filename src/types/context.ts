import type {BlueprintResource} from '../index.js'

/**
 * A knowledge base that a Context MCP endpoint serves.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface ContextKnowledgeBaseSource {
  type: 'knowledge-base'
  /** A knowledge base in the blueprint as `$.resources.<name>`, or the ID (`kb…`) of a knowledge base. */
  id: string
}

/**
 * A Sanity dataset that a Context MCP endpoint serves.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface ContextDatasetSource {
  type: 'dataset'
  /** The dataset as `<projectId>.<datasetName>`, for example `abc123.production`. It can't be a `$.resources.<name>` reference. */
  id: string
  /** The studio workspace whose schema agents use, by name. `null` uses the studio's first workspace. */
  workspace?: string | null
  /** The perspective agents query the dataset with. `null` uses `published`. */
  perspective?: 'published' | 'drafts' | 'raw' | null
  /**
   * Whether agents can use semantic search on the dataset. `false` turns it off. `true` or `null` use it while the
   * dataset has embeddings enabled.
   */
  semanticSearch?: boolean | null
}

/**
 * Content that a Context MCP endpoint serves.
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
  /**
   * The resource name in the blueprint. The knowledge base has no name, only a `title`. With the default deletion
   * policy (`retain`), a deploy fails if this name changes.
   */
  name: string
  /** The knowledge base title, up to 100 characters. */
  title: string
  /** What the knowledge base covers, up to 2,000 characters. */
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
   * The endpoint name in the URL that agents connect to: lowercase letters, digits and single hyphens, up to 64
   * characters. The names `by-name` and `mcp` followed by 8 letters or digits are reserved. With the default deletion
   * policy (`allow`), a change deletes the endpoint and creates a new endpoint with a new URL.
   */
  name: string
  /** The endpoint title, up to 100 characters. */
  title: string
  /** What the endpoint serves: any number of knowledge bases and at most one dataset. */
  sources: ContextMcpEndpointSource[]
  /** Instructions for agents that connect to the endpoint, up to 10,000 characters. */
  instructions?: string
  /** A GROQ filter for the documents that the dataset source serves. It requires a dataset source. */
  groqFilter?: string
}

/**
 * Configuration for a Context MCP endpoint.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 */
export type BlueprintContextMcpEndpointConfig = Omit<BlueprintContextMcpEndpointResource, 'type' | 'sources'> & {
  /**
   * What the endpoint serves: any number of knowledge bases and at most one dataset. A knowledge base source can also
   * be the resource that {@link defineContextKnowledgeBase} returns.
   */
  sources: Array<ContextMcpEndpointSource | BlueprintContextKnowledgeBaseResource>
}
