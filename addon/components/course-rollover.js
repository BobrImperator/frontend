import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { timeout } from 'ember-concurrency';
import moment from 'moment';

@validatable
export default class CourseRolloverComponent extends Component {
  @service fetch;
  @service store;
  @service flashMessages;
  @service iliosConfig;
  @Length(3, 200) @NotBlank() @tracked title;
  @NotBlank() @tracked selectedYear;

  @tracked years;
  @tracked selectedYear;
  @tracked course;
  @tracked startDate;
  @tracked skipOfferings = false;
  @tracked title;
  @tracked allCourses;
  @tracked selectedCohorts = [];

  constructor(){
    super(...arguments);
    const lastYear = Number(moment().subtract(1, 'year').format('YYYY'));
    this.years = [];
    for (let i = 0; i < 6; i++) {
      this.years.push(lastYear + i);
    }
  }

  @restartableTask
  *load(event, [course]) {
    if (!course) {
      return;
    }
    this.title = course.title;
    const school = course.belongsTo('school').id();
    this.allCourses = yield this.store.query('course', {
      filters: {
        school
      }
    });
    this.changeSelectedYear(this.years.firstObject);
  }

  @action
  changeTitle(newTitle){
    this.title = newTitle;
  }
  @action
  addCohort(cohort) {
    this.selectedCohorts = [...this.selectedCohorts, cohort];
  }
  @action
  removeCohort(cohort){
    this.selectedCohorts = this.selectedCohorts.filter(obj => obj !== cohort);
  }

  @dropTask
  *save(){
    yield timeout(1);
    this.addErrorDisplayForAllFields();
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    const courseId = this.args.course.id;

    const selectedCohortIds = this.selectedCohorts.mapBy('id');

    const data = {
      year: this.selectedYear,
      newCourseTitle: this.title
    };
    if (this.startDate) {
      data.newStartDate = moment(this.startDate).format('YYYY-MM-DD');
    }
    if (this.skipOfferings) {
      data.skipOfferings = true;
    }
    if (selectedCohortIds && selectedCohortIds.length) {
      data.newCohorts = selectedCohortIds;
    }

    const newCoursesObj = yield this.fetch.postToApi(`courses/${courseId}/rollover`, data);

    this.flashMessages.success('general.courseRolloverSuccess');
    this.store.pushPayload(newCoursesObj);
    const newCourse = this.store.peekRecord('course', newCoursesObj.data.id);

    return this.args.visit(newCourse);
  }

  get unavailableYears() {
    if (!this.allCourses) {
      return [];
    }
    const existingCoursesWithTitle = this.allCourses.filterBy('title', this.title);
    return existingCoursesWithTitle.mapBy('year');
  }

  @action
  setSelectedYear(event){
    this.changeSelectedYear(event.target.value);
  }

  @action
  changeSelectedYear(selectedYear){
    this.selectedYear = Number(selectedYear);

    const date = moment(this.args.course.startDate);
    const day = date.isoWeekday();
    const week = date.isoWeek();

    this.startDate = moment().year(selectedYear).isoWeek(week).isoWeekday(day).toDate();
  }

  /**
   * "disableDayFn" callback function pikaday.
   * @link https://github.com/dbushell/Pikaday#configuration
   * @param {Date} date
   * @returns {boolean}
   */
  @action
  disableDayFn(date) {
    // KLUDGE!
    // We're sneaking the course into pikaday via the options hash.
    // See https://github.com/edgycircle/ember-pikaday#using-pikaday-specific-options
    // If ember-pikaday ever locks down this backdoor, then we're hosed.
    // @todo Find a better way. [ST 2016/06/30]
    if (this.args.course) {
      // ensure that only dates that fall on the same weekday as the course's start date can be selected.
      return this.args.course.get('startDate').getUTCDay() !== date.getUTCDay();
    }
    return false; // don't disable anything if we don't have a course to compare to.
  }
}
