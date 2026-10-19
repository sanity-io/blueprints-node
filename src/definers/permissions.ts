import {
  type BlueprintContentResourceConfig,
  type BlueprintContentResourceMode,
  type BlueprintPermissionConfig,
  type BlueprintPermissionResource,
  type RolePermission,
  validateContentResource,
  validatePermission,
} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a custom permission that roles can grant, in the shape of the Access API.
 *
 * ```ts
 * definePermission({
 *   name: 'articles-only',
 *   permissionType: 'sanity.document.filter.mode',
 *   config: {filter: '_type == "article"'},
 * })
 * ```
 *
 * @example Grant the permission with a role
 * ```ts
 * definePermission({
 *   name: 'articles-only',
 *   title: 'Articles only',
 *   description: 'Access to article documents',
 *   permissionType: 'sanity.document.filter',
 *   config: {filter: '_type == "article"'},
 * })
 *
 * defineRole({
 *   name: 'article-editor',
 *   title: 'Article editor',
 *   appliesToUsers: true,
 *   appliesToRobots: false,
 *   permissions: [
 *     {name: 'sanity-project', action: 'read'},
 *     {name: '$.resources.articles-only', action: 'read'},
 *     {name: '$.resources.articles-only', action: 'update'},
 *   ],
 * })
 * ```
 * @param parameters The configuration of the permission
 * @public
 * @beta Deploying Permissions via Blueprints is experimental. This feature is stabilizing but may still be subject to breaking changes.
 * @category Definers
 * @expandType BlueprintPermissionConfig
 * @returns The permission resource
 */
export function definePermission(parameters: BlueprintPermissionConfig): BlueprintPermissionResource {
  const permissionResource: BlueprintPermissionResource = {
    ...parameters,
    type: 'sanity.access.permission',
  }

  runValidation(() => validatePermission(permissionResource))

  return permissionResource
}

/**
 * Defines a content resource as the Manage UI makes it: a custom permission of type `sanity.document.filter.mode`.
 *
 * ```ts
 * defineContentResource({
 *   name: 'movies',
 *   documentTypes: ['movie'],
 * })
 * // config.filter: '_type == "movie"'
 * ```
 *
 * @example Document types and a filter
 * ```ts
 * defineContentResource({
 *   name: 'london-posts',
 *   title: 'London posts',
 *   documentTypes: ['post', 'event'],
 *   filter: 'branch == "london"',
 * })
 * // config.filter: '_type in ["post", "event"] && (branch == "london")'
 * ```
 * @param parameters The configuration of the content resource
 * @public
 * @beta Deploying Permissions via Blueprints is experimental. This feature is stabilizing but may still be subject to breaking changes.
 * @category Definers
 * @expandType BlueprintContentResourceConfig
 * @returns The permission resource
 */
export function defineContentResource(parameters: BlueprintContentResourceConfig): BlueprintPermissionResource {
  const {documentTypes, filter, ...permission} = parameters

  runValidation(() => validateContentResource(parameters))

  return definePermission({
    ...permission,
    permissionType: 'sanity.document.filter.mode',
    config: {filter: contentResourceFilter(documentTypes, filter)},
  })
}

/**
 * Grants a content resource to a role with an access level, on all datasets, one dataset, or one dataset tag.
 *
 * ```ts
 * const movies = defineContentResource({
 *   name: 'movies',
 *   documentTypes: ['movie'],
 * })
 *
 * defineRole({
 *   name: 'movie-editor',
 *   title: 'Movie editor',
 *   appliesToUsers: true,
 *   appliesToRobots: false,
 *   permissions: [
 *     grantContentResource(movies, 'publish', {dataset: 'staging'}),
 *     grantContentResource(movies, 'read'),
 *   ],
 * })
 * ```
 * @param resource A permission of type `sanity.document.filter.mode` in the same blueprint
 * @param mode The access level
 * @param scope One dataset or one dataset tag. Omit it to grant on all datasets.
 * @public
 * @beta Deploying Permissions via Blueprints is experimental. This feature is stabilizing but may still be subject to breaking changes.
 * @category Definers
 * @returns The role permission
 */
export function grantContentResource(
  resource: BlueprintPermissionResource,
  mode: BlueprintContentResourceMode,
  scope?: {dataset: string; tagName?: never} | {tagName: string; dataset?: never},
): RolePermission {
  runValidation(() =>
    resource.permissionType === 'sanity.document.filter.mode'
      ? []
      : [
          {
            type: 'invalid_value',
            message: `Permission "${resource.name}" must have the permissionType \`sanity.document.filter.mode\` to be granted with a mode`,
          },
        ],
  )

  return {name: `$.resources.${resource.name}`, action: 'mode', params: {mode, ...scope}}
}

function contentResourceFilter(documentTypes: unknown, filter?: string): string {
  const types = Array.isArray(documentTypes) ? documentTypes.map((type) => JSON.stringify(type)) : []
  const typeClause = types.length > 1 ? `_type in [${types.join(', ')}]` : types.length === 1 ? `_type == ${types[0]}` : ''

  if (!typeClause) return filter ?? ''
  return filter ? `${typeClause} && (${filter})` : typeClause
}
