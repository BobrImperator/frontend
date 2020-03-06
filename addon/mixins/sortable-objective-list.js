import { action, computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import RSVP from 'rsvp';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';

const { alias } = computed;
const { all } = RSVP;

export default Mixin.create(SortableByPosition, {
  subject: null,
  totalObjectivesToSave: null,
  currentObjectivesSaved: null,
  isSorting: false,
  isSaving: false,

  objectives: alias('subject.sortedObjectives'),

  hasMoreThanOneObjective: computed('objectives.[]', async function(){
    const objectives = await this.get('objectives');
    return objectives.length > 1;
  }),

  saveSomeObjectives(arr){
    const chunk = arr.splice(0, 5);
    return all(chunk.invoke('save')).then(() => {
      if (arr.length){
        this.set('currentObjectivesSaved', this.get('currentObjectivesSaved') + chunk.length);
        return this.saveSomeObjectives(arr);
      }
    });
  },

  @action
  saveSortOrder(objectives){
    this.set('isSaving', true);
    for (let i = 0, n = objectives.length; i < n; i++) {
      const lm = objectives[i];
      lm.set('position', i + 1);
    }
    this.set('totalObjectivesToSave', objectives.length);
    this.set('currentObjectivesSaved', 0);

    this.saveSomeObjectives(objectives).then(() => {
      this.set('isSaving', false);
      this.set('isSorting', false);
    });
  },

  @action
  cancelSorting() {
    this.set('isSorting', false);
  },
});
