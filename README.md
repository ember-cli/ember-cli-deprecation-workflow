# ember-cli-deprecation-workflow

An addon geared towards making Ember upgrades easier by allowing you to work through deprecations without massive console noise.

[![Build Status](https://travis-ci.org/mixonic/ember-cli-deprecation-workflow.svg)](https://travis-ci.org/mixonic/ember-cli-deprecation-workflow)

This README outlines the details of collaborating on this Ember addon.

## History

Upgrading Ember versions (especially from 1.12 to 1.13) can be very daunting. One of the largest factors is the massive `console.log` noise that the deprecations
introduced in those versions (to help us know what we need to do to stay up to date) is so overwhelming that we quite literally have no idea what to do.

The "deprecation spew" issue became very obvious as we progressed into the later 1.13 beta releases. At that point, [@mixonic](https://twitter.com/mixonic) and [@rwjblue](https://twitter.com/rwjblue)
came up with a wild scheme to create a new way to handle deprecations (this addon's process).

## Usage

### Getting started

The initial steps needed to get started:

1. Install the  ember-cli-deprecation-workflow addon.
2. Run your test suite.*
3. Run `deprecationWorkflow.flushDeprecations()` from your browsers console.
4. Copy the string output into `config/deprecation-workflow.js` in your project.

Once this initial setup is completed the "deprecation spew" should be largely "fixed".  Only unhandled deprecations will be displayed in your console.

*Note: Unless your test coverage is amazing (>90%), it's likely that running the test suite alone will not reveal _every_ deprecation. It may be prudent to run through the app's workflows live and flush deprecations a second time, merging the resulting output list with that generated from your test suite.

Now that the spew has settled down, you can process one deprecation at a time while ensuring that no new deprecations are introduced.

### Workflow

What does that individual deprecation workflow look like?

1. Change one entry in `config/deprecation-workflow.js` from `silence` to `throw`.
2. Run your tests or use your application.
3. Errors will be thrown for just that one deprecation, and you can track down the fixes needed in relative isolation of the rest of the deprecations.
4. Once the deprecation has been dealt with, remove its entry from `config/deprecation-workflow.js`.
5. Lather and repeat.

### Handlers

There are 3 defined handlers that have different behaviors

 Handler | Behavior
 ------- | --------
 `silence` | Keeps this deprecation from spewing all over the console
 `log` | Normal deprecation behavior runs for this deprecation and messages are logged to the console
 `throw` | The error is thrown instead of allowing the deprecated behavior to run. ***WARNING: APPLICATION MAY GO :boom:***

### Matchers

the output from running `deprecationWorkflow.flushDeprecations()` gives you a nice Json like JS object with all the deprecations in your app. The `matchMessage` property determines what to filter out of the console. You can pass a string that must match the console message exactly or a `RegExp` for `ember-cli-deprecation-workflow` filter the log by.

## Other Resources

* [EmberScreencast video on ember-cli-deprecation-workflow](https://www.emberscreencasts.com/posts/71-upgrade-ember-with-ember-cli-deprecation-workflow) (note: requires paid subscription)

## Contributing

Details on contributing to the addon itself (not required for normal usage).

### Installation

* `git clone` this repository
* `npm install`
* `bower install`

### Running

* `ember server`
* Visit your app at http://localhost:4200.

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
