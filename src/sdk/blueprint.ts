import {defineBlueprint} from '../definers/blueprints'
import type {BlueprintModule, BlueprintResource} from '../types'

const resourceTypes = ['sanity.project', 'sanity.project.cors', 'sanity.function.document'] as const

export type ResourceType = (typeof resourceTypes)[number]

export abstract class BaseResource<A extends Record<string, unknown> = Record<string, unknown>> {
  readonly name: string
  readonly type: ResourceType

  constructor(name: string, type: ResourceType) {
    this.name = name
    this.type = type
  }

  abstract referenceData(): A

  abstract build(): BlueprintResource
}

export class BlueprintBuilder {
  #resources: BaseResource[]

  constructor(resources: BaseResource[]) {
    this.#resources = resources
  }

  build(): BlueprintModule {
    return defineBlueprint({
      resources: this.#resources.map((r) => r.build()),
    })
  }
}
