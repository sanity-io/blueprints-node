import type {BlueprintDocumentFunctionResource} from '../../../types'
import {BaseResource} from '../../blueprint'
import {_reference} from '../../reference'

type EventName = 'publish' | 'create' | 'delete' | 'update'
interface EventResourceDataset {
  type: 'dataset'
  /** @description A dataset ID in the format <projectId>.<datasetName>. <datasetName> can be `*` to signify "all datasets in project with ID <projectId>." */
  id: string
}
interface Event {
  on?: [EventName, ...EventName[]]
  filter?: string
  projection?: `{${string}}`
  includeDrafts?: boolean
  includeAllVersions?: boolean
  resource?: EventResourceDataset
}

interface DocumentFunctionParameters {
  event: Event
  src: string
  timeout?: number
  memory?: number
  env?: Record<string, string>
}

export type DocumentFunctionAttributes = {
  id: string
  event: Event
  timeout?: number
  memory?: number
  env?: Record<string, string>
}

export class DocumentFunctionResource extends BaseResource<DocumentFunctionAttributes> {
  #params: DocumentFunctionParameters

  constructor(name: string, params: DocumentFunctionParameters) {
    super(name, 'sanity.function.document')

    this.#params = params
  }

  override referenceData(): DocumentFunctionAttributes {
    return {
      event: {
        filter: 'filter',
        includeAllVersions: true,
        includeDrafts: true,
        on: ['create'],
        projection: '{projection}',
        resource: {
          id: 'id',
          type: 'dataset',
        },
      },
      id: 'id',
      env: {},
      memory: 1,
      timeout: 1,
    }
  }

  override build(): BlueprintDocumentFunctionResource {
    return {
      name: this.name,
      type: 'sanity.function.document',
      event: this.#params.event,
      src: this.#params.src,
      env: this.#params.env,
      memory: this.#params.memory,
      timeout: this.#params.timeout,
    }
  }
}

export function reference(func: DocumentFunctionResource): DocumentFunctionAttributes {
  return _reference<DocumentFunctionAttributes, DocumentFunctionResource>(func)
}
