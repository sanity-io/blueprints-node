import type {BlueprintFunctionResource, BlueprintFunctionResourceEvent} from '../types.js'

type EventKey = keyof BlueprintFunctionResourceEvent
const EVENT_KEYS = new Set<EventKey>(['on', 'filter', 'includeDrafts', 'includeAllVersions', 'projection', 'resource'])

export function defineDocumentFunction(functionConfig: Partial<BlueprintFunctionResource>): BlueprintFunctionResource

/** @deprecated Define event properties under the 'event' key instead of specifying them at the top level */
export function defineDocumentFunction(
  functionConfig: Partial<BlueprintFunctionResource> & Partial<BlueprintFunctionResourceEvent>,
): BlueprintFunctionResource

export function defineDocumentFunction(
  functionConfig: Partial<BlueprintFunctionResource> & Partial<BlueprintFunctionResourceEvent>,
): BlueprintFunctionResource {
  let {name, src, event, timeout, memory, env, type, ...maybeEvent} = functionConfig

  if (!name) throw new Error('`name` is required')

  // defaults
  if (!src) src = `functions/${name}`
  if (!type) type = 'sanity.function.document'

  // type validation
  if (memory && typeof memory !== 'number') throw new Error('`memory` must be a number')
  if (timeout && typeof timeout !== 'number') throw new Error('`timeout` must be a number')

  // event validation
  if (event) {
    // `event` was specified, but event keys (aggregated in `maybeEvent`) were also specified at the top level. ambiguous and deprecated usage.
    const duplicateKeys = Object.keys(maybeEvent).filter((k) => EVENT_KEYS.has(k as EventKey))
    if (duplicateKeys.length > 0) {
      throw new Error(
        `\`event\` properties should be specified under the \`event\` key - specifying them at the top level is deprecated. The following keys were specified at the top level: ${duplicateKeys.map((k) => `\`${k}\``).join(', ')}`,
      )
    }
    event = validateDocumentFunctionEvent(event)
  } else {
    event = validateDocumentFunctionEvent(maybeEvent)
    // deprecated usage of putting event properties at the top level, warn about this.
    console.warn(
      '⚠️ Deprecated usage of `defineDocumentFunction`: prefer to put `event` properties under the `event` key rather than at the top level.',
    )
  }

  return {
    type,
    name,
    src,
    event,
    timeout,
    memory,
    env,
  }
}

function validateDocumentFunctionEvent(event: Partial<BlueprintFunctionResourceEvent>): BlueprintFunctionResourceEvent {
  const cleanEvent = Object.fromEntries(
    Object.entries(event).filter(([key]) => EVENT_KEYS.has(key as EventKey)),
  ) as Partial<BlueprintFunctionResourceEvent>

  const fullEvent = {
    on: cleanEvent.on || ['publish'],
    ...cleanEvent,
  }
  if (!Array.isArray(fullEvent.on)) throw new Error('`event.on` must be an array')
  if (fullEvent.resource) {
    if (!fullEvent.resource.type || fullEvent.resource.type !== 'dataset') throw new Error('`event.resource.type` must be "dataset"')
    if (!fullEvent.resource.id || fullEvent.resource.id.split('.').length !== 2)
      throw new Error('`event.resource.id` must be in the format <projectId>.<datasetName>')
  }
  return fullEvent
}
