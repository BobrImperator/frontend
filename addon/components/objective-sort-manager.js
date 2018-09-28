/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';
import { task } from 'ember-concurrency';
import layout from '../templates/components/objective-sort-manager';

export default Component.extend(SortableByPosition, {
  layout,
  classNames: ['objective-sort-manager'],
  sortableObjectList: null,
  subject: null,

  didReceiveAttrs() {
    this._super(...arguments);
    let subject = this.get('subject');
    this.get('loadAttr').perform(subject);

  },

  loadAttr: task(function * (subject) {
    let objectives = yield subject.get('objectives');
    this.set('sortableObjectList', objectives.toArray().sort(this.get('positionSortingCallback')));
  }),

  actions: {
    cancel(){
      this.sendAction('cancel');
    },
    save() {
      this.sendAction('save', this.get('sortableObjectList'));
    }
  }
});
