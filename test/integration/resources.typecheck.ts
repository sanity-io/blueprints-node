import {
  type AclMode,
  type Blueprint,
  type BlueprintApplicationConfig,
  type BlueprintApplicationResource,
  // type BlueprintBaseFunctionResource,
  type BlueprintCorsOriginConfig,
  type BlueprintCorsOriginResource,
  type BlueprintDatasetConfig,
  type BlueprintDatasetResource,
  type BlueprintDocumentFunctionResource,
  type BlueprintDocumentFunctionResourceEvent,
  type BlueprintDocumentWebhookConfig,
  type BlueprintDocumentWebhookResource,
  type BlueprintDurableFunctionResource,
  type BlueprintFunctionResourceContentLakeEvent,
  type BlueprintMediaLibraryAssetFunctionResource,
  type BlueprintMediaLibraryConfigConfig,
  type BlueprintMediaLibraryConfigResource,
  type BlueprintMediaLibraryFunctionResourceEvent,
  type BlueprintModule,
  type BlueprintOutput,
  type BlueprintProjectResourceLifecycle,
  type BlueprintProjectRoleResource,
  type BlueprintPubSubFunctionResource,
  type BlueprintQueueFunctionResource,
  type BlueprintResource,
  type BlueprintRoleConfig,
  type BlueprintRoleResource,
  type BlueprintScheduledFunctionResource,
  type BlueprintScheduledFunctionResourceEvent,
  type BlueprintSyncTagInvalidateFunctionResource,
  type BlueprintSyncTagInvalidateFunctionResourceEvent,
  type BlueprintWorkflowDeployment,
  type BlueprintWorkflowsResource,
  defineApplication,
  defineAssetSourceView,
  defineCorsOrigin,
  defineDataset,
  defineDocumentFunction,
  defineDocumentWebhook,
  defineMediaLibraryAssetFunction,
  defineMediaLibraryConfig,
  definePanelView,
  defineProjectRole,
  definePubSubFunction,
  defineQueueFunction,
  defineRole,
  defineScheduledFunction,
  defineSyncTagInvalidateFunction,
  defineTileView,
  defineWebWorker,
  defineWindowView,
  defineWorkflows,
  type RolePermission,
  validateApplication,
  validateBlueprint,
  validateCorsOrigin,
  validateDataset,
  validateDocumentFunction,
  validateDocumentWebhook,
  validateFunction,
  validateMediaLibraryAssetFunction,
  validateMediaLibraryConfig,
  validatePubSubFunction,
  validateQueueFunction,
  validateResource,
  validateRole,
  validateScheduledFunction,
  validateSyncTagInvalidateFunction,
  validateWorkflows,
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
  origin: 'https://example.com',
  allowCredentials: true,
  project: 'projectId',
}
const corsOriginResource: BlueprintCorsOriginResource = defineCorsOrigin(corsOriginConfig)

const datasetConfig: BlueprintDatasetConfig = {
  name: 'dataset-name',
  aclMode: 'public',
  description: 'description',
  datasetName: 'production',
  project: 'projectId',
}
const datasetResource: BlueprintDatasetResource = defineDataset(datasetConfig)

const _durableDocumentEvent: BlueprintFunctionResourceContentLakeEvent = {
  type: 'document',
  on: ['create'],
  filter: "_type == 'article'",
}
const _durableSyncTagEvent: BlueprintFunctionResourceContentLakeEvent = {
  type: 'sync-tag-invalidate',
  resource: {type: 'dataset', id: 'proj.dataset'},
}
const _durableFunction: BlueprintDurableFunctionResource = {
  type: 'sanity.function.durable',
  name: 'my-durable',
  src: 'functions/my-durable',
  event: _durableDocumentEvent,
  concurrency: 5,
  debounce: 10,
  debounceKey: 'document._id',
}

const _documentFunctionResourceEvent: BlueprintDocumentFunctionResourceEvent = {
  filter: 'filter',
  includeAllVersions: false,
  includeDrafts: false,
  on: ['create'],
  projection: '{id}',
  resource: {type: 'dataset', id: 'production'},
}
const documentFunctionResource: BlueprintDocumentFunctionResource = defineDocumentFunction({name: 'sup'})

const _webhookTriggerCreate: WebhookTrigger = 'create'
const _webhookTriggerUpdate: WebhookTrigger = 'update'
const _webhookTriggerDelete: WebhookTrigger = 'delete'
const scheduledFunctionResourceEvent: BlueprintScheduledFunctionResourceEvent = {
  minute: '*',
  hour: '*',
  dayOfMonth: '*',
  month: '*',
  dayOfWeek: '*',
}
const scheduledFunctionResource: BlueprintScheduledFunctionResource = defineScheduledFunction({
  name: 'sup',
  event: scheduledFunctionResourceEvent,
  timezone: 'America/New_York',
})
const _bareSyncTagInvalidateFunctionResourceEvent: BlueprintSyncTagInvalidateFunctionResourceEvent = {}
const fullyQualifiedSyncTagInvalidateFunctionResourceEvent: BlueprintSyncTagInvalidateFunctionResourceEvent = {
  resource: {type: 'dataset', id: 'proj.dataset'},
}
const syncTagInvalidateFunction: BlueprintSyncTagInvalidateFunctionResource = defineSyncTagInvalidateFunction({
  name: 'yoyoyo',
  event: fullyQualifiedSyncTagInvalidateFunctionResourceEvent,
})

