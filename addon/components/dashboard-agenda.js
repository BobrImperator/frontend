import Ember from 'ember';
import layout from '../templates/components/dashboard-agenda';
import moment from 'moment';

const { Component, computed } = Ember;

export default Component.extend({
  layout,
  /**
   * Days in advance of the current date.
   * @property daysInAdvance
   * @type int
   * @public
   */
  daysInAdvance: 60,

  classNames: ['dashboard-agenda'],

  userEvents: Ember.inject.service(),

  weeksEvents: computed('daysInAdvance', function() {
    const daysInAdvance = this.get('daysInAdvance');
    const from = moment().hour(0).minute(0).unix();
    const to = moment().hour(23).minute(59).add(daysInAdvance, 'days').unix();

    return this.get('userEvents').getEvents(from, to);
  }),
  sixDaysAgo: moment().hour(0).minute(0).subtract(6, 'days'),
});
