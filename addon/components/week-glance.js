import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import layout from '../templates/components/week-glance';

export default Component.extend({
  layout,
  classNames: ['week-glance'],

  userEvents: service(),
  intl: service(),

  startOfWeek: 0,
  endOfWeek: 6,

  year: null,
  week: null,
  collapsible: true,
  collapsed: true,
  showFullTitle: false,
  'data-test-week-glance': true,
  midnightAtTheStartOfThisWeek: computed('intl.locale', 'year', 'week', 'startOfWeek', function(){
    this.get('intl'); //we need to use the service so the CP will re-fire
    const year = this.get('year');
    const week = this.get('week');
    const startOfWeek = this.get('startOfWeek');
    const targetDate = moment();
    targetDate.year(year);
    targetDate.isoWeek(week);
    targetDate.day(startOfWeek);
    return targetDate.hour(0).minute(0);
  }),
  midnightAtTheEndOfThisWeek: computed('intl.locale', 'year', 'week', 'endOfWeek', function(){
    this.get('intl'); //we need to use the service so the CP will re-fire
    const year = this.get('year');
    const week = this.get('week');
    const endOfWeek = this.get('endOfWeek');
    const targetDate = moment();
    targetDate.year(year);
    targetDate.isoWeek(week);
    targetDate.day(endOfWeek);
    return targetDate.hour(23).minute(59).second(59);
  }),
  title: computed('midnightAtTheStartOfThisWeek', 'midnightAtTheEndOfThisWeek', function(){
    const midnightAtTheStartOfThisWeek = this.get('midnightAtTheStartOfThisWeek');
    const midnightAtTheEndOfThisWeek = this.get('midnightAtTheEndOfThisWeek');
    const from = midnightAtTheStartOfThisWeek.format('MMMM D');

    let to;
    if (midnightAtTheStartOfThisWeek.month() != midnightAtTheEndOfThisWeek.month()) {
      to = midnightAtTheEndOfThisWeek.format('MMMM D');

      return `${from} - ${to}`;
    } else {
      to = midnightAtTheEndOfThisWeek.format('D');

      return `${from}-${to}`;
    }
  }),

  weekEvents: computed('midnightAtTheStartOfThisWeek', 'midnightAtTheEndOfThisWeek', async function() {
    const midnightAtTheStartOfThisWeek = this.get('midnightAtTheStartOfThisWeek');
    const midnightAtTheEndOfThisWeek = this.get('midnightAtTheEndOfThisWeek');

    const from = midnightAtTheStartOfThisWeek.unix();
    const to = midnightAtTheEndOfThisWeek.unix();

    return await this.get('userEvents').getEvents(from, to);
  }),

  publishedWeekEvents: computed('weekEvents.[]', async function() {
    const weekEvents = await this.get('weekEvents');
    return weekEvents.filter(ev => {
      return !ev.isBlanked && ev.isPublished && !ev.isScheduled;
    });
  }),

  ilmPreWork: computed('publishedWeekEvents.[]', async function () {
    const publishedWeekEvents = await this.get('publishedWeekEvents');
    const preWork =  publishedWeekEvents.reduce((arr, eventObject) => {
      return arr.pushObjects(eventObject.prerequisites);
    }, []);

    return preWork.filter(ev => ev.ilmSession);
  }),

  nonIlmPreWorkEvents: computed('publishedWeekEvents.[]', async function () {
    const publishedWeekEvents = await this.get('publishedWeekEvents');
    return publishedWeekEvents.filter(ev => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }),
});
