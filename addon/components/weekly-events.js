import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/weekly-events';
import moment from 'moment';

export default Component.extend({
  layout,
  classNames: ['weekly-events'],
  year: null,
  expandedWeeks: null,

  weeksInYear: computed('year', function(){
    const year = this.get('year');
    const weeksInTheYear = moment().year(year).isoWeeksInYear();
    let weeks = [];
    for (let i = 1; i <= weeksInTheYear; i++) {
      weeks.push(`${i}`);
    }

    return weeks;
  }),
  actions: {
    incrementYear(){
      const year = this.get('year');
      this.get('setYear')(parseInt(year, 10) + 1);
    },
    decrementYear(){
      const year = this.get('year');
      this.get('setYear')(parseInt(year, 10) - 1);
    }
  }
});
