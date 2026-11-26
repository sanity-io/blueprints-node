import {defineApplication} from '../definers/applications.js'
import {defineBlueprint} from '../definers/blueprints.js'
import {defineContextKnowledgeBase, defineContextMcpEndpoint} from '../definers/context.js'
import {defineCorsOrigin} from '../definers/cors.js'
import {defineDataset} from '../definers/datasets.js'
import {defineMediaLibraryConfig} from '../definers/installation-config.js'
import {definePermission} from '../definers/permissions.js'
import {defineProject} from '../definers/projects.js'
import {defineRobotToken} from '../definers/robot-tokens.js'
import {defineRole} from '../definers/roles.js'
import {defineStudio} from '../definers/studios.js'
import type {BlueprintApplicationConfig} from '../types/applications.js'
import type {Blueprint, BlueprintModule} from '../types/blueprints.js'
import type {
  BlueprintContextKnowledgeBaseConfig,
  BlueprintContextKnowledgeBaseResource,
  BlueprintContextMcpEndpointConfig,
  ContextMcpEndpointSource,
} from '../types/context.js'
import type {BlueprintCorsOriginConfig} from '../types/cors.js'
import type {BlueprintDatasetConfig} from '../types/datasets.js'
import type {BlueprintMediaLibraryConfigConfig} from '../types/installation-config.js'
import type {BlueprintPermissionConfig} from '../types/permissions.js'
import type {BlueprintProjectConfig} from '../types/projects.js'
import type {BlueprintResource} from '../types/resources.js'
import type {BlueprintRobotTokenConfig} from '../types/robotTokens.js'
import type {BlueprintRoleConfig} from '../types/roles.js'
import type {BlueprintStudioConfig} from '../types/studios.js'
import {ApplicationHandle} from './application.js'
import {ContextKnowledgeBaseHandle, ContextMcpEndpointHandle} from './context.js'
import {CorsOriginHandle} from './cors.js'
import {DatasetHandle} from './dataset.js'
import {MediaLibraryConfigHandle} from './installation-config.js'
import {PermissionHandle} from './permission.js'
import {ProjectHandle} from './project.js'
import {ResourceHandle} from './resource.js'
import {RobotTokenHandle} from './robot-token.js'
import {RoleHandle} from './role.js'
import {StudioHandle} from './studio.js'

type BlueprintConfig = Partial<Pick<Blueprint, '$schema' | 'blueprintVersion' | 'values'>>

class BlueprintHandle {
  #resources: BlueprintResource[]
  constructor(resources: BlueprintResource[]) {
    this.#resources = resources
  }

  application(config: BlueprintApplicationConfig): ApplicationHandle {
    this.#resources.push(defineApplication(config))
    return new ApplicationHandle(config.name)
  }

  contextKnowledgeBase(config: BlueprintContextKnowledgeBaseConfig): ContextKnowledgeBaseHandle {
    this.#resources.push(defineContextKnowledgeBase(config))
    return new ContextKnowledgeBaseHandle(config.name)
  }

  contextMcpEndpoint(
    config: Omit<BlueprintContextMcpEndpointConfig, 'sources'> & {
      sources: Array<ContextMcpEndpointSource | BlueprintContextKnowledgeBaseResource | ContextKnowledgeBaseHandle>
    },
  ): ContextMcpEndpointHandle {
    // map sources to types the definer accepts
    const sources = config.sources.map<ContextMcpEndpointSource | BlueprintContextKnowledgeBaseResource>((source) =>
      source instanceof ContextKnowledgeBaseHandle ? {type: 'knowledge-base', id: source.reference()} : source,
    )
    this.#resources.push(defineContextMcpEndpoint({...config, sources}))
    return new ContextMcpEndpointHandle(config.name)
  }

  corsOrigin(config: BlueprintCorsOriginConfig): CorsOriginHandle {
    this.#resources.push(defineCorsOrigin(config))
    return new CorsOriginHandle(config.name)
  }

  dataset(config: BlueprintDatasetConfig): DatasetHandle {
    this.#resources.push(defineDataset(config))
    return new DatasetHandle(config.name)
  }

  mediaLibraryConfig(config: BlueprintMediaLibraryConfigConfig): MediaLibraryConfigHandle {
    this.#resources.push(defineMediaLibraryConfig(config))
    return new MediaLibraryConfigHandle(config.name)
  }

  permission(config: BlueprintPermissionConfig): PermissionHandle {
    this.#resources.push(definePermission(config))
    return new PermissionHandle(config.name)
  }

  project(config: BlueprintProjectConfig): ProjectHandle {
    this.#resources.push(defineProject(config))

    return new ProjectHandle(config.name, this.#resources)
  }

  resource<R extends BlueprintResource>(r: R): ResourceHandle {
    this.#resources.push(r)
    return new ResourceHandle(r.name)
  }

  robotToken(config: BlueprintRobotTokenConfig): RobotTokenHandle {
    this.#resources.push(defineRobotToken(config))
    return new RobotTokenHandle(config.name)
  }

  role(config: BlueprintRoleConfig): RoleHandle {
    this.#resources.push(defineRole(config))
    return new RoleHandle(config.name)
  }

  studio(config: BlueprintStudioConfig): StudioHandle {
    this.#resources.push(defineStudio(config))

    return new StudioHandle(config.name)
  }
}

export function buildBlueprint(config: BlueprintConfig, callback: (blueprint: BlueprintHandle) => void): BlueprintModule {
  const output: Partial<Blueprint> = {
    ...config,
  }
  const resources: BlueprintResource[] = []

  callback(new BlueprintHandle(resources))

  return defineBlueprint({...output, resources})
}
