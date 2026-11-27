import {defineApplication} from '../definers/applications.js'
import {defineBlueprint} from '../definers/blueprints.js'
import {defineContextKnowledgeBase, defineContextMcpEndpoint} from '../definers/context.js'
import {defineCorsOrigin} from '../definers/cors.js'
import {defineDataset} from '../definers/datasets.js'
import {defineDocumentFunction} from '../definers/functions/document.js'
import {defineDurableFunction} from '../definers/functions/durable.js'
import {defineMediaLibraryAssetFunction} from '../definers/functions/media-library.js'
import {definePubSubFunction} from '../definers/functions/pubsub.js'
import {defineScheduledFunction} from '../definers/functions/scheduled.js'
import {defineSyncTagInvalidateFunction} from '../definers/functions/sync-tag-invalidate.js'
import {defineMediaLibraryConfig} from '../definers/installation-config.js'
import {definePermission} from '../definers/permissions.js'
import {defineProject} from '../definers/projects.js'
import {defineResource} from '../definers/resources.js'
import {defineRobotToken} from '../definers/robot-tokens.js'
import {defineRole} from '../definers/roles.js'
import {defineStudio} from '../definers/studios.js'
import {defineDocumentWebhook} from '../definers/webhooks.js'
import type {BlueprintApplicationConfig} from '../types/applications.js'
import type {Blueprint, BlueprintModule} from '../types/blueprints.js'
import type {
  BlueprintContextKnowledgeBaseConfig,
  BlueprintContextKnowledgeBaseResource,
  BlueprintContextMcpEndpointConfig,
  ContextMcpEndpointSource,
} from '../types/context.js'
import type {BlueprintCorsOriginConfig} from '../types/cors.js'
import type {BlueprintDatasetConfig} from '../types/datasets.js'
import type {
  BlueprintDocumentFunctionConfig,
  BlueprintDurableConfig,
  BlueprintMediaLibraryAssetFunctionConfig,
  BlueprintPubSubFunctionConfig,
  BlueprintScheduledFunctionConfig,
  BlueprintSyncTagInvalidateFunctionConfig,
} from '../types/functions/index.js'
import type {BlueprintMediaLibraryConfigConfig} from '../types/installation-config.js'
import type {BlueprintPermissionConfig} from '../types/permissions.js'
import type {BlueprintProjectConfig} from '../types/projects.js'
import type {BlueprintResource} from '../types/resources.js'
import type {BlueprintRobotTokenConfig} from '../types/robotTokens.js'
import type {BlueprintRoleConfig} from '../types/roles.js'
import type {BlueprintStudioConfig} from '../types/studios.js'
import type {BlueprintDocumentWebhookConfig} from '../types/webhooks.js'
import {resetCollectedErrors} from '../utils/validation.js'
import {ApplicationHandle} from './application.js'
import {ContextKnowledgeBaseHandle, ContextMcpEndpointHandle} from './context.js'
import {CorsOriginHandle} from './cors.js'
import {DatasetHandle} from './dataset.js'
import {MediaLibraryConfigHandle} from './installation-config.js'
import {PermissionHandle} from './permission.js'
import {ProjectHandle} from './project.js'
import {ResourceHandle} from './resource.js'
import {RobotTokenHandle} from './robot-token.js'
import {RoleHandle} from './role.js'
import {StudioHandle} from './studio.js'
import {DocumentWebhookHandle} from './webhook.js'

/**
 * Top-level settings for {@link buildBlueprint}.
 * @public
 * @beta
 * @category Builder
 * @interface
 */
export type BuildBlueprintConfig = Partial<Pick<Blueprint, '$schema' | 'blueprintVersion' | 'values'>>

/**
 * Adds resources in a {@link buildBlueprint} callback. Each method takes the same options as the definer it links to.
 * @public
 * @beta
 * @category Builder
 */
export class BlueprintHandle {
  #resources: BlueprintResource[]

  /** @internal */
  constructor(resources: BlueprintResource[]) {
    this.#resources = resources
  }

  /** Adds an application. See {@link defineApplication}. */
  application(config: BlueprintApplicationConfig): ApplicationHandle {
    this.#resources.push(defineApplication(config))
    return new ApplicationHandle(config.name)
  }

