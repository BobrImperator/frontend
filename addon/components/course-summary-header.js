
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { Promise as RSVPPromise } from 'rsvp';
import { computed } from '@ember/object';
import layout from '../templates/components/course-summary-header';

export default Component.extend({
  currentUser: service(),
  routing: service('-routing'),
  permissionChecker: service(),
  layout,
  classNames: ['course-summary-header'],
  course: null,

  showRollover: computed('course', 'currentUser', 'routing.currentRouteName', async function () {
    const routing = this.get('routing');
    if (routing.get('currentRouteName') === 'course.rollover') {
      return false;
    }
    const permissionChecker = this.get('permissionChecker');
    const course = this.get('course');
    const school = await course.get('school');
    return permissionChecker.canCreateCourse(school);
  }),

  showMaterials: computed('routing.currentRouteName', function(){
    return new RSVPPromise(resolve => {
      const routing = this.get('routing');
      resolve(routing.get('currentRouteName') !== 'course-materials');
    });
  }),
});
