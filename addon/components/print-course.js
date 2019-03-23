import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { Promise as RSVPPromise } from 'rsvp';
import ObjectProxy from '@ember/object/proxy';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';
import layout from '../templates/components/print-course';

export default Component.extend(SortableByPosition, {
  store: service(),
  layout,
  course: null,
  includeUnpublishedSessions: false,
  tagName: 'section',
  classNames: ['print-course'],
  sortTitle: null,
  sortDirectorsBy: null,
  sortedDirectors: sort('course.directors', 'sortDirectorsBy'),
  sortedMeshDescriptors: sort('course.meshDescriptors', 'sortTitle'),

  /**
   * A list of proxied course sessions, sorted by title.
   * @property sortedSessionProxies
   * @type {Ember.computed}
   * @public
   */
  sortedSessionProxies: computed('course.sessions.[]', 'includeUnpublishedSessions', function(){
    return new RSVPPromise(resolve => {

      const course = this.get('course');
      if(!course){
        resolve([]);
        return;
      }

      let SessionProxy = ObjectProxy.extend({
        sortTitle: null,
        sortedMeshDescriptors: sort('content.meshDescriptors', 'sortTitle'),
        sessionLearningMaterials: computed('content', function(){
          return new RSVPPromise(resolve => {
            let session = this.get('content').get('id');
            this.get('store').query('sessionLearningMaterial', {
              filters: {
                session
              }
            }).then(learningMaterials => {
              resolve(learningMaterials.toArray().sort(this.get('positionSortingCallback')));
            });
          });
        }),
        init() {
          this._super(...arguments);
          this.set('sortTitle', ['title']);
        },
      });
      course.get('sessions').then(sessions => {
        if (!this.get('includeUnpublishedSessions')) {
          sessions = sessions.filterBy('isPublishedOrScheduled');
        }
        let proxiedSessions = sessions.map(function(session){
          return SessionProxy.create({
            content: session
          });
        });
        resolve(proxiedSessions.sortBy('title'));
      });

    });
  }),

  courseLearningMaterials: computed('course', function(){
    return new RSVPPromise(resolve => {
      let course = this.get('course').get('id');
      this.get('store').query('courseLearningMaterial', {
        filters: {
          course
        }
      }).then(learningMaterials => {
        resolve(learningMaterials.toArray().sort(this.get('positionSortingCallback')));
      });
    });
  }),

  init(){
    this._super(...arguments);
    this.set('sortTitle', ['title']);
    this.set('sortDirectorsBy', ['lastName', 'firstName']);
  },
});
