# Changelog

## [0.6.0](https://github.com/sanity-io/blueprints-node/compare/v0.5.0...v0.6.0) (2025-11-20)


### Features

* add support for `includeDrafts` to media library asset functions ([#34](https://github.com/sanity-io/blueprints-node/issues/34)) ([92ab40a](https://github.com/sanity-io/blueprints-node/commit/92ab40ae9cf0bb08e350049a7f92b781fe0303f6))

## [0.5.0](https://github.com/sanity-io/blueprints-node/compare/v0.4.2...v0.5.0) (2025-11-20)


### Features

* Add dataset definer function ([#27](https://github.com/sanity-io/blueprints-node/issues/27)) ([eb69a81](https://github.com/sanity-io/blueprints-node/commit/eb69a812575b1c4ee6eab0b6c00e0f8d3764aa84))
* Add role definers ([#31](https://github.com/sanity-io/blueprints-node/issues/31)) ([d9cb336](https://github.com/sanity-io/blueprints-node/commit/d9cb33636374c285d2e10e90ea076b0b243556a9))


### Bug Fixes

* function `name` is now a required part of the function resource types ([#30](https://github.com/sanity-io/blueprints-node/issues/30)) ([c86f0b5](https://github.com/sanity-io/blueprints-node/commit/c86f0b508e2e259dec3582c2909d2bc0304b4d26))
* Remove unused permission type ([#32](https://github.com/sanity-io/blueprints-node/issues/32)) ([d95732e](https://github.com/sanity-io/blueprints-node/commit/d95732e6f7affcfebd7b1c72e2461358e97e4b1e))

## [0.4.2](https://github.com/sanity-io/blueprints-node/compare/v0.4.1...v0.4.2) (2025-11-14)


### Bug Fixes

* Ensure webhooks types match expectations in provider ([#25](https://github.com/sanity-io/blueprints-node/issues/25)) ([13d083f](https://github.com/sanity-io/blueprints-node/commit/13d083f6706996178e06fa3ffb576b22598faf13))

## [0.4.1](https://github.com/sanity-io/blueprints-node/compare/v0.4.0...v0.4.1) (2025-11-05)


### Bug Fixes

* update function event.projection type to include wrapped curlies ([#22](https://github.com/sanity-io/blueprints-node/issues/22)) ([11516e2](https://github.com/sanity-io/blueprints-node/commit/11516e2e811b762fb66d00a04813a05646a31795))

## [0.4.0](https://github.com/sanity-io/blueprints-node/compare/v0.3.0...v0.4.0) (2025-10-31)


### Features

* Add define function for CORS Origins ([#21](https://github.com/sanity-io/blueprints-node/issues/21)) ([1697adb](https://github.com/sanity-io/blueprints-node/commit/1697adb746534c2314ae331625f2e8c58a7a9d8e))
* Add definer for webhooks ([#18](https://github.com/sanity-io/blueprints-node/issues/18)) ([6d38e93](https://github.com/sanity-io/blueprints-node/commit/6d38e9358be04437ad8dc5e896fd9aa9c6313b61))
* support for media library asset function ([#16](https://github.com/sanity-io/blueprints-node/issues/16)) ([95384eb](https://github.com/sanity-io/blueprints-node/commit/95384eb3f523be4ff9cc97ff8235165f4787b37c))


### Bug Fixes

* Move webhook types into types.ts file ([#20](https://github.com/sanity-io/blueprints-node/issues/20)) ([08941a0](https://github.com/sanity-io/blueprints-node/commit/08941a03c7433bd890c55b63c25acedc4275f4c8))

## [0.3.0](https://github.com/sanity-io/blueprints-node/compare/v0.2.0...v0.3.0) (2025-09-22)


### Features

* Support dataset scoping of function event sources ([#10](https://github.com/sanity-io/blueprints-node/issues/10)) ([51766ed](https://github.com/sanity-io/blueprints-node/commit/51766ed288ce93e9a820e67c85bd749bfc85999f))

## [0.2.0](https://github.com/sanity-io/blueprints-node/compare/v0.1.0...v0.2.0) (2025-08-20)


### Features

* Support new document change events (`create`, `delete`, `update`), plus `includeDrafts` and `includeAllVersions` filters ([#8](https://github.com/sanity-io/blueprints-node/issues/8)) ([f447d07](https://github.com/sanity-io/blueprints-node/commit/f447d07e75cbfa9ebb687f6d066adc81d658d538))

## [0.1.0](https://github.com/sanity-io/blueprints-node/compare/v0.0.1...v0.1.0) (2025-06-20)


### Features

* constrain event names to a type composed of specific string literals ([#5](https://github.com/sanity-io/blueprints-node/issues/5)) ([a522820](https://github.com/sanity-io/blueprints-node/commit/a522820b41c1d85d3a3738e2fc7c654b5ad9de95))

## 0.0.1 (2025-06-04)


### Bug Fixes

* less strict and type BlueprintModule ([847fcc1](https://github.com/sanity-io/blueprints-node/commit/847fcc17c4d034342eff43b466ba4c0b769d3291))


### Miscellaneous Chores

* release 0.0.1 ([1c305ca](https://github.com/sanity-io/blueprints-node/commit/1c305cab31fffff51869396153ba7fef47c361da))

## 0.0.1

- Initial release
