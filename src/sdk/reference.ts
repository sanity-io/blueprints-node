import type {BaseResource} from './blueprint'

export function _reference<A extends Record<string, unknown>, R extends BaseResource<A>>(resource: R): A {
  let prefix = `$.resources.${resource.name}`
  const handler: ProxyHandler<A> = {
    get(target, key) {
      if (!target || typeof key !== 'string') {
        throw Error('Invalid reference')
      }

      if (typeof target === 'object' && key in target) {
        const targetType = typeof target[key]
        if (targetType === 'boolean' || targetType === 'number' || targetType === 'string') {
          if (Array.isArray(target)) {
            return `${prefix}[${key}]`
          }
          return `${prefix}.${key}`
        }

        if (targetType === 'object' && target[key]) {
          if (Array.isArray(target)) {
            prefix = `${prefix}[${key}]`
          } else {
            prefix = `${prefix}.${key}`
          }
          return new Proxy(target[key], handler)
        }
      }

      throw Error('Invalid reference')
    },
  }

  const typedAttributes = resource.referenceData() as A

  return new Proxy(typedAttributes, handler)
}
