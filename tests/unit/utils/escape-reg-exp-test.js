import escapeRegExp from '../../../utils/escape-reg-exp';
import { module, test } from 'qunit';

module('Unit | Utility | escape Regular Expressions special characters', function () {
  test('escapes special chars', function (assert) {
    assert.equal(escapeRegExp('\\^$*+?.()|{}[]'), '\\\\\\^\\$\\*\\+\\?\\.\\(\\)\\|\\{\\}\\[\\]');
    assert.equal(escapeRegExp('abc'), 'abc');
    assert.equal(escapeRegExp('MoneyBag$$$ +1'), 'MoneyBag\\$\\$\\$ \\+1');
    assert.equal(escapeRegExp(null), null);
    assert.equal(escapeRegExp(''), '');
  });
});
