import type { Blueprint, BlueprintFunctionResource, BlueprintResource } from './types.js'

export function defineBlueprint(blueprintConfig: Partial<Blueprint>): (args: unknown) => Blueprint {
  let { blueprintVersion, resources, values, outputs } = blueprintConfig
  if (!resources) throw new Error('`resources` is required')

  if (!blueprintVersion) blueprintVersion = '2024-10-01'

  return () => {
    return {
      $schema: 'https://schemas.sanity.io/blueprints/v2024-10-01/blueprint.schema.json',
      blueprintVersion,
      resources,
      values,
      outputs,
    }
  }
}

export function defineFunction(functionConfig: Partial<BlueprintFunctionResource>): BlueprintFunctionResource {
  let { name, src, event, timeout, memory, env } = functionConfig
  if (!name) throw new Error('`name` is required')

  if (!src) {
    src = `functions/${name}`
  }

  if (event) {
    if (!event.on) throw new Error('`event.on` is required')
    if (!Array.isArray(event.on)) throw new Error('`event.on` must be an array')
    if (!event.on.includes('publish')) throw new Error('`event.on` must include `publish`')
  } else {
    event = { on: ['publish'] }
  }

  // memory should be integer between 1 and 10
  if (memory) {
    if (typeof memory !== 'number') throw new Error('`memory` must be a number')
    if (memory < 1 || memory > 10) throw new Error('`memory` must be between 1 and 10')
  }

  // timeout should be integer between 1 and 900
  if (timeout) {
    if (typeof timeout !== 'number') throw new Error('`timeout` must be a number')
    if (timeout < 1 || timeout > 900) throw new Error('`timeout` must be between 1 and 900')
  }

  return {
    type: 'sanity.function.document',
    name,
    src,
    event,
    timeout,
    memory,
    env,
  }
}

export function defineResource(resourceConfig: Partial<BlueprintResource>): BlueprintResource {
  const { name, type } = resourceConfig
  if (!name) throw new Error('`name` is required')
  if (!type) throw new Error('`type` is required')

  return {
    ...resourceConfig,
    type,
    name,
  }
}
