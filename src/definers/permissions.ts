import {type BlueprintPermissionConfig, type BlueprintPermissionResource, validatePermission} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a custom permission that roles can grant. The Manage UI calls it a "content resource".
 *
 * ```ts
 * definePermission({
 *   name: 'articles-only',
 *   filter: '_type == "article"',
 * })
 * ```
 *
 * @example Grant the permission with a role
 * ```ts
 * definePermission({
 *   name: 'articles-only',
 *   title: 'Articles only',
 *   description: 'Access to article documents',
 *   filter: '_type == "article"',
 * })
 *
 * defineRole({
 *   name: 'article-editor',
 *   title: 'Article editor',
 *   appliesToUsers: true,
 *   appliesToRobots: false,
 *   permissions: [
 *     {name: 'sanity-project', action: 'read'},
 *     {name: '$.resources.articles-only', action: 'mode', params: {mode: 'publish'}},
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
