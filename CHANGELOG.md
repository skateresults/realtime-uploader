# Changelog

## [2.1.3](https://github.com/skateresults/realtime-uploader/compare/v2.1.2...v2.1.3) (2024-10-19)


### Bug Fixes

* default to `0` points. Not null ([ef56c44](https://github.com/skateresults/realtime-uploader/commit/ef56c4437d2b936af5681a4209655d432765910c))

## [2.1.2](https://github.com/skateresults/realtime-uploader/compare/v2.1.1...v2.1.2) (2024-10-19)


### Bug Fixes

* stringify logged api data ([deebf38](https://github.com/skateresults/realtime-uploader/commit/deebf3828c8e31aa826c5ae7a2a623ae9148e40f))
* use `null` for invalid bibs ([4ea5818](https://github.com/skateresults/realtime-uploader/commit/4ea58189cf926e514efd5b38bd5f10e681e4e55a))

## [2.1.1](https://github.com/skateresults/realtime-uploader/compare/v2.1.0...v2.1.1) (2024-10-18)


### Bug Fixes

* handle invalid non-number bibs ([cb918df](https://github.com/skateresults/realtime-uploader/commit/cb918dfac26e73bdea8f21619d26fae291ca9b28))

## [2.1.0](https://github.com/skateresults/realtime-uploader/compare/v2.0.0...v2.1.0) (2024-10-18)


### Features

* upload data of unknown athletes ([cd772c0](https://github.com/skateresults/realtime-uploader/commit/cd772c070d6b11d5752a7d430fae2d603daec9ab))


### Bug Fixes

* filter empty bib ([cf6c9bc](https://github.com/skateresults/realtime-uploader/commit/cf6c9bc9523d537e3119c7192c214a9ddb71847f))

## [2.0.0](https://github.com/skateresults/realtime-uploader/compare/v1.1.2...v2.0.0) (2024-10-16)


### ⚠ BREAKING CHANGES

* remove legacy API implementation

### Features

* remove legacy API implementation ([a0e039c](https://github.com/skateresults/realtime-uploader/commit/a0e039c3b839ddc5740faaa84607ae443efb20cd))
* send timekeeping data to new API ([62df9d7](https://github.com/skateresults/realtime-uploader/commit/62df9d70ce4fe771b250de50d291477090371a1f))
* upload eliminations ([d0ab2ec](https://github.com/skateresults/realtime-uploader/commit/d0ab2ec232437bfe5a1a4b5c9444ad7a2370b9ec))
* upload points from result board ([73db4bb](https://github.com/skateresults/realtime-uploader/commit/73db4bba018c0dfb48c77d8cbfe6d258ac7fb555))


### Bug Fixes

* **deps:** update dependency @skateresults/api-client to v1.4.0 ([#164](https://github.com/skateresults/realtime-uploader/issues/164)) ([e806526](https://github.com/skateresults/realtime-uploader/commit/e8065265f2f3d8c137974460c6ce3427b4e73cd1))
* **deps:** update dependency date-fns to v4 ([#176](https://github.com/skateresults/realtime-uploader/issues/176)) ([b411814](https://github.com/skateresults/realtime-uploader/commit/b4118143e6fb1e31c576a0161f3bf939a5957749))
* **deps:** update dependency ky to v1.2.4 ([#143](https://github.com/skateresults/realtime-uploader/issues/143)) ([2a313f2](https://github.com/skateresults/realtime-uploader/commit/2a313f22c48b9dce762e8a83eb60ac915a66b70e))
* **deps:** update dependency ky to v1.5.0 ([#153](https://github.com/skateresults/realtime-uploader/issues/153)) ([4e852c7](https://github.com/skateresults/realtime-uploader/commit/4e852c7069cfa68f2c5fa912362ae16c00ca5317))
* **deps:** update dependency ky to v1.7.0 ([#168](https://github.com/skateresults/realtime-uploader/issues/168)) ([d31912e](https://github.com/skateresults/realtime-uploader/commit/d31912e67921064791ffde1fc26192c4074f0c5c))
* **deps:** update dependency ky to v1.7.2 ([#170](https://github.com/skateresults/realtime-uploader/issues/170)) ([d4c7ecd](https://github.com/skateresults/realtime-uploader/commit/d4c7ecdd5ecceeff83b47d88a4190e4d518dda1b))
* **docker:** use corepack ([2b134c2](https://github.com/skateresults/realtime-uploader/commit/2b134c231a55f53cbb4471f5d2a51a09d951b78d))
* send points sprints in correct shape ([8215760](https://github.com/skateresults/realtime-uploader/commit/821576065dce1b6948f277283bddbbb6cc5b0552))
* typo in `startedAt` field ([bffd201](https://github.com/skateresults/realtime-uploader/commit/bffd201dc9a9370b2df63e7be0d0127a7ec2fd14))

## [1.1.2](https://github.com/skateresults/realtime-uploader/compare/v1.1.1...v1.1.2) (2024-04-19)


### Bug Fixes

* force release ([5fad408](https://github.com/skateresults/realtime-uploader/commit/5fad4087b56f49d5caedfbc8de6a4dacc7f835fa))

## [1.1.1](https://github.com/skateresults/realtime-uploader/compare/v1.1.0...v1.1.1) (2024-04-19)


### Bug Fixes

* force release ([9f3883f](https://github.com/skateresults/realtime-uploader/commit/9f3883fc2cec17e7c786037aa2bb6c031d87acf3))

## [1.1.0](https://github.com/skateresults/realtime-uploader/compare/v1.0.6...v1.1.0) (2024-04-19)


### Features

* tweak error message ([62b7666](https://github.com/skateresults/realtime-uploader/commit/62b7666ccac05ea39e1532910997ae21a68d1b11))


### Bug Fixes

* accept "elim-" as elimination indicator ([3cdda20](https://github.com/skateresults/realtime-uploader/commit/3cdda2078ce2a00a6bac39eb59a76f79e82b51d2))
* do not fall back to rank=0 ([18580ca](https://github.com/skateresults/realtime-uploader/commit/18580cab78df19d88ed9bb63f1e2a84165dee60f))
* don't use total time as best time in quali ([7b6fbfc](https://github.com/skateresults/realtime-uploader/commit/7b6fbfcba28220acb77024f0f3be57137f412a45))

## [1.0.6](https://github.com/skateresults/realtime-uploader/compare/v1.0.5...v1.0.6) (2024-04-18)


### Bug Fixes

* force release ([d7877be](https://github.com/skateresults/realtime-uploader/commit/d7877be9873613a6459beb88d3f899cadf6c6d7e))

## [1.0.5](https://github.com/skateresults/realtime-uploader/compare/v1.0.4...v1.0.5) (2024-04-18)


### Bug Fixes

* do not upload race with empty name ([bae3817](https://github.com/skateresults/realtime-uploader/commit/bae3817e9d2e2571d01e59f9428cfa0a51f463ae))

## [1.0.4](https://github.com/skateresults/realtime-uploader/compare/v1.0.3...v1.0.4) (2024-04-12)


### Bug Fixes

* force release ([cb961f9](https://github.com/skateresults/realtime-uploader/commit/cb961f96cec1e7587982d6ed040fa4c12ad590c0))

## [1.0.3](https://github.com/skateresults/realtime-uploader/compare/v1.0.2...v1.0.3) (2024-04-12)


### Bug Fixes

* force release ([bc334df](https://github.com/skateresults/realtime-uploader/commit/bc334df5ad35f1319a83c519ef5b9ed791851745))

## [1.0.2](https://github.com/skateresults/realtime-uploader/compare/v1.0.1...v1.0.2) (2024-04-12)


### Bug Fixes

* log when athletes were fetched ([09df433](https://github.com/skateresults/realtime-uploader/commit/09df4331aa21033f5bf3705d8a8b5da5cf480e1b))

## [1.0.1](https://github.com/skateresults/realtime-uploader/compare/v1.0.0...v1.0.1) (2024-04-12)


### Bug Fixes

* improve error handling ([61d6c08](https://github.com/skateresults/realtime-uploader/commit/61d6c088531707bec5ff69d2c497e130885e320a))

## 1.0.0 (2024-04-12)


### Features

* build for multiple docker platforms ([#2](https://github.com/skateresults/realtime-uploader/issues/2)) ([0d9f14e](https://github.com/skateresults/realtime-uploader/commit/0d9f14ec8d5f7b9f54217138183a9804e7151d76))
* hash values for id ([7d33e88](https://github.com/skateresults/realtime-uploader/commit/7d33e886f3eaf0d6424136c8cfa14fa15ea6879d))
* prefix env variables with REALTIME_ ([ed2d5b6](https://github.com/skateresults/realtime-uploader/commit/ed2d5b6b77087c94781d9404bcfb8c5899179fec))
* support TimeResults ([5ddecc8](https://github.com/skateresults/realtime-uploader/commit/5ddecc8b7e7ffdd3562da7ae15bc14033f3926f1))
* throttle upload ([2f173da](https://github.com/skateresults/realtime-uploader/commit/2f173da6f94e8758d4db30d01a3749fa66c54ed0))
* upgrade to node 20 ([80a6ceb](https://github.com/skateresults/realtime-uploader/commit/80a6ceb150d78c74d942a26014052918442e9d05))


### Bug Fixes

* bump api-client ([a7f8152](https://github.com/skateresults/realtime-uploader/commit/a7f8152804c9ea75dd5cf3299cb39fe729d0c5a7))
* **deps:** update dependency @skateresults/api-client to v1.2.0 ([#104](https://github.com/skateresults/realtime-uploader/issues/104)) ([a793208](https://github.com/skateresults/realtime-uploader/commit/a793208a640a1188783c4437c619ff977e9aecd0))
* **deps:** update dependency @skateresults/api-client to v1.3.0 ([#108](https://github.com/skateresults/realtime-uploader/issues/108)) ([8a80ffe](https://github.com/skateresults/realtime-uploader/commit/8a80ffeca2ae4142e864f9031eee3039462ad6f2))
* **deps:** update dependency date-fns to v3 ([#93](https://github.com/skateresults/realtime-uploader/issues/93)) ([f2de07e](https://github.com/skateresults/realtime-uploader/commit/f2de07eec82bc1d723a4e6ce3e505835d63469ba))
* **deps:** update dependency date-fns to v3.5.0 ([#115](https://github.com/skateresults/realtime-uploader/issues/115)) ([82f24cd](https://github.com/skateresults/realtime-uploader/commit/82f24cd241c1aa3e48502485360f931f970f95bd))
* **deps:** update dependency date-fns to v3.6.0 ([#117](https://github.com/skateresults/realtime-uploader/issues/117)) ([76d0fa5](https://github.com/skateresults/realtime-uploader/commit/76d0fa5eb82b23a0e63c2e9bd5d902dcfdc2ee8f))
* **deps:** update dependency ky to v1.2.0 ([#90](https://github.com/skateresults/realtime-uploader/issues/90)) ([4299570](https://github.com/skateresults/realtime-uploader/commit/4299570871c3721f050a8836b8ef7ee062669ca8))
* **deps:** update dependency ky to v1.2.2 ([#112](https://github.com/skateresults/realtime-uploader/issues/112)) ([b1ff9b4](https://github.com/skateresults/realtime-uploader/commit/b1ff9b4762cd94fa8a62aebaa1c29037c6042d16))
* **deps:** update dependency ky to v1.2.3 ([#122](https://github.com/skateresults/realtime-uploader/issues/122)) ([57ae978](https://github.com/skateresults/realtime-uploader/commit/57ae978353e5e99164496ed6f8e3afabf0bc43e2))
* improve dual sprint detection ([4c05ede](https://github.com/skateresults/realtime-uploader/commit/4c05ede99df8f4ccee5fc783748c14922c70f6fb))
* log errors ([cb75fa1](https://github.com/skateresults/realtime-uploader/commit/cb75fa1a8c5768a0f479293b3f5cc98ea4a8fde4))
* prevent flaky lap counts ([4f8a1d1](https://github.com/skateresults/realtime-uploader/commit/4f8a1d1574c2bf1b1c30184072215184bd960945))
* prevent flaky start times ([96925e2](https://github.com/skateresults/realtime-uploader/commit/96925e2343d9d598a1ec4ea4fe119b01ba535cb0))
* start uploader without pnpm ([5088413](https://github.com/skateresults/realtime-uploader/commit/5088413baf1ec3c3a7e8037e1928255eed9cbbf0))
* support canceling of initial fetches ([ecc6c18](https://github.com/skateresults/realtime-uploader/commit/ecc6c189da4ef781422e0c044ddb16cbfc1401d9))
* support german elimination races ([b0e7119](https://github.com/skateresults/realtime-uploader/commit/b0e711984449e4ee604d31662ef087c8f6f80708))
* uninstall pnpm ([d04aab0](https://github.com/skateresults/realtime-uploader/commit/d04aab07f5d59d739060eabdd20b72a0e7b5f8ea))
* update dependency @skateresults/api-client to v1.1.1 ([#45](https://github.com/skateresults/realtime-uploader/issues/45)) ([3a9b957](https://github.com/skateresults/realtime-uploader/commit/3a9b957672314db103b912f767577bf5cd4289a0))
* update dependency date-fns to v2.30.0 ([#9](https://github.com/skateresults/realtime-uploader/issues/9)) ([bd2cb41](https://github.com/skateresults/realtime-uploader/commit/bd2cb41f8d49cab26a44b4129f9c09bc2bcaa5ba))
* update dependency ky to v1 ([#50](https://github.com/skateresults/realtime-uploader/issues/50)) ([5208d4d](https://github.com/skateresults/realtime-uploader/commit/5208d4d023bb78b225294f11c4f2bb91e1696a9c))
* update dependency yargs to v17.7.2 ([#4](https://github.com/skateresults/realtime-uploader/issues/4)) ([68b681d](https://github.com/skateresults/realtime-uploader/commit/68b681d9c428b7d2e61c162bf728658f50d2ba42))
