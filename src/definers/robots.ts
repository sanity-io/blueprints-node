import {type BlueprintRobotConfig, type BlueprintRobotResource, validateRobot} from '../index.js'
import {runValidation} from '../utils/validation.js'

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
