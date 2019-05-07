import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank, isEmpty } from '@ember/utils';
import layout from '../templates/components/single-event';
import EventMixin from 'ilios-common/mixins/events';
import moment from 'moment';

export default Component.extend(EventMixin, {
  currentUser: service(),
  intl: service(),
  router: service(),
  store: service(),

  classNames: ['single-event'],

  'data-test-single-event': true,
  event: null,
  layout,

  courseId: computed('event', async function() {
    return await this.getCourseIdForEvent(this.event);
  }),

  taughtBy: computed('event.instructors', 'intl.locale', function() {
    const instructors = this.get('event.instructors');
    if (isEmpty(instructors)) {
      return '';
    }
    return this.get('intl').t('general.taughtBy', { instructors });
  }),

  sessionIs: computed('event.sessionType', 'intl.locale', function() {
    const intl = this.get('intl');
    const type = this.get('event.sessionTypeTitle');
    return intl.t('general.sessionIs', { type });
  }),

  courseObjectives: computed('intl.locale', 'event.courseObjectives.[]', 'event.competencies.[]', function(){
    const intl = this.get('intl');
    const event = this.get('event');
    const objectives =  event.courseObjectives;
    const competencies = event.competencies;
    return objectives.map(objective => {
      //strip all HTML
      const title = objective.title.replace(/(<([^>]+)>)/ig,"");
      const position = objective.position;
      if(isEmpty(objective.competencies)) {
        return {
          id: objective.id,
          title,
          domain: intl.t('general.noAssociatedCompetencies'),
          position
        };
      }
      const competencyId = objective.competencies[0];
      const competency = competencies.findBy('id', competencyId);
      const parentId = competency.parent;
      let domain = competency;
      if (! isEmpty(parentId)) {
        domain = competencies.findBy('id', parentId);
      }
      return {
        id: objective.id,
        title,
        domain: competency.title + ' (' + domain.title + ')',
        position
      };
    }).sort(this.positionSortingCallback);
  }),

  typedLearningMaterials: computed('event.learningMaterials', function() {
    const lms = this.get('event.learningMaterials') || [];
    lms.forEach(lm => {
      if (lm.isBlanked) {
        lm['type'] = 'unknown';
        return;
      }
      if (!isBlank(lm.citation)) {
        lm['type'] = 'citation';
      } else if (!isBlank(lm.link)) {
        lm['type'] = 'link';
      } else {
        lm['type'] = 'file';
      }
    });
    return lms;
  }),

  courseLearningMaterials: computed('intl.locale', 'typedLearningMaterials', function() {
    const eventLms = this.get('typedLearningMaterials') || [];
    return eventLms.filterBy('courseLearningMaterial').sort((lm1, lm2) => {
      let pos1 = parseInt(lm1.position, 10) || 0;
      let pos2 = parseInt(lm2.position, 10) || 0;

      // 1. position, asc
      if (pos1 > pos2) {
        return 1;
      } else if (pos1 < pos2) {
        return -1;
      }

      // 2. course learning material id, desc
      let id1 = lm1.courseLearningMaterial;
      let id2 = lm2.courseLearningMaterial;
      if (id1 > id2) {
        return -1;
      } else if (id1 < id2) {
        return 1;
      }
      return 0;
    });
  }),

  sessionObjectives: computed('intl.locale', 'event.sessionObjectives.[]', 'event.competencies.[]', function(){
    const intl = this.get('intl');
    const event = this.get('event');
    const objectives =  event.sessionObjectives;
    const competencies = event.competencies;
    return objectives.map(objective => {
      //strip all HTML
      const title = objective.title.replace(/(<([^>]+)>)/ig,"");
      const position = objective.position;
      if(isEmpty(objective.competencies)) {
        return {
          id: objective.id,
          title,
          domain: intl.t('general.noAssociatedCompetencies'),
          position
        };
      }
      const competencyId = objective.competencies[0];
      const competency = competencies.findBy('id', competencyId);
      const parentId = competency.parent;
      let domain = competency;
      if (! isEmpty(parentId)) {
        domain = competencies.findBy('id', parentId);
      }
      return {
        id: objective.id,
        title,
        domain: competency.title + ' (' + domain.title + ')',
        position
      };
    }).sort(this.positionSortingCallback);
  }),

  sessionLearningMaterials: computed('intl.locale', 'typedLearningMaterials', function() {
    const eventLms = this.get('typedLearningMaterials') || [];
    return eventLms.filterBy('sessionLearningMaterial').sort((lm1, lm2) => {
      let pos1 = parseInt(lm1.position, 10) || 0;
      let pos2 = parseInt(lm2.position, 10) || 0;

      // 1. position, asc
      if (pos1 > pos2) {
        return 1;
      } else if (pos1 < pos2) {
        return -1;
      }

      // 2. session learning material id, desc
      let id1 = lm1.sessionLearningMaterial;
      let id2 = lm2.sessionLearningMaterial;
      if (id1 > id2) {
        return -1;
      } else if (id1 < id2) {
        return 1;
      }
      return 0;
    });
  }),

  recentlyUpdated: computed('event.lastModified', function(){
    const lastModifiedDate = moment(this.get('event.lastModified'));
    const today = moment();
    const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days');
    return daysSinceLastUpdate < 6;
  }),

  postrequisiteLink: computed('event.postrequisiteSlug', function(){
    if (this.event.postrequisites.length) {
      return this.router.urlFor('events', this.event.postrequisites[0].slug);
    }
  }),

  actions: {
    async transitionToMyMaterials() {
      const course = await this.courseId;
      const queryParams = { course, sortBy: 'sessionTitle' };
      this.router.transitionTo('mymaterials', { queryParams });
    }
  },

  /**
   * Callback function for <code>Array.sort()<code>.
   * Compares two given Objects by their position property (in ascending order), and then by id (descending).
   *
   * @method positionSortingCallback
   * @param {Object} obj1
   * @param {Object} obj2
   * @return {Number}
   */
  positionSortingCallback(obj1, obj2) {
    let pos1 = obj1.position;
    let pos2 = obj2.position;
    // 1. position, asc
    if (pos1 > pos2) {
      return 1;
    } else if (pos1 < pos2) {
      return -1;
    }

    // 2. id, desc
    let id1 = obj1.id;
    let id2 = obj2.id;
    if (id1 > id2) {
      return -1;
    } else if (id1 < id2) {
      return 1;
    }
    return 0;
  }
});
