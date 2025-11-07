import type {BlueprintProjectResource} from '../../../types'
import {BaseResource} from '../../blueprint'
import {_reference} from '../../reference'

type ProjectParameters = {
  displayName?: string
}

export type ProjectAttributes = {
  id: string
  organizationId: string
  displayName: string
  isBlocked: boolean
  isDisabled: boolean
}

export class ProjectResource extends BaseResource<ProjectAttributes> {
  #displayName?: string

  constructor(name: string, params: ProjectParameters) {
    super(name, 'sanity.project')

    this.#displayName = params.displayName
  }

  referenceData(): ProjectAttributes {
    return {
      displayName: 'displayName',
      id: 'id',
      isBlocked: true,
      isDisabled: true,
      organizationId: 'organizationId',
    }
  }

  build(): BlueprintProjectResource {
    return {
      name: this.name,
      type: this.type,
      displayName: this.#displayName,
    }
  }
}

export function reference(project: ProjectResource): ProjectAttributes {
  return _reference<ProjectAttributes, ProjectResource>(project)
}
