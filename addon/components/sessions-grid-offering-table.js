import Component from '@ember/component';
import { computed } from '@ember/object';
import OfferingDateBlock from 'ilios-common/utils/offering-date-block';
import layout from '../templates/components/sessions-grid-offerings-table';

export default Component.extend({
  layout,
  tagName: 'table',
  classNames: ['sessions-grid-offering-table'],
  'data-test-sessions-grid-offering-table': true,
  offeringBlocks: computed('offerings.@each.{startDate,endDate,room,learnerGroups,instructorGroups}', function() {
    let offerings = this.get('offerings');
    if (!offerings) {
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
});
