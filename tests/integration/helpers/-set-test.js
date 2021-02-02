import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | set', function (hooks) {
  setupRenderingTest(hooks);

  test('it works when transformed', async function (assert) {
    await render(hbs`
      <span data-test-greeting>{{this.greeting}}</span>

      <button type="button" {{on "click" (set this.greeting "Hello!")}}>
        English
      </button>
    `);

    assert.equal(find('[data-test-greeting]').textContent.trim(), '');

    await click('button');

    assert.equal(find('[data-test-greeting]').textContent.trim(), 'Hello!');
  });

  test('it works when called directly', async function (assert) {
    await render(hbs`
      <span data-test-greeting>{{this.greeting}}</span>

      <button type="button" {{on "click" (-set this "greeting" "Hello!")}}>
        English
      </button>
    `);

    assert.equal(find('[data-test-greeting]').textContent.trim(), '');

    await click('button');

    assert.equal(find('[data-test-greeting]').textContent.trim(), 'Hello!');
  });
});
