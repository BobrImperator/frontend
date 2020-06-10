import { currentRouteName } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Independent Learning', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.server.createList('user', 6);
    this.server.create('academicYear');
    this.course = this.server.create('course', { school: this.school });
    this.server.createList('instructorGroup', 5, { school: this.school });
    this.server.createList('user', 2, {instructorGroupIds: [ 1 ]});
    this.server.createList('user', 3, {instructorGroupIds: [ 2 ]});
    this.server.create('sessionType', { school: this.school });
    this.server.create('sessionDescription');
    const ilmSession = this.server.create('ilmSession', {
      instructorGroupIds: [1,2,3],
      instructorIds: [2,3,4]
    });
    this.ilmSession = this.server.create('session', {
      course: this.course,
      ilmSession
    });
  });

  test('initial selected instructors', async function(assert) {
    await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
    assert.equal(currentRouteName(), 'session.index');
    assert.equal(page.instructors.title, 'Instructors and Instructor Groups (3/3)');

    assert.equal(page.instructors.currentGroups.length, 3);
    assert.equal(page.instructors.currentGroups[0].title, 'instructor group 0');
    assert.equal(page.instructors.currentGroups[0].members.length, 2);
    assert.equal(page.instructors.currentGroups[0].members[0].text, '7 guy M. Mc7son');
    assert.equal(page.instructors.currentGroups[0].members[1].text, '8 guy M. Mc8son');
    assert.equal(page.instructors.currentGroups[1].title, 'instructor group 1');
    assert.equal(page.instructors.currentGroups[1].members.length, 3);
    assert.equal(page.instructors.currentGroups[1].members[0].text, '10 guy M. Mc10son');
    assert.equal(page.instructors.currentGroups[1].members[1].text, '11 guy M. Mc11son');
    assert.equal(page.instructors.currentGroups[1].members[2].text, '9 guy M. Mc9son');
    assert.equal(page.instructors.currentGroups[2].title, 'instructor group 2');
    assert.equal(page.instructors.currentGroups[2].members.length, 0);

    assert.equal(page.instructors.currentInstructors.length, 3);
    assert.equal(page.instructors.currentInstructors[0].title, '1 guy M. Mc1son');
    assert.equal(page.instructors.currentInstructors[1].title, '2 guy M. Mc2son');
    assert.equal(page.instructors.currentInstructors[2].title, '3 guy M. Mc3son');
  });

  test('manage instructors lists', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
    assert.equal(currentRouteName(), 'session.index');
    await page.instructors.manage();
    const { manager } = page.instructors;

    assert.equal(manager.instructorGroups.length, 3);
    assert.equal(manager.instructorGroups[0].title, 'instructor group 0');
    assert.equal(manager.instructorGroups[0].members.length, 2);
    assert.equal(manager.instructorGroups[0].members[0].text, '7 guy M. Mc7son');
    assert.equal(manager.instructorGroups[0].members[1].text, '8 guy M. Mc8son');
    assert.equal(manager.instructorGroups[1].title, 'instructor group 1');
    assert.equal(manager.instructorGroups[1].members[0].text, '10 guy M. Mc10son');
    assert.equal(manager.instructorGroups[1].members[1].text, '11 guy M. Mc11son');
    assert.equal(manager.instructorGroups[1].members[2].text, '9 guy M. Mc9son');
    assert.equal(manager.instructorGroups[1].members.length, 3);
    assert.equal(manager.instructorGroups[2].text, 'instructor group 2');
    assert.equal(manager.instructorGroups[2].members.length, 0);
    assert.equal(manager.instructors.length, 3);
    assert.equal(manager.instructors[0].text, '1 guy M. Mc1son');
    assert.equal(manager.instructors[1].text, '2 guy M. Mc2son');
    assert.equal(manager.instructors[2].text, '3 guy M. Mc3son');
  });

  test('manage instructors search users', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
    assert.equal(currentRouteName(), 'session.index');
    await page.instructors.manage();
    const { manager } = page.instructors;

    await manager.search('guy');
    assert.equal(manager.searchResults.length, 12);
    assert.equal(manager.searchResults[0].text, '0 guy M. Mc0son user@example.edu');
    assert.ok(manager.searchResults[0].active);
    assert.equal(manager.searchResults[1].text, '1 guy M. Mc1son user@example.edu');
    assert.ok(manager.searchResults[1].inactive);
    assert.equal(manager.searchResults[2].text, '2 guy M. Mc2son user@example.edu');
    assert.ok(manager.searchResults[2].inactive);
    assert.equal(manager.searchResults[3].text, '3 guy M. Mc3son user@example.edu');
    assert.ok(manager.searchResults[3].inactive);
    assert.equal(manager.searchResults[4].text, '4 guy M. Mc4son user@example.edu');
    assert.ok(manager.searchResults[4].active);
    assert.equal(manager.searchResults[5].text, '5 guy M. Mc5son user@example.edu');
    assert.ok(manager.searchResults[5].active);
    assert.equal(manager.searchResults[6].text, '6 guy M. Mc6son user@example.edu');
    assert.ok(manager.searchResults[6].active);
    assert.equal(manager.searchResults[7].text, '7 guy M. Mc7son user@example.edu');
    assert.ok(manager.searchResults[7].active);
    assert.equal(manager.searchResults[8].text, '8 guy M. Mc8son user@example.edu');
    assert.ok(manager.searchResults[8].active);
    assert.equal(manager.searchResults[9].text, '9 guy M. Mc9son user@example.edu');
    assert.ok(manager.searchResults[9].active);
    assert.equal(manager.searchResults[10].text, '10 guy M. Mc10son user@example.edu');
    assert.ok(manager.searchResults[10].active);
    assert.equal(manager.searchResults[11].text, '11 guy M. Mc11son user@example.edu');
    assert.ok(manager.searchResults[11].active);
  });


  test('manage instructors search groups', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
    assert.equal(currentRouteName(), 'session.index');
    await page.instructors.manage();
    const { manager } = page.instructors;

    await manager.search('group');
    assert.equal(manager.searchResults.length, 5);
    assert.equal(manager.searchResults[0].text, 'instructor group 0');
    assert.ok(manager.searchResults[0].inactive);
    assert.equal(manager.searchResults[1].text, 'instructor group 1');
    assert.ok(manager.searchResults[1].inactive);
    assert.equal(manager.searchResults[2].text, 'instructor group 2');
    assert.ok(manager.searchResults[2].inactive);
    assert.equal(manager.searchResults[3].text, 'instructor group 3');
    assert.ok(manager.searchResults[3].active);
    assert.equal(manager.searchResults[4].text, 'instructor group 4');
    assert.ok(manager.searchResults[4].active);
  });

  test('add instructor group', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
    assert.equal(currentRouteName(), 'session.index');
    await page.instructors.manage();
    const { manager } = page.instructors;

    await manager.search('group');
    await manager.searchResults[3].add();

    assert.equal(manager.instructorGroups.length, 4);
    assert.equal(manager.instructorGroups[0].title, 'instructor group 0');
    assert.equal(manager.instructorGroups[1].title, 'instructor group 1');
    assert.equal(manager.instructorGroups[2].title, 'instructor group 2');
    assert.equal(manager.instructorGroups[3].title, 'instructor group 3');

    assert.equal(manager.instructors.length, 3);
    assert.equal(manager.instructors[0].text, '1 guy M. Mc1son');
    assert.equal(manager.instructors[1].text, '2 guy M. Mc2son');
    assert.equal(manager.instructors[2].text, '3 guy M. Mc3son');

    await page.instructors.save();
    assert.equal(page.instructors.currentGroups.length, 4);
    assert.equal(page.instructors.currentGroups[0].title, 'instructor group 0');
    assert.equal(page.instructors.currentGroups[1].title, 'instructor group 1');
    assert.equal(page.instructors.currentGroups[2].title, 'instructor group 2');
    assert.equal(page.instructors.currentGroups[3].title, 'instructor group 3');

    assert.equal(page.instructors.currentInstructors.length, 3);
    assert.equal(page.instructors.currentInstructors[0].title, '1 guy M. Mc1son');
    assert.equal(page.instructors.currentInstructors[1].title, '2 guy M. Mc2son');
    assert.equal(page.instructors.currentInstructors[2].title, '3 guy M. Mc3son');

  });

  test('add instructor', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
    assert.equal(currentRouteName(), 'session.index');
    await page.instructors.manage();
    const { manager } = page.instructors;

    await manager.search('guy');
    await manager.searchResults[4].add();

    assert.equal(manager.instructorGroups.length, 3);
    assert.equal(manager.instructorGroups[0].title, 'instructor group 0');
    assert.equal(manager.instructorGroups[1].title, 'instructor group 1');
    assert.equal(manager.instructorGroups[2].title, 'instructor group 2');

    assert.equal(manager.instructors.length, 4);
    assert.equal(manager.instructors[0].text, '1 guy M. Mc1son');
    assert.equal(manager.instructors[1].text, '2 guy M. Mc2son');
    assert.equal(manager.instructors[2].text, '3 guy M. Mc3son');
    assert.equal(manager.instructors[3].text, '4 guy M. Mc4son');

    await page.instructors.save();
    assert.equal(page.instructors.currentGroups.length, 3);
    assert.equal(page.instructors.currentGroups[0].title, 'instructor group 0');
    assert.equal(page.instructors.currentGroups[1].title, 'instructor group 1');
    assert.equal(page.instructors.currentGroups[2].title, 'instructor group 2');

    assert.equal(page.instructors.currentInstructors.length, 4);
    assert.equal(page.instructors.currentInstructors[0].title, '1 guy M. Mc1son');
    assert.equal(page.instructors.currentInstructors[1].title, '2 guy M. Mc2son');
    assert.equal(page.instructors.currentInstructors[2].title, '3 guy M. Mc3son');
    assert.equal(page.instructors.currentInstructors[3].title, '4 guy M. Mc4son');
  });

  test('remove instructor group', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
    assert.equal(currentRouteName(), 'session.index');
    await page.instructors.manage();
    const { manager } = page.instructors;

    await manager.instructorGroups[0].remove();

    assert.equal(manager.instructorGroups.length, 2);
    assert.equal(manager.instructorGroups[0].title, 'instructor group 1');
    assert.equal(manager.instructorGroups[1].title, 'instructor group 2');

    assert.equal(manager.instructors.length, 3);
    assert.equal(manager.instructors[0].text, '1 guy M. Mc1son');
    assert.equal(manager.instructors[1].text, '2 guy M. Mc2son');
    assert.equal(manager.instructors[2].text, '3 guy M. Mc3son');

    await page.instructors.save();
    assert.equal(page.instructors.currentGroups.length, 2);
    assert.equal(page.instructors.currentGroups[0].title, 'instructor group 1');
    assert.equal(page.instructors.currentGroups[1].title, 'instructor group 2');

    assert.equal(page.instructors.currentInstructors.length, 3);
    assert.equal(page.instructors.currentInstructors[0].title, '1 guy M. Mc1son');
    assert.equal(page.instructors.currentInstructors[1].title, '2 guy M. Mc2son');
    assert.equal(page.instructors.currentInstructors[2].title, '3 guy M. Mc3son');
  });

  test('remove instructor', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
    assert.equal(currentRouteName(), 'session.index');
    await page.instructors.manage();
    const { manager } = page.instructors;

    await manager.instructors[0].remove();

    assert.equal(manager.instructorGroups.length, 3);
    assert.equal(manager.instructorGroups[0].title, 'instructor group 0');
    assert.equal(manager.instructorGroups[1].title, 'instructor group 1');
    assert.equal(manager.instructorGroups[2].title, 'instructor group 2');

    assert.equal(manager.instructors.length, 2);
    assert.equal(manager.instructors[0].text, '2 guy M. Mc2son');
    assert.equal(manager.instructors[1].text, '3 guy M. Mc3son');

    await page.instructors.save();
    assert.equal(page.instructors.currentGroups.length, 3);
    assert.equal(page.instructors.currentGroups[0].title, 'instructor group 0');
    assert.equal(page.instructors.currentGroups[1].title, 'instructor group 1');
    assert.equal(page.instructors.currentGroups[2].title, 'instructor group 2');

    assert.equal(page.instructors.currentInstructors.length, 2);
    assert.equal(page.instructors.currentInstructors[0].title, '2 guy M. Mc2son');
    assert.equal(page.instructors.currentInstructors[1].title, '3 guy M. Mc3son');
  });

  test('undo instructor/group changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
    assert.equal(currentRouteName(), 'session.index');
    await page.instructors.manage();
    const { manager } = page.instructors;

    await manager.instructorGroups[0].remove();
    await manager.instructors[0].remove();


    await page.instructors.cancel();

    assert.equal(page.instructors.currentGroups.length, 3);
    assert.equal(page.instructors.currentGroups[0].title, 'instructor group 0');
    assert.equal(page.instructors.currentGroups[1].title, 'instructor group 1');
    assert.equal(page.instructors.currentGroups[2].title, 'instructor group 2');

    assert.equal(page.instructors.currentInstructors.length, 3);
    assert.equal(page.instructors.currentInstructors[0].title, '1 guy M. Mc1son');
    assert.equal(page.instructors.currentInstructors[1].title, '2 guy M. Mc2son');
    assert.equal(page.instructors.currentInstructors[2].title, '3 guy M. Mc3son');

  });

  test('ilm due date is visible if sesion has no post-requisite', async function(assert) {
    await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
    assert.ok(page.overview.ilmDueDate.isPresent);
    assert.ok(page.overview.ilmDueDate.isVisible);
  });

  test('ilm due date should not be visible if session has post-requisite', async function (assert) {
    const postRequisite = this.server.create('session', { course: this.course });
    this.ilmSession.update('postrequisite', postRequisite);
    await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
    assert.ok(page.overview.ilmDueDate.isPresent);
    assert.ok(page.overview.ilmDueDate.isHidden);
  });

  test('ilm-only subcomponents disappear/reappear if ilm gets toggled off/on', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1, sessionLearnergroupDetails: true });
    assert.equal(currentRouteName(), 'session.index');

    assert.ok(page.learnersAreVisible);
    assert.ok(page.instructorsAreVisible);

    await page.overview.toggleIlm();

    assert.notOk(page.learnersAreVisible);
    assert.notOk(page.instructorsAreVisible);

    await page.overview.toggleIlm();

    assert.ok(page.learnersAreVisible);
    assert.ok(page.instructorsAreVisible);
  });
});
