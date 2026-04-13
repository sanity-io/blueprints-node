import * as index from '../../src/index.js'

export function defineBlueprintForResource(resource: index.BlueprintResource) {
  index.defineBlueprint({resources: [resource]})
}
