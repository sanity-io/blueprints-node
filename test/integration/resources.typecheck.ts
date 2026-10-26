import {
  type AclMode,
  type Blueprint,
  type BlueprintApplicationConfig,
  type BlueprintApplicationResource,
  type BlueprintContentResourceConfig,
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
  type BlueprintPermissionConfig,
  type BlueprintPermissionResource,
  type BlueprintProjectResourceLifecycle,
  type BlueprintProjectRoleResource,
  type BlueprintPubSubFunctionResource,
  type BlueprintQueueFunctionResource,
  type BlueprintResource,
  type BlueprintRoleConfig,
  type BlueprintRoleResource,
  type BlueprintScheduledFunctionResource,
  type BlueprintScheduledFunctionResourceEvent,
  type BlueprintStudioConfig,
  type BlueprintStudioResource,
  type BlueprintSyncTagInvalidateFunctionResource,
  type BlueprintSyncTagInvalidateFunctionResourceEvent,
  defineApplication,
  defineAssetSourceView,
  defineContentResource,
  defineCorsOrigin,
  defineDataset,
  defineDocumentFunction,
  defineDocumentWebhook,
  defineMediaLibraryAssetFunction,
  defineMediaLibraryConfig,
  definePanelView,
  definePermission,
  defineProjectRole,
  definePubSubFunction,
  defineQueueFunction,
  defineRole,
  defineScheduledFunction,
  defineSyncTagInvalidateFunction,
  defineTileView,
  defineWebWorker,
  defineWindowView,
  type RolePermission,
  validateApplication,
  validateBlueprint,
  validateContentResource,
  validateCorsOrigin,
  validateDataset,
  validateDocumentFunction,
  validateDocumentWebhook,
  validateFunction,
  validateMediaLibraryAssetFunction,
  validateMediaLibraryConfig,
  validatePermission,
  validatePubSubFunction,
  validateQueueFunction,
  validateResource,
  validateRole,
  validateScheduledFunction,
  validateSyncTagInvalidateFunction,
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
  debounce: {window: 10},
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

const queueFunction: BlueprintQueueFunctionResource = defineQueueFunction({
  name: 'stuff',
})

// a definer accepts durations for `debounce` and returns a resource holding the parsed config
const debouncedQueueFunction: BlueprintQueueFunctionResource = defineQueueFunction({
  name: 'debounced-stuff',
  debounce: {window: '30s', maxWindow: '1 hour', key: 'event.data._id'},
})
const _debounceWindowIsSeconds: number | undefined = debouncedQueueFunction.debounce?.window

const _bareDebounceQueueFunction: BlueprintQueueFunctionResource = defineQueueFunction({
  name: 'bare-debounced-stuff',
  debounce: '69s',
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
  root: './apps/design-retro',
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
  root: './media-library',
  fields: [{name: 'brand', title: 'Brand', src: './src/fields/brand.tsx'}],
}
const mediaLibraryConfigResource: BlueprintMediaLibraryConfigResource = defineMediaLibraryConfig(mediaLibraryConfigConfig)

const permissionConfig: BlueprintPermissionConfig = {
  name: 'test-permission',
  title: 'Test Permission',
  description: 'Test Permission Description',
  permissionType: 'sanity.document.filter',
  config: {filter: '_type == "article"'},
  project: 'projectId',
}
const permissionResource: BlueprintPermissionResource = definePermission(permissionConfig)

const contentResourceConfig: BlueprintContentResourceConfig = {
  name: 'test-content-resource',
  title: 'Test Content Resource',
  description: 'Test Content Resource Description',
  documentTypes: ['article'],
  filter: 'defined(slug)',
  project: 'projectId',
}
const contentResource: BlueprintPermissionResource = defineContentResource(contentResourceConfig)

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

const _studioConfig: BlueprintStudioConfig = {
  name: 'test-studio',
  root: './studio',
  autoUpdates: {
    enabled: true,
    version: '1',
  },
  basePath: '/',
  icon: 'favicon.svg',
  lifecycle: {
    deletionPolicy: 'allow',
    dependsOn: '$.resources.test',
  },
  minify: true,
  project: 'project1234',
  reactCompiler: true,
  slug: 'test-studio',
  sourceMap: true,
  title: 'Test Studio',
  visibility: 'default',
  vite: () => ({}),
}

const _studioResource: BlueprintStudioResource = {
  name: 'test-studio',
  type: 'sanity.studio',
  root: './studio',
  autoUpdates: {
    enabled: true,
    version: '1',
  },
  basePath: '/',
  icon: 'favicon.svg',
  lifecycle: {
    deletionPolicy: 'allow',
    dependsOn: '$.resources.test',
  },
  minify: true,
  project: 'project1234',
  reactCompiler: true,
  slug: 'test-studio',
  sourceMap: true,
  title: 'Test Studio',
  visibility: 'default',
  vite: () => ({}),
  mfManifest: {},
  schemaInputs: [
    {
      dataset: 'staging',
      manifestSchema: [
        {
          name: 'schema-name',
          type: 'type',
        },
      ],
      name: 'test-schema',
      projectId: 'project1234',
      title: 'title',
    },
  ],
}

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
    permissionResource,
    contentResource,
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
validateApplication(applicationResource)
validateMediaLibraryConfig(mediaLibraryConfigResource)
validateCorsOrigin(corsOriginResource)
validateDataset(datasetResource)
validateDocumentFunction(documentFunctionResource)
validateDocumentWebhook(documentWebhookResource)
validateFunction({name: 'test-function'})
validateMediaLibraryAssetFunction(mediaLibraryAssetFunctionResource)
validatePermission(permissionResource)
validateContentResource(contentResourceConfig)
validateResource(blueprintResource)
validateRole(roleResource)
validateScheduledFunction(scheduledFunctionResource)
validateSyncTagInvalidateFunction(syncTagInvalidateFunction)
validateQueueFunction(queueFunction)
validatePubSubFunction(pubSubFunction)
