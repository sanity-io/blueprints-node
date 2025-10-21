import type {BlueprintProjectResource} from '../types'

export function defineProject(projectConfig: Omit<BlueprintProjectResource, 'type'>): BlueprintProjectResource {
  const {name, displayName} = projectConfig

  if (!name) throw new Error('`name` is required')
  if (!displayName) throw new Error('`displayName` is required')

  return {
    name,
    type: 'sanity.project',
    displayName,
  }
}
