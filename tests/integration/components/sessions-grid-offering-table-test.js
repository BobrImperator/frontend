import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import moment from 'moment';
import { create } from 'ember-cli-page-object';
import table from 'ilios-common/page-objects/components/sessions-grid-offering-table';

const page = create({ table });

module('Integration | Component | sessions-grid-offering-table', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.owner.lookup('service:moment').setLocale('en');
  }),
    test('it renders', async function (assert) {
      const session = this.server.create('session');
      this.server.createList('offering', 3, {
        session,
        startDate: moment().hour(8).toDate(),
        endDate: moment().hour(8).add(1, 'hour').toDate(),
      });
      this.server.createList('offering', 3, {
        session,
        startDate: moment().hour(8).add(1, 'hour').toDate(),
        endDate: moment().hour(8).add(110, 'minutes').toDate(),
      });
      this.server.createList('offering', 3, {
        session,
        startDate: moment().hour(8).add(1, 'day').add(1, 'hour').toDate(),
        endDate: moment().hour(8).add(1, 'day').add(2, 'hour').toDate(),
      });
      const offerings = this.owner.lookup('service:store').findAll('offering');
      this.set('offerings', offerings);

      await render(hbs`<SessionsGridOfferingTable @offerings={{this.offerings}} />`);

      assert.strictEqual(page.table.dates.length, 2);
      assert.strictEqual(page.table.offerings.length, 9);
    });
});
