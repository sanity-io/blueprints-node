import type {BlueprintProjectResourceLifecycle, BlueprintResource} from '../index.js'

/**
 * Types of events that can trigger a webhook
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export type WebhookTrigger = 'create' | 'update' | 'delete'

/**
 * A webhook resource definition
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface BlueprintDocumentWebhookResource extends BlueprintResource<BlueprintProjectResourceLifecycle> {
  type: 'sanity.project.webhook'
  project?: string
  displayName?: string
  description?: string | null
  url: string
  on: WebhookTrigger[]
  filter?: string
  projection?: string
  status?: 'enabled' | 'disabled'
  httpMethod?: 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'GET'
  headers?: Record<string, string>
  includeDrafts?: boolean
  includeAllVersions?: boolean
  secret?: string
  dataset: string
  apiVersion: string
}

/**
 * Configuration for a webhook
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export type BlueprintDocumentWebhookConfig = Omit<BlueprintDocumentWebhookResource, 'type'>
