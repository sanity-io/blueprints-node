/**
 * Key resources by name. A resource without a string `name` is left out, and a later resource with the same name replaces an earlier one.
 * @internal
 */
export function byName<T extends {name?: unknown}>(resources: T[]): Record<string, T> {
  const keyed: Record<string, T> = {}
  for (const resource of resources) {
    if (typeof resource?.name === 'string') keyed[resource.name] = resource
  }
  return keyed
}
