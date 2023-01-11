import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';
import PapaParse from 'papaparse';
import { use } from 'ember-could-get-used-to-this';
import buildReportTitle from 'ilios/utils/build-report-title';
import createDownloadFile from 'ilios/utils/create-download-file';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import { ensureSafeComponent } from '@embroider/util';
import CourseComponent from './subject/course';

export default class ReportsSubjectComponent extends Component {
  @service currentUser;
  @service preserveScroll;
  @service reporting;
  @service store;
  @service intl;

  @tracked finishedBuildingReport = false;
  @tracked myReportEditorOn = false;

  @use allAcademicYears = new ResolveAsyncValue(() => [this.store.findAll('academic-year')]);

  @use selectedReportTitle = new AsyncProcess(() => [
    this.getSelectedReportTitle.bind(this),
    this.args.selectedReport,
  ]);

  get subjectComponent() {
    switch (this.args.selectedReport.subject) {
      case 'course':
        return ensureSafeComponent(CourseComponent, this);
    }

    return null;
  }

  async getSelectedReportTitle(selectedReport) {
    if (!selectedReport) {
      return '';
    }
    return buildReportTitle(selectedReport, this.store, this.intl);
  }

  get showAcademicYearFilter() {
    if (!this.args.selectedReport) {
      return false;
    }
    const { subject, prepositionalObject } = this.args.selectedReport;
    return prepositionalObject !== 'course' && ['course', 'session'].includes(subject);
  }

  @dropTask
  *downloadReport() {
    const report = this.args.selectedReport;
    const title = this.selectedReportTitle;
    const year = this.args.selectedYear;
    const data = yield this.reporting.getArrayResults(report, year);
    this.finishedBuildingReport = true;
    const csv = PapaParse.unparse(data);
    createDownloadFile(`${title}.csv`, csv, 'text/csv');
    yield timeout(2000);
    this.finishedBuildingReport = false;
  }
}
