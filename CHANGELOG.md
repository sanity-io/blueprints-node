# Changelog

## [0.8.0](https://github.com/sanity-io/blueprints-node/compare/v0.7.1...v0.8.0) (2026-01-21)


### Features

* Add lifecycle to base resource type ([#48](https://github.com/sanity-io/blueprints-node/issues/48)) ([06e1381](https://github.com/sanity-io/blueprints-node/commit/06e13814ea70a2037a4c754ba61bb88eb949adbc))
* Add ownershipAction lifecycle property ([#49](https://github.com/sanity-io/blueprints-node/issues/49)) ([8532218](https://github.com/sanity-io/blueprints-node/commit/853221883e159cd8a87c5b7ae1a0122948fce856))
* add robot token to defineFunction ([#44](https://github.com/sanity-io/blueprints-node/issues/44)) ([e937d31](https://github.com/sanity-io/blueprints-node/commit/e937d31eed3f0c344efcec04099c1507e8476137))
* Allow specifying a projectId for attachment and improve validation ([#51](https://github.com/sanity-io/blueprints-node/issues/51)) ([4c5e451](https://github.com/sanity-io/blueprints-node/commit/4c5e4511d364ac9f202d3e6aac3de806988e1c7a))
* Robot definer and validation ([#47](https://github.com/sanity-io/blueprints-node/issues/47)) ([0e71fe2](https://github.com/sanity-io/blueprints-node/commit/0e71fe2c795340a15221c8e2fda550832df474c3))


### Bug Fixes

* Improve code documentation ([#50](https://github.com/sanity-io/blueprints-node/issues/50)) ([ca6802f](https://github.com/sanity-io/blueprints-node/commit/ca6802f69e9543837115531566e19b4468654cd0))

## [0.7.1](https://github.com/sanity-io/blueprints-node/compare/v0.7.0...v0.7.1) (2025-12-17)


### Bug Fixes

* Mark apiVersion is required to match API ([#42](https://github.com/sanity-io/blueprints-node/issues/42)) ([4d8b796](https://github.com/sanity-io/blueprints-node/commit/4d8b79615930af3da76fd6d85338ce9a4504ad9e))

## [0.7.0](https://github.com/sanity-io/blueprints-node/compare/v0.6.0...v0.7.0) (2025-11-26)


### Features

* Improve validation when type is not known ([#39](https://github.com/sanity-io/blueprints-node/issues/39)) ([55cfe1c](https://github.com/sanity-io/blueprints-node/commit/55cfe1ce2ad31c9a29884897bfc08bb2860dd6a3))
* Split out validation logic to be used by other modules ([#37](https://github.com/sanity-io/blueprints-node/issues/37)) ([4fde938](https://github.com/sanity-io/blueprints-node/commit/4fde93864438fb784ef38d6c4ff8a8a9c81f524b))


### Bug Fixes

* Validate resource end result instead of input config ([#40](https://github.com/sanity-io/blueprints-node/issues/40)) ([c8ef821](https://github.com/sanity-io/blueprints-node/commit/c8ef821104e50b6e55e0b5c9c5aca315b2d300c5))

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
