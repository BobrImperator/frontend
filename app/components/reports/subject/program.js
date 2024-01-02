import Component from '@glimmer/component';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { camelize } from '@ember/string';

export default class ReportsSubjectProgramComponent extends Component {
  @service graphql;
  @service currentUser;

  @use data = new AsyncProcess(() => [
    this.getReportResults.bind(this),
    this.args.subject,
    this.args.prepositionalObject,
    this.args.prepositionalObjectTableRowId,
    this.args.school,
  ]);

  get canView() {
    return this.currentUser.performsNonLearnerFunction;
  }

  get showSchool() {
    return !this.args.school;
  }

  get sortedPrograms() {
    return sortBy(this.data, ['school.title', 'title']);
  }

  get finishedLoading() {
    return Array.isArray(this.data);
  }

  async getReportResults(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    if (subject !== 'program') {
      throw new Error(`Report for ${subject} sent to ReportsSubjectProgramComponent`);
    }

    let filters = [];
    if (school) {
      filters.push(`schools: [${school.id}]`);
    }
    if (prepositionalObject && prepositionalObjectTableRowId) {
      const what = pluralize(camelize(prepositionalObject));
      filters.push(`${what}: [${prepositionalObjectTableRowId}]`);
    }
    const result = await this.graphql.find('programs', filters, 'id, title, school { title }');

    return result.data.programs;
  }
}
