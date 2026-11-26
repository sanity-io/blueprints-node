import {defineCorsOrigin} from '../definers/cors.js'
import {defineDataset} from '../definers/datasets.js'
import {definePermission} from '../definers/permissions.js'
import {defineRobotToken} from '../definers/robotTokens.js'
import {defineProjectRole} from '../definers/roles.js'
import {defineStudio} from '../definers/studios.js'
import {defineDocumentWebhook} from '../definers/webhooks.js'
import type {BlueprintCorsOriginConfig} from '../types/cors.js'
import type {BlueprintDatasetConfig} from '../types/datasets.js'
import type {BlueprintPermissionConfig} from '../types/permissions.js'
import type {BlueprintResource} from '../types/resources.js'
import type {BlueprintRobotTokenConfig} from '../types/robotTokens.js'
import type {BlueprintRoleConfig} from '../types/roles.js'
import type {BlueprintStudioConfig} from '../types/studios.js'
import type {BlueprintDocumentWebhookConfig} from '../types/webhooks.js'
import {AbstractHandle} from './abstractHandle.js'
import {CorsOriginHandle} from './cors.js'
import {DatasetHandle} from './dataset.js'
import {PermissionHandle} from './permission.js'
import {RobotTokenHandle} from './robotToken.js'
import {RoleHandle} from './role.js'
import {StudioHandle} from './studio.js'
import {DocumentWebhookHandle} from './webhook.js'

export class ProjectHandle extends AbstractHandle {
  #resources: BlueprintResource[]

  constructor(projectName: string, resources: BlueprintResource[]) {
    super(projectName)
    this.#resources = resources
  }

  corsOrigin(config: Omit<BlueprintCorsOriginConfig, 'project'>): CorsOriginHandle {
    this.#resources.push(defineCorsOrigin({...config, project: this.reference()}))
    return new CorsOriginHandle(config.name)
  }

  dataset(config: Omit<BlueprintDatasetConfig, 'project'>): DatasetHandle {
    this.#resources.push(defineDataset({...config, project: this.reference()}))
    return new DatasetHandle(config.name)
  }

  documentWebhook(config: Omit<BlueprintDocumentWebhookConfig, 'project'>): DocumentWebhookHandle {
    this.#resources.push(defineDocumentWebhook({...config, project: this.reference()}))
    return new DocumentWebhookHandle(config.name)
  }

  permission(config: Omit<BlueprintPermissionConfig, 'project'>): PermissionHandle {
    this.#resources.push(definePermission({...config, project: this.reference()}))
    return new PermissionHandle(config.name)
  }

  robotToken(config: Omit<BlueprintRobotTokenConfig, 'resourceType' | 'resourceId'>): RobotTokenHandle {
    this.#resources.push(defineRobotToken({...config, resourceType: 'project', resourceId: this.reference()}))
    return new RobotTokenHandle(config.name)
  }

  role(config: BlueprintRoleConfig): RoleHandle {
    this.#resources.push(defineProjectRole(this.reference(), config))
    return new RoleHandle(config.name)
  }

  studio(config: Omit<BlueprintStudioConfig, 'project'>): StudioHandle {
    this.#resources.push(defineStudio({...config, project: this.reference()}))
    return new StudioHandle(config.name)
  }
}
