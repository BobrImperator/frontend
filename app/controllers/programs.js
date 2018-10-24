/* eslint ember/order-in-controllers: 0 */
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { isPresent, isEmpty, isBlank } from '@ember/utils';
import { resolve } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import escapeRegExp from '../utils/escape-reg-exp';

const { gt } = computed;

export default Controller.extend({
  currentUser: service(),
  intl: service(),
  permissionChecker: service(),

  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter'
  },

  schoolId: null,
  titleFilter: null,

  changeTitleFilter: task(function * (value) {
    this.set('titleFilter', value);
    yield timeout(250);
    return value;
  }).restartable(),

  hasMoreThanOneSchool: gt('model.schools.length', 1),

  filteredPrograms: computed('titleFilter', 'programs.[]', async function() {
    const titleFilter = this.get('titleFilter');
    const title = isBlank(titleFilter) ? '' : titleFilter ;
    const cleanTitle = escapeRegExp(title);
    let exp = new RegExp(cleanTitle, 'gi');

    const programs = await this.get('programs');
    let filteredPrograms;
    if(isEmpty(cleanTitle)){
      filteredPrograms = programs;
    } else {
      filteredPrograms = programs.filter(program => {
        return isPresent(program.get('title')) && program.get('title').match(exp);
      });
    }
    return filteredPrograms.sortBy('title');
  }),

  selectedSchool: computed('model.schools.[]', 'schoolId', 'primarySchool', function(){
    const schools = this.get('model.schools');
    const primarySchool = this.get('model.primarySchool');
    if(isPresent(this.get('schoolId'))){
      const schoolId = this.get('schoolId');
      const school = schools.findBy('id', schoolId);
      if(school){
        return school;
      }
    }

    return primarySchool;
  }),

  programs: computed('selectedSchool', 'deletedProgram', 'newProgram', async function() {
    let schoolId = this.get('selectedSchool').get('id');
    if(isEmpty(schoolId)) {
      return resolve([]);
    }

    return await this.get('store').query('program', {
      filters: {
        school: schoolId
      }
    });
  }),

  canCreate: computed('selectedSchool', async function () {
    const permissionChecker = this.get('permissionChecker');
    const selectedSchool = this.get('selectedSchool');
    return permissionChecker.canCreateProgram(selectedSchool);
  }),

  showNewProgramForm: false,
  deletedProgram: null,
  newProgram: null,

  actions: {
    toggleEditor() {
      if (this.get('showNewProgramForm')) {
        this.set('showNewProgramForm', false);
      } else {
        this.setProperties({ showNewProgramForm: true, newProgram: null });
      }
    },

    editProgram(program) {
      this.transitionToRoute('program', program);
    },

    async removeProgram(program) {
      const school = await this.get('selectedSchool');
      const programs = await school.get('programs');
      programs.removeObject(program);
      await program.destroyRecord();
      this.set('deletedProgram', program);
      const newProgram = this.get('newProgram');
      if (newProgram === program) {
        this.set('newProgram', null);
      }
    },

    async saveNewProgram(newProgram){
      const school = await this.get('selectedSchool');
      const duration = 4;
      newProgram.setProperties({school, duration});
      const savedProgram = await newProgram.save();
      this.set('showNewProgramForm', false);
      this.set('newProgram', savedProgram);
      const programs = await school.get('programs');
      programs.pushObject(savedProgram);
      return savedProgram;
    },

    cancel() {
      this.set('showNewProgramForm', false);
    },

    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
    },
  }
});
