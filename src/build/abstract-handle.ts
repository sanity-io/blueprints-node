/**
 * The base of the handles that {@link BlueprintHandle} and {@link ProjectHandle} methods return. A handle creates
 * references to the resource it was returned for.
 * @internal
 */
export abstract class AbstractHandle {
  /** The resource type, for example `sanity.project.dataset` */
  abstract readonly kind: string
  #name: string

  /** @internal */
  constructor(name: string) {
    this.#name = name
  }

  /**
   * Creates a reference to the resource, or to one of its attributes.
   * @param path The attribute to reference, for example `datasetName`
   * @returns `$.resources.<name>`, or `$.resources.<name>.<path>` when `path` is given
   */
  reference(path?: string) {
    if (path) {
      return `$.resources.${this.#name}.${path}`
    }

    return `$.resources.${this.#name}`
  }
}
