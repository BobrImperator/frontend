/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';
import { task } from 'ember-concurrency';
import layout from '../templates/components/learning-materials-sort-manager';

export default Component.extend(SortableByPosition, {
  layout,
  classNames: ['learning-materials-sort-manager'],
  sortableObjectList: null,
  subject: null,

  didReceiveAttrs() {
    this._super(...arguments);
    let subject = this.get('subject');
    this.get('loadAttr').perform(subject);

  },

  loadAttr: task(function * (subject) {
    let learningMaterials = yield subject.get('learningMaterials');
    this.set('sortableObjectList', learningMaterials.toArray().sort(this.get('positionSortingCallback')));
  }),

  actions: {
    cancel(){
      this.cancel();
    },
    save() {
      this.save(this.get('sortableObjectList'));
    }
  }
});
