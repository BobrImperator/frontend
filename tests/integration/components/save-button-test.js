import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | save-button', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<SaveButton>Save</SaveButton>`);
    assert.dom().hasText('Save');
  });

  test('it displays save percent and spinner when saving', async function (assert) {
    await render(hbs`<SaveButton @isSaving={{true}} @saveProgressPercent={{11}}>Save</SaveButton>`);
    assert.dom('[data-icon="spinner"]').exists();
    assert.dom().hasText('11%');
  });

  test('icon is a check at 100%', async function (assert) {
    await render(
      hbs`<SaveButton @isSaving={{true}} @saveProgressPercent={{100}}>Save</SaveButton>`
    );
    assert.dom('[data-icon="check"]').exists();
    assert.dom().hasText('100%');
  });

  test('binds passed action', async function (assert) {
    this.set('click', () => assert.ok(true));
    await render(hbs`<SaveButton data-test-save {{on "click" this.click}}>Save</SaveButton>`);
    await click('[data-test-save]');
  });
});
