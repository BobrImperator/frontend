import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { isPresent, isEmpty } from '@ember/utils';
import { all } from 'rsvp';
import moment from 'moment';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import striptags from 'striptags';

const { alias, collect, mapBy, sum, oneWay, not } = computed;

export default Model.extend({
  title: attr('string'),
  description: attr('string'),
  attireRequired: attr('boolean'),
  equipmentRequired: attr('boolean'),
  supplemental: attr('boolean'),
  attendanceRequired: attr('boolean'),
  instructionalNotes: attr('string'),
  updatedAt: attr('date'),
  publishedAsTbd: attr('boolean'),
  published: attr('boolean'),
  sessionType: belongsTo('session-type', { async: true }),
  course: belongsTo('course', { async: true }),
  ilmSession: belongsTo('ilm-session', { async: true }),
  sessionObjectives: hasMany('session-objective', { async: true }),
  meshDescriptors: hasMany('mesh-descriptor', { async: true }),
  learningMaterials: hasMany('session-learning-material', { async: true }),
  offerings: hasMany('offering', { async: true }),
  administrators: hasMany('user', {
    async: true,
    inverse: 'administeredSessions'
  }),
  studentAdvisors: hasMany('user', {
    async: true,
    inverse: 'studentAdvisedSessions'
  }),
  postrequisite: belongsTo('session', {
    inverse: 'prerequisites',
    async: true
  }),
  prerequisites: hasMany('session', {
    inverse: 'postrequisite',
    async: true
  }),
  terms: hasMany('term', {async: true}),
  offeringLearnerGroups: mapBy('offerings', 'learnerGroups'),
  offeringLearnerGroupsLength: mapBy('offeringLearnerGroups', 'length'),
  learnerGroupCount: sum('offeringLearnerGroupsLength'),
  assignableVocabularies: alias('course.assignableVocabularies'),
  xObjectives: alias('sessionObjectives'),

  isIndependentLearning: computed('ilmSession.id', function () {
    return !!this.belongsTo('ilmSession').id();
  }),

  /**
   * All offerings for this session, sorted by offering start date in ascending order.
   * @property sortedOfferingsByDate
   * @type {Ember.computed}
   */
  sortedOfferingsByDate: computed('offerings.@each.startDate', async function () {
    const offerings = await this.get('offerings');
    const filteredOfferings = offerings.filter(offering => isPresent(offering.get('startDate')));
    return filteredOfferings.sort((a, b) => {
      const aDate = moment(a.get('startDate'));
      const bDate = moment(b.get('startDate'));
      if (aDate === bDate) {
        return 0;
      }
      return aDate > bDate ? 1 : -1;
    });
  }),

  /**
   * The earliest start date of all offerings in this session, or, if this is an ILM session, the ILM's due date.
   *
   * @property firstOfferingDate
   * @type {Ember.computed}
   */
  firstOfferingDate: computed('sortedOfferingsByDate.@each.startDate', 'ilmSession.dueDate', async function () {
    const ilmSession = await this.get('ilmSession');
    if (ilmSession) {
      return ilmSession.get('dueDate');
    }

    const offerings = await this.get('sortedOfferingsByDate');
    if (isEmpty(offerings)) {
      return null;
    }

    return offerings.get('firstObject.startDate');
  }),

  /**
   * The maximum duration in hours (incl. fractions) of any session offerings.
   * @property maxSingleOfferingDuration
   * @type {Ember.computed}
   */
  maxSingleOfferingDuration: computed('offerings.@each.startDate', 'offerings.@each.endDate', async function () {
    const offerings = await this.get('offerings');
    if (isEmpty(offerings)) {
      return 0;
    }
    const sortedOfferings = offerings.toArray().sort(function (a, b) {
      const diffA = moment(a.get('endDate')).diff(moment(a.get('startDate')), 'minutes');
      const diffB = moment(b.get('endDate')).diff(moment(b.get('startDate')), 'minutes');
      if (diffA > diffB) {
        return -1;
      } else if (diffA < diffB) {
        return 1;
      }
      return 0;
    });

    const offering = sortedOfferings[0];
    const duration = moment(offering.get('endDate')).diff(moment(offering.get('startDate')), 'hours', true);

    return duration.toFixed(2);
  }),

  /**
   * The total duration in hours (incl. fractions) of all session offerings.
   * @property totalSumOfferingsDuration
   * @type {Ember.computed}
   */
  totalSumOfferingsDuration: computed('offerings.@each.startDate', 'offerings.@each.endDate', async function () {
    const offerings = await this.get('offerings');
    if (isEmpty(offerings)) {
      return 0;
    }

    return offerings.reduce((total, offering) => {
      return total + moment(offering.get('endDate')).diff(moment(offering.get('startDate')), 'hours', true);
    }, 0).toFixed(2);
  }),

  /**
   * Total duration in hours for offerings and ILM Sessions
   * If both ILM and offerings are present sum them
   * @property totalSumDuration
   * @type {Ember.computed}
   */
  totalSumDuration: computed('totalSumOfferingsDuration', 'ilmSession.hours', async function () {
    const totalSumOfferingsDuration = await this.get('totalSumOfferingsDuration');
    const ilmSession = await this.get('ilmSession');
    if (!ilmSession) {
      return totalSumOfferingsDuration;
    }

    const ilmHours = ilmSession.get('hours');

    return parseFloat(ilmHours) + parseFloat(totalSumOfferingsDuration);
  }),

  /**
   * The maximum duration in hours (incl. fractions) of any session offerings, plus any ILM hours.
   * If both ILM and offerings are present sum them
   * @property totalSumDuration
   * @type {Ember.computed}
   */
  maxDuration: computed('maxSingleOfferingDuration', 'ilmSession.hours', async function () {
    const maxSingleOfferingDuration = await this.get('maxSingleOfferingDuration');
    const ilmSession = await this.get('ilmSession');
    if (!ilmSession) {
      return maxSingleOfferingDuration;
    }

    const ilmHours = ilmSession.get('hours');

    return parseFloat(ilmHours) + parseFloat(maxSingleOfferingDuration);
  }),

  requiredPublicationIssues: computed(
    'title',
    'offerings.length',
    'ilmSession.dueDate',
    'isIndependentLearning',
    function(){
      if(!this.get('isIndependentLearning')){
        this.set('requiredPublicationLengthFields', ['offerings']);
        this.set('requiredPublicationSetFields', ['title']);
      } else {
        this.set('requiredPublicationLengthFields', []);
        this.set('requiredPublicationSetFields', ['title', 'ilmSession.dueDate']);
      }
      return this.getRequiredPublicationIssues();
    }
  ),
  optionalPublicationIssues: computed(
    'terms.length',
    'sessionObjectives.length',
    'meshDescriptors.length',
    function(){
      return this.getOptionalPublicationIssues();
    }
  ),

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

  /**
   * Learner-groups associated with this session via its offerings.
   *
   * @property associatedOfferingLearnerGroups
   * @type {Ember.computed}
   */
  associatedOfferingLearnerGroups: computed('offerings.@each.learnerGroups', async function(){
    const offerings = await this.get('offerings');
    const offeringLearnerGroups = await all(offerings.mapBy('learnerGroups'));
    return offeringLearnerGroups.reduce((array, set) => {
      array.pushObjects(set.toArray());
      return array;
    }, []).uniq().sortBy('title');
  }),

  /**
   * Learner-groups associated with this session via its ILM.
   * @property associatedIlmLearnerGroups
   * @type {Ember.computed}
   */
  associatedIlmLearnerGroups: computed('ilmSession.learnerGroups', async function(){
    const ilmSession = await this.get('ilmSession');
    if (! isPresent(ilmSession)) {
      return [];
    }

    const learnerGroups = await ilmSession.get('learnerGroups');
    return learnerGroups.sortBy('title');
  }),

  /**
   * Learner-groups associated with this session via its ILM and offerings.
   * @property associatedLearnerGroups
   * @type {Ember.computed}
   */
  associatedLearnerGroups: computed('associatedIlmLearnerGroups.[]', 'associatedOfferingLearnerGroups.[]', async function(){
    const ilmLearnerGroups = await this.get('associatedIlmLearnerGroups');
    const offeringLearnerGroups = await this.get('associatedOfferingLearnerGroups');
    const allGroups = [].pushObjects(offeringLearnerGroups).pushObjects(ilmLearnerGroups);
    return allGroups.uniq().sortBy('title');
  }),

  /**
   * A list of session objectives, sorted by position (asc) and then id (desc).
   * @property sortedSessionObjectives
   * @type {Ember.computed}
   */
  sortedSessionObjectives: computed('sessionObjectives.@each.position', async function() {
    const objectives = await this.get('sessionObjectives');
    return objectives.toArray().sort(sortableByPosition);
  }),

  /**
   * Every instructor associated with the session
   * @property allInstructors
   * @type {Ember.computed}
   */
  allInstructors: computed('offerings.[]', 'offerings.@each.{instructors,instructorGroups}', 'ilmSession.{instructors.[],instructorGroups.[]}', async function() {
    const offerings = await this.get('offerings');
    const offeringInstructors = await all(offerings.mapBy('instructors'));
    const offeringInstructorGroupsArr = await all(offerings.mapBy('instructorGroups'));
    const flatten = (flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    };

    const offeringInstructorGroups = offeringInstructorGroupsArr.reduce(flatten, []);

    let ilmInstructorGroups = [];
    let ilmInstructors = [];
    const ilmSession = await this.get('ilmSession');
    if (ilmSession) {
      ilmInstructors = await ilmSession.get('instructors');
      ilmInstructorGroups = await ilmSession.get('instructorGroups');
    }

    const groupInstructors = await all([].concat(offeringInstructorGroups.toArray(), ilmInstructorGroups.toArray()).mapBy('users'));

    const flat = [].concat(offeringInstructors, ilmInstructors, groupInstructors).reduce(flatten, []);

    return flat.uniq();
  }),

  /**
   * Computes if this session has any prerequisites.
   * @property hasPrerequisites
   * @type {Ember.computed}
   */
  hasPrerequisites: computed('prerequisites.[]', function(){
    const ids = this.hasMany('prerequisites').ids();
    return ids.length > 0;
  }),

  /**
   * Computes if this session has a postrequisite.
   * @property hasPostrequisite
   * @type {Ember.computed}
   */
  hasPostrequisite: computed('postrequisite', function(){
    return !!this.belongsTo('postrequisite').id();
  }),

  showUnlinkIcon: computed('sessionObjectives.[]', async function() {
    const sessionObjectives = await this.get("sessionObjectives");
    const collectionOfCourseObjectives = await all(sessionObjectives.mapBy('courseObjectives'));
    return collectionOfCourseObjectives.any((courseObjectives) => isEmpty(courseObjectives.toArray()));
  }),

  init() {
    this._super(...arguments);
    this.set('optionalPublicationLengthFields', ['terms', 'sessionObjectives', 'meshDescriptors']);
    this.set('requiredPublicationSetFields', []);
    this.set('requiredPublicationLengthFields', []);
    this.set('optionalPublicationSetFields', []);
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

  textDescription: computed('description', function(){
    return striptags(this.description);
  }),
});
