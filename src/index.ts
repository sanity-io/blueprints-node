/**
 * @packageDocumentation
 *
 * @categoryDescription Definers
 * These functions are used to define resources in a Blueprint.
 *
 * @categoryDescription Application Children
 * These functions define the views and web workers of an application. Pass them to `defineApplication`.
 *
 * @categoryDescription Referencers
 * These functions are used to reference resources in another Blueprint.
 *
 * @categoryDescription Builder
 * An alternative to {@link defineBlueprint}. `buildBlueprint` adds resources in a callback and returns handles that reference them.
 *
 * @categoryDescription Resource Types
 * These types are used to define the shape of resources in a Blueprint.
 *
 * @categoryDescription Functions Types
 * Resource types for functions in a Blueprint.
 *
 * @categoryDescription Validation
 * These functions are used to validate resources in a Blueprint.
 *
 * @categoryDescription Blueprint Internals
 * Shared types that Blueprints and resources are built on. Definers and resource types use them, so most code does not need to import them.
 */

// BUILDER - build a blueprint
export type {AbstractHandle} from './build/abstract-handle.js'
export type {ApplicationHandle} from './build/application.js'
export {type BlueprintHandle, type BuildBlueprintCallback, type BuildBlueprintConfig, buildBlueprint} from './build/blueprint.js'
export type {ContextKnowledgeBaseHandle, ContextMcpEndpointHandle} from './build/context.js'
export type {CorsOriginHandle} from './build/cors.js'
export type {DatasetHandle} from './build/dataset.js'
export type {MediaLibraryConfigHandle} from './build/installation-config.js'
export type {PermissionHandle} from './build/permission.js'
export type {ProjectHandle} from './build/project.js'
export type {ResourceHandle} from './build/resource.js'
export type {RobotTokenHandle} from './build/robot-token.js'
export type {RoleHandle} from './build/role.js'
export type {StudioHandle} from './build/studio.js'
export type {DocumentWebhookHandle} from './build/webhook.js'

// DEFINERS - helper functions to create resources
export * from './definers/agents.js'
export * from './definers/applications.js'
export * from './definers/blueprints.js'
export * from './definers/context.js'
export * from './definers/cors.js'
export * from './definers/datasets.js'
export * from './definers/functions/document.js'
export * from './definers/functions/durable.js'
export * from './definers/functions/index.js'
export * from './definers/functions/media-library.js'
export * from './definers/functions/pubsub.js'
export * from './definers/functions/queue.js'
export * from './definers/functions/scheduled.js'
export * from './definers/functions/sync-tag-invalidate.js'
export * from './definers/installation-config.js'
export * from './definers/permissions.js'
export * from './definers/projects.js'
export * from './definers/resources.js'
export * from './definers/robot-tokens.js'
export * from './definers/robots.js'
export * from './definers/roles.js'
export * from './definers/studios.js'
export * from './definers/webhooks.js'

// TYPES - base types for all resources
export * from './types/agents.js'
export * from './types/applications.js'
export * from './types/blueprints.js'
export * from './types/context.js'
export * from './types/cors.js'
export * from './types/datasets.js'
export * from './types/errors.js'
export * from './types/functions/index.js'
export * from './types/installation-config.js'
export * from './types/permissions.js'
export * from './types/projects.js'
export * from './types/resources.js'
export * from './types/robots.js'
export * from './types/robotTokens.js'
export * from './types/roles.js'
export * from './types/studios.js'
export * from './types/webhooks.js'

// VALIDATION - validation for all resources
export * from './validation/agents.js'
export * from './validation/applications.js'
export * from './validation/blueprints.js'
export * from './validation/context.js'
export * from './validation/cors.js'
export * from './validation/datasets.js'
export * from './validation/functions.js'
export * from './validation/installation-config.js'
export * from './validation/permissions.js'
export * from './validation/projects.js'
export * from './validation/resources.js'
export * from './validation/robots.js'
export * from './validation/robotTokens.js'
export * from './validation/roles.js'
export * from './validation/studios.js'
export * from './validation/webhooks.js'
