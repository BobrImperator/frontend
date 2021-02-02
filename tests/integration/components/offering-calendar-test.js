import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | offering-calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('shows events', async function (assert) {
    assert.expect(1);
    const today = moment().hour(8);
    const tomorrow = moment().add(1, 'day').hour(8);
    const course = this.server.create('course');
    const sessionType = this.server.create('session-type');
    const session = this.server.create('session', {
      course,
      sessionType,
    });

    const offering1 = this.server.create('offering', {
      startDate: today.format(),
      endDate: today.clone().add('1', 'hour').format(),
      location: 123,
      session,
    });
    const offering2 = this.server.create('offering', {
      startDate: today.format(),
      endDate: today.clone().add('1', 'hour').format(),
      location: 123,
      session,
    });
    const learnerGroup = this.server.create('learner-group', {
      offerings: [offering1, offering2],
    });
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    this.set('startDate', today.toDate());
    this.set('endDate', tomorrow.toDate());
    this.set('session', sessionModel);
    this.set('learnerGroups', [learnerGroupModel]);
    await render(hbs`<OfferingCalendar
      @learnerGroups={{learnerGroups}}
      @session={{session}}
      @startDate={{startDate}}
      @endDate={{endDate}}
    />`);
    const events = '[data-test-calendar-event]';
    assert.dom(events).exists({ count: 4 });
  });
});
