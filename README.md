# ember-cli-deprecation-workflow

An addon geared towards making Ember upgrades easier by allowing you to work
through deprecations without massive console noise.

## History

Upgrading Ember versions can be very daunting. One of the largest factors is the
massive `console.log` noise that the deprecations introduced in those versions
(to help us know what we need to do to stay up to date) is so overwhelming that
we quite literally have no idea what to do.

The "deprecation spew" issue became very obvious as we progressed into the later
1.13 beta releases. At that point, [@mixonic](https://twitter.com/mixonic) and
[@rwjblue](https://twitter.com/rwjblue) came up with a wild scheme.

The scheme was to build tooling which made dealing with deprecations an
incremental process. ember-cli-deprecation-workflow allows you to focus on
addressing a single deprecation at a time, and prevents backsliding
(re-introduction of a deprecated API use) in a codebase.

## Usage

### Compatibility

3.x

- Ember.js 3.28 until at least 5.4
- Ember CLI 4.12 or above
- Node.js 16 or above

2.x

- Ember.js 2.12 until at least 4.12
- Ember CLI 3.16 or above
- Node.js 12 and 14 or above

1.x

- Ember.js 1.13 until at least 3.4
- Ember CLI 3.4 as well as many versions before and after
- Node.js 6, 8, and 10 until at least 14

### Getting started

1. Install the ember-cli-deprecation-workflow addon (`ember install ember-cli-deprecation-workflow`).
2. Create an `app/deprecation-workflow.js` file with the following content:
    
    ```js
    import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

    setupDeprecationWorkflow();
    ```

3. In your `app/app.js`, do: 

    ```js
    import './deprecation-workflow';
    ```

4. Run your test suite\* with `ember test --server`.
5. Navigate to your tests (default: http://localhost:7357/)
6. Run `deprecationWorkflow.flushDeprecations()` in your browsers console. Or `flushDeprecations({ handler: 'log' })` if you want a different [handler](#handlers) than the default of `silence`.
7. Copy the string output and overwrite the content of `app/deprecation-workflow.js`.

    In Chrome, use right click → "Copy string contents" to avoid escape characters.

Once this initial setup is completed the "deprecation spew" should be largely
"fixed". Only unhandled deprecations will be displayed in your console.

\*Note: Unless your test coverage is amazing (>90%), it's likely that running
the test suite alone will not reveal _every_ deprecation. It may be prudent to
run through the app's workflows live and flush deprecations a second time,
merging the resulting output list with that generated from your test suite.

Now that the spew has settled down, you can process one deprecation at a time while ensuring that no new deprecations are introduced.

### Workflow

What does that individual deprecation workflow look like?

1. Change one entry in `app/deprecation-workflow.js` from `silence` to `throw`.
2. Run your tests or use your application.
3. Errors will be thrown for just that one deprecation, and you can track down the fixes needed in relative isolation of the rest of the deprecations.
4. Once the deprecation has been dealt with, remove its entry from `app/deprecation-workflow.js`.
5. Lather and repeat.

### Handlers

There are 3 defined handlers that have different behaviors

| Handler   | Behavior                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| `silence` | Keeps this deprecation from spewing all over the console                                                         |
| `log`     | Normal deprecation behavior runs for this deprecation and messages are logged to the console                     |
| `throw`   | The error is thrown instead of allowing the deprecated behavior to run. **_WARNING: APPLICATION MAY GO :boom:_** |

### Matchers

the output from running `deprecationWorkflow.flushDeprecations()` gives you a
nice Json like JS object with all the deprecations in your app. The
`matchMessage` property determines what to filter out of the console. You can
pass a string that must match the console message exactly or a `RegExp` for
`ember-cli-deprecation-workflow` filter the log by.

### Production builds

By default, production ember-cli builds already remove deprecation warnings. Any
deprecations configured to `throw` or `log` will only do so in non-production
builds.

### Enable / Disable through configuration

If your app has disabled test files in development environment you can force enabling this addon through configuration in `ember-cli-build.js` instead:
```javascript
'ember-cli-deprecation-workflow': {
  enabled: true,
},
```

### Catch-all

To force all deprecations to throw (can be useful in larger teams to prevent
accidental introduction of deprecations), update your
`app/deprecation-workflow.js`:

```javascript
window.deprecationWorkflow.config = {
  throwOnUnhandled: true,
};
```

### Template Deprecations

By default, the console based deprecations that occur during template
compilation are suppressed in favor of browser deprecations ran during the test
suite. If you would prefer to still have the deprecations in the console, add
the following to your `app/environment.js`:

```javascript
module.exports = function (env) {
  var ENV = {};

  // normal things here

  ENV.logTemplateLintToConsole = true;
};
```

### Configuration

In some cases, it may be necessary to indicate a different `config` directory
from the default one (`/config`). For example, you may want the flushed
deprecations file to be referenced in a config directory like `my-config`.

Adjust the `configPath` in your `package.json` file. The `/` will automatically
be prefixed.

```javascript
{
  'ember-addon': {
    configPath: 'my-config'
  }
}
```

## Contributing

Details on contributing to the addon itself (not required for normal usage).

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
