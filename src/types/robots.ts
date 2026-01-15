import type {BlueprintResource} from './resources'

/** Resource types that robots can be attached to. */
export type RobotResourceType = 'organization' | 'project'

/**
 * Defines the robot's roles within a given resource.
 */
export interface RobotMembership {
  resourceType: RobotResourceType
  resourceId: string
  roleNames: string[]
}

/**
 * A robot that provides a token for automated access.
 * @see https://www.sanity.io/docs/content-lake/http-auth#k4c21d7b829fe
 */
export interface BlueprintRobotResource extends BlueprintResource {
  type: 'sanity.access.robot'
  /** A descriptive label for the robot and its use case */
  label: string
  memberships: RobotMembership[]

  resourceType?: RobotResourceType
  resourceId?: string
}

/**
 * Configuration for a robot that provides a token for automated access.
 * @see https://www.sanity.io/docs/content-lake/http-auth#k4c21d7b829fe
 */
export type BlueprintRobotConfig = Omit<BlueprintRobotResource, 'type' | 'label' | 'token'> & {
  label?: string
}
