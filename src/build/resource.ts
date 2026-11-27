import {AbstractHandle} from './abstract-handle.js'

export class ResourceHandle<Kind extends string = string> extends AbstractHandle {
  readonly kind: Kind

  constructor(name: string, kind: Kind) {
    super(name)
    this.kind = kind
  }
}
