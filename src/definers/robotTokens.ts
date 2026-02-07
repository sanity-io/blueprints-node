import {type BlueprintRobotTokenConfig, type BlueprintRobotTokenResource, validateRobotToken} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a Robot Token for automated access. Has a token property provided during deployment that can be referenced by other resources.
 * ```
 * defineRobotToken({
 *   name: 'my-robot',
 *   label: 'My Robot',
 *   memberships: [{
 *     resourceType: 'project',
 *     resourceId: projectId,
 *     roleNames: ['custom-robot-role'],
 *   }],
 * })
 * ```
 *
 * @param parameters The robot token configuration
 * @public
 * @beta Deploying Robot Tokens via Blueprints is experimental. This feature is stabilizing but may still be subject to breaking changes.
 * @category Definers
 * @returns The robot token resource
 */
export function defineRobotToken(parameters: BlueprintRobotTokenConfig): BlueprintRobotTokenResource {
  const label = parameters.label || parameters.name

  const robotResource: BlueprintRobotTokenResource = {
    ...parameters,
    label,
    type: 'sanity.access.robot',
  }

  runValidation(() => validateRobotToken(robotResource))

  return robotResource
}
