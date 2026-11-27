import {AbstractHandle} from './abstract-handle.js'

/**
 * A resource added with the `resource` method of {@link BlueprintHandle} in a {@link buildBlueprint} callback.
 * @public
 * @beta
 * @category Builder
 */
export class ResourceHandle<Kind extends string = string> extends AbstractHandle {
  readonly kind: Kind

  /** @internal */
  constructor(name: string, kind: Kind) {
    super(name)
    this.kind = kind
  }
}
