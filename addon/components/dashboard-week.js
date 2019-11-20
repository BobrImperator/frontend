import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';

export default Component.extend({
  classNames: ['dashboard-week'],
  'data-test-dashboard-week': true,
  expanded: computed(function(){
    const lastSunday = moment().day(1).subtract(1, 'week').format('W');
    const thisSunday = moment().day(1).format('W');
    const nextSunday = moment().day(1).add(1, 'week').format('W');

    return `${lastSunday}-${thisSunday}-${nextSunday}`;
  }),
  year: computed(function(){
    return moment().year();
  }),
  week: computed(function(){
    return moment().isoWeek();
  })
});