  /** Adds a Context knowledge base. See {@link defineContextKnowledgeBase}. */
  contextKnowledgeBase(config: BlueprintContextKnowledgeBaseConfig): ContextKnowledgeBaseHandle {
    this.#resources.push(defineContextKnowledgeBase(config))
    return new ContextKnowledgeBaseHandle(config.name)
  }

  /** Adds a Context MCP endpoint. See {@link defineContextMcpEndpoint}. `sources` also accepts a {@link ContextKnowledgeBaseHandle}. */
  contextMcpEndpoint(
    config: Omit<BlueprintContextMcpEndpointConfig, 'sources'> & {
      sources: Array<ContextMcpEndpointSource | BlueprintContextKnowledgeBaseResource | ContextKnowledgeBaseHandle>
    },
  ): ContextMcpEndpointHandle {
    // map sources to types the definer accepts
    const sources = config.sources.map<ContextMcpEndpointSource | BlueprintContextKnowledgeBaseResource>((source) =>
      source instanceof ContextKnowledgeBaseHandle ? {type: 'knowledge-base', id: source.reference()} : source,
    )
    this.#resources.push(defineContextMcpEndpoint({...config, sources}))
    return new ContextMcpEndpointHandle(config.name)
  }

  /** Adds a CORS origin. See {@link defineCorsOrigin}. */
  corsOrigin(config: BlueprintCorsOriginConfig): CorsOriginHandle {
    this.#resources.push(defineCorsOrigin(config))
    return new CorsOriginHandle(config.name)
  }

  /** Adds a dataset. See {@link defineDataset}. */
  dataset(config: BlueprintDatasetConfig): DatasetHandle {
    this.#resources.push(defineDataset(config))
    return new DatasetHandle(config.name)
  }

  /** Adds a Document Function. See {@link defineDocumentFunction}. */
  documentFunction(config: BlueprintDocumentFunctionConfig): void {
    this.#resources.push(defineDocumentFunction(config))
  }

  /** Adds a document webhook. See {@link defineDocumentWebhook}. */
  documentWebhook(config: BlueprintDocumentWebhookConfig): DocumentWebhookHandle {
    this.#resources.push(defineDocumentWebhook(config))
    return new DocumentWebhookHandle(config.name)
  }

  /** Adds a Durable Function. See {@link defineDurableFunction}. */
  durableFunction(config: BlueprintDurableConfig): void {
    this.#resources.push(defineDurableFunction(config))
  }

  /** Adds a Media Library Asset Function. See {@link defineMediaLibraryAssetFunction}. */
  mediaLibraryAssetFunction(config: BlueprintMediaLibraryAssetFunctionConfig): void {
    this.#resources.push(defineMediaLibraryAssetFunction(config))
  }

  /** Adds a Media Library configuration. See {@link defineMediaLibraryConfig}. */
  mediaLibraryConfig(config: BlueprintMediaLibraryConfigConfig): MediaLibraryConfigHandle {
    this.#resources.push(defineMediaLibraryConfig(config))
    return new MediaLibraryConfigHandle(config.name)
  }

  /** Adds a permission. See {@link definePermission}. */
  permission(config: BlueprintPermissionConfig): PermissionHandle {
    this.#resources.push(definePermission(config))
    return new PermissionHandle(config.name)
  }

