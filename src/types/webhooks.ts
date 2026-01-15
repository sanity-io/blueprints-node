import type {BlueprintResource} from '../index.js'

/** Types of events that can trigger a webhook */
export type WebhookTrigger = 'create' | 'update' | 'delete'

/** A webhook resource definition */
export interface BlueprintDocumentWebhookResource extends BlueprintResource {
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
  dataset?: string
  apiVersion: string
}

/** Configuration for a webhook */
export type BlueprintDocumentWebhookConfig = Omit<BlueprintDocumentWebhookResource, 'type'>
