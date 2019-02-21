
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import layout from '../templates/components/session-offerings-list';

import OfferingDateBlock from 'ilios-common/utils/offering-date-block';

const { oneWay } = computed;

export default Component.extend({
  store: service(),
  layout,
  classNames: ['session-offerings-list'],
  session: null,
  editable: true,
  'data-test-session-offerings-list': true,

  offerings: oneWay('session.offerings'),
  /**
   * @property offeringBlocks
   * @type {Ember.computed}
   * @public
   */
  offeringBlocks: computed('offerings.@each.{startDate,endDate,room,learnerGroups,instructorGroups}', async function() {
    let offerings = await this.get('offerings');
    if (isEmpty(offerings)) {
      return [];
    }
    let dateBlocks = {};
    offerings.forEach(offering => {
      let key = offering.get('dateKey');
      if (!(key in dateBlocks)) {
        dateBlocks[key] = OfferingDateBlock.create({
          dateKey: key
        });
      }
      dateBlocks[key].addOffering(offering);
    });
    //convert indexed object to array
    let dateBlockArray = [];
    for (let key in dateBlocks) {
      dateBlockArray.pushObject(dateBlocks[key]);
    }
    return dateBlockArray.sortBy('dateStamp');
  }),

  actions: {
    removeOffering(offering) {
      let session = this.get('session');
      session.get('offerings').then(offerings => {
        offerings.removeObject(offering);
        offering.deleteRecord();
        offering.save();
      });
    },
  }
});
