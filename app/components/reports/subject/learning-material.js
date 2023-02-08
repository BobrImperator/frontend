import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';

export default class ReportsSubjectLearningMaterialComponent extends Component {
  @service graphql;
  @service intl;

  @use data = new AsyncProcess(() => [this.getReportResults.bind(this), this.args.report]);

  get finishedLoading() {
    return Array.isArray(this.data);
  }

  get sortedData() {
    return this.data?.sort((a, b) => {
      return a.localeCompare(b, this.intl.primaryLocale);
    });
  }

  async getGraphQLFilters(report) {
    const { prepositionalObject, prepositionalObjectTableRowId } = report;

    const school = await report.school;

    let rhett = [];
    if (school) {
      rhett.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      let what = pluralize(camelize(prepositionalObject));
      if (what === 'course') {
        what = 'fullCourses';
      }
      if (prepositionalObject === 'mesh term') {
        what = 'meshDescriptors';
      }
      rhett.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }

    return rhett;
  }

  async getReportResults(report) {
    const { subject } = report;

    if (subject !== 'learning material') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectLearningMaterialComponent`);
    }

    const filters = await this.getGraphQLFilters(report);
    const result = await this.graphql.find('learningMaterials', filters, 'id, title');
    return result.data.learningMaterials.map(({ title }) => title);
  }
}
