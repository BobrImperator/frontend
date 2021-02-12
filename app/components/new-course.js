import Component from '@glimmer/component';
import { tracked } from "@glimmer/tracking";
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';

const THIS_YEAR = parseInt(moment().format('YYYY'), 10);
const YEARS = [
  THIS_YEAR - 2,
  THIS_YEAR - 1,
  THIS_YEAR,
  THIS_YEAR + 1,
  THIS_YEAR + 2
];

@validatable
export default class NewCourseComponent extends Component {
  @service intl;
  @service store;
  @service iliosConfig;

  @tracked @NotBlank() selectedYear;
  @tracked @NotBlank() @Length(3, 200) title;
  @tracked years = Object.freeze(YEARS);
  @tracked academicYearCrossesCalendarYearBoundaries;

  @action
  setYear(year) {
    this.selectedYear = parseInt(year, 10);
  }

  @action
  keyboard(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }
    if (13 === keyCode) {
      this.saveCourse.perform();
      return;
    }
    if (27 === keyCode) {
      this.args.cancel();
    }
  }

  @restartableTask
  *load() {
    this.academicYearCrossesCalendarYearBoundaries
      = yield this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries');
    if (this.args.currentYear && this.years.includes(parseInt(this.args.currentYear.id, 10))) {
      this.setYear(this.args.currentYear.id);
    }
  }

  @dropTask
  *saveCourse() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    const course = this.store.createRecord('course', {
      level: 1,
      title: this.title,
      school: this.args.currentSchool,
      year: this.selectedYear
    });
    yield this.args.save(course);
  }
}
