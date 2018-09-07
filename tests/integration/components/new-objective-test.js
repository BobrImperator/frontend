import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | new objective', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('cancel', () => {});

    await render(hbs`{{new-objective cancel=(action cancel)}}`);

    return settled().then(() => {
      let content = find('*').textContent.trim();
      assert.notEqual(content.search(/New Objective/), -1);
      assert.notEqual(content.search(/Description/), -1);
    });
  });

  test('errors do not show up initially', async function(assert) {
    this.set('cancel', () => {
      assert.ok(false); //shouldn't be called
    });
    await render(hbs`{{new-objective cancel=(action cancel)}}`);

    return settled().then(() => {
      assert.equal(findAll('.validation-error-message').length, 0);

    });
  });

  test('errors show up', async function(assert) {
    this.set('cancel', () => {
      assert.ok(false); //shouldn't be called
    });
    await render(hbs`{{new-objective cancel=(action cancel)}}`);

    return settled().then(async () => {
      await click('.done');
      return settled().then(() => {
        let boxes = this.$('.form-data');
        assert.ok(boxes.eq(0).text().search(/blank/) > -1);
      });

    });
  });
});
