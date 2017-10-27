import moment from 'moment';
import Ember from 'ember';
import DS from 'ember-data';

const { computed } = Ember;
const { Model } = DS;

export default Model.extend({
  title: DS.attr('string'),
  programYear: DS.belongsTo('program-year', {async: true}),
  courses: DS.hasMany('course', {async: true}),
  learnerGroups: DS.hasMany('learner-group', {async: true}),
  users: DS.hasMany('user', {async: true}),

  competencies: computed('programYear.competencies.[]', async function() {
    const programYear = await this.get('programYear');
    return await programYear.get('competencies');
  }),

  objectives: computed('programYear.objectives.[]', async function() {
    const programYear = await this.get('programYear');
    return await programYear.get('objectives');
  }),

  /**
   * All top-level learner groups associated with this cohort.
   *
   * @property rootLevelLearnerGroups
   * @type {Ember.computed}
   * @public
   */
  rootLevelLearnerGroups: computed('learnerGroups.[]', async function() {
    let learnerGroups = await this.get('learnerGroups');
    return learnerGroups.filter(learnerGroup => learnerGroup.belongsTo('parent').value() === null);
  }),

  currentLevel: computed('programYear.startYear', async function(){
    const programYear = await this.get('programYear');
    const startYear = programYear.get('startYear');
    if(startYear){
      return Math.abs(moment().year(startYear).diff(moment(), 'years'));
    }
    return '';
  }),
  program: computed('programYear.program', async function() {
    const programYear = await this.get('programYear');
    return await programYear.get('program');
  }),
  school: computed('program.school', async function() {
    const program = await this.get('program');
    return await program.get('school');
  }),

  sortedObjectives: computed('programYear.sortedObjectives.[]', async function() {
    const programYear = await this.get('programYear');
    return await programYear.get('sortedObjectives');
  }),
  classOfYear: computed('programYear.startYear', 'programYear.program.duration', async function(){
    const programYear = await this.get('programYear');
    const startYear = parseInt(programYear.get('startYear'));
    const program = await programYear.get('program');
    const duration = parseInt(program.get('duration'));
    return (startYear + duration);
  }),
});
