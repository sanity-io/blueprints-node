import {type BlueprintRobotConfig, type BlueprintRobotResource, validateRobot} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a Robot token for automated access. Has a token property provided during deployment that can be referenced by other resources.
 * ```
 * defineRobot({
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
 * @param parameters The robot configuration
 */
export function defineRobot(parameters: BlueprintRobotConfig): BlueprintRobotResource {
  // default robot label
  const label = parameters.label || parameters.name

  const robotResource: BlueprintRobotResource = {
    ...parameters,
    label,
    type: 'sanity.access.robot',
  }

  runValidation(() => validateRobot(robotResource))

  return robotResource
}
