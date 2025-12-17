import type {BlueprintResource} from '../index.js'

export type WebhookTrigger = 'create' | 'update' | 'delete'
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
export type BlueprintDocumentWebhookConfig = Omit<BlueprintDocumentWebhookResource, 'type'>
