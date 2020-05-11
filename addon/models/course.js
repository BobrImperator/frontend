import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { all, map } from 'rsvp';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';

const { alias, filterBy, mapBy, sum, oneWay, not, collect } = computed;

export default Model.extend({
  title: attr('string'),
  level: attr('number'),
  year: attr('number'),
  startDate: attr('date'),
  endDate: attr('date'),
  externalId: attr('string'),
  locked: attr('boolean'),
  archived: attr('boolean'),
  publishedAsTbd: attr('boolean'),
  published: attr('boolean'),
  clerkshipType: belongsTo('course-clerkship-type', {async: true}),
  school: belongsTo('school', {async: true}),
  directors: hasMany('user', {
    async: true,
    inverse: 'directedCourses'
  }),
  administrators: hasMany('user', {
    async: true,
    inverse: 'administeredCourses'
  }),
  cohorts: hasMany('cohort', {async: true}),
  courseObjectives: hasMany('course-objective', {async: true}),
  meshDescriptors: hasMany('mesh-descriptor', {async: true}),
  learningMaterials: hasMany('course-learning-material', {async: true}),
  sessions: hasMany('session', {async: true}),
  ancestor: belongsTo('course', {
    inverse: 'descendants',
    async: true
  }),
  descendants: hasMany('course', {
    inverse: 'ancestor',
    async: true
  }),
  terms: hasMany('term', {async: true}),

  publishedSessions: filterBy('sessions', 'isPublished'),
  publishedSessionOfferings: mapBy('publishedSessions', 'offerings'),
  publishedSessionOfferingCounts: mapBy('publishedSessionOfferings', 'length'),
  publishedOfferingCount: sum('publishedSessionOfferingCounts'),

  objectives: computed('courseObjectives.[]', async function(){
    const courseObjectives = await this.get('courseObjectives');
    const objectives = await all(courseObjectives.toArray().mapBy('objective'));
    return objectives.uniq();
  }),

  academicYear: computed('year', function(){
    return this.get('year') + ' - ' + (parseInt(this.get('year'), 10) + 1);
  }),

  /**
   * All competencies linked to this course via its objectives.
   * @property competencies
   * @type {Ember.computed}
   * @public
   */
  competencies: computed('objectives.@each.treeCompetencies', async function(){
    const objectives = await this.get('objectives');
    const trees = await all(objectives.mapBy('treeCompetencies'));
    const competencies = trees.reduce((array, set) => {
      return array.pushObjects(set);
    }, []);
    return competencies.uniq().filter(item => {
      return !isEmpty(item);
    });
  }),

  /**
   * A list of competency and their domains linked to this course via its objectives.
   * Each item in this list is a proxy object, containing the domain and all competencies of this domain that are linked.
   *
   * @property domains
   * @type {Ember.computed}
   * @public
   */
  domains: computed('competencies.@each.domain', async function(){
    const competencies = await this.get('competencies');
    const domains = await all(competencies.mapBy('domain'));
    const domainProxies = await map(domains.uniq(), async domain => {
      let subCompetencies = await domain.get('treeChildren');

      // filter out any competencies of this domain that are not linked to this course.
      subCompetencies = subCompetencies.filter(competency => {
        return competencies.includes(competency);
      }).sortBy('title');

      return ObjectProxy.create({
        content: domain,
        subCompetencies
      });
    });

    return domainProxies.sortBy('title');
  }),

  requiredPublicationIssues: computed('startDate', 'endDate', 'cohorts.length', function(){
    return this.getRequiredPublicationIssues();
  }),
  optionalPublicationIssues: computed(
    'terms.length',
    'objectives.length',
    'meshDescriptors.length',
    function(){
      return this.getOptionalPublicationIssues();
    }
  ),

  /**
   * All schools associated with this course.
   * This includes the course-owning school, as well as schools owning associated cohorts.
   * @property schools
   * @type {Ember.computed}
   * @public
   */
  schools: computed('school', 'cohorts.[]', async function() {

    const courseOwningSchool = await this.get('school');

    const cohorts = await this.get('cohorts');
    const programYears = await all(cohorts.mapBy('programYear'));
    const programs = await all(programYears.mapBy('program'));
    const schools = await all(programs.mapBy('school'));

    schools.pushObject(courseOwningSchool);
    return schools.uniq();
  }),

  /**
   * All vocabularies that are eligible for assignment to this course.
   * @property assignableVocabularies
   * @type {Ember.computed}
   * @public
   */
  assignableVocabularies: computed('schools.@each.vocabularies', async function() {
    const schools = await this.get('schools');
    const vocabularies = await all(schools.mapBy('vocabularies'));
    return vocabularies.reduce((array, set) => {
      array.pushObjects(set.toArray());
      return array;
    }, []).sortBy('school.title', 'title');
  }),

  /**
   * A list of course objectives, sorted by position (asc) and then id (desc).
   * @property sortedObjectives
   * @type {Ember.computed}
   */
  sortedObjectives: computed('objectives.@each.position', async function() {
    const objectives = await this.get('objectives');
    return objectives.toArray().sort(sortableByPosition);
  }),

  hasMultipleCohorts: computed('cohorts.[]', function(){
    const meta = this.hasMany('cohorts');
    const ids = meta.ids();

    return ids.length > 1;
  }),

  /**
   * A list of all vocabularies that are associated via terms.
   * @property associatedVocabularies
   * @type {Ember.computed}
   * @public
   */
  associatedVocabularies: computed('terms.@each.vocabulary', async function () {
    const terms = await this.get('terms');
    const vocabularies = await all(terms.toArray().mapBy('vocabulary'));
    return vocabularies.uniq().sortBy('title');
  }),

  /**
   * A list containing all associated terms and their parent terms.
   * @property termsWithAllParents
   * @type {Ember.computed}
   * @public
   */
  termsWithAllParents: computed('terms.[]', async function () {
    const terms = await this.get('terms');
    const allTerms = await all(terms.toArray().mapBy('termWithAllParents'));
    return (allTerms.reduce((array, set) => {
      array.pushObjects(set);
      return array;
    }, [])).uniq();
  }),

  /**
   * The number of terms attached to this model
   * @property termCount
   * @type {Ember.computed}
   * @public
   */
  termCount: computed('terms.[]', function(){
    const termIds = this.hasMany('terms').ids();
    return termIds.length;
  }),

  init() {
    this._super(...arguments);
    this.set('requiredPublicationSetFields', ['startDate', 'endDate']);
    this.set('requiredPublicationLengthFields', ['cohorts']);
    this.set('optionalPublicationSetFields', []);
    this.set('optionalPublicationLengthFields', ['terms', 'objectives', 'meshDescriptors']);
  },

  setDatesBasedOnYear: function(){
    const today = moment();
    const firstDayOfYear = moment(this.get('year') + '-7-1', "YYYY-MM-DD");
    const startDate = today < firstDayOfYear?firstDayOfYear:today;
    const endDate = moment(startDate).add('8', 'weeks');
    this.set('startDate', startDate.toDate());
    this.set('endDate', endDate.toDate());
  },

  isPublished: alias('published'),
  isNotPublished: not('isPublished'),
  isScheduled: oneWay('publishedAsTbd'),
  isPublishedOrScheduled: computed('publishTarget.isPublished', 'publishTarget.isScheduled', function(){
    return this.get('publishedAsTbd') || this.get('isPublished');
  }),
  allPublicationIssuesCollection: collect('requiredPublicationIssues.length', 'optionalPublicationIssues.length'),
  allPublicationIssuesLength: sum('allPublicationIssuesCollection'),
  requiredPublicationSetFields: null,
  requiredPublicationLengthFields: null,
  optionalPublicationSetFields: null,
  optionalPublicationLengthFields: null,
  getRequiredPublicationIssues(){
    const issues = [];
    this.requiredPublicationSetFields.forEach(val => {
      if(!this.get(val)){
        issues.push(val);
      }
    });

    this.requiredPublicationLengthFields.forEach(val => {
      if(this.get(val + '.length') === 0){
        issues.push(val);
      }
    });

    return issues;
  },
  getOptionalPublicationIssues(){
    const issues = [];
    this.optionalPublicationSetFields.forEach(val => {
      if(!this.get(val)){
        issues.push(val);
      }
    });

    this.optionalPublicationLengthFields.forEach(val => {
      if(this.get(val + '.length') === 0){
        issues.push(val);
      }
    });

    return issues;
  },
});
