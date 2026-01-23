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
  type BlueprintProjectRoleResource,
  type BlueprintResource,
  type BlueprintRoleConfig,
  type BlueprintRoleResource,
  type BlueprintScheduleFunctionResource,
  type BlueprintScheduleFunctionResourceEvent,
  defineCorsOrigin,
  defineDataset,
  defineDocumentFunction,
  defineDocumentWebhook,
  defineMediaLibraryAssetFunction,
  defineProjectRole,
  defineRole,
  defineScheduleFunction,
  type RolePermission,
  validateBlueprint,
  validateCorsOrigin,
  validateDataset,
  validateDocumentFunction,
  validateDocumentWebhook,
  validateFunction,
  validateMediaLibraryAssetFunction,
  validateResource,
  validateRole,
  validateScheduleFunction,
  // type BlueprintsApiConfig,
  type WebhookTrigger,
} from '@sanity/blueprints'

/**
 * These 'tests' create typed objects mimicking how users would import types from this package.
 */

const _aclModePublic: AclMode = 'public'
const _aclModePrivate: AclMode = 'private'
const _aclModeCustom: AclMode = 'custom'

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

const _documentFunctionResourceEvent: BlueprintDocumentFunctionResourceEvent = {
  filter: 'filter',
  includeAllVersions: false,
  includeDrafts: false,
  on: ['create'],
  projection: '{id}',
  resource: { type: 'dataset', id: 'production' },
}
const documentFunctionResource: BlueprintDocumentFunctionResource = defineDocumentFunction({ name: 'sup' })

const _webhookTriggerCreate: WebhookTrigger = 'create'
const _webhookTriggerUpdate: WebhookTrigger = 'update'
const _webhookTriggerDelete: WebhookTrigger = 'delete'
const scheduleFunctionResourceEvent: BlueprintScheduleFunctionResourceEvent = {
  minute: '*',
  hour: '*',
  dayOfMonth: '*',
  month: '*',
  dayOfWeek: '*',
}
const scheduleFunctionResource: BlueprintScheduleFunctionResource = defineScheduleFunction({
  name: 'sup',
  event: scheduleFunctionResourceEvent,
  timezone: 'America/New_York',
})

const documentWebhookConfig: BlueprintDocumentWebhookConfig = {
  name: 'webhook-name',
  on: ['create'],
  url: 'https://example.com',
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
  resource: { type: 'media-library', id: 'ml1234' },
  filter: 'filter',
  on: ['create'],
  projection: '{id}',
}
const mediaLibraryAssetFunctionResource: BlueprintMediaLibraryAssetFunctionResource = defineMediaLibraryAssetFunction({
  name: 'required',
  event: mediaLibraryAssetFunctionEvent,
})

const rolePermission: RolePermission = { action: 'read', name: 'sanity-test-read' }
const roleConfig: BlueprintRoleConfig = {
  name: 'test-role',
  title: 'Test Role',
  description: 'Test Role Description',
  appliesToRobots: true,
  appliesToUsers: true,
  permissions: [rolePermission],
}
const roleResource: BlueprintRoleResource = defineRole(roleConfig)
const projectRoleResource: BlueprintProjectRoleResource = defineProjectRole('projectId', roleConfig)

const blueprintResource: BlueprintResource = { name: 'test-resource', type: 'test' }

const blueprintOutput: BlueprintOutput = { name: 'output', value: 'value' }
const blueprint: Blueprint = {
  $schema: 'schema',
  blueprintVersion: '2025-01-01',
  outputs: [blueprintOutput],
  resources: [
    corsOriginResource,
    datasetResource,
    documentFunctionResource,
    documentWebhookResource,
    mediaLibraryAssetFunctionResource,
    projectRoleResource,
    blueprintResource,
  ],
  values: {
    key: 'value',
  },
}
const blueprintModule: BlueprintModule = () => blueprint
blueprintModule.organizationId = 'orgId'
blueprintModule.projectId = 'projectId'
blueprintModule.stackId = 'stackId'

validateBlueprint(blueprintModule)
validateCorsOrigin(corsOriginResource)
validateDataset(datasetResource)
validateDocumentFunction(documentFunctionResource)
validateDocumentWebhook(documentWebhookResource)
validateFunction({ name: 'test-function' })
validateMediaLibraryAssetFunction(mediaLibraryAssetFunctionResource)
validateResource(blueprintResource)
validateRole(roleResource)
validateScheduleFunction(scheduleFunctionResource)
