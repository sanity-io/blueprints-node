import type {BlueprintCorsOriginResource} from '../../../types'
import {BaseResource} from '../../blueprint'
import {_reference} from '../../reference'

type CorsParameters = {
  origin: string
  allowCredentials?: boolean
  project?: string
}

type CorsAttributes = {
  id: string
  origin: string
  allowCredentials: boolean
}

export class CorsResource extends BaseResource<CorsAttributes> {
  #origin: string
  #allowCredentials?: boolean
  #project?: string

  constructor(name: string, params: CorsParameters) {
    super(name, 'sanity.project.cors')

    this.#origin = params.origin
    this.#allowCredentials = params.allowCredentials
    this.#project = params.project
  }

  override referenceData(): CorsAttributes {
    return {
      allowCredentials: true,
      id: 'id',
      origin: 'origin',
    }
  }

  build(): BlueprintCorsOriginResource {
    return {
      name: this.name,
      type: 'sanity.project.cors',
      origin: this.#origin,
      allowCredentials: this.#allowCredentials,
      project: this.#project,
    }
  }
}

export function reference(cors: CorsResource): CorsAttributes {
  return _reference<CorsAttributes, CorsResource>(cors)
}
