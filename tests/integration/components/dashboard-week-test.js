import Service from '@ember/service';
import moment from 'moment';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

import { component } from 'ilios-common/page-objects/components/dashboard-week';

module('Integration | Component | dashboard week', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const today = moment();

  hooks.beforeEach(function () {
    this.server.create('userevent', {
      name: 'Learn to Learn',
      startDate: today.format(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      offering: 1,
    });
    this.server.create('userevent', {
      name: 'Finding the Point in Life',
      startDate: today.format(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      ilmSession: 1,
    });
    this.server.create('userevent', {
      name: 'Blank',
      isBlanked: true,
    });
    this.server.create('userevent', {
      name: 'Not Published',
      isBlanked: false,
      isPublished: false,
      isScheduled: false,
    });
    this.server.create('userevent', {
      name: 'Scheduled',
      isBlanked: false,
      isPublished: true,
      isScheduled: true,
    });
    const events = this.server.db.userevents;

    this.userEventsMock = Service.extend({
      async getEvents() {
        return events.toArray();
      },
    });
    this.blankEventsMock = Service.extend({
      async getEvents() {
        return [];
      }
    });
  });

  const getTitle = function(){
    const startOfWeek = today.clone().day(0).hour(0).minute(0).second(0);
    const endOfWeek = today.clone().day(6).hour(23).minute(59).second(59);

    let expectedTitle;
    if (startOfWeek.month() != endOfWeek.month()) {
      const from = startOfWeek.format('MMMM D');
      const to = endOfWeek.format('MMMM D');
      expectedTitle = `${from} - ${to}`;
    } else {
      const from = startOfWeek.format('MMMM D');
      const to = endOfWeek.format('D');
      expectedTitle = `${from}-${to}`;
    }
    expectedTitle += ' Week at a Glance';

    return expectedTitle;
  };

  test('it renders with events', async function(assert) {
    assert.expect(5);
    this.owner.register('service:user-events', this.userEventsMock);

    await render(hbs`<DashboardWeek />`);
    const expectedTitle = getTitle();
    assert.equal(component.weeklyLink, 'All Weeks');
    assert.equal(component.weekGlance.title, expectedTitle);
    assert.equal(component.weekGlance.offeringEvents.length, 2, 'Blank events are not shown');
    assert.equal(component.weekGlance.offeringEvents[0].title, 'Learn to Learn');
    assert.equal(component.weekGlance.offeringEvents[1].title, 'Finding the Point in Life');
  });

  test('it renders blank', async function(assert) {
    assert.expect(3);
    this.owner.register('service:user-events', this.blankEventsMock);
    this.userEvents = this.owner.lookup('service:user-events');

    await render(hbs`<DashboardWeek />`);
    const expectedTitle = getTitle();
    assert.equal(component.weeklyLink, 'All Weeks');
    assert.equal(component.weekGlance.title, expectedTitle);
    assert.equal(component.weekGlance.offeringEvents.length, 0);
  });
});
