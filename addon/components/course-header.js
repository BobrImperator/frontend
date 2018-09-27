/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import layout from '../templates/components/course-header';
import { computed } from '@ember/object';
import { Promise as RSVPPromise } from 'rsvp';
import Publishable from 'ilios-common/mixins/publishable';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const { alias } = computed;

const Validations = buildValidations({
  courseTitle: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 200
    }),
  ],
});

export default Component.extend(Validations, Publishable, ValidationErrorDisplay, {
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('courseTitle', this.get('course.title'));
  },
  layout,
  classNames: ['course-header'],
  course: null,
  courseTitle: null,
  publishTarget: alias('course'),

  editable: false,
  'data-test-course-header': true,

  actions: {
    changeTitle() {
      const course = this.get('course');
      const newTitle = this.get('courseTitle');
      this.send('addErrorDisplayFor', 'courseTitle');
      return new RSVPPromise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'courseTitle');
            course.set('title', newTitle);
            course.save().then((newCourse) => {
              this.set('courseTitle', newCourse.get('title'));
              this.set('course', newCourse);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },
    revertTitleChanges(){
      const course = this.get('course');
      this.set('courseTitle', course.get('title'));
    },
  }
});
