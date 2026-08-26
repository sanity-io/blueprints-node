import type {BlueprintResourceDeletionPolicy} from '../types/resources.js'

export const WORKFLOW_RESOURCE_TYPE = 'sanity.workflow'

export const WORKFLOW_UNSUPPORTED_DELETION_POLICIES = ['allow', 'replace'] as const satisfies readonly BlueprintResourceDeletionPolicy[]
