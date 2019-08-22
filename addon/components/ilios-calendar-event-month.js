import Ember from 'ember';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import { default as CalendarEvent } from 'elemental-calendar/components/calendar-event';
import layout from '../templates/components/ilios-calendar-event-month';
import moment from 'moment';
import TooltipContent from '../mixins/tooltip-content';
import colorChange from '../utils/color-change';

const { Handlebars } = Ember;
const { notEmpty, or } = computed;
const { Utils } = Handlebars;
const { escapeExpression } = Utils;

export default CalendarEvent.extend(TooltipContent, {
  layout,
  event: null,
  timeFormat: 'h:mma',
  classNameBindings: [':event', ':event-pos', ':ilios-calendar-event', ':month-event', 'clickable:clickable'],
  daysToShowAlert: null,

  isIlm: notEmpty('event.ilmSession'),
  isOffering: notEmpty('event.offering'),
  clickable: or('isIlm', 'isOffering'),

  style: computed(function() {
    const event = this.get('event');
    if (event == null) {
      return new htmlSafe('');
    }
    const darkcolor = colorChange(event.color, -0.15);

    return new htmlSafe(
      `background-color: ${escapeExpression(event.color)};
       border-left: 4px solid ${escapeExpression(darkcolor)};`
    );
  }),
  recentlyUpdated: computed('event.lastModified', {
    get() {
      const lastModifiedDate = moment(this.get('event.lastModified'));
      const today = moment();
      const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days');

      return daysSinceLastUpdate < 6 ? true : false;
    }
  }).readOnly(),

  click(){
    if(this.get('clickable')){
      this.get('selectEvent')();
    }
  }
});
