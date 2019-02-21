
import Component from '@ember/component';
import layout from '../templates/components/collapsed-competencies';
import { computed } from '@ember/object';
import { all, Promise as RSVPPromise } from 'rsvp';

export default Component.extend({
  layout,
  tagName: 'section',
  classNames: ['collapsed-competencies'],
  /**
   * The model object with assigned competencies.
   * Can be either a course or program-year.
   *
   * @property subject
   * @type {Object}
   * @public
   */
  subject: null,

  /**
   * A summary of schools and their competencies that are assigned to the given subject.
   * @property summary
   * @type {Ember.computed}
   * @public
   */
  summary: computed('subject.competencies.[]', function(){
    return new RSVPPromise(resolve => {
      this.get('subject.competencies').then(competencies => {
        let promises = [];
        let schools = [];
        competencies.forEach(competency => {
          promises.pushObject(competency.get('school').then(school => {
            schools.pushObject(school);
          }));
        });
        all(promises).then(() => {
          let schoolIds = schools.mapBy('id').uniq();
          let summary = [];
          schoolIds.forEach(id => {
            summary.pushObject({
              school: schools.findBy('id', id),
              competencies: schools.filterBy('id', id)
            });
          });
          resolve(summary);
        });
      });
    });
  })
});