const workflowDeployment: BlueprintWorkflowDeployment = {
  name: 'production',
  tag: 'production',
  expectedMinReaderModel: 4,
  workflowResource: {type: 'dataset', id: 'projectId.dataset'},
  definitions: [{name: 'article-review'}],
}
const workflowsResource: BlueprintWorkflowsResource = defineWorkflows(workflowDeployment, {lifecycle: {deletionPolicy: 'protect'}})

const queueFunction: BlueprintQueueFunctionResource = defineQueueFunction({
  name: 'stuff',
})

const pubSubFunction: BlueprintPubSubFunctionResource = definePubSubFunction({
  name: 'pubsub-stuff',
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
  resource: {type: 'media-library', id: 'ml1234'},
  filter: 'filter',
  on: ['create'],
  projection: '{id}',
}
const mediaLibraryAssetFunctionResource: BlueprintMediaLibraryAssetFunctionResource = defineMediaLibraryAssetFunction({
  name: 'required',
  event: mediaLibraryAssetFunctionEvent,
})

const applicationConfig: BlueprintApplicationConfig = {
  name: 'design-retro-app',
  slug: 'design-retro',
  title: 'Design Retro',
  icon: './src/icons/app-icon.svg',
  visibility: 'unlisted',
  views: [
    defineWindowView({name: 'main', title: 'Design Retro', src: './src/windows/main.tsx', dock: {group: 'applications', order: 10}}),
    definePanelView({name: 'side', title: 'Favorites', src: './src/panels/main.tsx'}),
    defineAssetSourceView({name: 'image-picker', title: 'Image Picker', src: './src/asset-sources/image-picker.tsx'}),
    defineTileView({name: 'jump-back-in', title: 'Main Tile', src: './src/tiles/jump-back-in.tsx', size: 'banner'}),
  ],
  webWorkers: [defineWebWorker({name: 'background-refresh', title: 'Background Worker', src: './src/workers/background-refresh.ts'})],
}
const applicationResource: BlueprintApplicationResource = defineApplication(applicationConfig)

const mediaLibraryConfigConfig: BlueprintMediaLibraryConfigConfig = {
  name: 'media-library',
  src: './media-library.config.ts',
}
const mediaLibraryConfigResource: BlueprintMediaLibraryConfigResource = defineMediaLibraryConfig(mediaLibraryConfigConfig)

const rolePermission: RolePermission = {action: 'read', name: 'sanity-test-read'}
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

const blueprintResource: BlueprintResource = {name: 'test-resource', type: 'test'}

const _blueprintProjectLifecycleAttach: BlueprintProjectResourceLifecycle = {
  deletionPolicy: 'allow',
  dependsOn: '$.resources.test',
  ownershipAction: {
    type: 'attach',
    projectId: 'project',
    id: 'id',
  },
}

const _blueprintProjectLifecycleDetach: BlueprintProjectResourceLifecycle = {
  deletionPolicy: 'allow',
  dependsOn: '$.resources.test',
  ownershipAction: {
    type: 'detach',
  },
}

const _blueprintProjectLifecycleReference: BlueprintProjectResourceLifecycle = {
  deletionPolicy: 'allow',
  dependsOn: '$.resources.test',
  ownershipAction: {
    type: 'reference',
    name: 'name',
    stack: 'stack',
  },
}

const blueprintOutput: BlueprintOutput = {name: 'output', value: 'value'}
const blueprint: Blueprint = {
  $schema: 'schema',
  blueprintVersion: '2025-01-01',
  outputs: [blueprintOutput],
  resources: [
    applicationResource,
    corsOriginResource,
    datasetResource,
    documentFunctionResource,
    documentWebhookResource,
    mediaLibraryAssetFunctionResource,
    mediaLibraryConfigResource,
    projectRoleResource,
    blueprintResource,
    workflowsResource,
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
validateApplication(applicationResource)
validateMediaLibraryConfig(mediaLibraryConfigResource)
validateCorsOrigin(corsOriginResource)
validateDataset(datasetResource)
validateDocumentFunction(documentFunctionResource)
validateDocumentWebhook(documentWebhookResource)
validateFunction({name: 'test-function'})
validateMediaLibraryAssetFunction(mediaLibraryAssetFunctionResource)
validateResource(blueprintResource)
validateRole(roleResource)
validateScheduledFunction(scheduledFunctionResource)
validateSyncTagInvalidateFunction(syncTagInvalidateFunction)
validateQueueFunction(queueFunction)
validatePubSubFunction(pubSubFunction)
validateWorkflows(workflowsResource)
