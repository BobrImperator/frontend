import { click, visit, currentURL } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import { setupAuthentication, getElementText, getText } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Course - Publish All Sessions', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    await setupAuthentication();
    this.school = this.server.create('school');
    this.cohort = this.server.create('cohort');
  });

  test('published sessions do not appear in the cannot publish list #1658', async function(assert) {
    const objectiveInSession1 = this.server.create('objective');
    const objectiveInSession2 = this.server.create('objective');
    const objectiveInSession3 = this.server.create('objective');
    this.server.create('meshDescriptor');
    this.server.create('term');

    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      cohortIds: [1],
    });
    const session1 = this.server.create('session', {
      courseId: 1,
      published: true,
      publishedAsTbd: false,
      meshDescriptorIds: [1],
      termIds: [1],
    });
    this.server.create('session-objective', { session: session1, objective: objectiveInSession1 });
    this.server.create('offering', {sessionId: 1});
    const session2 = this.server.create('session', {
      courseId: 1,
      published: true,
      publishedAsTbd: false,
      meshDescriptorIds: [1],
      termIds: [1],
    });
    this.server.create('session-objective', { session: session2, objective: objectiveInSession2 });

    this.server.create('offering', {sessionId: 2});
    this.server.create('ilmSession', { sessionId: 2});
    const session3 = this.server.create('session', {
      courseId: 1,
      published: true,
      publishedAsTbd: true,
      meshDescriptorIds: [1],
      termIds: [1],
    });
    this.server.create('session-objective', { session: session3, objective: objectiveInSession3 });

    this.server.create('offering', {sessionId: 3});
    await visit('/courses/1/publishall');

    await click('.publish-all-sessions-publishable .title');
    assert.equal(await getElementText('tbody tr:nth-of-type(1) td:nth-of-type(1)'), getText('session 0'));
    assert.equal(await getElementText('tbody tr:nth-of-type(2) td:nth-of-type(1)'), getText('session 1'));
    assert.equal(await getElementText('tbody tr:nth-of-type(3) td:nth-of-type(1)'), getText('session 2'));
  });

  test('After publishing user is returned to the courses route #4099', async function(assert) {
    const objective = this.server.create('objective');
    const meshDescriptors = this.server.createList('meshDescriptor', 1);
    const terms = this.server.createList('term', 1);

    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      published: true,
      cohorts: [this.cohort],
    });
    const session = this.server.create('session', {
      course,
      published: false,
      publishedAsTbd: false,
      meshDescriptors,
      terms
    });
    this.server.create('session-objective', { session, objective });
    this.server.create('sessionType', {
      sessions: [session]
    });
    this.server.create('offering', { session });
    await visit('/courses/1/publishall');

    await click('.publish-all-sessions-review button');
    assert.equal(currentURL(), '/courses/1');
    assert.ok(session.published);
  });
});
