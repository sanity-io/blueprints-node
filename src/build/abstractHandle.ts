export class AbstractHandle {
  #name: string

  constructor(name: string) {
    this.#name = name
  }

  reference(path?: string) {
    if (path) {
      return `$.resources.${this.#name}.${path}`
    }

    return `$.resources.${this.#name}`
  }
}
