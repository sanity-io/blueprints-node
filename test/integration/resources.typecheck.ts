import {
  type AclMode,
  type Blueprint,
  // type BlueprintBaseFunctionResource,
  type BlueprintCorsOriginConfig,
  type BlueprintCorsOriginResource,
  type BlueprintDatasetConfig,
  type BlueprintDatasetResource,
  type BlueprintDocumentFunctionResource,
  type BlueprintDocumentFunctionResourceEvent,
  type BlueprintDocumentWebhookConfig,
  type BlueprintDocumentWebhookResource,
  // type BlueprintFunctionBaseResourceEvent,
  // type BlueprintFunctionResourceEvent,
  type BlueprintMediaLibraryAssetFunctionResource,
  type BlueprintMediaLibraryFunctionResourceEvent,
  type BlueprintModule,
  type BlueprintOutput,
  type BlueprintResource,
  type BlueprintsApiConfig,
  type WebhookTrigger,
  defineCorsOrigin,
  defineDataset,
  defineDocumentFunction,
  defineDocumentWebhook,
  defineMediaLibraryAssetFunction,
} from '@sanity/blueprints'

/**
 * These 'tests' create typed objects mimicking how users would import types from this package.
 */

const aclModePublic: AclMode = 'public'
const aclModePrivate: AclMode = 'private'
const aclModeCustom: AclMode = 'custom'

const corsOriginConfig: BlueprintCorsOriginConfig = {
  name: 'cors-name',
  origin: 'url',
  allowCredentials: true,
  project: 'projectId',
}
const corsOriginResource: BlueprintCorsOriginResource = defineCorsOrigin(corsOriginConfig)

const datasetConfig: BlueprintDatasetConfig = {
  name: 'dataset-name',
  aclMode: 'public',
  datasetName: 'production',
  project: 'projectId',
}
const datasetResource: BlueprintDatasetResource = defineDataset(datasetConfig)

const documentFunctionResourceEvent: BlueprintDocumentFunctionResourceEvent = {
  filter: 'filter',
  includeAllVersions: false,
  includeDrafts: false,
  on: ['create'],
  projection: '{id}',
  resource: {type: 'dataset', id: 'production'},
}
const documentFunctionResource: BlueprintDocumentFunctionResource = defineDocumentFunction({name: 'sup'})

const documentWebhookConfig: BlueprintDocumentWebhookConfig = {
  name: 'webhook-name',
  on: ['create'],
  url: 'url',
  apiVersion: '2025-01-01',
  dataset: 'production',
  description: 'Test Webhook',
  displayName: 'Webhook Name',
  filter: 'filter',
  headers: {
    key: 'value',
  },
  httpMethod: 'GET',
  includeAllVersions: false,
  includeDrafts: false,
  project: 'projectId',
  projection: '*',
  secret: 's3cr3t',
  status: 'enabled',
}
const documentWebhookResource: BlueprintDocumentWebhookResource = defineDocumentWebhook(documentWebhookConfig)

const mediaLibraryAssetFunctionEvent: BlueprintMediaLibraryFunctionResourceEvent = {
  resource: {type: 'media-library', id: 'ml1234'},
  filter: 'filter',
  on: ['create'],
  projection: '{id}',
}
const mediaLibraryAssetFunctionResource: BlueprintMediaLibraryAssetFunctionResource = defineMediaLibraryAssetFunction({
  name: 'required',
  event: mediaLibraryAssetFunctionEvent,
})

const blueprintOutput: BlueprintOutput = {name: 'output', value: 'value'}
const blueprint: Blueprint = {
  $schema: 'schema',
  blueprintVersion: '2025-01-01',
  outputs: [],
  resources: [corsOriginResource, datasetResource, documentFunctionResource, documentWebhookResource, mediaLibraryAssetFunctionResource],
  values: {
    key: 'value',
  },
}
const blueprintModule: BlueprintModule = () => blueprint
blueprintModule.organizationId = 'orgId'
blueprintModule.projectId = 'projectId'
blueprintModule.stackId = 'stackId'
