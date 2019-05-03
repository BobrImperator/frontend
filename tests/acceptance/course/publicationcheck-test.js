import {
  currentRouteName,
  currentURL,
  click,
  findAll,
  visit
} from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { getElementText, getText } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Course - Publication Check', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    await setupAuthentication();
    this.server.create('school');
    this.server.create('vocabulary');
    this.server.create('cohort');
    this.server.create('objective');
    this.server.create('term', {
      vocabularyId: 1,
    });
    this.server.create('meshDescriptor');
    this.fullCourse = this.server.create('course', {
      year: 2013,
      schoolId: 1,
      cohortIds: [1],
      objectiveIds: [1],
      termIds: [1],
      meshDescriptorIds: [1],
    });
    this.emptyCourse = this.server.create('course', {
      year: 2013,
      schoolId: 1
    });
  });

  test('full course count', async function(assert) {
    await visit('/courses/' + this.fullCourse.id + '/publicationcheck');
    assert.equal(currentRouteName(), 'course.publication_check');
    var items = findAll('.course-publicationcheck table tbody td');
    assert.equal(await getElementText(items[0]), getText('course 0'));
    assert.equal(await getElementText(items[1]), getText('Yes (1)'));
    assert.equal(await getElementText(items[2]), getText('Yes (1)'));
    assert.equal(await getElementText(items[3]), getText('Yes (1)'));
    assert.equal(await getElementText(items[4]), getText('Yes (1)'));
  });

  test('empty course count', async function(assert) {
    await visit('/courses/' + this.emptyCourse.id + '/publicationcheck');
    assert.equal(currentRouteName(), 'course.publication_check');
    var items = findAll('.course-publicationcheck table tbody td');
    assert.equal(await getElementText(items[0]), getText('course 1'));
    assert.equal(await getElementText(items[1]), getText('No'));
    assert.equal(await getElementText(items[2]), getText('No'));
    assert.equal(await getElementText(items[3]), getText('No'));
    assert.equal(await getElementText(items[4]), getText('No'));
  });

  test('unlink icon transitions properly', async function(assert) {
    await visit('/courses/' + this.fullCourse.id + '/publicationcheck');
    await click('.fa-unlink');
    assert.equal(currentURL(), '/courses/1?courseCompetencyDetails=false&courseLeadershipDetails=false&courseManageLeadership=false&courseObjectiveDetails=true&courseTaxonomyDetails=false&details=true&filterBy=&sortBy=title');
  });
});
