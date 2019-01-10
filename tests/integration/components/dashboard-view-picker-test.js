import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dashbaord view picker', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const week = '[data-test-glance]';
    const activities = '[data-test-activities';
    const materials = '[data-test-materials]';
    const calendar = '[data-test-calendar]';

    this.set('nothing', parseInt);
    this.set('show', 'week');
    await render(hbs`{{dashboard-view-picker show=show change=(action nothing)}}`);

    assert.dom(week).hasText('Week at a Glance');
    assert.dom(week).hasClass('active');
    assert.dom(activities).hasText('Activities');
    assert.dom(activities).hasNoClass('active');
    assert.dom(materials).hasText('Materials');
    assert.dom(materials).hasNoClass('active');
    assert.dom(calendar).hasText('Calendar');
    assert.dom(calendar).hasNoClass('active');
  });

  test('changing show changes active button', async function(assert) {
    const week = '[data-test-glance]';
    const activities = '[data-test-activities';
    const materials = '[data-test-materials]';
    const calendar = '[data-test-calendar]';

    this.set('nothing', parseInt);
    this.set('show', 'week');
    await render(hbs`{{dashboard-view-picker show=show change=(action nothing)}}`);

    assert.dom(week).hasClass('active');
    assert.dom(activities).hasNoClass('active');
    assert.dom(materials).hasNoClass('active');
    assert.dom(calendar).hasNoClass('active');

    this.set('show', 'agenda');
    assert.dom(week).hasNoClass('agenda');
    assert.dom(activities).hasClass('active');
    assert.dom(materials).hasNoClass('active');
    assert.dom(calendar).hasNoClass('active');

    this.set('show', 'materials');
    assert.dom(week).hasNoClass('agenda');
    assert.dom(activities).hasNoClass('active');
    assert.dom(materials).hasClass('active');
    assert.dom(calendar).hasNoClass('active');

    this.set('show', 'calendar');
    assert.dom(week).hasNoClass('agenda');
    assert.dom(activities).hasNoClass('active');
    assert.dom(materials).hasNoClass('active');
    assert.dom(calendar).hasClass('active');
  });

  test('clicking week fires action', async function(assert) {
    assert.expect(2);
    const week = '[data-test-glance]';

    this.set('click', what => {
      assert.equal(what, 'week');
    });
    this.set('show', 'agenda');
    await render(hbs`{{dashboard-view-picker show=show change=(action click)}}`);

    assert.dom(week).hasNoClass('active');
    find(week).click();
  });

  test('clicking activities fires action', async function(assert) {
    assert.expect(2);
    const activities = '[data-test-activities';

    this.set('click', what => {
      assert.equal(what, 'agenda');
    });
    this.set('show', 'materials');
    await render(hbs`{{dashboard-view-picker show=show change=(action click)}}`);

    assert.dom(activities).hasNoClass('active');
    find(activities).click();
  });

  test('clicking materials fires action', async function(assert) {
    assert.expect(2);
    const materials = '[data-test-materials]';

    this.set('click', what => {
      assert.equal(what, 'materials');
    });
    this.set('show', 'agenda');
    await render(hbs`{{dashboard-view-picker show=show change=(action click)}}`);

    assert.dom(materials).hasNoClass('active');
    find(materials).click();
  });

  test('clicking activities fires action', async function(assert) {
    assert.expect(2);
    const calendar = '[data-test-calendar]';

    this.set('click', what => {
      assert.equal(what, 'calendar');
    });
    this.set('show', 'agenda');
    await render(hbs`{{dashboard-view-picker show=show change=(action click)}}`);

    assert.dom(calendar).hasNoClass('active');
    find(calendar).click();
  });
});
