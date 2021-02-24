import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency';

export default class CurriculumInventoryReportsComponent extends Component {
  @service currentUser;
  @service intl;
  @service permissionChecker;

  @tracked showNewCurriculumInventoryReportForm = false;
  @tracked hasMoreThanOneSchool = false;
  @tracked selectedSchool = null;
  @tracked sortedSchools = [];
  @tracked programs = [];
  @tracked selectedProgram = null;
  @tracked canCreate = false;

  @action
  async changeSelectedProgram(programId) {
    const program = this.programs.findBy('id', programId);
    const school = await program.school;
    this.args.setSchoolId(school.id);
    this.args.setProgramId(programId);
    this.showNewCurriculumInventoryReportForm = false;
  }

  @action
  changeSelectedSchool(schoolId) {
    this.args.setSchoolId(schoolId);
    this.args.setProgramId(null);
    this.showNewCurriculumInventoryReportForm = false;
  }

  @action
  toggleNewCurriculumInventoryReportForm() {
    this.showNewCurriculumInventoryReportForm = !this.showNewCurriculumInventoryReportForm;
  }

  @action
  cancel() {
    this.showNewCurriculumInventoryReportForm = false;
  }

  @action
  async saveNewCurriculumInventoryReport(newReport) {
    const savedReport = await newReport.save();
    this.newReport = savedReport;
    const program = await this.selectedProgram;
    const reports = await program.curriculumInventoryReports;
    reports.pushObject(savedReport);
    this.showNewCurriculumInventoryReportForm = false;
  }

  @restartableTask
  *load() {
    if (! this.args.schools) {
      return;
    }
    this.sortedSchools = this.args.schools.sortBy('title').toArray();
    this.hasMoreThanOneSchool = this.sortedSchools.length > 1;

    if (! this.args.schoolId) {
      const user = yield this.currentUser.model;
      this.selectedSchool =  yield user.school;
    } else {
      this.selectedSchool = this.args.schools.findBy('id', this.args.schoolId);
    }

    if (this.selectedSchool) {
      this.canCreate = yield this.permissionChecker.canCreateCurriculumInventoryReport(this.selectedSchool);
      const programs = yield this.selectedSchool.programs;
      this.programs = programs.sortBy('title').toArray();
    }

    if (this.args.programId) {
      this.selectedProgram = this.programs.findBy('id', this.args.programId);
    } else {
      this.selectedProgram = this.programs.length ? this.programs[0] : null;
    }
  }

  @dropTask
  *removeCurriculumInventoryReport(report) {
    const reports = yield this.selectedProgram.curriculumInventoryReports;
    reports.removeObject(report);
    yield report.destroyRecord();
  }
}
