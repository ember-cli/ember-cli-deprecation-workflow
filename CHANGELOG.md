## v2.2.0 (2023-11-01)

* Introduce a dependency on ember-string to improve out of the box
  compatibiliy with Ember 4.12
* Refactor to adopt newer versions of dev dependencies.


## v2.0.0 (2021-07-04)


## v2.0.0-beta.5 (2021-07-04)

#### :bug: Bug Fix
* [#118](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/118) Avoid the Ember global deprecation ([@mixonic](https://github.com/mixonic))

#### Committers: 1
- Matthew Beale ([@mixonic](https://github.com/mixonic))


## v2.0.0-beta.4 (2021-06-04)

#### :boom: Breaking Change
* [#116](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/116) [BREAKING] Drop Node 10 ([@mixonic](https://github.com/mixonic))

#### :bug: Bug Fix
* [#123](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/123) [BUGFIX] Check the incremented count for limit ([@mixonic](https://github.com/mixonic))

#### :house: Internal
* [#125](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/125) Drop ember.component.reopen log ([@mixonic](https://github.com/mixonic))
* [#124](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/124) Clean up test config for clarity ([@mixonic](https://github.com/mixonic))
* [#121](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/121) Remove deprecation-without-for and deprecation-without-since warnings in test ([@SergeAstapov](https://github.com/SergeAstapov))
* [#120](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/120) Update main.js code style ([@mixonic](https://github.com/mixonic))
* [#119](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/119) Bump deps to remove some deprecated use of Ember global ([@mixonic](https://github.com/mixonic))

#### Committers: 2
- Matthew Beale ([@mixonic](https://github.com/mixonic))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))


## v2.0.0-beta.3 (2021-05-27)

#### :boom: Breaking Change
* Upgrade verious dependencies across major versions

#### :bug: Bug Fix
* [#111](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/111) Address a deprecated import path for deprecate in tests
* [#114](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/114) Drop debug handler polyfill, fixes [#113](https://github.com/mixonic/ember-cli-deprecation-workflow/issues/113).

#### :rocket: Enhancement
* [#93](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/93) Limit logging when a high-repetition deprecation is firing.

## v2.0.0-beta.2 (2021-02-27)

#### :boom: Breaking Change
* [#92](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/92) Modernize ([@wagenet](https://github.com/wagenet))

#### :house: Internal
* [#98](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/98) Add release automation ([@rwjblue](https://github.com/rwjblue))
* [#97](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/97) Migrate to GH Actions. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 3
- Igor Terzic ([@igorT](https://github.com/igorT))
- Peter Wagenet ([@wagenet](https://github.com/wagenet))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v1.0.1 (2018-11-05)

#### :bug: Bug Fix
* [#62](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/62) Avoid error when running on nested addons (`this.app` is not always present) ([@SparshithNR](https://github.com/SparshithNR))

#### Committers: 1
- SparshithNRai ([@SparshithNR](https://github.com/SparshithNR))

## v1.0.0 (2018-09-26)

#### :boom: Breaking Change
* [#57](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/57) Update to ember-cli 2.18 ([@Gaurav0](https://github.com/Gaurav0))
  * Drop support for Node 4 and lower.

#### :rocket: Enhancement
* [#55](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/55) Allow custom addon config directory ([@atsao](https://github.com/atsao))
* [#58](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/58) Update to ember-cli@3.4 blueprint. ([@rwjblue](https://github.com/rwjblue))
* [#57](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/57) Update to ember-cli 2.18 ([@Gaurav0](https://github.com/Gaurav0))

#### :bug: Bug Fix
* [#59](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/59) Update broccoli node to be broccoli-plugin based. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#60](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/60) Add Ember 1.13, 2.4, 2.8, and 2.12 back into config/ember-try.js. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 3
- Andrew Tsao ([@atsao](https://github.com/atsao))
- Gaurav Munjal ([@Gaurav0](https://github.com/Gaurav0))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v0.2.5 (2018-08-10)

#### :bug: Bug Fix
* [#54](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/54) Switch from Ember.Logger to console ([@wagenet](https://github.com/wagenet))

#### :memo: Documentation
* [#42](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/42) Update README.md ([@tabeth](https://github.com/tabeth))
* [#48](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/48) document production builds and catch-all ([@IRun26Point2](https://github.com/IRun26Point2))

#### Committers: 3
- Peter Wagenet ([@wagenet](https://github.com/wagenet))
- Tabeth Nkangoh ([@tabeth](https://github.com/tabeth))
- [@IRun26Point2](https://github.com/IRun26Point2)


## v0.2.4 (2017-10-18)

#### :rocket: Enhancement
* [#46](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/46) Convert "ember-cli-babel" to dev dependency ([@Turbo87](https://github.com/Turbo87))

#### :memo: Documentation
* [#41](https://github.com/mixonic/ember-cli-deprecation-workflow/pull/41) Update README.md ([@tabeth](https://github.com/tabeth))

#### Committers: 2
- Tabeth Nkangoh ([@tabeth](https://github.com/tabeth))
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))
