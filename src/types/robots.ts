import type {BlueprintResource} from './resources'

export type RobotResourceType = 'organization' | 'project'

export interface RobotMembership {
  resourceType: RobotResourceType
  resourceId: string
  roleNames: string[]
}

export interface BlueprintRobotResource extends BlueprintResource {
  type: 'sanity.access.robot'
  label: string
  memberships: RobotMembership[]

  resourceType?: RobotResourceType
  resourceId?: string
}

export type BlueprintRobotConfig = Omit<BlueprintRobotResource, 'type' | 'label'> & {
  label?: string
}
