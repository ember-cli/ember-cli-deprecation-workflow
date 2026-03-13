import { module, test } from 'qunit';
import { isApproaching } from '#src/index.js';

module('isApproaching', function () {
  test('returns true when until is the next major and current minor is >= 8', function (assert) {
    assert.true(
      isApproaching('8.0', '7.8.0'),
      '7.8 approaches 8.0 (exactly 2 minor steps away)',
    );
    assert.true(
      isApproaching('8.0', '7.9.0'),
      '7.9 approaches 8.0 (1 minor step away)',
    );
    assert.true(
      isApproaching('8.0.0', '7.8.0'),
      'handles 3-part until version',
    );
    assert.true(
      isApproaching('8.0', '7.10.0'),
      '7.10 approaches 8.0 (minor >= 8)',
    );
  });

  test('returns false when until is the next major but current minor is < 8', function (assert) {
    assert.false(
      isApproaching('8.0', '7.7.0'),
      '7.7 does not approach 8.0 (more than 2 minor steps away)',
    );
    assert.false(isApproaching('8.0', '7.0.0'), '7.0 does not approach 8.0');
  });

  test('returns true when until is within 2 minor versions in the same major', function (assert) {
    assert.true(
      isApproaching('7.3', '7.1.0'),
      '7.1 approaches 7.3 (2 minors away)',
    );
    assert.true(
      isApproaching('7.2', '7.1.0'),
      '7.1 approaches 7.2 (1 minor away)',
    );
    assert.true(
      isApproaching('7.1', '7.1.0'),
      '7.1 approaches 7.1 (same version - overdue)',
    );
  });

  test('returns false when until is more than 2 minor versions ahead in same major', function (assert) {
    assert.false(
      isApproaching('7.4', '7.1.0'),
      '7.1 does not approach 7.4 (3 minors away)',
    );
    assert.false(isApproaching('7.10', '7.1.0'), '7.1 does not approach 7.10');
  });

  test('returns false when until is 2+ majors ahead', function (assert) {
    assert.false(
      isApproaching('9.0', '7.9.0'),
      '7.9 does not approach 9.0 (2 majors away)',
    );
    assert.false(isApproaching('10.0', '7.9.0'), '7.9 does not approach 10.0');
  });

  test('returns false when until is not a valid version', function (assert) {
    assert.false(
      isApproaching('forever', '7.9.0'),
      'forever is not approaching',
    );
    assert.false(isApproaching(null, '7.9.0'), 'null is not approaching');
    assert.false(
      isApproaching(undefined, '7.9.0'),
      'undefined is not approaching',
    );
    assert.false(isApproaching('', '7.9.0'), 'empty string is not approaching');
  });

  test('returns false when until is in the past (older major)', function (assert) {
    assert.false(
      isApproaching('6.0', '7.9.0'),
      'past version is not approaching',
    );
    assert.false(
      isApproaching('5.0', '7.9.0'),
      'much older version is not approaching',
    );
  });
});