  /** Adds a project. See {@link defineProject}. Add resources to the project with the returned {@link ProjectHandle}. */
  project(config: BlueprintProjectConfig): ProjectHandle {
    this.#resources.push(defineProject(config))

    return new ProjectHandle(config.name, this.#resources)
  }

  /** Adds a Pub Sub Function. See {@link definePubSubFunction}. */
  pubSubFunction(config: BlueprintPubSubFunctionConfig): void {
    this.#resources.push(definePubSubFunction(config))
  }

  /** Adds a resource that has no method of its own, such as the function that {@link defineDocumentFunction} returns. */
  resource<R extends BlueprintResource>(r: R): ResourceHandle<R['type']> {
    this.#resources.push(defineResource(r))
    return new ResourceHandle(r.name, r.type)
  }

  /** Adds a robot token. See {@link defineRobotToken}. */
  robotToken(config: BlueprintRobotTokenConfig): RobotTokenHandle {
    this.#resources.push(defineRobotToken(config))
    return new RobotTokenHandle(config.name)
  }

  /** Adds a role. See {@link defineRole}. */
  role(config: BlueprintRoleConfig): RoleHandle {
    this.#resources.push(defineRole(config))
    return new RoleHandle(config.name)
  }

  /** Adds a Studio. See {@link defineStudio}. */
  studio(config: BlueprintStudioConfig): StudioHandle {
    this.#resources.push(defineStudio(config))

    return new StudioHandle(config.name)
  }

  /** Adds a Scheduled Function. See {@link defineScheduledFunction}. */
  scheduledFunction(config: BlueprintScheduledFunctionConfig): void {
    this.#resources.push(defineScheduledFunction(config))
  }

  /** Adds a Sync Tag Invalidate Function. See {@link defineSyncTagInvalidateFunction}. */
  syncTagInvalidateFunction(config: BlueprintSyncTagInvalidateFunctionConfig): void {
    this.#resources.push(defineSyncTagInvalidateFunction(config))
  }
}

/**
 * The function that {@link buildBlueprint} calls to add resources. It must add every resource before it returns.
 * @public
 * @beta
 * @category Builder
 */
export type BuildBlueprintCallback = (blueprint: BlueprintHandle) => void

/**
 * Builds a Blueprint by adding resources in a callback.
 *
 * Building Blueprints with `buildBlueprint` is experimental. This may be subject to breaking changes.
 *
 * @remarks
 * An alternative to {@link defineBlueprint}. Each method on {@link BlueprintHandle} calls a definer and returns a handle
 * that creates `$.resources.*` references to the new resource. Resources added through a {@link ProjectHandle} are scoped
 * to that project. For the options of each resource, see its definer.
 *
 * @example
 * ```ts
 * buildBlueprint((blueprint) => {
 *   const project = blueprint.project({name: 'my-project'})
 *   project.dataset({name: 'production'})
 * })
 * ```
 *
 * @example References between resources
 * ```ts
 * buildBlueprint((blueprint) => {
 *   const project = blueprint.project({name: 'my-project'})
 *   const dataset = project.dataset({name: 'production'})
 *   project.documentWebhook({
 *     name: 'article-sync',
 *     dataset: dataset.datasetName,
 *     apiVersion: 'v2025-01-01',
 *     on: ['create', 'update'],
 *     url: 'https://example.com/webhook',
 *   })
 *
 *   const role = project.role({
 *     name: 'ci-deploy-role',
 *     title: 'CI Deploy Role',
 *     appliesToRobots: true,
 *     appliesToUsers: false,
 *     permissions: [{name: 'sanity-project-cors', action: 'create'}],
 *   })
 *   project.robotToken({
 *     name: 'ci-robot',
 *     memberships: [{roleNames: [role.name]}],
 *   })
 * })
 * ```
 * @param callback Adds resources to the Blueprint
 * @public
 * @beta
 * @category Builder
 * @returns A blueprint module
 */
export function buildBlueprint(callback: BuildBlueprintCallback): BlueprintModule
/**
 * Builds a Blueprint with top-level settings, such as `values`, by adding resources in a callback.
 *
 * @example With values
 * ```ts
 * buildBlueprint({values: {environment: 'production'}}, (blueprint) => {
 *   blueprint.corsOrigin({name: 'localhost', origin: 'http://localhost:3333'})
 * })
 * ```
 * @param config Top-level settings for the Blueprint
 * @param callback Adds resources to the Blueprint
 * @public
 * @beta
 * @category Builder
 * @returns A blueprint module
 */
export function buildBlueprint(config: BuildBlueprintConfig | undefined, callback: BuildBlueprintCallback): BlueprintModule
export function buildBlueprint(
  configOrCallback: BuildBlueprintConfig | BuildBlueprintCallback | undefined,
  maybeCallback?: BuildBlueprintCallback,
): BlueprintModule {
  const config = typeof configOrCallback === 'function' ? undefined : configOrCallback
  const callback = typeof configOrCallback === 'function' ? configOrCallback : maybeCallback
  if (!callback) throw new Error('buildBlueprint requires a callback')

  const output: Partial<Blueprint> = {
    ...config,
  }
  const resources: BlueprintResource[] = []

  try {
    callback(new BlueprintHandle(resources))
  } catch (err) {
    resetCollectedErrors()
    throw err
  }

  return defineBlueprint({...output, resources})
}
