import {
  type BlueprintCrossStackReferenceConfig,
  type BlueprintProjectRoleResource,
  type BlueprintResource,
  type BlueprintRoleConfig,
  type BlueprintRoleResource,
  referenceResource,
  validateProjectRole,
  validateRole,
} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a role that is scoped to the same resource as the blueprint.
 *
 * @example
 * ```ts
 * defineRole({
 *   name: 'custom-robot-role',
 *   title: 'Custom Robot Role',
 *   appliesToRobots: true,
 *   appliesToUsers: false,
 *   permissions: [{
 *     name: 'sanity-project-cors',
 *     action: 'create',
 *   }],
 * })
 * ```
 *
 * @example All options
 * ```ts
 * defineRole({
 *   name: 'ci-deploy-role',
 *   title: 'CI Deploy Role',
 *   description: 'Permissions for CI/CD pipelines to manage CORS origins',
 *   appliesToRobots: true,
 *   appliesToUsers: false,
 *   permissions: [{
 *     name: 'sanity-project-cors',
 *     action: 'create',
 *   }, {
 *     name: 'sanity-project-cors',
 *     action: 'read',
 *   }, {
 *     name: 'sanity-project-cors',
 *     action: 'delete',
 *   }],
 * })
 * ```
 * @param parameters The configuration of the role
 * @public
 * @category Definers
 * @expandType BlueprintRoleConfig
 * @returns The role resource
 */
export function defineRole(parameters: BlueprintRoleConfig, options?: {skipValidation?: boolean}): BlueprintRoleResource {
  const roleResource: BlueprintRoleResource = {
    name: parameters.name,
    type: 'sanity.access.role',
    title: parameters.title,
    description: parameters.description,
    appliesToUsers: parameters.appliesToUsers,
    appliesToRobots: parameters.appliesToRobots,
    permissions: parameters.permissions,
  }

  if (parameters.lifecycle) {
    roleResource.lifecycle = parameters.lifecycle
  }

  if (options?.skipValidation !== true) runValidation(() => validateRole(roleResource))

  return roleResource
}

/**
 * Defines a role that is scoped to the specified project.
 *
 * @example
 * ```ts
 * defineProjectRole(projectId, {
 *   name: 'viewer-role',
 *   title: 'Viewer',
 *   appliesToUsers: true,
 *   appliesToRobots: false,
 *   permissions: [{
 *     name: 'sanity-project-cors',
 *     action: 'read',
 *   }],
 * })
 * ```
 *
 * @example Cross-resource references
 * ```ts
 * const role = defineProjectRole(projectId, {
 *   name: 'ci-deploy-role',
 *   title: 'CI Deploy Role',
 *   appliesToRobots: true,
 *   appliesToUsers: false,
 *   permissions: [{
 *     name: 'sanity-project-cors',
 *     action: 'create',
 *   }, {
 *     name: 'sanity-project-cors',
 *     action: 'delete',
 *   }],
 * })
 *
 * defineRobotToken({
 *   name: 'ci-robot',
 *   memberships: [{
 *     resourceType: 'project',
 *     resourceId: projectId,
 *     roleNames: ['$.resources.ci-deploy-role'],
 *   }],
 * })
 * ```
 * @public
 * @category Definers
 * @expandType BlueprintRoleConfig
 * @param projectId The ID of the project to which the role will be scoped
 * @param parameters The configuration of the role
 * @returns The role resource
 */
export function defineProjectRole(projectId: string, parameters: BlueprintRoleConfig): BlueprintProjectRoleResource {
  const roleResource = defineRole(parameters, {skipValidation: true})

  const projectRoleResource: BlueprintProjectRoleResource = {
    ...roleResource,
    resourceType: 'project',
    resourceId: projectId,
  }

  runValidation(() => validateProjectRole(projectRoleResource))

  return projectRoleResource
}

/**
 * Creates a reference to a role in another stack.
 *
 * ```ts
 * referenceRole({
 *   name: 'editor-role',
 *   stack: 'editorial',
 * })
 * ```
 *
 * @public
 * @category Referencers
 * @expandType BlueprintCrossStackReferenceConfig
 * @param params The parameters for referencing the role
 * @returns The role reference
 */
export function referenceRole({name, stack, localName}: BlueprintCrossStackReferenceConfig): BlueprintResource {
  return referenceResource({name, stack, localName, type: 'sanity.access.role'})
}
