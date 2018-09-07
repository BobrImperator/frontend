import EmberObject, { computed } from '@ember/object';
import RSVP from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


const { resolve } = RSVP;

let mockReports = [
  EmberObject.create({
    title: 'all courses',
    subject: 'courses',
    user: 1
  }),
  EmberObject.create({
    title: 'courses for session',
    subject: 'courses',
    prepositionalObject: 'session',
    prepositionalObjectTableRowId: 11,
    user: 1
  }),
];

let reportingMock = Service.extend({
  reportsList: computed(function(){
    return resolve(mockReports);
  })
});

let reportingMockNoReports = Service.extend({
  reportsList: computed(function(){
    return resolve([]);
  })
});

module('Integration | Component | dashboard myreports', function(hooks) {
  setupRenderingTest(hooks);

  test('list reports', async function(assert) {
    assert.expect(4);
    let currentUserMock = Service.extend({
      model: resolve(EmberObject.create({
        reports: resolve(mockReports)
      }))
    });
    this.owner.register('service:reporting', reportingMock);
    this.owner.register('service:currentUser', currentUserMock);
    await render(hbs`{{dashboard-myreports}}`);

    assert.equal(find('.dashboard-block-header').textContent.trim(), 'My Reports');
    return settled().then(()=> {
      for (let i = 0; i < 2; i++) {
        let tds = this.$(`[data-test-saved-reports] li:eq(${i})`);
        assert.equal(tds.eq(0).text().trim(), mockReports[i].get('title'));
      }
      assert.equal(this.$(`[data-test-saved-reports] li`).length, 2);
    });
  });

  test('display none when no reports', async function(assert) {
    assert.expect(2);
    let currentUserMock = Service.extend({
      model: resolve(EmberObject.create({
        reports: resolve([])
      }))
    });
    this.owner.register('service:reporting', reportingMockNoReports);
    this.owner.register('service:currentUser', currentUserMock);
    await render(hbs`{{dashboard-myreports}}`);
    assert.equal(find('.dashboard-block-header').textContent.trim(), 'My Reports');
    assert.equal(find('.dashboard-block-body').textContent.trim(), 'None');
  });
});
