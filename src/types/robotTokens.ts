import type {BlueprintProjectResourceLifecycle, BlueprintResource} from './resources'

/**
 * Resource types that robot tokens can be attached to.
 * @internal
 */
export type RobotTokenResourceType = 'organization' | 'project'

/**
 * Defines the robot token's roles within a given resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 */
export interface RobotTokenMembership {
  resourceType: RobotTokenResourceType
  resourceId: string
  roleNames: string[]
}

/**
 * A robot token that provides automated access.
 *
 * This feature is subject to breaking changes.
 *
 * @see https://www.sanity.io/docs/content-lake/http-auth#k4c21d7b829fe
 * @beta
 * @category Resource Types
 */
export interface BlueprintRobotTokenResource extends BlueprintResource<BlueprintProjectResourceLifecycle> {
  type: 'sanity.access.robot'
  /**
   * A descriptive label for the robot token and its use case
   * @hidden
   */
  label?: string
  /** A descriptive label for the robot token and its use case */
  displayName?: string
  /** A list of memberships that the robot token has */
  memberships: RobotTokenMembership[]

  resourceType?: RobotTokenResourceType
  resourceId?: string
}

/**
 * Configuration for a robot token that provides automated access.
 *
 * This feature is subject to breaking changes.
 * @see https://www.sanity.io/docs/content-lake/http-auth#k4c21d7b829fe
 * @beta
 * @category Resource Types
 * @interface
 */
export type BlueprintRobotTokenConfig = Omit<BlueprintRobotTokenResource, 'type' | 'label' | 'displayName' | 'token'> &
  (
    | {
        /**
         * A descriptive label for the robot token and its use case
         * @defaultValue The `name` of the resource
         * @hidden
         */
        label: string
        //displayName: never
      }
    | {
        /**
         * A descriptive label for the robot token and its use case
         * @defaultValue The `name` of the resource
         */
        displayName: string
        //label: never
      }
  )
