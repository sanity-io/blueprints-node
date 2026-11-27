import {defineCorsOrigin} from '../definers/cors.js'
import {defineDataset} from '../definers/datasets.js'
import {defineDocumentFunction} from '../definers/functions/document.js'
import {defineDurableFunction} from '../definers/functions/durable.js'
import {defineMediaLibraryAssetFunction} from '../definers/functions/media-library.js'
import {definePubSubFunction} from '../definers/functions/pubsub.js'
import {defineSyncTagInvalidateFunction} from '../definers/functions/sync-tag-invalidate.js'
import {definePermission} from '../definers/permissions.js'
import {defineRobotToken} from '../definers/robot-tokens.js'
import {defineProjectRole} from '../definers/roles.js'
import {defineStudio} from '../definers/studios.js'
import {defineDocumentWebhook} from '../definers/webhooks.js'
import type {BlueprintCorsOriginConfig} from '../types/cors.js'
import type {BlueprintDatasetConfig} from '../types/datasets.js'
import type {
  BlueprintDocumentFunctionConfig,
  BlueprintDurableConfig,
  BlueprintMediaLibraryAssetFunctionConfig,
  BlueprintPubSubFunctionConfig,
  BlueprintSyncTagInvalidateFunctionConfig,
} from '../types/functions/index.js'
import type {BlueprintPermissionConfig} from '../types/permissions.js'
import type {BlueprintResource} from '../types/resources.js'
import type {BlueprintRobotTokenConfig} from '../types/robotTokens.js'
import type {BlueprintRoleConfig} from '../types/roles.js'
import type {BlueprintStudioConfig} from '../types/studios.js'
import type {BlueprintDocumentWebhookConfig} from '../types/webhooks.js'
import {AbstractHandle} from './abstract-handle.js'
import {CorsOriginHandle} from './cors.js'
import {DatasetHandle} from './dataset.js'
import {PermissionHandle} from './permission.js'
import {RobotTokenHandle} from './robot-token.js'
import {RoleHandle} from './role.js'
import {StudioHandle} from './studio.js'
import {DocumentWebhookHandle} from './webhook.js'

/**
 * A project in a {@link buildBlueprint} callback. Resources added through it are scoped to the project, so options
 * such as `project` are set for you. Each method otherwise takes the same options as the definer it links to.
 * @public
 * @beta
 * @category Builder
 */
export class ProjectHandle extends AbstractHandle {
  readonly kind = 'sanity.project'
  #resources: BlueprintResource[]

  /** @internal */
  constructor(projectName: string, resources: BlueprintResource[]) {
    super(projectName)
    this.#resources = resources
  }

  /** Adds a CORS origin to the project. See {@link defineCorsOrigin}. */
  corsOrigin(config: Omit<BlueprintCorsOriginConfig, 'project'>): CorsOriginHandle {
    this.#resources.push(defineCorsOrigin({...config, project: this.reference()}))
    return new CorsOriginHandle(config.name)
  }

  /** Adds a dataset to the project. See {@link defineDataset}. */
  dataset(config: Omit<BlueprintDatasetConfig, 'project'>): DatasetHandle {
    this.#resources.push(defineDataset({...config, project: this.reference()}))
    return new DatasetHandle(config.name)
  }

  /** Adds a Document Function to the project. See {@link defineDocumentFunction}. */
  documentFunction(config: Omit<BlueprintDocumentFunctionConfig, 'project'>): void {
    this.#resources.push(defineDocumentFunction({...config, project: this.reference()}))
  }

  /** Adds a document webhook to the project. See {@link defineDocumentWebhook}. */
  documentWebhook(config: Omit<BlueprintDocumentWebhookConfig, 'project'>): DocumentWebhookHandle {
    this.#resources.push(defineDocumentWebhook({...config, project: this.reference()}))
    return new DocumentWebhookHandle(config.name)
  }

  /** Adds a Durable Function to the project. See {@link defineDurableFunction}. */
  durableFunction(config: Omit<BlueprintDurableConfig, 'project'>): void {
    this.#resources.push(defineDurableFunction({...config, project: this.reference()}))
  }

  /** Adds a Media Library Asset Function to the project. See {@link defineMediaLibraryAssetFunction}. */
  mediaLibraryAssetFunction(config: Omit<BlueprintMediaLibraryAssetFunctionConfig, 'project'>): void {
    this.#resources.push(defineMediaLibraryAssetFunction({...config, project: this.reference()}))
  }

  /** Adds a permission to the project. See {@link definePermission}. */
  permission(config: Omit<BlueprintPermissionConfig, 'project'>): PermissionHandle {
    this.#resources.push(definePermission({...config, project: this.reference()}))
    return new PermissionHandle(config.name)
  }

  /** Adds a Pub Sub Function to the project. See {@link definePubSubFunction}. */
  pubSubFunction(config: Omit<BlueprintPubSubFunctionConfig, 'project'>): void {
    this.#resources.push(definePubSubFunction({...config, project: this.reference()}))
  }

  /** Adds a robot token to the project. See {@link defineRobotToken}. The project sets `resourceType` and `resourceId`. */
  robotToken(config: Omit<BlueprintRobotTokenConfig, 'resourceType' | 'resourceId'>): RobotTokenHandle {
    this.#resources.push(defineRobotToken({...config, resourceType: 'project', resourceId: this.reference()}))
    return new RobotTokenHandle(config.name)
  }

  /** Adds a role to the project. See {@link defineProjectRole}. */
  role(config: BlueprintRoleConfig): RoleHandle {
    this.#resources.push(defineProjectRole(this.reference(), config))
    return new RoleHandle(config.name)
  }

  /** Adds a Studio to the project. See {@link defineStudio}. */
  studio(config: Omit<BlueprintStudioConfig, 'project'>): StudioHandle {
    this.#resources.push(defineStudio({...config, project: this.reference()}))
    return new StudioHandle(config.name)
  }

  /** Adds a Sync Tag Invalidate Function to the project. See {@link defineSyncTagInvalidateFunction} */
  syncTagInvalidateFunction(config: Omit<BlueprintSyncTagInvalidateFunctionConfig, 'project'>): void {
    this.#resources.push(defineSyncTagInvalidateFunction({...config, project: this.reference()}))
  }
}
